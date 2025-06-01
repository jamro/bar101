terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  backend "s3" {
    bucket = "bar101-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

provider "cloudflare" {
  # Configuration will be read from environment variables:
  # CLOUDFLARE_API_TOKEN or CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY
}

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

# S3 bucket for CDN
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

# Cloudflare Zone
data "cloudflare_zone" "jmrlab_com" {
  name = var.domain_name
}

# DNS record for main application (bar101.jmrlab.com)
resource "cloudflare_record" "bar101_app" {
  zone_id = data.cloudflare_zone.jmrlab_com.id
  name    = var.app_subdomain
  content = aws_s3_bucket_website_configuration.s3_bar101_app_website.website_endpoint
  type    = "CNAME"
  ttl     = var.cloudflare_proxied ? 1 : var.cloudflare_ttl
  proxied = var.cloudflare_proxied
  
  comment = "Main Bar101 application - points to S3 static website"
}

# DNS record for CDN assets (cdn-bar101.jmrlab.com)
resource "cloudflare_record" "bar101_cdn" {
  zone_id = data.cloudflare_zone.jmrlab_com.id
  name    = var.cdn_subdomain
  content = aws_s3_bucket_website_configuration.s3_cdn_bar101_website.website_endpoint
  type    = "CNAME"
  ttl     = var.cloudflare_proxied ? 1 : var.cloudflare_ttl
  proxied = var.cloudflare_proxied
  
  comment = "Bar101 CDN assets - points to S3 static website for media content"
}

# Outputs for reference
output "bar101_app_s3_website_endpoint" {
  description = "S3 website endpoint for main application"
  value       = aws_s3_bucket_website_configuration.s3_bar101_app_website.website_endpoint
}

output "bar101_cdn_s3_website_endpoint" {
  description = "S3 website endpoint for CDN assets"
  value       = aws_s3_bucket_website_configuration.s3_cdn_bar101_website.website_endpoint
}

output "bar101_app_cloudflare_record" {
  description = "Cloudflare record for main application"
  value       = cloudflare_record.bar101_app.hostname
}

output "bar101_cdn_cloudflare_record" {
  description = "Cloudflare record for CDN assets"
  value       = cloudflare_record.bar101_cdn.hostname
}