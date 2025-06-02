variable "domain_name" {
  description = "The base domain name"
  type        = string
  default     = "jmrlab.com"
}

variable "app_subdomain" {
  description = "Subdomain for the main application"
  type        = string
  default     = "bar101"
}

variable "cdn_subdomain" {
  description = "Subdomain for CDN assets"
  type        = string
  default     = "cdn-bar101"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "cloudflare_proxied" {
  description = "Whether to enable Cloudflare proxy for CDN and security features"
  type        = bool
  default     = true
}

variable "cloudflare_ttl" {
  description = "TTL for Cloudflare DNS records (only used when proxied is false)"
  type        = number
  default     = 300
}

variable "daily_transfer_bytes_limit" {
  description = "Daily data transfer limit in bytes"
  type        = number
  default     = 10737418240  # 10 GB in bytes
}

variable "alert_email" {
  description = "Email address for cost limiter alerts (optional)"
  type        = string
  default     = "kjamroz83@gmail.com"
} 