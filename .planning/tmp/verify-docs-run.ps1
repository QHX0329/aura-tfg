$ErrorActionPreference = 'Stop'

$projectRoot = (Get-Location).Path
$docs = @(
  'README.md',
  'docs/architecture/overview.md',
  'docs/configuration/configuration.md',
  'docs/guides/getting-started.md',
  'docs/guides/development.md',
  'docs/testing/testing.md',
  'docs/deployment/deployment.md'
)

function Is-PlaceholderPath {
  param([string]$PathToken)
  $lp = $PathToken.ToLowerInvariant()
  return (
    $lp -match 'your-' -or
    $lp -match '<[^>]+>' -or
    $lp -match '\{[^\}]+\}' -or
    $lp -match 'example' -or
    $lp -match 'sample' -or
    $lp -match 'placeholder' -or
    $lp -match 'my-'
  )
}

function Prefix-Is-Example {
  param([string]$Line, [int]$MatchIndex)
  if ($MatchIndex -le 0) { return $false }
  $prefix = $Line.Substring(0, $MatchIndex).ToLowerInvariant()
  return (
    $prefix -match 'e\.g\.,?\s*$' -or
    $prefix -match 'example:\s*$' -or
    $prefix -match 'for instance\s*$' -or
    $prefix -match 'such as\s*$' -or
    $prefix -match 'like:\s*$'
  )
}

function Normalize-Token {
  param([string]$Token)
  return $Token.Trim().TrimEnd('.', ',', ';', ')', ']', '}', '"', "'")
}

function Script-Exists {
  param($PkgObject, [string]$ScriptName)
  if (-not $PkgObject -or -not $PkgObject.scripts) { return $false }
  foreach ($name in $PkgObject.scripts.PSObject.Properties.Name) {
    if ($name -eq $ScriptName) { return $true }
  }
  return $false
}

function Package-Exists {
  param($PkgObject, [string]$Name)
  if (-not $PkgObject) { return $false }
  $depNames = @()
  if ($PkgObject.dependencies) { $depNames += $PkgObject.dependencies.PSObject.Properties.Name }
  if ($PkgObject.devDependencies) { $depNames += $PkgObject.devDependencies.PSObject.Properties.Name }
  return ($depNames -contains $Name)
}

$pkgPath = Join-Path $projectRoot 'package.json'
$pkgExists = Test-Path -LiteralPath $pkgPath -PathType Leaf
$pkg = $null
if ($pkgExists) {
  try {
    $pkg = Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json
  } catch {
    $pkg = $null
  }
}

$sourceDirs = @('src', 'routes', 'api', 'server', 'app') |
  ForEach-Object { Join-Path $projectRoot $_ } |
  Where-Object { Test-Path -LiteralPath $_ }
if ($sourceDirs.Count -eq 0) {
  $sourceDirs = @('backend', 'frontend/src', 'config') |
    ForEach-Object { Join-Path $projectRoot $_ } |
    Where-Object { Test-Path -LiteralPath $_ }
}

$functionSearchFiles = Get-ChildItem -Path $projectRoot -Recurse -File -Include *.py,*.ts,*.tsx,*.js,*.jsx,*.mjs,*.cjs -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\|\\\.planning\\|\\docs\\' }

$summary = New-Object System.Collections.Generic.List[object]

