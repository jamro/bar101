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

# Attach CloudWatch policy to the Lambda role
resource "aws_iam_role_policy_attachment" "cost_limiter_cloudwatch_attachment" {
  role       = aws_iam_role.cost_limiter_lambda_role.name
  policy_arn = aws_iam_policy.cost_limiter_cloudwatch_policy.arn
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
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.cost_limiter_lambda_basic_execution,
    aws_iam_role_policy_attachment.cost_limiter_cloudwatch_attachment
  ]
}

# CloudWatch Log Group for the Lambda function
resource "aws_cloudwatch_log_group" "cost_limiter_log_group" {
  name              = "/aws/lambda/cost-limiter"
  retention_in_days = 7
} 