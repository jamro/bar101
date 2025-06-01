# Cost Protection System - Lambda Components

# SNS Topic for budget alerts
resource "aws_sns_topic" "s3_cost_alerts" {
  name = "bar101-s3-cost-alerts"
}

resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.s3_cost_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# IAM role for Lambda function
resource "aws_iam_role" "cost_limiter_lambda_role" {
  name = "bar101-cost-limiter-lambda-role"

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

resource "aws_iam_role_policy" "cost_limiter_lambda_policy" {
  name = "bar101-cost-limiter-lambda-policy"
  role = aws_iam_role.cost_limiter_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetBucketPolicy",
          "s3:PutBucketPolicy",
          "s3:DeleteBucketPolicy"
        ]
        Resource = [
          aws_s3_bucket.s3_cdn_bar101.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.s3_cost_alerts.arn
      }
    ]
  })
}

# Lambda function to block/unblock S3 access
resource "aws_lambda_function" "s3_cost_limiter" {
  filename         = "s3_cost_limiter.zip"
  function_name    = "bar101-s3-cost-limiter"
  role            = aws_iam_role.cost_limiter_lambda_role.arn
  handler         = "s3_cost_limiter.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = "python3.9"
  timeout         = 60

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.s3_cdn_bar101.bucket
      SNS_TOPIC_ARN = aws_sns_topic.s3_cost_alerts.arn
    }
  }
}

# Lambda function code packaging
data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "s3_cost_limiter.zip"
  source_file = "${path.module}/s3_cost_limiter.py"
}

# CloudWatch Event Rule to reset access daily at midnight UTC
resource "aws_cloudwatch_event_rule" "daily_reset" {
  name                = "bar101-daily-s3-reset"
  description         = "Reset S3 access daily at midnight UTC"
  schedule_expression = "cron(0 0 * * ? *)"
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.daily_reset.name
  target_id = "TriggerLambda"
  arn       = aws_lambda_function.s3_cost_limiter.arn
  
  input = jsonencode({
    action = "unblock"
  })
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.s3_cost_limiter.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_reset.arn
}

# AWS Budget for S3 transfer costs
resource "aws_budgets_budget" "s3_daily_transfer_budget" {
  name     = "bar101-s3-daily-transfer-budget"
  budget_type = "COST"
  limit_amount = var.daily_transfer_cost_limit
  limit_unit   = "USD"
  time_unit    = "DAILY"
  time_period_start = "2024-01-01_00:00"

  cost_filter {
    name = "Service"
    values = ["Amazon Simple Storage Service"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
    subscriber_sns_topic_arns  = [aws_sns_topic.s3_cost_alerts.arn]
  }
}

# Outputs for cost protection system
output "cost_protection_budget" {
  description = "Daily S3 cost budget limit"
  value       = "$${var.daily_transfer_cost_limit} USD per day"
}

output "cost_protection_lambda" {
  description = "Lambda function for S3 access control"
  value       = aws_lambda_function.s3_cost_limiter.function_name
}

output "cost_alerts_topic" {
  description = "SNS topic for cost alerts"
  value       = aws_sns_topic.s3_cost_alerts.arn
} 