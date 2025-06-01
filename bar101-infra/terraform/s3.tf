# S3 bucket for Terraform state storage
resource "aws_s3_bucket" "terraform_state" {
  bucket = "bar101-terraform-state"
}

resource "aws_s3_bucket_versioning" "terraform_state_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_encryption" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state_pab" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket for main application
resource "aws_s3_bucket" "s3_bar101_app" {
  bucket = "bar101.jmrlab.com"
}

resource "aws_s3_bucket_website_configuration" "s3_bar101_app_website" {
  bucket = aws_s3_bucket.s3_bar101_app.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "s3_bar101_app_pab" {
  bucket = aws_s3_bucket.s3_bar101_app.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "s3_bar101_app_policy" {
  bucket = aws_s3_bucket.s3_bar101_app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "arn:aws:s3:::bar101.jmrlab.com/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.s3_bar101_app_pab]
}

# S3 bucket for CDN assets
resource "aws_s3_bucket" "s3_cdn_bar101" {
  bucket = "cdn-bar101.jmrlab.com"
}

resource "aws_s3_bucket_website_configuration" "s3_cdn_bar101_website" {
  bucket = aws_s3_bucket.s3_cdn_bar101.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_cors_configuration" "s3_cdn_bar101_cors" {
  bucket = aws_s3_bucket.s3_cdn_bar101.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = [
      "http://localhost:3000",
      "http://192.168.68.58:3000",
      "https://bar101.jmrlab.com"
    ]
    expose_headers  = ["Content-Length"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "s3_cdn_bar101_pab" {
  bucket = aws_s3_bucket.s3_cdn_bar101.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "s3_cdn_bar101_policy" {
  bucket = aws_s3_bucket.s3_cdn_bar101.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "arn:aws:s3:::cdn-bar101.jmrlab.com/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.s3_cdn_bar101_pab]
} 