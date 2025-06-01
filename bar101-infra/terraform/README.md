# Bar101 Infrastructure

Terraform configuration for the Bar101 project infrastructure on AWS with Cloudflare DNS management.

## Features

- **S3 Static Website Hosting**: Two buckets for app and CDN assets
- **Cloudflare DNS Management**: Automatic DNS record creation with optional proxy
- **Automated Alerts**: Email notifications for usage warnings and limit violations

## Architecture

### S3 Buckets
- `bar101.jmrlab.com` - Main application bucket
- `cdn-bar101.jmrlab.com` - CDN assets bucket with CORS configuration

### Usage Protection System
The infrastructure includes a sophisticated usage-based protection system that monitors S3 data transfer in real-time:

- **CloudWatch Metrics**: Monitors `BytesDownloaded` from the CDN bucket with 1-minute granularity
- **Dual Alarms**: Warning at 80% and blocking at 100% of daily limit
- **Lambda Function**: Automatically blocks/unblocks S3 access based on usage
- **Daily Reset**: Automatically restores access at midnight UTC
- **SNS Notifications**: Email alerts for all usage events

## Quick Start

1. **Prerequisites**
   ```bash
   # Install Terraform
   brew install terraform  # macOS
   
   # Configure AWS CLI
   aws configure
   
   # Set Cloudflare API token (if using Cloudflare)
   export CLOUDFLARE_API_TOKEN="your-token-here"
   ```

2. **Deploy Infrastructure**
   ```bash
   # Clone and navigate
   git clone <repository>
   cd bar101-infra/terraform
   
   # Configure variables
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   
   # Deploy
   terraform init
   terraform plan
   terraform apply
   ```

## Configuration Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `domain_name` | Base domain name | `"jmrlab.com"` | `"yourdomain.com"` |
| `app_subdomain` | App subdomain | `"bar101"` | `"myapp"` |
| `cdn_subdomain` | CDN subdomain | `"cdn-bar101"` | `"cdn-myapp"` |
| `aws_region` | AWS region | `"us-east-1"` | `"us-west-2"` |
| `daily_transfer_bytes_limit` | Daily transfer limit in bytes | `23622320128` (~22GB) | Custom bytes |
| `alert_email` | Email for notifications | Required | `"admin@domain.com"` |

## Usage Protection Details

### Daily Limits
- **Default Limit**: ~22GB (23,622,320,128 bytes) ≈ $2 at $0.09/GB
- **Warning Threshold**: 80% of daily limit
- **Blocking Threshold**: 100% of daily limit

### Monitoring Metrics
- **Metric**: `AWS/S3` `BytesDownloaded`
- **Period**: 24 hours rolling window
- **Evaluation**: 1-minute intervals
- **Dimensions**: Filtered by CDN bucket name

### Automatic Actions
1. **80% Usage**: Email warning notification
2. **100% Usage**: 
   - Email blocking notification
   - Lambda function triggered
   - S3 bucket policy updated to deny public access
   - Access blocked until midnight UTC
3. **Daily Reset**: 
   - Scheduled Lambda execution at 00:00 UTC
   - Bucket policy restored to allow public access
   - Email restoration notification

## Outputs

After deployment, Terraform provides:

```hcl
# S3 Information
s3_app_bucket_name = "bar101.jmrlab.com"
s3_cdn_bucket_name = "cdn-bar101.jmrlab.com"
s3_app_website_endpoint = "bar101.jmrlab.com.s3-website-us-east-1.amazonaws.com"
s3_cdn_website_endpoint = "cdn-bar101.jmrlab.com.s3-website-us-east-1.amazonaws.com"

# Usage Protection System
usage_protection_limit = "23622320128 bytes (~22 GB)"
usage_protection_lambda = "bar101-s3-usage-limiter"
usage_alerts_topic = "arn:aws:sns:us-east-1:123456789012:bar101-s3-usage-alerts"

# DNS Records
cloudflare_app_record = "bar101.jmrlab.com"
cloudflare_cdn_record = "cdn-bar101.jmrlab.com"
```

## Manual Operations

### Check Current Usage
```bash
# Check current daily usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name BytesDownloaded \
  --dimensions Name=BucketName,Value=cdn-bar101.jmrlab.com \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum
```

### Manual Access Control
```bash
# Block access manually
aws lambda invoke \
  --function-name bar101-s3-usage-limiter \
  --payload '{"action": "block"}' \
  response.json

# Restore access manually
aws lambda invoke \
  --function-name bar101-s3-usage-limiter \
  --payload '{"action": "unblock"}' \
  response.json
```

### Adjust Limits
```bash
# Update daily limit (example: 50GB)
terraform apply -var="daily_transfer_bytes_limit=53687091200"
```

## Troubleshooting

### Common Issues

1. **CloudWatch Metrics Not Available**
   - S3 request metrics need to be enabled
   - Allow 15-30 minutes for metrics to appear after first requests

2. **Lambda Not Triggering**
   - Check CloudWatch alarm state
   - Verify Lambda permissions for S3 and SNS
   - Check Lambda logs in CloudWatch

3. **Access Still Blocked**
   - Check current bucket policy
   - Manually trigger unblock Lambda
   - Verify daily reset schedule

### Monitoring
- CloudWatch Alarms: `bar101-s3-daily-transfer-*`
- Lambda Logs: `/aws/lambda/bar101-s3-usage-limiter`
- SNS Topic: `bar101-s3-usage-alerts`

## Security Notes

- Lambda function has minimal permissions (S3 bucket policy management, SNS publish, CloudWatch read)
- Bucket policies deny access to all except AWS services during blocking
- Daily reset ensures temporary blocks don't become permanent
- All actions are logged and monitored