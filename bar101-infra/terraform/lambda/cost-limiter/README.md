# Cost Limiter Lambda Function

Monitors S3 bucket download costs and automatically blocks web access when daily transfer limits are exceeded. This Lambda function is the core component of the Bar101 infrastructure's cost protection system.

## Overview

The cost limiter provides automated protection against unexpected AWS S3 charges by monitoring data transfer usage in real-time and automatically blocking access when predefined limits are exceeded.

**Designed for Hobby Projects**: This system was specifically built for Bar101, a hobby project where predictable costs are essential. The application architecture ensures **graceful degradation** - when the CDN is blocked, the core game continues to function normally, but voiceovers become unavailable. This allows users to keep playing while protecting against runaway costs.

**CloudFlare Integration**: Works in conjunction with CloudFlare's aggressive 30-day caching to minimize S3 requests and reduce the likelihood of triggering cost protection.

## Configuration

### Environment Variables
- `S3_BUCKET_ID`: Target S3 bucket name (default: "cdn-bar101.jmrlab.com")
- `DAILY_TRANSFER_BYTES_LIMIT`: Daily transfer limit in bytes (default: 10,737,418,240 = 10GB)
- `SNS_TOPIC_ARN`: SNS topic ARN for sending notifications

### Default Thresholds
- **Daily Limit**: 10 GB ≈ $0.90 at $0.09/GB
- **Warning**: 80% of limit (8 GB)
- **Blocking**: 100% of limit (10 GB)

## Architecture

The function is organized into four main modules:

- **`index.mjs`**: Main orchestrator - coordinates metrics retrieval, access control, and notifications
- **`metrics.mjs`**: CloudWatch metrics client - retrieves and calculates 24-hour rolling totals
- **`s3-access-control.mjs`**: S3 bucket policy manager - handles allow/block policy templates
- **`notifications.mjs`**: SNS notification publisher - sends formatted status messages

## Functionality

### Core Workflow
1. **Monitor**: Query CloudWatch for S3 BytesDownloaded metrics over 24-hour rolling window
2. **Evaluate**: Compare current usage against configured daily transfer limit
3. **Control**: Apply or remove blocking bucket policies based on usage thresholds
4. **Notify**: Send SNS notifications for all state changes and status updates

### Trigger Sources
- **CloudWatch Alarms**: Triggered at 80% (warning) and 100% (blocking) thresholds
- **EventBridge Schedule**: Daily scheduled check at 00:00 UTC for automatic restoration
- **Manual Invocation**: On-demand status checks and policy management

## Response Format

The function returns a standardized JSON response:

```json
{
  "statusCode": 200,
  "body": {
    "bucket": "cdn-bar101.jmrlab.com",
    "totalDownloadedBytes": 8589934592,
    "downloadedMB": 8192.0,
    "limitMB": 10240.0,
    "percentageUsed": 80.0,
    "isOverLimit": false,
    "action": "warning_sent|blocked|unblocked|no_change",
    "statusMessage": "Warning: Usage 8192 MB is 80% of limit 10240 MB",
    "isBlocked": false,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response Fields
- `totalDownloadedBytes`: Raw bytes downloaded in the last 24 hours
- `downloadedMB`/`limitMB`: Human-readable MB values
- `percentageUsed`: Current usage as percentage of limit
- `isOverLimit`: Boolean indicating if limit is exceeded
- `action`: Action taken (warning_sent, blocked, unblocked, no_change)
- `statusMessage`: Human-readable status description
- `isBlocked`: Current blocking state of the bucket
- `timestamp`: ISO timestamp of the evaluation

## S3 Bucket Policies

### Allow Policy (Normal Operation)
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::cdn-bar101.jmrlab.com/*"
  }]
}
```

### Block Policy (Limit Exceeded)
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyPublicReadGetObject",
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::cdn-bar101.jmrlab.com/*"
  }]
}
```

## Notifications

The function sends SNS notifications for all significant events:

### Message Types
- **Warning**: When usage reaches 80% of limit
- **Blocked**: When usage exceeds 100% and access is blocked
- **Unblocked**: When access is restored (daily reset or manual)
- **Error**: When technical issues occur

### Message Format
```
Subject: [ALERT] Bar101 CDN Usage Warning/Blocked/Restored

Bar101 CDN Bucket: cdn-bar101.jmrlab.com
Current Usage: 8192 MB (8589934592 bytes)
Daily Limit: 10240 MB (10737418240 bytes)
Percentage: 80%

Status: Warning - approaching daily limit
Action: Email notification sent

Timestamp: 2024-01-15T10:30:00.000Z
```

## Testing and Debugging

### Manual Testing
```bash
# Test the function with empty payload (triggers normal evaluation)
aws lambda invoke \
  --function-name cost-limiter \
  --payload '{}' \
  response.json && cat response.json | jq .

# Check current CloudWatch metrics manually
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name BytesDownloaded \
  --dimensions Name=BucketName,Value=cdn-bar101.jmrlab.com \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum
```

### Viewing Logs
```bash
# View recent Lambda execution logs
aws logs tail /aws/lambda/cost-limiter --follow

# View logs from specific time range
aws logs filter-log-events \
  --log-group-name /aws/lambda/cost-limiter \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Common Error Scenarios
- **No CloudWatch data**: Bucket hasn't received traffic yet
- **SNS permission errors**: Check IAM role has SNS:Publish permission
- **S3 policy errors**: Verify IAM role has S3 bucket policy permissions

## Deployment

The function is automatically deployed by Terraform:

1. Source code changes are detected by Terraform
2. New ZIP archive is created from `lambda/cost-limiter/` directory
3. Lambda function is updated with new code
4. Environment variables are updated from Terraform variables

### Dependencies
- Node.js 20.x runtime
- AWS SDK v3 (ES modules)
- No external npm packages required

## Security

### IAM Permissions
The function requires minimal permissions:
- `cloudwatch:GetMetricData`, `cloudwatch:GetMetricStatistics`, `cloudwatch:ListMetrics`
- `s3:GetBucketPolicy`, `s3:PutBucketPolicy` (for target bucket only)
- `sns:Publish` (for notification topic only)
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` (CloudWatch Logs)

### Security Considerations
- Function only modifies the specific S3 bucket policy (not IAM policies)
- Blocking policy denies all principals (including owner) except AWS services
- Automatic daily reset prevents permanent lockouts
- All actions are logged for audit trail 