# PHASE 1/4 supplement — read-only reachability of the production stack.
# DNS lookups only. No connections, no writes, no credentials.
$hosts = @(
  "aqliya-prod-db.cds80cqswjgf.eu-north-1.rds.amazonaws.com",
  "aqliya-prod-alb-1090266351.eu-north-1.elb.amazonaws.com",
  "aqliya-prod-redis.j5oziv.0001.eun1.cache.amazonaws.com",
  "app.aqliya.com",
  "staging.aqliya.com",
  "aqliya.com"
)
foreach ($h in $hosts) {
  try {
    $r = Resolve-DnsName -Name $h -ErrorAction Stop -DnsOnly |
         Where-Object { $_.QueryType -in @("A", "AAAA", "CNAME") } |
         Select-Object -First 1
    if ($r) {
      $val = if ($r.IPAddress) { $r.IPAddress } else { $r.NameHost }
      Write-Host ("  {0,-58} RESOLVES -> {1}" -f $h, $val)
    } else {
      Write-Host ("  {0,-58} no A/AAAA/CNAME record" -f $h)
    }
  } catch {
    Write-Host ("  {0,-58} DOES NOT RESOLVE" -f $h)
  }
}

Write-Host ""
Write-Host "=== deployment evidence files, by commit date ==="
Set-Location "C:\Users\PC\Documents\Aqliya"
git log --date=short --pretty=format:"%ad %h %s" --diff-filter=A -- "docs/deployments/*"
Write-Host ""
