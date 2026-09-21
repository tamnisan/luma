# Luma / Rev A engineering prototype

## Design intent and status

Luma is a removable urine-strip reflectance-reader module for existing public toilets. This package is a native SolidWorks engineering layout and reproducible C# generator. It is a prototype starting point, not a clinically validated instrument or fabrication release. Read `checks.txt` and `sketch_checks.txt` in the latest build for actual CAD results. No design certification is implied by the renderings.

The envelope is 230 mm wide × 330 mm high × 134 mm deep, with the rear adapter datum at z = -16 mm, giving a nominal 150 mm projection. Mounts can add rearward depth: 150 mm is the main unit/interface envelope, not a claim that every clamp installation occupies only 150 mm. Coordinates: x left/right, y upward from case bottom, z forward from case rear. Floor stand layouts place the kiosk bottom about 1,000 mm above the base top; final installation height needs a site-specific reach assessment.

Requirements originating in the supplied presentation include the 300–350 × 200–250 × 120–150 mm envelope, TCS34725 sensor, two white LEDs, Arduino Uno, 14-pad strip concept, private results and front servicing. The source presentation's INR 2,667 estimate covers a sensor, Uno, strips, LEDs and jumpers only. It does not establish the cost of an enclosure, mounts, automation, battery, display, or waste system.

## Mechanical architecture

| Zone | Layout / rationale | Open design work |
|---|---|---|
| Dry electronics | Upper tray, sealed lid, full wet/dry shelf below | Select feedthroughs and gasket compression; no leak test performed |
| Unused strips | Separate left cassette with removable lid | Strip supplier and moisture barrier/desiccant system required |
| Optics | Right central chamber, black insert, moving RGB/LED carriage and stationary strip datum | Optical brackets and scan drive require development and calibration |
| Sample input | Front removable tray behind shutter | Manual strip insertion is Rev A; powered transfer to optical datum is not validated |
| Waste | Lower removable tray/cartridge; closure slide for removal | Transfer/ejection chute and self-closing seal require detailed development |
| Cleaning | Independent small fluid-cartridge allowance plus removable wetted inserts | Washing sequence, drain isolation and carryover tests required |
| Power | Battery tray configuration or DC connector configuration | Actual pack, BMS, fuse and rated connector selection required |
| Interface | Display bezel/window, QR area, indicator and lock | Display mount angle, wiring and software are prototype tasks |

The clean cassette is separate from the contaminated measurement path. Baseline operating concept: operator/user inserts an already wetted strip in a keyed disposable carrier; reader checks cover closure and strip presence; optics scan; user receives a private result; used strip goes into a closed waste cartridge. The CAD includes packaging for future feed/eject and cleaning functions. It does not demonstrate a fully automatic urine sampling mechanism. Do not present a clean cassette plus motor envelope as proof of automatic dispensing or fluid handling.

Screen/SMS/payment/clinical algorithms are outside this mechanical CAD implementation. In particular, an offline device cannot verify a new UPI payment or deliver SMS without a suitable connection; local measurement and local display are the offline workflow.

## Configurable dimensions and measured inputs

The generator's `Layout()` lists every part dimension and position in mm. Every extruded feature has a global depth variable. Auto-defined sketch dimensions are linked to individual global variables named `Profile_Sketch_N` or `Back_Sketch_N`. `EnvelopeWidth` and `EnvelopeHeight` are reference metadata, not master assembly controls. To change the whole layout consistently, edit `Layout()` and rebuild into a new timestamped directory. Local edits to one part do not automatically resize adjacent parts.

