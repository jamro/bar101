# Bar101 Infrastructure

A low-cost infrastructure setup for the Bar101 hobby project, optimized for minimal operational costs while providing reliable hosting and content delivery.

## Architecture Overview

The infrastructure leverages cost-effective AWS S3 static hosting combined with CloudFlare for DNS management and CDN capabilities.

### Core Components

**Static Hosting (S3)**
- **Main Application**: `bar101.jmrlab.com` - S3 bucket hosting game files and web assets
- **CDN Assets**: `cdn-bar101.jmrlab.com` - Dedicated S3 bucket for voiceover files and media content

**DNS & CDN**
- **CloudFlare**: DNS configuration and free CDN tier for improved performance and cost optimization

**CI/CD Pipeline**
- **GitHub Actions**: Automated build and deployment pipelines for continuous delivery
- Triggers on code changes for seamless updates to S3 buckets

## Cost Optimization Strategy

This setup prioritizes minimal operational costs suitable for a hobby project:

- **S3 Static Hosting**: Pay-per-use storage and bandwidth (typically $1-5/month for small projects)
- **CloudFlare Free Tier**: No-cost DNS management, global CDN, and free HTTPS certificates
- **GitHub Actions**: Free tier provides sufficient CI/CD minutes for hobby projects
- **No Server Costs**: Serverless architecture eliminates ongoing compute expenses

## Deployment Flow

1. Code pushed to GitHub repository
2. GitHub Actions triggered automatically
3. Build process compiles and optimized assets
4. Deployment uploads files to `bar101.jmrlab.com` S3 bucket (voiceovers must be manually uploaded to `cdn-bar101.jmrlab.com` S3 bucket - too many files to sync automatically)


# Installation

## Prerequisites

Before installing the infrastructure, ensure you have:

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Configured with your credentials
3. **CloudFlare Account**: For DNS management (if using custom domain)
4. **Cloudflare API Token**: Required for Terraform to manage DNS records

## Terraform Installation (MacOS)

Install Terraform using Homebrew:

```bash
# Add HashiCorp tap to Homebrew
brew tap hashicorp/tap

# Install Terraform
brew install hashicorp/tap/terraform

# Verify installation
terraform -v
```

## AWS Configuration

Configure your AWS credentials (choose one method):

### Option 1: AWS CLI Configuration
```bash
aws configure
```

### Option 2: Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### Option 3: AWS Credentials File
Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = your-access-key
aws_secret_access_key = your-secret-key
```

## Cloudflare Configuration

### Create API Token
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" with the following permissions:
   - **Zone:Zone:Read** (for the `jmrlab.com` zone)
   - **Zone:DNS:Edit** (for the `jmrlab.com` zone)

### Set Environment Variable
```bash
export CLOUDFLARE_API_TOKEN="your-api-token-here"
```

Or alternatively, use email + Global API Key:
```bash
export CLOUDFLARE_EMAIL="your-email@example.com"
export CLOUDFLARE_API_KEY="your-global-api-key"
```

## Infrastructure Deployment

1. **Navigate to Terraform directory**:
   ```bash
   cd terraform
   ```

2. **Initialize Terraform**:
   ```bash
   terraform init
   ```
   This downloads the required providers and sets up the backend.

3. **Import existing Cloudflare resources** (if they exist):
   Follow the detailed instructions in `terraform/IMPORT.md`

4. **Review the deployment plan**:
   ```bash
   terraform plan
   ```
   This shows what resources will be created without making any changes.

5. **Apply the infrastructure**:
   ```bash
   terraform apply
   ```
   Review the plan and type `yes` to confirm deployment.

## Configuration

The infrastructure uses variables for easy customization. Default values are:

- **Domain**: `jmrlab.com`
- **App subdomain**: `bar101` (creates `bar101.jmrlab.com`)
- **CDN subdomain**: `cdn-bar101` (creates `cdn-bar101.jmrlab.com`)
- **AWS Region**: `us-east-1`
- **Cloudflare Proxy**: `true` (enables CDN and security features)
- **Cloudflare TTL**: `300` seconds (only used when proxy is disabled)

To customize these values, create a `terraform.tfvars` file in the `terraform/` directory:

```hcl
domain_name = "yourdomain.com"
app_subdomain = "myapp"
cdn_subdomain = "cdn-myapp"
aws_region = "us-west-2"
cloudflare_proxied = true
cloudflare_ttl = 600
```

**Note**: When `cloudflare_proxied` is `true`, the TTL is automatically set to `1` (Cloudflare automatic). The `cloudflare_ttl` variable only applies when the proxy is disabled.