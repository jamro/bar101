# S3 outputs
output "bar101_app_s3_website_endpoint" {
  description = "S3 website endpoint for main application"
  value       = aws_s3_bucket_website_configuration.s3_bar101_app_website.website_endpoint
}

output "bar101_cdn_s3_website_endpoint" {
  description = "S3 website endpoint for CDN assets"
  value       = aws_s3_bucket_website_configuration.s3_cdn_bar101_website.website_endpoint
}

# Cloudflare outputs
output "bar101_app_cloudflare_record" {
  description = "Cloudflare record for main application"
  value       = cloudflare_record.bar101_app.hostname
}

output "bar101_cdn_cloudflare_record" {
  description = "Cloudflare record for CDN assets"
  value       = cloudflare_record.bar101_cdn.hostname
}

output "bar101_cdn_page_rule" {
  description = "Cloudflare Page Rule for CDN caching (1 month)"
  value       = "Target: ${cloudflare_page_rule.bar101_cdn_cache.target}, Cache TTL: ${cloudflare_page_rule.bar101_cdn_cache.actions[0].edge_cache_ttl} seconds"
} 