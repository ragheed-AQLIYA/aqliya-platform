# Architecture Memory

**Updated:** 2026-07-11T11:27:35.620Z  
**Decisions:** 1

> Engineering Excellence must **not** recommend reverting these without a new ADR.

| ID | Product | Title | Pattern | Date | Source |
| -- | ------- | ----- | ------- | ---- | ------ |
| ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT | Platform | ADR-DEPLOY-001: CloudFront WAF Attachment via `web_acl_id` | — | 2026-07-11 | docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md |

## Details

### ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT — ADR-DEPLOY-001: CloudFront WAF Attachment via `web_acl_id`

- **Product:** Platform
- **Status:** accepted
- **Reason:** **Use `web_acl_id` inside `aws_cloudfront_distribution` instead of `aws_wafv2_web_acl_association`.** ```hcl resource "aws_cloudfront_distribution" "main" {   # ...   web_acl_id = aws_wafv2_web_acl.cloudfront[0].arn   # ... } ```
- **Pattern:** —
- **Files:** —
- **Do not revert:** true
