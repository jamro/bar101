# Bar101 Infrastructure - Terraform Configuration

Terraform configuration for the Bar101 project infrastructure on AWS with Cloudflare DNS management.

## Features

- **S3 Static Website Hosting**: Two buckets for app and CDN assets
- **Cloudflare DNS Management**: Automatic DNS record creation with optional proxy
- **Cost Protection System**: Real-time monitoring with automated blocking/unblocking
- **Email Notifications**: Comprehensive alerting for all usage events

## Architecture

### S3 Buckets
- `bar101.jmrlab.com` - Main application bucket
- `cdn-bar101.jmrlab.com` - CDN assets bucket with CORS configuration

### Cost Protection System
The infrastructure includes a sophisticated usage-based protection system that monitors S3 data transfer in real-time:

- **CloudWatch Metrics**: Monitors `BytesDownloaded` from the CDN bucket with 24-hour rolling windows
- **Dual Alarms**: Warning at 80% and blocking at 100% of daily limit
- **Lambda Function**: Automatically blocks/unblocks S3 access based on usage
- **Daily Reset**: Automatically restores access at midnight UTC via EventBridge scheduled events
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
| `cloudflare_proxied` | Enable Cloudflare proxy | `true` | `false` |
| `cloudflare_ttl` | TTL for DNS records (when proxy disabled) | `300` | `600` |
| `daily_transfer_bytes_limit` | Daily transfer limit in bytes | `10737418240` (10GB) | Custom bytes |
| `alert_email` | Email for notifications | `"kjamroz83@gmail.com"` | `"admin@domain.com"` |

## Cost Protection Details

### Default Configuration
- **Daily Limit**: 10 GB (10,737,418,240 bytes) ≈ $0.90 at $0.09/GB
- **Warning Threshold**: 80% of daily limit (8 GB)
- **Blocking Threshold**: 100% of daily limit (10 GB)

### Monitoring Metrics
- **Metric**: `AWS/S3` `BytesDownloaded`
- **Period**: 24 hours rolling window (86400 seconds)
- **Evaluation**: Real-time monitoring
- **Dimensions**: Filtered by CDN bucket name (`cdn-bar101.jmrlab.com`)

### Automatic Actions
1. **80% Usage**: Email warning notification
2. **100% Usage**: 
   - Email blocking notification
   - Lambda function triggered via SNS
   - S3 bucket policy updated to deny public access
   - Access blocked until midnight UTC
3. **Daily Reset (00:00 UTC)**: 
   - Scheduled Lambda execution via EventBridge
   - Bucket policy restored to allow public access
   - Email restoration notification

### Lambda Function Components
- **`index.mjs`**: Main orchestrator - retrieves metrics, manages access control, sends notifications
- **`metrics.mjs`**: CloudWatch metrics retrieval and 24-hour rolling totals
- **`s3-access-control.mjs`**: S3 bucket policy management (allow/block templates)
- **`notifications.mjs`**: SNS notification publishing

## Outputs

After deployment, Terraform provides:

```hcl
# S3 Information
s3_app_bucket_name = "bar101.jmrlab.com"
s3_cdn_bucket_name = "cdn-bar101.jmrlab.com"
s3_app_website_endpoint = "bar101.jmrlab.com.s3-website-us-east-1.amazonaws.com"
s3_cdn_website_endpoint = "cdn-bar101.jmrlab.com.s3-website-us-east-1.amazonaws.com"

# Cost Protection System
cost_protection_limit = "10737418240 bytes (10 GB)"
cost_protection_lambda = "cost-limiter"
cost_alerts_topic = "arn:aws:sns:us-east-1:123456789012:cost-limiter-alerts"

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
# Check current status / trigger evaluation
aws lambda invoke \
  --function-name cost-limiter \
  --payload '{}' \
  response.json && cat response.json

# Check current bucket policy
aws s3api get-bucket-policy --bucket cdn-bar101.jmrlab.com
```

### Adjust Limits
```bash
# Update daily limit (example: 20GB)
terraform apply -var="daily_transfer_bytes_limit=21474836480"
```

## Troubleshooting

### Common Issues

1. **CloudWatch Metrics Not Available**
   - S3 request metrics need to be enabled (they are auto-enabled by CloudWatch alarms)
   - Allow 15-30 minutes for metrics to appear after first requests
   - Check S3 bucket has received some download traffic

2. **Lambda Not Triggering**
   - Check CloudWatch alarm state: `cost-limiter-daily-transfer-warning` and `cost-limiter-daily-transfer-exceeded`
   - Verify Lambda permissions for S3 and SNS
   - Check Lambda logs in CloudWatch: `/aws/lambda/cost-limiter`
   - Verify SNS topic subscription is active

3. **Access Still Blocked**
   - Check current bucket policy in S3 console
   - Manually invoke Lambda function to trigger evaluation
   - Verify EventBridge scheduled rule: `cost-limiter-periodic-check`
   - Check if usage is still above threshold

4. **Email Notifications Not Received**
   - Verify SNS topic subscription is confirmed (check email for confirmation link)
   - Check SNS topic ARN matches in Lambda environment variables
   - Verify `alert_email` variable is set correctly

### Monitoring Resources
- **CloudWatch Alarms**: `cost-limiter-daily-transfer-warning`, `cost-limiter-daily-transfer-exceeded`
- **Lambda Function**: `cost-limiter`
- **Lambda Logs**: `/aws/lambda/cost-limiter`
- **SNS Topic**: `cost-limiter-alerts`
- **EventBridge Rule**: `cost-limiter-periodic-check` (daily at 00:00 UTC)

## Security Notes

- Lambda function has minimal permissions (S3 bucket policy management, SNS publish, CloudWatch read)
- Bucket policies deny access to all principals except AWS services during blocking
- Daily reset ensures temporary blocks don't become permanent
- All actions are logged and monitored through CloudWatch
- IAM roles follow principle of least privilege

## Development

To modify the Lambda function:

1. Edit files in `lambda/cost-limiter/`
2. Run `terraform apply` to update the function (Terraform will automatically zip and deploy)
3. Check logs in CloudWatch for debugging: `/aws/lambda/cost-limiter`

The Lambda function is written in Node.js 20.x and uses ES modules (.mjs files).