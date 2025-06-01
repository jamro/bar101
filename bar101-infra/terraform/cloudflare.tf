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

# Page Rule for CDN caching to reduce costs
resource "cloudflare_page_rule" "bar101_cdn_cache" {
  zone_id  = data.cloudflare_zone.jmrlab_com.id
  target   = "cdn-bar101.jmrlab.com/*"
  priority = 1
  status   = "active"

  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 2592000 # 30 days (1 month) in seconds
    browser_cache_ttl = 2592000 # 30 days (1 month) in seconds
  }
} 