| Parameter | Prototype value / investigation range | Evidence needed |
|---|---|---|
| Case W/H | 230 / 330 mm | Packaging build and installed clearances |
| Shell / adapter thickness | 3 / 4 mm | Print trials and structural checks; optimise steel mass |
| Strip envelope | 125 × 5 × 0.5 mm | Measure purchased strip, including handle |
| Sensor board envelope | 21 × 21 × 5 mm | Supplier drawing; not all TCS34725 boards match |
| UNO envelope | 69 × 54 × 16 mm | Board plus cable/connector height |
| Sensor-to-pad spacing | Initial envelope around 10–20 mm; explore 5–25 mm on optical jig | Read repeatability, saturation, pad crosstalk |
| LED angle | Explore 30–60° to pad plane | Specular rejection and uniformity tests; brackets presently schematic |
| Pad centres / scan stroke | Supplier-specific; proposed ~100 mm scan range | Actual pad positions and lead-screw travel |
| Pad reaction times | Supplier-defined per pad | Do not use one universal read time |
| Partition thickness | Intended 12–50 mm; represented at 50 mm | Jaw adjustment, screw travel and pad load tests |
| Rail/post diameter | 32 mm insert shown; intended 25/32/38 mm variants | Exact rail geometry, stiffness and permitted load |
| Hook opening | Nominal 55 mm padded gap | Partition top condition, thickness and overhead clearance |
| Battery | 75 × 23 × 39 mm allowance | Energy budget and purchased protected pack |
| Waste capacity | Compute from CAD cavity; do not infer test count from gross volume | Strip stacking, liquid retention and service interval |
| Service space | Reserve 250 mm in front as an initial survey allowance | Full door swing and withdrawal trials |

No assumptions about test-strip chemistry, sensitivity or clinical accuracy are validated here. Fourteen listed analytes do not establish that the selected strip and reader can measure all fourteen reliably.

## Mounting compatibility matrix

All adapters use a common 180 × 260 mm plate with Ø5 mm mounting clearances at x = ±78 mm, y = 49 and 281 mm. Rear stand-offs include Ø4.5 mm screw clearances; the clamp moving jaws include simplified Ø8.1 mm screw passages. Rail bridges have a cylindrical contact relief matching the clamp's 27 mm outside radius. Thread retention, nuts, shoulders, clamp ears and captive-fastener details still require mechanical development before manufacture. Existing infrastructure supplies no new drilled holes.

| Configuration | Suitable site | Exclusions / prerequisites | Reversible installation |
|---|---|---|---|
| Partition | Accessible edge of a structurally suitable 12–50 mm partition | No thin loose sheet, glass edge, fragile finish, moving door or uncertain panel anchorage | Padded opposed jaws and installer-adjusted screws; concept needs load test |
| Rail/post | Approved structural post with unobstructed grip/access zone | Do not load water/flush pipes or impair a required grab rail; obtain asset-owner load information | Split clamp halves, replaceable elastomer inserts and anti-rotation bridge |
| Over-partition hook | Sound exposed partition top | No door closer, door movement or head-clearance conflict; no glass without approved hardware | Padded hook, anti-lift restraint and positive anti-rotation attachment |
| Weighted pedestal | Level floor with enough space and cleaning access | Reject wet slippery/uneven sites unless measured stability and slip resistance pass; no obstructed route | Place and level without anchors; heavy base needs handling provision |
| Smooth surface | Qualified glass/glazed tile with tested mounting product | Reject porous/rough/contaminated surfaces, damaged tile, unknown substrate or no independent tether point | Selected rated removable system; presently not approved for deployment |
| Magnetic | Verified ferromagnetic structural steel | No aluminium, austenitic stainless, thin unsupported sheet, loose coating or no independent tether point | Rated magnetic pots, shear-resisting arrangement and independent tether |

Adhesive and magnetic adapters are reserved configurations, not verified attachment solutions. A safety tether requires an existing suitable independent anchor; if none exists, reject these methods and consider a different mount. No mount is universally compatible. The common enclosure stays consistent while the installer chooses a compatible attachment and checks user clearances.

## Load and stability assumptions

Use the computed component-volume estimate in the generated report as a preliminary dry mass only. Purchased-part densities are placeholders. Add consumables, retained liquid, wiring, all fasteners and manufacturing changes. For initial attachment study use a conservative 10 kg supported device allowance and evaluate 100 N outward and lateral user loads separately. These are chosen design cases, not requirements from a cited standard.

