# Cursor beforeShellExecution — AQLIYA low-load gate (stdout = JSON only)
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'

function Emit-HookResult {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('allow', 'deny', 'ask')]
        [string]$Permission,
        [string]$UserMessage,
        [string]$AgentMessage
    )
    $payload = [ordered]@{ permission = $Permission }
    if ($UserMessage) { $payload['user_message'] = $UserMessage }
    if ($AgentMessage) { $payload['agent_message'] = $AgentMessage }
    $json = ($payload | ConvertTo-Json -Compress)
    $utf8 = [System.Text.UTF8Encoding]::new($false)
    $stdout = [Console]::OpenStandardOutput()
    $bytes = $utf8.GetBytes($json + [Environment]::NewLine)
    $stdout.Write($bytes, 0, $bytes.Length)
    $stdout.Flush()
    exit 0
}

try {
    $raw = [Console]::In.ReadToEnd()
    $command = ''
    if (-not [string]::IsNullOrWhiteSpace($raw)) {
        $parsed = $raw | ConvertFrom-Json
        if ($null -ne $parsed.command) {
            $command = [string]$parsed.command
        }
    }
}
catch {
    Emit-HookResult -Permission 'allow'
}

$cmd = $command.Trim()

$lightGitPatterns = @(
    '(?i)\bgit\s+status\b',
    '(?i)\bgit\s+add\b',
    '(?i)\bgit\s+commit\b',
    '(?i)\bgit\s+diff\b',
    '(?i)\bgit\s+log\b',
    '(?i)\bgit\s+push\b',
    '(?i)\bgit\s+ls-files\b',
    '(?i)\bgit\s+branch\b',
    '(?i)\bgit\s+check-ignore\b',
    '(?i)\bgit\s+show\b',
    '(?i)\bgit\s+rev-parse\b',
    '(?i)\bgit\s+-C\s+[^\s]+\s+(status|add|commit|diff|log|ls-files|branch|push)\b'
)
foreach ($pattern in $lightGitPatterns) {
    if ($cmd -match $pattern) {
        Emit-HookResult -Permission 'allow'
    }
}

$lightOtherPatterns = @(
    '(?i)\bnpx\s+tsc\s+--noEmit\b',
    '(?i)\bnpx\s+prisma\s+validate\b',
    '(?i)\bnpx\s+prettier\s+--check\b',
    '(?i)^\s*Get-ChildItem\b',
    '(?i)^\s*Get-Content\b',
    '(?i)^\s*dir\b',
    '(?i)^\s*where\.exe\b',
    '(?i)^\s*command\s+-v\b'
)
foreach ($pattern in $lightOtherPatterns) {
    if ($cmd -match $pattern) {
        Emit-HookResult -Permission 'allow'
    }
}

$heavyPatterns = @(
    '(?i)\bnpm\s+run\s+build\b',
    '(?i)\bnpm\s+run\s+lint\b',
    '(?i)\bnpm\s+test\b',
    '(?i)\bnpx\s+jest\b',
    '(?i)\bnpx\s+prisma\s+generate\b',
    '(?i)\bnpx\s+prisma\s+migrate\b',
    '(?i)\bnpm\s+install\b',
    '(?i)\bnpm\s+ci\b',
    '(?i)\byarn\s+install\b',
    '(?i)\bpnpm\s+install\b'
)
foreach ($pattern in $heavyPatterns) {
    if ($cmd -match $pattern) {
        Emit-HookResult -Permission 'deny' `
            -UserMessage 'Heavy command blocked by AQLIYA low-load hook. Request explicit approval to run build, lint, test, prisma migrate/generate, or package installs.' `
            -AgentMessage "Low-load policy blocked shell command: $cmd"
    }
}

Emit-HookResult -Permission 'allow'