foreach ($docRel in $docs) {
  $docAbs = Join-Path $projectRoot $docRel
  $basename = Split-Path $docRel -Leaf
  $sanitized = $docRel -replace '/', '__'
  $tmpDir = Join-Path $projectRoot '.planning/tmp'
  $outStd = Join-Path $tmpDir ("verify-$basename.json")
  $outDup = Join-Path $tmpDir ("verify-path-$sanitized.json")

  New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

  if (-not (Test-Path -LiteralPath $docAbs -PathType Leaf)) {
    $missing = [ordered]@{
      doc_path = $docRel
      claims_checked = 0
      claims_passed = 0
      claims_failed = 1
      failures = @(
        [ordered]@{
          line = 0
          claim = $docRel
          expected = 'file exists'
          actual = 'doc file not found'
        }
      )
    }
    $missingJson = $missing | ConvertTo-Json -Depth 8
    Set-Content -LiteralPath $outStd -Value $missingJson -Encoding UTF8
    Set-Content -LiteralPath $outDup -Value $missingJson -Encoding UTF8

    $summary.Add([pscustomobject]@{
      doc = $docRel
      checked = 0
      passed = 0
      failed = 1
    }) | Out-Null
    continue
  }

  $lines = Get-Content -LiteralPath $docAbs
  $claims = New-Object System.Collections.Generic.List[object]

  $inFence = $false
  $fenceLang = ''

  for ($i = 0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    $line = $lines[$i]

    if ($line -match '^```\s*([A-Za-z0-9_-]*)\s*$') {
      if (-not $inFence) {
        $inFence = $true
        $fenceLang = $Matches[1].ToLowerInvariant()
      } else {
        $inFence = $false
        $fenceLang = ''
      }
      continue
    }

    if ($line -match '<!--\s*generated-by:\s*gsd-doc-writer\s*-->') { continue }
    if ($line -match '<!--\s*VERIFY:') { continue }

    if ($line -match '".*"' -and $line.ToLowerInvariant() -match 'according to|vendor|documentation says|docs say') {
      continue
    }

    if ($inFence -and ($fenceLang -in @('diff', 'example', 'template'))) {
      continue
    }

    # Inline code claims
    $inline = [regex]::Matches($line, '`([^`]+)`')
    foreach ($m in $inline) {
      $content = $m.Groups[1].Value.Trim()
      if ([string]::IsNullOrWhiteSpace($content)) { continue }
      if ($content -match '^(v?\d+\.\d+(\.\d+)*)$') { continue }

      if ($content -match '^[a-zA-Z0-9_./-]+\.(ts|js|cjs|mjs|md|json|yaml|yml|toml|txt|sh|py|go|rs|java|rb|css|html|tsx|jsx)$') {
        if (-not (Prefix-Is-Example -Line $line -MatchIndex $m.Index) -and -not (Is-PlaceholderPath -PathToken $content)) {
          $claims.Add([pscustomobject]@{ line = $lineNum; category = 'file'; claim = (Normalize-Token -Token $content) }) | Out-Null
        }
      }

      if ($content -match '^(npm|node|yarn|pnpm|npx|git)\b') {
        if (-not (Prefix-Is-Example -Line $line -MatchIndex $m.Index)) {
          $claims.Add([pscustomobject]@{ line = $lineNum; category = 'command'; claim = (Normalize-Token -Token $content) }) | Out-Null
        }
      }

      if ($content -match '^[A-Za-z_][A-Za-z0-9_]*\($') {
        if (-not (Prefix-Is-Example -Line $line -MatchIndex $m.Index)) {
          $claims.Add([pscustomobject]@{ line = $lineNum; category = 'function'; claim = $content.TrimEnd('(') }) | Out-Null
        }
      }
    }

    # Shell block command claims
    if ($inFence -and ($fenceLang -in @('bash', 'sh', 'shell'))) {
      $trim = $line.Trim()
      if (-not [string]::IsNullOrWhiteSpace($trim) -and -not $trim.StartsWith('#')) {
        $claims.Add([pscustomobject]@{ line = $lineNum; category = 'command'; claim = $trim }) | Out-Null
      }
    }

    # API claims
    $apiMatches = [regex]::Matches($line, '(GET|POST|PUT|DELETE|PATCH)\s+(/[a-zA-Z0-9/_:-]+)')
    foreach ($am in $apiMatches) {
      if (-not (Prefix-Is-Example -Line $line -MatchIndex $am.Index)) {
        $claims.Add([pscustomobject]@{
          line = $lineNum
          category = 'api'
          claim = ($am.Groups[1].Value.ToUpperInvariant() + ' ' + $am.Groups[2].Value)
        }) | Out-Null
      }
    }

    # Dependency claims
    if ($line.ToLowerInvariant() -match 'uses|requires|depends on|powered by|built with') {
      foreach ($m in $inline) {
        $content = $m.Groups[1].Value.Trim()
        if ($content -match '^[a-zA-Z0-9@/_\.-]+$' -and -not ($content -match '/|\\')) {
          if (-not (Prefix-Is-Example -Line $line -MatchIndex $m.Index)) {
            $claims.Add([pscustomobject]@{ line = $lineNum; category = 'dependency'; claim = $content }) | Out-Null
          }
        }
      }
    }
  }

  $checked = 0
  $passed = 0
  $failures = New-Object System.Collections.Generic.List[object]

  foreach ($c in $claims) {
    switch ($c.category) {
      'file' {
        $checked++
        $resolved = Join-Path $projectRoot $c.claim
        if (Test-Path -LiteralPath $resolved -PathType Leaf) {
          $passed++
        } else {
          $failures.Add([ordered]@{
            line = $c.line
            claim = $c.claim
            expected = 'file exists'
            actual = ("file not found at $($c.claim)")
          }) | Out-Null
        }
      }

      'command' {
        $cmd = $c.claim.Trim()

        if ($cmd -match '\bnpm\s+run\s+([A-Za-z0-9:_-]+)') {
          if (-not $pkgExists -or -not $pkg) { continue }
          $checked++
          $script = $Matches[1]
          if (Script-Exists -PkgObject $pkg -ScriptName $script) {
            $passed++
          } else {
            $failures.Add([ordered]@{
              line = $c.line
              claim = $cmd
              expected = "script '$script' in package.json"
              actual = 'script not found in package.json'
            }) | Out-Null
          }
          continue
        }

        if ($cmd -match '^yarn\s+([A-Za-z0-9:_-]+)') {
          if (-not $pkgExists -or -not $pkg) { continue }
          $candidate = $Matches[1]
          if ($candidate -in @('add', 'install', 'remove', 'upgrade', 'dlx', 'set', 'config', 'cache', 'npm', 'help', 'init')) {
            continue
          }
          $checked++
          if (Script-Exists -PkgObject $pkg -ScriptName $candidate) {
            $passed++
          } else {
            $failures.Add([ordered]@{
              line = $c.line
              claim = $cmd
              expected = "script '$candidate' in package.json"
              actual = 'script not found in package.json'
            }) | Out-Null
          }
          continue
        }

        if ($cmd -match '\bpnpm\s+run\s+([A-Za-z0-9:_-]+)') {
          if (-not $pkgExists -or -not $pkg) { continue }
          $script = $Matches[1]
          $checked++
          if (Script-Exists -PkgObject $pkg -ScriptName $script) {
            $passed++
          } else {
            $failures.Add([ordered]@{
              line = $c.line
              claim = $cmd
              expected = "script '$script' in package.json"
              actual = 'script not found in package.json'
            }) | Out-Null
          }
          continue
        }

        if ($cmd -match '\bnode\s+([A-Za-z0-9_./\\-]+\.[A-Za-z0-9]+)') {
          $checked++
          $fp = $Matches[1]
          $resolved = Join-Path $projectRoot $fp
          if (Test-Path -LiteralPath $resolved -PathType Leaf) {
            $passed++
          } else {
            $failures.Add([ordered]@{
              line = $c.line
              claim = $cmd
              expected = 'file exists'
              actual = "file not found at $fp"
            }) | Out-Null
          }
          continue
        }

        if ($cmd -match '\bnpx\s+(@?[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)?)') {
          if (-not $pkgExists -or -not $pkg) { continue }
          $pkgName = $Matches[1]
          $checked++
          if (Package-Exists -PkgObject $pkg -Name $pkgName) {
            $passed++
          } else {
            $failures.Add([ordered]@{
              line = $c.line
              claim = $cmd
              expected = 'package in package.json dependencies'
              actual = 'package not found'
            }) | Out-Null
          }
          continue
        }

        continue
      }

      'api' {
        $checked++
        $parts = $c.claim.Split(' ', 2)
        $method = $parts[0].ToLowerInvariant()
        $path = $parts[1]
        $found = $false

        foreach ($dir in $sourceDirs) {
          $literalMatch = Select-String -Path (Join-Path $dir '*') -Pattern $path -SimpleMatch -CaseSensitive:$false -Recurse -ErrorAction SilentlyContinue
          if ($literalMatch) {
            $found = $true
            break
          }
        }

        if (-not $found) {
          foreach ($dir in $sourceDirs) {
            $routerPattern = "router\\.$method|app\\.$method"
            $routePathPattern = [regex]::Escape($path)
            $routeMatch = Select-String -Path (Join-Path $dir '*') -Pattern $routerPattern -CaseSensitive:$false -Recurse -ErrorAction SilentlyContinue
            $pathMatch = Select-String -Path (Join-Path $dir '*') -Pattern $routePathPattern -CaseSensitive:$false -Recurse -ErrorAction SilentlyContinue
            if ($routeMatch -and $pathMatch) {
              $found = $true
              break
            }
          }
        }

        if ($found) {
          $passed++
        } else {
          $failures.Add([ordered]@{
            line = $c.line
            claim = $c.claim
            expected = 'route definition in codebase'
            actual = "no route definition found for $path"
          }) | Out-Null
        }
      }

      'function' {
        $checked++
        $name = $c.claim
        $found = $false
        $patterns = @(
          "function\\s+$([regex]::Escape($name))\\b",
          "const\\s+$([regex]::Escape($name))\\s*=",
          "export\\s+.*$([regex]::Escape($name))\\b",
          "\\b$([regex]::Escape($name))\\s*\\("
        )

        foreach ($f in $functionSearchFiles) {
          foreach ($pat in $patterns) {
            if (Select-String -Path $f.FullName -Pattern $pat -CaseSensitive:$false -Quiet) {
              $found = $true
              break
            }
          }
          if ($found) { break }
        }

        if ($found) {
          $passed++
        } else {
          $failures.Add([ordered]@{
            line = $c.line
            claim = "$name("
            expected = "function '$name' in codebase"
            actual = 'no definition found'
          }) | Out-Null
        }
      }

      'dependency' {
        if (-not $pkgExists -or -not $pkg) { continue }
        $checked++
        $depName = $c.claim
        if (Package-Exists -PkgObject $pkg -Name $depName) {
          $passed++
        } else {
          $failures.Add([ordered]@{
            line = $c.line
            claim = $depName
            expected = 'package in package.json dependencies'
            actual = 'package not found'
          }) | Out-Null
        }
      }
    }
  }

  $resultObj = [ordered]@{
    doc_path = $docRel
    claims_checked = $checked
    claims_passed = $passed
    claims_failed = $failures.Count
    failures = @($failures)
  }

  $resultJson = $resultObj | ConvertTo-Json -Depth 12
  Set-Content -LiteralPath $outStd -Value $resultJson -Encoding UTF8
  Set-Content -LiteralPath $outDup -Value $resultJson -Encoding UTF8

  $summary.Add([pscustomobject]@{
    doc = $docRel
    checked = $checked
    passed = $passed
    failed = $failures.Count
  }) | Out-Null
}

$summary | ConvertTo-Json -Depth 4