- Gravity for 10 kg: 98.1 N. With 3× static allowance, investigate 294.3 N vertical attachment capacity.
- At a 90 mm centre-of-mass offset, dead-load moment is 8.83 N·m; with that allowance it is 26.5 N·m.
- A 100 N outward load can add a moment depending on its actual application point. Never add moments without checking direction and lever arm.
- Clamp shear estimate: required total normal force N ≥ design shear / measured coefficient of friction. At provisional μ = 0.3 and design shear 294.3 N, N ≥ 981 N across contact faces. Wet friction may be much lower; this is not a clamp rating or tightening-torque prescription.
- The 500 × 500 × 30 mm steel ballast envelope is 60 kg at 8,000 kg/m³. Base-only restoring moment about an edge is approximately 147 N·m when centred. A 100 N horizontal force at 1.30 m gives 130 N·m, margin only 1.13 before sliding or offsets. A 150 N force gives 195 N·m and fails this base-only assessment. Do not call this pedestal vandal-resistant or tip-certified. Its footprint/mass conflict needs site-specific resolution.
- Sliding check uses measured wet-floor friction: R = μ × total weight. Tipping resistance does not establish resistance to sliding.

The CAD density defaults are not engineering material assignments. The generated report estimates mass from explicit geometric volumes and listed densities; SolidWorks mass properties must not be used as certified values until production materials and purchased-component masses are assigned. The final exploded layout is in a separate `Luma_Exploded.SLDASM` document because fixed-component position changes propagated across configurations during testing. `final-interferences.txt` supersedes earlier interference logs after the installed positions are restored.

## Assembly and service sequence

1. Assemble shell, dry compartment, barrier and rear plate. Fit actual seals and perform leak inspection before electronics.
2. Install optical chamber on repeatable datums; install sensor/LED modules and calibration reference. Confirm dark reading with covers closed.
3. Install strip guide, sample carrier and drive hardware. Prove motion and jam recovery without samples before fluid testing.
4. Fit electrical modules, protected battery or DC input, fuse, glands and strain relief. Keep cable routes above liquid retention regions.
5. Fit removable clean cassette, sample drawer, drip tray, cleaning insert and waste cartridge. Verify that each removes from the front without exposure of clean stock.
6. Fit front panels, display window, lock, hinges and interlock. The current CAD uses separate panel bodies; final door fasteners and full hinge swing require detailing.
7. Choose a compatible mount using the survey below. Perform an instrumented proof test off-site before public deployment.
8. Maintenance: disable motion; close waste cartridge slide; withdraw and replace waste cartridge; remove/wash or replace wetted insert; inspect seals; refill clean stock through the clean access path; replace protected battery if used; close and lock covers; run reference and sensor checks.

The used-strip cartridge must not be emptied through the clean compartment. The cartridge slide must close before removal. Opening the service door disables motion; a missing/full cartridge inhibits testing; jam/overflow states stop further sample intake. Sensor boxes in the model reserve these functions but do not implement electrical interlocks.

## Site survey / installer record

- Record fixture type, photographs, mounting surface dimensions, owner approval, material and structural condition.
- Measure free width/depth, opening doors, cleaner access and remaining circulation space.
- Identify accessible partition edge or qualified support, exact thickness/diameter and a compatible mount.
- Determine permitted surface pressure, clamp load and removable-product compatibility with the finish.
- Check display/sample reach with intended users; inspect for privacy conflicts and sharp/pinch points.
- Verify clear access to flush controls, grab rails, toilet/urinal, door latches and emergency routes.
- Identify existing safe power source or use a removable battery. No new building wiring or plumbing.
- Check the actual installed projection including mount hardware and cable bend radius.
- Confirm front service space and a hygienic route for replacement cartridges.
- For optional mounts, record tether anchor, substrate verification and applicable supplier rating.
- For pedestal, measure levelness and wet friction; prove stability at actual mass, height and applied loads.
- Reject the site if none of the reversible options passes these checks.

