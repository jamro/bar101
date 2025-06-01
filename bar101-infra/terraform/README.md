# Bar101 Infrastructure

This directory contains the Terraform configuration for the Bar101 hobby project infrastructure.

## 📁 File Structure

```
terraform/
├── main.tf                 # Core infrastructure (S3, Cloudflare DNS, Page Rules)
├── lambda.tf              # Cost protection system (Lambda, SNS, Budget, CloudWatch)
├── s3_cost_limiter.py     # Python code for S3 cost limiting Lambda function
├── variables.tf           # Input variables definition
├── terraform.tfvars.example # Example configuration values
└── README.md              # This file
```

## 🏗️ Infrastructure Components

### Core Infrastructure (`main.tf`)
- **S3 Buckets**: Static website hosting for app and CDN
- **Cloudflare DNS**: Domain management and CDN setup
- **Page Rules**: 30-day cache configuration for cost optimization

### Cost Protection System (`lambda.tf`)
- **AWS Budget**: Daily cost monitoring ($2.00 limit)
- **Lambda Function**: Automatic S3 access blocking/unblocking
- **SNS Notifications**: Email alerts for cost events
- **CloudWatch Events**: Daily reset scheduling

## 🚀 Quick Start

1. **Configure variables**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

2. **Set Cloudflare credentials**:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token"
   # OR
   export CLOUDFLARE_EMAIL="your-email"
   export CLOUDFLARE_API_KEY="your-key"
   ```

3. **Deploy infrastructure**:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

## 💰 Cost Monitoring and Protection

The system automatically:
- ⚠️ **80% warning**: Email alert at 80% of daily limit
- 🛑 **100% block**: S3 access blocked when limit exceeded
- 🔄 **Daily reset**: Access restored at midnight UTC

### Manual Controls

**Block S3 access immediately**:
```bash
aws lambda invoke --function-name bar101-s3-cost-limiter \
  --payload '{"action":"block"}' response.json
```

**Restore S3 access**:
```bash
aws lambda invoke --function-name bar101-s3-cost-limiter \
  --payload '{"action":"unblock"}' response.json
```