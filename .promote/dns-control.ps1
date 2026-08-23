# Is this network's DNS trustworthy for negative results?
$controls = @("vercel.com", "aws.amazon.com", "google.com", "github.com")
Write-Host "=== control domains (must all resolve) ==="
foreach ($h in $controls) {
  try {
    $r = Resolve-DnsName -Name $h -ErrorAction Stop -DnsOnly |
         Where-Object { $_.QueryType -in @("A","AAAA","CNAME") } | Select-Object -First 1
    $v = if ($r.IPAddress) { $r.IPAddress } else { $r.NameHost }
    Write-Host ("  {0,-20} RESOLVES -> {1}" -f $h, $v)
  } catch { Write-Host ("  {0,-20} DOES NOT RESOLVE  <-- resolver is unreliable" -f $h) }
}

Write-Host ""
Write-Host "=== a known-nonexistent RDS-style host (must NOT resolve) ==="
foreach ($h in @("definitely-not-a-real-db-xyz123.cds80cqswjgf.eu-north-1.rds.amazonaws.com")) {
  try {
    $r = Resolve-DnsName -Name $h -ErrorAction Stop -DnsOnly | Select-Object -First 1
    Write-Host ("  {0} RESOLVED (unexpected)" -f $h)
  } catch { Write-Host "  control NXDOMAIN behaves correctly" }
}
