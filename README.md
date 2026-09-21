# Luma retrofit reader: CAD model

A compact, removable urine-strip reader with a common enclosure and six interchangeable mounts for existing public-toilet infrastructure. The model was built natively in SolidWorks 2026 by a C# generator. It is also exported to **STEP**, **STL** and a **browser-based 3D viewer**, so you can open it without SolidWorks.

![3D viewer](docs/3d-viewer.png)

> **Engineering prototype, Rev A.** This is not a fabrication release or a clinically validated device. Sample transport, clamp mechanisms and interfaces still need detailed design and testing. See [ENGINEERING.md](ENGINEERING.md).

## Open the model

**First, download the repository:** click **Code → Download ZIP** on GitHub, then right-click the zip and choose **Extract All**. Don't open files from inside the zip. The viewer and the SolidWorks assembly both need the files next to them. You can also `git clone` the repository.

| What you have | What to open |
|---|---|
| **Just a web browser** | Double-click **`START.html`**. The interactive 3D viewer opens and works offline. |
| **FreeCAD, Fusion 360, Onshape, Inventor, Solid Edge, CATIA, …** | A STEP file from [`builds/20260913-163314/exports/step/`](builds/20260913-163314/exports/step/) |
| **SolidWorks 2026 or newer** | [`builds/20260913-163314/Luma_Retrofit.SLDASM`](builds/20260913-163314/) |
| **A slicer / 3D printer** | Per-part STL files in [`builds/20260913-163314/exports/stl/`](builds/20260913-163314/exports/stl/) |
| **Nothing downloaded yet** | Browse [`exports/stl`](builds/20260913-163314/exports/stl/) on GitHub and click any `.stl` file. GitHub shows a rotatable 3D preview. |

### 1. Browser 3D viewer (no install)

Open `START.html`, which forwards to `builds/20260913-163314/Viewer.html`. It works offline in any current Chrome, Edge, Firefox or Safari.

- **Configuration menu:** switch between the 12 mounting/power combinations, the 4 "installed on host" scenes, the service view and the exploded layout.
- **Mouse:** left-drag rotates, right-drag pans, scroll zooms. Click a part for its material, process and size from the BOM. Double-click zooms to it.
- **Toolbar:** Iso / Front / Right / Top / Back views, **X-ray** (see through the housing), edge lines and PNG screenshots.
- **Parts panel:** filter by name or material, hide parts, or isolate one.
- **Links to a view:** add the configuration name after `#`, e.g. `Viewer.html#Rail_Battery`.
- **Keyboard:** `F` fit, `X` X-ray, `E` edges, `1`–`5` views, `H` hide selected, `Esc` clear.

The same page also links to `Review.html`, the design review with dimensioned drawings, native SolidWorks renders, the filterable BOM and the engineering record.

**Share it online (optional).** In the repository go to **Settings → Pages**, set *Source* to **Deploy from a branch**, choose `main` and `/ (root)`, then save. The viewer will be available at `https://<your-user>.github.io/<repo>/START.html`. GitHub Pages is free for public repositories.

### 2. STEP files (any CAD program)

There is one STEP AP214 assembly per configuration, in millimetres, with colours. Open it with **File → Open/Import** in FreeCAD, Fusion 360 (Upload), Onshape (Import), Inventor, etc.

| Mount | DC power | Battery power | On host (illustrative) |
|---|---|---|---|
| Partition clamp: 12–50 mm panels, padded jaws | `Luma_Partition_DC.step` | `Luma_Partition_Battery.step` | `Luma_Installed_Partition.step` |
| Rail clamp: 32 mm rail, split halves | `Luma_Rail_DC.step` | `Luma_Rail_Battery.step` | `Luma_Installed_Rail.step` |
| Over-partition hook: 55 mm padded gap | `Luma_Hook_DC.step` | `Luma_Hook_Battery.step` | none |
| Floor pedestal: ballasted base | `Luma_Pedestal_DC.step` | `Luma_Pedestal_Battery.step` | `Luma_Installed_Pedestal.step` |
| Smooth-surface pads | `Luma_Smooth_DC.step` | `Luma_Smooth_Battery.step` | `Luma_Installed_Smooth.step` |
| Magnetic mount | `Luma_Magnetic_DC.step` | `Luma_Magnetic_Battery.step` | none |

`Luma_Service_Open.step` shows front access with the covers removed. The host geometry in the *Installed* files (partition panel, rail, floor, wall) is illustrative reference only.

STEP carries the solid geometry but not the SolidWorks feature history or parametric equations. Edit those in SolidWorks (below).

### 3. SolidWorks (native, parametric)

