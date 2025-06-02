# Cost Limiter Lambda

This Lambda function monitors S3 bucket download costs by tracking the BytesDownloaded metric from CloudWatch.

## Function Details

- **Runtime**: Node.js 20.x
- **Handler**: `index.handler`
- **Timeout**: 30 seconds
- **Memory**: 128 MB

## Environment Variables

- `NODE_ENV`: Set to "production"

## Functionality

The function:
1. Queries CloudWatch for S3 BytesDownloaded metrics over the last 24 hours
2. Sums up the total bytes downloaded
3. Returns the data in both bytes and MB format

## Response Format

```json
{
  "statusCode": 200,
  "body": {
    "bucket": "cdn-bar101.jmrlab.com",
    "totalDownloadedBytes": 1234567890,
    "downloadedMB": "1177.44"
  }
}
```

## Development

To add new functionality:
1. Modify `index.mjs`
2. Add any new dependencies to `package.json`
3. Update this README if needed
4. Run `terraform plan` and `terraform apply` to deploy changes

## Dependencies

- `@aws-sdk/client-cloudwatch`: AWS SDK for CloudWatch operations 