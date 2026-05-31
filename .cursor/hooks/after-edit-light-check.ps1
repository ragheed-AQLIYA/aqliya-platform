$inputJson = [Console]::In.ReadToEnd()

# Keep this intentionally light. Do not run lint/build/test here.
Write-Output '{"message":"AQLIYA reminder: after edits, report changed files and suggest targeted validation only."}'
exit 0
