# IAM role for the cost-limiter Lambda function
resource "aws_iam_role" "cost_limiter_lambda_role" {
  name = "cost-limiter-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for CloudWatch access
resource "aws_iam_policy" "cost_limiter_cloudwatch_policy" {
  name        = "cost-limiter-cloudwatch-policy"
  description = "IAM policy for cost-limiter Lambda to access CloudWatch metrics"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM policy for S3 bucket policy management
resource "aws_iam_policy" "cost_limiter_s3_policy" {
  name        = "cost-limiter-s3-policy"
  description = "IAM policy for cost-limiter Lambda to manage S3 bucket policies"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetBucketPolicy",
          "s3:PutBucketPolicy"
        ]
        Resource = "arn:aws:s3:::${var.cdn_subdomain}.${var.domain_name}"
      }
    ]
  })
}

# IAM policy for SNS publishing
resource "aws_iam_policy" "cost_limiter_sns_policy" {
  name        = "cost-limiter-sns-policy"
  description = "IAM policy for cost-limiter Lambda to publish to SNS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.cost_limiter_alerts.arn
      }
    ]
  })
}

# Attach CloudWatch policy to the Lambda role
resource "aws_iam_role_policy_attachment" "cost_limiter_cloudwatch_attachment" {
  role       = aws_iam_role.cost_limiter_lambda_role.name
  policy_arn = aws_iam_policy.cost_limiter_cloudwatch_policy.arn
}

# Attach S3 policy to the Lambda role
resource "aws_iam_role_policy_attachment" "cost_limiter_s3_attachment" {
  role       = aws_iam_role.cost_limiter_lambda_role.name
  policy_arn = aws_iam_policy.cost_limiter_s3_policy.arn
}

# Attach SNS policy to the Lambda role
resource "aws_iam_role_policy_attachment" "cost_limiter_sns_attachment" {
  role       = aws_iam_role.cost_limiter_lambda_role.name
  policy_arn = aws_iam_policy.cost_limiter_sns_policy.arn
}

# Attach basic Lambda execution policy to the role
resource "aws_iam_role_policy_attachment" "cost_limiter_lambda_basic_execution" {
  role       = aws_iam_role.cost_limiter_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Create a ZIP file with the Lambda function code
data "archive_file" "cost_limiter_lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/cost-limiter-lambda.zip"
  source_dir  = "${path.module}/lambda/cost-limiter"
  excludes    = ["node_modules", ".git", "*.md"]
}

# Lambda function
resource "aws_lambda_function" "cost_limiter" {
  filename         = data.archive_file.cost_limiter_lambda_zip.output_path
  function_name    = "cost-limiter"
  role            = aws_iam_role.cost_limiter_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 128

  source_code_hash = data.archive_file.cost_limiter_lambda_zip.output_base64sha256

  environment {
    variables = {
      NODE_ENV = "production"
      S3_BUCKET_ID = "cdn-bar101.jmrlab.com"
      DAILY_TRANSFER_BYTES_LIMIT = var.daily_transfer_bytes_limit
      SNS_TOPIC_ARN = aws_sns_topic.cost_limiter_alerts.arn
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.cost_limiter_lambda_basic_execution,
    aws_iam_role_policy_attachment.cost_limiter_cloudwatch_attachment,
    aws_iam_role_policy_attachment.cost_limiter_s3_attachment,
    aws_iam_role_policy_attachment.cost_limiter_sns_attachment
  ]
}

# CloudWatch Log Group for the Lambda function
resource "aws_cloudwatch_log_group" "cost_limiter_log_group" {
  name              = "/aws/lambda/cost-limiter"
  retention_in_days = 7
}

# CloudWatch alarm for when daily transfer approaches limit (80%)
resource "aws_cloudwatch_metric_alarm" "daily_transfer_warning_alarm" {
  alarm_name          = "cost-limiter-daily-transfer-warning"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "BytesDownloaded"
  namespace           = "AWS/S3"
  period              = "86400"  # 24 hours
  statistic           = "Sum"
  threshold           = var.daily_transfer_bytes_limit * 0.8
  alarm_description   = "Warning: Daily S3 transfer approaching limit (80%)"
  alarm_actions       = [aws_sns_topic.cost_limiter_alerts.arn]

  dimensions = {
    BucketName = "cdn-bar101.jmrlab.com"
    FilterId   = "EntireBucket"
  }

  treat_missing_data = "notBreaching"
}

# CloudWatch alarm for when daily transfer limit is exceeded
resource "aws_cloudwatch_metric_alarm" "daily_transfer_limit_alarm" {
  alarm_name          = "cost-limiter-daily-transfer-exceeded"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "BytesDownloaded"
  namespace           = "AWS/S3"
  period              = "86400"  # 24 hours
  statistic           = "Sum"
  threshold           = var.daily_transfer_bytes_limit
  alarm_description   = "Critical: Daily S3 transfer limit exceeded - blocking access"
  alarm_actions       = [aws_sns_topic.cost_limiter_alerts.arn]

  dimensions = {
    BucketName = "cdn-bar101.jmrlab.com"
    FilterId   = "EntireBucket"
  }

  treat_missing_data = "notBreaching"
}

# SNS topic for cost limiter alerts
resource "aws_sns_topic" "cost_limiter_alerts" {
  name = "cost-limiter-alerts"
}

# SNS topic subscription for Lambda trigger
resource "aws_sns_topic_subscription" "cost_limiter_lambda_trigger" {
  topic_arn = aws_sns_topic.cost_limiter_alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.cost_limiter.arn
}

# Lambda permission for SNS to invoke the function
resource "aws_lambda_permission" "allow_sns_invoke" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_limiter.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.cost_limiter_alerts.arn
}

# EventBridge rule for periodic check (every hour)
resource "aws_cloudwatch_event_rule" "cost_limiter_periodic_check" {
  name                = "cost-limiter-periodic-check"
  description         = "Trigger cost limiter check every hour"
  schedule_expression = "rate(1 hour)"
}

# EventBridge target for the Lambda function
resource "aws_cloudwatch_event_target" "cost_limiter_target" {
  rule      = aws_cloudwatch_event_rule.cost_limiter_periodic_check.name
  target_id = "CostLimiterTarget"
  arn       = aws_lambda_function.cost_limiter.arn
}

# Lambda permission for EventBridge to invoke the function
resource "aws_lambda_permission" "allow_eventbridge_invoke" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_limiter.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cost_limiter_periodic_check.arn
}

# SNS topic subscription for email notifications (optional)
resource "aws_sns_topic_subscription" "cost_limiter_email" {
  count     = var.alert_email != null ? 1 : 0
  topic_arn = aws_sns_topic.cost_limiter_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
} 