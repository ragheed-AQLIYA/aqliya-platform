# ADR-DEPLOY-001: CloudFront WAF Attachment via `web_acl_id`

**Status:** Accepted | **Date:** 2026-07-08 | **Author:** Platform Team

---

## Context

When configuring a WAFv2 WebACL with a CloudFront distribution, there are two ways to associate them:

1. **`aws_wafv2_web_acl_association`** resource — associates a WAF ACL with a resource
2. **`web_acl_id`** parameter inside `aws_cloudfront_distribution` — embeds the WAF ACL directly

Initially, option 1 was implemented. During deployment, it failed with:

```
WAFInvalidParameterException: The ARN isn't valid. A valid ARN begins with arn: and includes other
information separated by colons or slashes.
field: RESOURCE_ARN
parameter: arn:aws:wafv2:us-east-1:...:global/webacl/aqliya-dev-waf/...
```

The error showed that:
- The WAF ARN was being passed as the `resource_arn` parameter
- Even when `resource_arn` was correctly set to the CloudFront distribution ARN
- The CloudFront distribution ARN (`arn:aws:cloudfront::ACCOUNT:distribution/ID`) was rejected as invalid

## Investigation

Testing via AWS CLI confirmed:
```bash
aws wafv2 associate-web-acl \
  --web-acl-arn <waf-arn> \
  --resource-arn <cloudfront-arn>
# → WAFInvalidParameterException: The ARN isn't valid
```

This indicates that the WAFv2 `AssociateWebACL` API does not accept CloudFront distribution ARNs for `resource_arn`, even though they are valid ARNs for CloudFront.

## Decision

**Use `web_acl_id` inside `aws_cloudfront_distribution` instead of `aws_wafv2_web_acl_association`.**

```hcl
resource "aws_cloudfront_distribution" "main" {
  # ...
  web_acl_id = aws_wafv2_web_acl.cloudfront[0].arn
  # ...
}
```

## Rationale

- The `web_acl_id` parameter is the correct way to attach WAF to CloudFront
- CloudFront distributions need to be redeployed when `web_acl_id` changes (which is acceptable)
- The `aws_wafv2_web_acl_association` resource is designed for Application Load Balancers and API Gateway, not CloudFront
- AWS CloudFront API has its own mechanism for WAF association via the distribution configuration

## Consequences

### Positive
- ✅ WAF correctly associated with CloudFront distribution
- ✅ Single resource manages the WAF attachment (no separate association resource)
- ✅ Works with Terraform state management

### Negative
- ❌ Changing WAF requires CloudFront distribution to be updated (triggers redeployment)
- ❌ Cannot associate WAF and CloudFront independently if using separate modules

## References

- [AWS: Using AWS WAF with CloudFront](https://docs.aws.amazon.com/waf/latest/developerguide/cloudfront-features.html)
- [Terraform: aws_cloudfront_distribution.web_acl_id](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution#web_acl_id)
- [Terraform: aws_wafv2_web_acl_association](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/wafv2_web_acl_association)
