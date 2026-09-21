# Full build:  src\Build.ps1                 (new timestamped build of the whole model)
# Re-export:   src\Build.ps1 -ExportOnly     (refresh STEP/STL/3D viewer of the LATEST.txt build after editing it in SolidWorks)
param([string]$Resume='', [switch]$ExportOnly)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
# SolidWorks install folder: SOLIDWORKS_DIR if set, otherwise the newest version registered on this PC.
$interop = $env:SOLIDWORKS_DIR
if(!$interop){
    $key = Get-ChildItem 'HKLM:\SOFTWARE\SolidWorks' -ErrorAction SilentlyContinue | Where-Object { $_.PSChildName -match '^SOLIDWORKS \d{4}$' } | Sort-Object PSChildName | Select-Object -Last 1
    if($key){ $interop = (Get-ItemProperty -LiteralPath "$($key.PSPath)\Setup" -ErrorAction SilentlyContinue).'SolidWorks Folder' }
}
if(!$interop){ $interop = 'C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS' }
$interop = $interop.TrimEnd('\')
if(!(Test-Path -LiteralPath "$interop\SolidWorks.Interop.sldworks.dll")){ throw "SolidWorks API libraries not found in '$interop'. Install SolidWorks or set SOLIDWORKS_DIR to its install folder." }
$compiler = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$refs = @("/reference:$interop\SolidWorks.Interop.sldworks.dll", "/reference:$interop\SolidWorks.Interop.swconst.dll")
Copy-Item -LiteralPath "$interop\SolidWorks.Interop.sldworks.dll" -Destination $PSScriptRoot -Force
Copy-Item -LiteralPath "$interop\SolidWorks.Interop.swconst.dll" -Destination $PSScriptRoot -Force
$stages = @('Export')
if(!$ExportOnly){
    & $compiler /nologo /platform:x64 /target:exe "/out:$PSScriptRoot\LumaBuilder.exe" $refs "$PSScriptRoot\LumaBuilder.cs"
    if($LASTEXITCODE -ne 0){throw 'Compilation failed'}
    & "$PSScriptRoot\LumaBuilder.exe" $root $Resume
    if($LASTEXITCODE -ne 0){throw 'CAD build failed; see build.log'}
    $stages = @('RepairConfigurations','Scenes','Verify','HardwareDetails','Finalize','FinalAudit') + $stages
}
# Builds always live in builds\<timestamp>; use only the folder name so a moved or downloaded copy still resolves.
$run = Join-Path "$root\builds" (Split-Path (Get-Content -Raw -LiteralPath "$root\LATEST.txt").Trim() -Leaf)
foreach($stage in $stages) {
    & $compiler /nologo /platform:x64 /target:exe "/out:$PSScriptRoot\$stage.exe" $refs "$PSScriptRoot\$stage.cs"
    if($LASTEXITCODE -ne 0){throw "$stage compilation failed"}
    & "$PSScriptRoot\$stage.exe" $run
    if($LASTEXITCODE -ne 0){throw "$stage failed; inspect logs"}
}
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if(!$node){ Write-Warning 'Node.js not found on PATH; skipped Audit.js, Viewer.js and Report.js (install from https://nodejs.org).'; return }
foreach($script in @('Audit.js','Viewer.js','Report.js','Guide.js')){
    & $node "$PSScriptRoot\$script" $run
    if($LASTEXITCODE -ne 0){throw "$script failed"}
}
