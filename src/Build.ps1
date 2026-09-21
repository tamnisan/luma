param([string]$Resume='')
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$interop = 'C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS'
$compiler = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
Copy-Item -LiteralPath "$interop\SolidWorks.Interop.sldworks.dll" -Destination $PSScriptRoot -Force
Copy-Item -LiteralPath "$interop\SolidWorks.Interop.swconst.dll" -Destination $PSScriptRoot -Force
& $compiler /nologo /platform:x64 /target:exe "/out:$PSScriptRoot\LumaBuilder.exe" "/reference:$interop\SolidWorks.Interop.sldworks.dll" "/reference:$interop\SolidWorks.Interop.swconst.dll" "$PSScriptRoot\LumaBuilder.cs"
if($LASTEXITCODE -ne 0){throw 'Compilation failed'}
& "$PSScriptRoot\LumaBuilder.exe" $root $Resume
if($LASTEXITCODE -ne 0){throw 'CAD build failed; see build.log'}
$run = (Get-Content -Raw -LiteralPath "$root\LATEST.txt").Trim()
foreach($stage in @('RepairConfigurations','Scenes','Verify','HardwareDetails','Finalize','FinalAudit')) {
    & $compiler /nologo /platform:x64 /target:exe "/out:$PSScriptRoot\$stage.exe" "/reference:$interop\SolidWorks.Interop.sldworks.dll" "$PSScriptRoot\$stage.cs"
    if($LASTEXITCODE -ne 0){throw "$stage compilation failed"}
    & "$PSScriptRoot\$stage.exe" $run
    if($LASTEXITCODE -ne 0){throw "$stage failed; inspect logs"}
}
$node = 'C:\Users\sonoi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if(Test-Path -LiteralPath $node){ & $node "$PSScriptRoot\Audit.js" $run; & $node "$PSScriptRoot\Report.js" $run }
