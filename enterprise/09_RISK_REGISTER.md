# AQLIYA Risk Register

**Status:** Active | **Version:** 1.0 | **Date:** 2026-06-30

| # | Risk | Type | Impact | Likelihood | Severity | Mitigation |
|---|------|------|--------|-----------|---------|------------|
| R-01 | **Staging DNS ENOTFOUND** | Operational | Blocks full integration testing | High | 🔴 High | Fix DNS or recreate staging env |
| R-02 | **No AWS Live Access** | Operational | Cannot run restore drill on RDS | High | 🔴 High | Request AWS credentials |
| R-03 | **SalesOS 3 layers still active** | Architecture | Maintenance burden | Medium | 🟠 Medium | Already 80% resolved |
| R-04 | **No Pen Test** | Security | Unknown vulnerabilities | Medium | 🟠 Medium | Schedule external test |
| R-05 | **No SOC2** | Compliance | Enterprise sales blocker | Medium | 🟠 Medium | Q4 2026 target |
| R-06 | **Node 22 → EOL** | Technical | Dependency risk | Low | 🟢 Low | Monitor end-of-life |
| R-07 | **Single region (me-south-1)** | Availability | No DR failover | Low | 🟢 Low | Multi-region in roadmap |
