# Luma retrofit CAD

Open `START.html`, which leads to the current build's `Review.html`. This offline review includes dimensioned reference drawings, native CAD images, a filterable bill of materials, mass estimates and the engineering record. In the working project, `LATEST.txt` also records the build location.

Open `Luma_Retrofit.SLDASM` in SolidWorks 2026. Keep its `parts` directory beside it. Use ConfigurationManager to select one of the mounting/power combinations:

- Partition_DC / Partition_Battery
- Rail_DC / Rail_Battery
- Hook_DC / Hook_Battery
- Pedestal_DC / Pedestal_Battery
- Smooth_DC / Smooth_Battery
- Magnetic_DC / Magnetic_Battery
- `Luma_Exploded.SLDASM`: independent separated-parts review assembly, preserving installed component positions
- Installed_Partition / Installed_Rail / Installed_Pedestal / Installed_Smooth: illustrative host geometry
- Service_Open: front access view with selected covers removed

Read `ENGINEERING.md` for the installation matrix, assumed dimensions, material/process choices, assembly and servicing sequence, site-survey checklist, budget allowances and unresolved engineering work. This is an engineering prototype. The sample transport, clamp mechanisms and interfaces still require detailed design and testing; it must not be treated as a fabrication release or a clinically validated device.

## Files

- `src/LumaBuilder.cs`: native SolidWorks geometry and assembly generator. Millimetre layout values are in `Layout()`.
- `src/Build.ps1`: compile and execute using installed SolidWorks interop libraries.
- `src/Verify.cs`: reopen and inspect parts/assembly, constrain remaining sketch translations, record body volumes and check static interference.
- `src/RepairConfigurations.cs`, `src/Scenes.cs`, `src/Finalize.cs`: configuration verification, host reference geometry, independent exploded assembly and final views.
- `src/HardwareDetails.cs`: screw clearances, curved rail-saddle contact relief and hook-plate separation.
- `src/Report.js`: generate offline HTML review and dimensioned SVG reference drawings from the build BOM and logs.
- `builds/<timestamp>/parts`: native SLDPRT files.
- `builds/<timestamp>/Luma_Retrofit.SLDASM`: assembly.
- `builds/<timestamp>/Luma_GA.SLDDRW`: native general-arrangement views, where generated successfully.
- `builds/<timestamp>/BOM.csv`: component envelopes, positions, materials and manufacturing notes.
- `builds/<timestamp>/verification.txt`: final reopen, rebuild and interference results.
- `builds/<timestamp>/verified-sketches.txt`: actual sketch constraint status after verification.
- `builds/<timestamp>/measured-geometry.csv`: measured solid-body envelopes and volumes.
- `builds/<timestamp>/Review.html`: standalone review entry point; keep its SVG and views together.

Builds use unique timestamps. Earlier failed/interrupted runs are retained as development records and are not deliverables; only `LATEST.txt` identifies the intended current build. Do not merge their part folders.

## Rebuild

From Windows PowerShell:

```powershell
& 'C:\Users\sonoi\Luma-Retrofit-CAD\src\Build.ps1'
```

The source requires the installed .NET Framework compiler, a usable SolidWorks licence and the configured 2026 templates. Do not run multiple builders against the same SolidWorks instance. The program creates new documents and saves only its own output. A native save/rebuild failure terminates the build with its error recorded.

For another PC, update the SolidWorks installation/template paths in `Build.ps1` and `LumaBuilder.cs`. The generator is supplied as C# source and an executable compiled on this computer; no external API service is required.

## Meaning of parametric

Parts contain sketches and extrusion features, with dimensions linked to global variables. The overall layout is generated from the named dimension/position table in C#. This version does not use a fully linked master skeleton or functional mechanical mates; changes to a part do not automatically resize its neighbours. Fixed component placements support packaging review. The optical mechanism still needs bearings, travel constraints and a motion study before it can be claimed operational.