Open `builds/20260913-163314/Luma_Retrofit.SLDASM` and keep the `parts` folder beside it. **SolidWorks 2026 or newer is required,** because SolidWorks files cannot be opened in older versions. The free [eDrawings Viewer](https://www.edrawingsviewer.com/) can view them only if it is also version 2026 or newer.

Choose a combination in the ConfigurationManager:

- `Partition_DC` / `Partition_Battery`, `Rail_DC` / `Rail_Battery`, `Hook_DC` / `Hook_Battery`, `Pedestal_DC` / `Pedestal_Battery`, `Smooth_DC` / `Smooth_Battery`, `Magnetic_DC` / `Magnetic_Battery`
- `Installed_Partition` / `Installed_Rail` / `Installed_Pedestal` / `Installed_Smooth`: illustrative host geometry
- `Service_Open`: front access view with selected covers removed

Also in the folder: `Luma_Exploded.SLDASM` (separated-parts review assembly) and `Luma_GA.SLDDRW` (general-arrangement drawing).

### 4. STL files (3D printing)

Each part is a binary STL in millimetres, in its own coordinate system. Check the `Process` column of [`BOM.csv`](builds/20260913-163314/BOM.csv) before printing. Parts named `*_envelope` are space reservations for purchased components (Arduino, sensors, battery, motor, …), and COTS items should be bought, not printed.

## Repository layout

```
START.html                      Opens the 3D viewer
README.md, ENGINEERING.md       This guide; installation matrix, assumptions, materials, open engineering work
LATEST.txt                      Name of the current build folder
builds/20260913-163314/         Current build (the only one kept; earlier failed runs are in git history)
  Viewer.html, viewer/          Browser 3D viewer and its model data
  Review.html                   Design review: dimensioned drawings, native renders, BOM, engineering record
  Luma_Retrofit.SLDASM          SolidWorks assembly (+ Luma_Exploded.SLDASM, Luma_GA.SLDDRW)
  parts/                        109 native SolidWorks parts
  exports/step/                 STEP assemblies, one per configuration
  exports/stl/                  STL mesh per part
  exports/scene.json            Component placements per configuration (used by the viewer)
  BOM.csv                       Envelopes, positions, materials and processes
  views/                        Native SolidWorks renders
  VALIDATION.md, *.txt, *.csv   Rebuild, sketch-constraint, geometry and interference check records
src/                            Generator and export source (C#, PowerShell, Node.js)
```

## Rebuilding from source (SolidWorks users)

**Requirements:** Windows with a licensed SolidWorks 2026 or newer. You also need .NET Framework 4.x (included with Windows) and [Node.js](https://nodejs.org) for the reports and viewer. Default templates must be set in SolidWorks under **Tools → Options → Default Templates**. The script finds the SolidWorks install through the registry; set `SOLIDWORKS_DIR` to override it.

```powershell
# Full build into a new builds\<timestamp> folder (updates LATEST.txt)
powershell -ExecutionPolicy Bypass -File src\Build.ps1

# After editing the current model in SolidWorks: refresh STEP, STL, the 3D viewer and the review page
powershell -ExecutionPolicy Bypass -File src\Build.ps1 -ExportOnly

# Zip the current build for a GitHub Release
powershell -ExecutionPolicy Bypass -File src\Package.ps1
```

Don't run several builders against the same SolidWorks instance. Each run creates new documents and saves only its own output. Export opens the model read-only, and it restores your STL/STEP export settings when it finishes.

| Source | Purpose |
|---|---|
| `src/LumaBuilder.cs` | Native geometry and assembly generator; millimetre layout values are in `Layout()` |
| `src/Verify.cs` | Reopen and inspect parts/assembly, constrain remaining sketch translations, record volumes, check interference |
| `src/RepairConfigurations.cs`, `Scenes.cs`, `Finalize.cs`, `FinalAudit.cs` | Configuration checks, host reference geometry, exploded assembly, final views |
| `src/HardwareDetails.cs` | Screw clearances, rail-saddle contact relief, hook-plate separation |
| `src/Export.cs` | STEP per configuration, STL per part and the placement data for the viewer |
| `src/Viewer.js`, `src/Viewer.html` | Build the offline 3D viewer; checks every placement against SolidWorks' own component boxes |
| `src/Report.js`, `src/Audit.js` | Offline design review, dimensioned SVG drawings and validation record |
| `src/vendor/` | [three.js](https://threejs.org) r147 (MIT licence) used by the viewer |

## What "parametric" means here

Parts contain sketches and extrusion features, with dimensions linked to global variables. The overall layout is generated from the named dimension/position table in C#. This version does not use a fully linked master skeleton or functional mechanical mates, so changing one part does not automatically resize its neighbours. Fixed component placements support packaging review. The optical mechanism still needs bearings, travel constraints and a motion study before it can be claimed operational.