## Verification and remaining development

| Item | Current evidence | Required before fabrication/deployment |
|---|---|---|
| Native geometry / rebuild | CAD generator checks extrusions and saves; inspect generated logs | Reopen all final references and resolve rebuild errors |
| Sketch constraint state | 125 inspected sketches fully constrained after final detailing; state 3 | Recheck after dimensional or mechanism changes |
| Interference | SolidWorks static interference log for default configuration | Classify intentional contact, resolve unintended overlap; inspect all moving states |
| Envelope | Part and assembly bounding checks in report | Actual mount and site envelope verification |
| Optical geometry | Layout only | Bench study, repeatable datums, black finish, pad-specific calibration |
| Feed/eject | Packaging allowance | Detailed kinematics and physical strip-jam/carryover tests |
| Hygiene | Separated compartments and removable trays | Leak, cleaning efficacy, liquid carryover, disinfectant compatibility |
| IP54/IP55 | Design target only | Selected seals, drainage/vents and tested complete enclosure |
| User/service clearance | Concept envelope only | Door sweep, reach, pinch-point and maintenance demonstration |
| Reversible mounts | CAD concepts | Load paths, clamp hardware, surface damage and creep/pull tests |
| Manufacturing | Printed prototype and steel bracket concepts | Fillets, draft, rib/boss design, bend radii, tolerances, threaded inserts |
| CAD assembly mechanism | Fixed components for packaging | Mates, bearings, linkages, travel stops and motion study |
| Clinical performance | None | Appropriate analytical/clinical validation for chosen consumables |

Optional external auto-flush actuator is deliberately not installed in this baseline: no specific existing flush-button or lever geometry was supplied, and core measurement is independent of plumbing. A future removable actuator must preserve manual operation and spring-return safely on power loss.

## Prototype cost allowances (INR, not supplier quotes)

| Category | Planning allowance |
|---|---:|
| Sensor, Uno, LEDs and wiring | 1,167 from presentation, excludes its strip pack |
| 100-strip pack | 1,500 from presentation; confirm supplier and compatibility |
| Printed enclosure / removable trays | 2,000–4,500 |
| One mechanical mount / locks / seals / fasteners | 1,500–3,500 |
| Display / interface | 500–1,500 |
| Motion / bearings / driver / interlocks | 1,000–3,000 |
| Power / protection | 700–2,000 |
| Optical finish / calibration / cleaning provisions | 500–1,500 |
| Total, before stand / connectivity / labour / validation | 8,867–18,667 |

Do not claim the complete kiosk meets an INR 3,000 target. The heavy pedestal, tooling and clinical validation are separate costs. Use these allowances to decide what to prototype first, then replace them with dated supplier quotes.

## Source and reproducibility

Source idea: `Smart-Health-Kiosks-Democratizing-Diagnostics-via-Public-Infrastructure.pdf.pdf`, supplied by the user, especially pages 4–7, 10–11. User's pasted request controls scope; the PDF is supporting reference material. Geometric/API implementation follows local SOLIDWORKS 2026 interop signatures and official documentation:

- https://help.solidworks.com/2023/English/api/sldworksapi/SOLIDWORKS.Interop.sldworks~SOLIDWORKS.Interop.sldworks.ISketchManager~CreateCornerRectangle.html
- https://help.solidworks.com/2020/English/api/sldworksapi/Insert_Feature_Extrusion_Example_VB.htm

Run `src/Build.ps1` from Windows PowerShell on the same Windows installation with a licensed, available SolidWorks 2026. The script compiles a 64-bit .NET Framework C# executable against installed interop libraries. No API key or cloud CAD service is needed. It creates a new timestamped build and never overwrites prior builds or user CAD models. The SolidWorks install folder is read from the registry (override with the `SOLIDWORKS_DIR` environment variable) and new documents use the default templates set in SolidWorks under Tools > Options > Default Templates, so no paths need editing on another PC.
