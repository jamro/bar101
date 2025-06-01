#!/bin/bash

# Setup script for importing Cloudflare DNS records into Terraform
# This script helps automate the import process described in IMPORT.md

set -e  # Exit on any error

echo "🌐 Bar101 Cloudflare Import Setup"
echo "================================="

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo "❌ curl is required but not installed. Aborting." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq is required but not installed. Install with: brew install jq" >&2; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "❌ terraform is required but not installed. Aborting." >&2; exit 1; }

# Check for Cloudflare API credentials
if [[ -z "$CLOUDFLARE_API_TOKEN" && (-z "$CLOUDFLARE_EMAIL" || -z "$CLOUDFLARE_API_KEY") ]]; then
    echo "❌ Cloudflare credentials not found!"
    echo "Please set either:"
    echo "  export CLOUDFLARE_API_TOKEN=\"your-api-token\""
    echo "or:"
    echo "  export CLOUDFLARE_EMAIL=\"your-email@example.com\""
    echo "  export CLOUDFLARE_API_KEY=\"your-global-api-key\""
    exit 1
fi

echo "✅ Prerequisites check passed"

# Set up auth header
if [[ -n "$CLOUDFLARE_API_TOKEN" ]]; then
    AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
else
    AUTH_HEADER="X-Auth-Email: $CLOUDFLARE_EMAIL"
    AUTH_KEY_HEADER="X-Auth-Key: $CLOUDFLARE_API_KEY"
fi

echo ""
echo "🔍 Fetching Cloudflare zone information..."

# Get Zone ID
if [[ -n "$CLOUDFLARE_API_TOKEN" ]]; then
    ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" | \
        jq -r '.result[] | select(.name=="jmrlab.com") | .id')
else
    ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
        -H "$AUTH_HEADER" \
        -H "$AUTH_KEY_HEADER" \
        -H "Content-Type: application/json" | \
        jq -r '.result[] | select(.name=="jmrlab.com") | .id')
fi

if [[ -z "$ZONE_ID" || "$ZONE_ID" == "null" ]]; then
    echo "❌ Could not find zone ID for jmrlab.com"
    echo "Please check your API credentials and domain access"
    exit 1
fi

echo "✅ Found zone ID: $ZONE_ID"

# Get DNS Record IDs
echo ""
echo "🔍 Fetching DNS record information..."

if [[ -n "$CLOUDFLARE_API_TOKEN" ]]; then
    BAR101_RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=bar101.jmrlab.com" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" | \
        jq -r '.result[0].id // empty')

    CDN_RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=cdn-bar101.jmrlab.com" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" | \
        jq -r '.result[0].id // empty')
else
    BAR101_RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=bar101.jmrlab.com" \
        -H "$AUTH_HEADER" \
        -H "$AUTH_KEY_HEADER" \
        -H "Content-Type: application/json" | \
        jq -r '.result[0].id // empty')

    CDN_RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=cdn-bar101.jmrlab.com" \
        -H "$AUTH_HEADER" \
        -H "$AUTH_KEY_HEADER" \
        -H "Content-Type: application/json" | \
        jq -r '.result[0].id // empty')
fi

echo "✅ Found bar101.jmrlab.com record ID: $BAR101_RECORD_ID"
echo "✅ Found cdn-bar101.jmrlab.com record ID: $CDN_RECORD_ID"

if [[ -z "$BAR101_RECORD_ID" ]]; then
    echo "⚠️  Could not find DNS record for bar101.jmrlab.com"
fi

if [[ -z "$CDN_RECORD_ID" ]]; then
    echo "⚠️  Could not find DNS record for cdn-bar101.jmrlab.com"
fi

# Change to terraform directory
cd terraform

echo ""
echo "🚀 Initializing Terraform..."
terraform init

echo ""
echo "📥 Importing Cloudflare resources..."

# Import records if they exist
if [[ -n "$BAR101_RECORD_ID" ]]; then
    echo "Importing bar101.jmrlab.com..."
    terraform import cloudflare_record.bar101_app "$ZONE_ID/$BAR101_RECORD_ID"
    echo "✅ Imported bar101.jmrlab.com"
else
    echo "⚠️  Skipping import for bar101.jmrlab.com (record not found)"
fi

if [[ -n "$CDN_RECORD_ID" ]]; then
    echo "Importing cdn-bar101.jmrlab.com..."
    terraform import cloudflare_record.bar101_cdn "$ZONE_ID/$CDN_RECORD_ID"
    echo "✅ Imported cdn-bar101.jmrlab.com"
else
    echo "⚠️  Skipping import for cdn-bar101.jmrlab.com (record not found)"
fi

echo ""
echo "🔍 Running Terraform plan to verify configuration..."
terraform plan

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Review the Terraform plan output above"
echo "2. If everything looks correct, run: terraform apply"
echo "3. Your Cloudflare DNS records are now managed by Terraform!"
echo ""
echo "For troubleshooting, see terraform/IMPORT.md" 