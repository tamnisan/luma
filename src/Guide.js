// Generate the website build guide (build-guide.html at the repository root) from the current build's BOM.csv.
// Sizes, positions, part tables and layout diagrams come from the CAD data; purchased-part specifications,
// instructions and the suggested wiring are written below and must stay within the envelopes the CAD reserves.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const run=process.argv[2]||path.join(root,'builds',fs.readFileSync(path.join(root,'LATEST.txt'),'utf8').trim().split(/[\\/]/).pop());
const build=path.basename(run);
const csv=fs.readFileSync(path.join(run,'BOM.csv'),'utf8').trim().split(/\r?\n/);
const keys=csv.shift().split(',');
const bom=csv.map(l=>Object.fromEntries(l.split(',').map((v,i)=>[keys[i],i>=3&&i<=9?+v:v])));
const byName=Object.fromEntries(bom.map(p=>[p.Part,p]));
const part=id=>{const p=byName[id]||bom.find(b=>b.Part.startsWith(id+'_'));if(!p)throw new Error('No BOM part '+id);return p;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mm=v=>(Math.round(v*10)/10).toString().replace('-','−');
const size=p=>`${mm(p.Width_mm)} × ${mm(p.Height_mm)} × ${mm(p.Depth_mm)}`;
const box=ps=>{const b=[1e9,1e9,1e9,-1e9,-1e9,-1e9];for(const p of ps){b[0]=Math.min(b[0],p.X_mm);b[1]=Math.min(b[1],p.Y_mm);b[2]=Math.min(b[2],p.Z_mm);b[3]=Math.max(b[3],p.X_mm+p.Width_mm);b[4]=Math.max(b[4],p.Y_mm+p.Height_mm);b[5]=Math.max(b[5],p.Z_mm+p.Depth_mm);}return b;};
const at=(...ids)=>{const b=box(ids.map(part));return `x ${mm(b[0])}…${mm(b[3])}, y ${mm(b[1])}…${mm(b[4])}, z ${mm(b[2])}…${mm(b[5])} mm`;};
const num=p=>(p.Part.match(/^(\d+)_/)||[])[1];
const pretty=n=>n.replace(/^\d+_/,'').replace(/_(\d+)$/,'').replace(/_/g,' ');
const group=n=>n.replace(/_\d+$/,'');
const viewerUrl=(cfg,ids)=>`builds/${build}/Viewer.html#${cfg}/${ids.map(id=>part(id).Part).join(',')}`;
const show3d=(cfg,ids,text='Show in 3D')=>`<a class="show3d" href="${viewerUrl(cfg,ids)}">${text} ↗</a>`;
const SITE='https://tamnisan.github.io/luma/';

// Purchased and specified components, keyed to the CAD envelopes they must fit.
const BUY=[
 {cat:'Controller and power',ids:['13'],name:'Arduino Uno R3',spec:'ATmega328P, 5 V logic, 68.6 × 53.4 mm board with 4 × Ø3.2 mm holes. The Uno R4 Minima/WiFi share the footprint.',where:'Dry electronics tray, upper left. Stands upright against the tray’s back wall on 5 mm M3 standoffs, headers facing the front.',note:'Keep the USB-B port reachable for programming; the CAD reserves no cable path for it.'},
 {cat:'Controller and power',ids:['14'],name:'Dual fuse holder board',spec:'Two 5 × 20 mm fuse holders on one board. Suggested: F1 input 1 A time-lag, F2 motor branch 0.5 A.',where:'Dry electronics tray, top, right of the Arduino.',note:'Size the fuses to your measured load and wire gauge.'},
 {cat:'Controller and power',ids:['47'],cfg:'Partition_DC',name:'DC barrel jack (DC version)',spec:'Panel-mount 5.5 × 2.1 mm jack, rated ≥ 2 A, compact body.',where:'Upper right, on bracket 46, behind the upper front panel.',note:'Supply: 9 V DC, ≥ 1 A, centre-positive plug-in adapter (SELV) from an existing safe socket. The cable path through the enclosure wall still has to be detailed.'},
 {cat:'Controller and power',ids:['48'],name:'Cable gland',spec:'M12 × 1.5 nylon cable gland, IP68, for cable Ø3–6.5 mm.',where:'Upper right, next to the DC jack.'},
 {cat:'Controller and power',ids:['45'],cfg:'Partition_Battery',name:'2S Li-ion battery pack with protection (battery version)',spec:'7.4 V nominal, 8.4 V full: 2 × 18650 cells in 2S1P with a protection board (BMS), about 70 × 37 × 19 mm.',where:'In the battery tray (44), upper left, in front of the dry-compartment lid.',note:'Charge outside the enclosure with a matching 2S (8.4 V) charger. The energy budget still has to be measured.'},
 {cat:'Optics and sensing',ids:['29'],name:'TCS34725 RGB colour sensor breakout',spec:'I²C colour sensor (address 0x29) on a 3.3–5 V board with regulator, about 20 × 20 mm (e.g. Adafruit 1334 or equivalent).',where:'Centre of the scan carriage (28), facing back onto the test strip.',note:'Ground the board’s LED pin so its own LED stays off and only the two angled LEDs light the pads. Board sizes vary; check it fits the envelope.'},
 {cat:'Optics and sensing',ids:['32','33'],name:'White LEDs',spec:'White SMD LED on a small carrier board, about 20 mA; high colour rendering (CRI ≥ 80) recommended.',where:'On brackets 30 and 31 either side of the sensor.',note:'Aim them 30–60° to the strip to avoid glare; the best angle still has to be found on a bench jig.'},
 {cat:'Optics and sensing',ids:['35'],name:'Micro linear stepper motor',spec:'15 mm-class 2-phase bipolar stepper (about 5 V) with an M3 lead screw and nut, ≥ 100 mm stroke; body within the envelope.',where:'Right end of the optical chamber.',note:'The scan drive is schematic in Rev A: the motor, lead screw and carriage are not yet coupled in the CAD.'},
 {cat:'Optics and sensing',ids:['36'],name:'M3 lead screw',spec:'3 mm lead screw, about 132 mm long; normally supplied with the micro stepper.',where:'Along the top of the optical chamber, beside the scan rail.'},
 {cat:'Optics and sensing',ids:['54'],name:'Carriage home / strip-jam sensor',spec:'Reflective optical sensor (e.g. QRE1113) or a Hall sensor, on a board within the envelope.',where:'Right end of the optical chamber.'},
 {cat:'Optics and sensing',ids:['34'],name:'White reference tile',spec:'8 × 8 × 1 mm white ceramic (or PTFE) reference for calibration.',where:'Right end of the scan travel, level with the test strip.'},
 {cat:'Switches, safety and interface',ids:['51'],name:'Door interlock switch',spec:'Ultra-subminiature snap-action switch, e.g. Omron D2F series (12.8 × 5.8 × 6.5 mm).',where:'Upper right, just behind the door frame.',note:'Wire it so an open door stops all motion.'},
 {cat:'Switches, safety and interface',ids:['52'],name:'Cartridge-present sensor',spec:'Miniature switch, or a Hall-effect sensor with a small magnet on the cartridge.',where:'Lower left, beside the waste cartridge.'},
 {cat:'Switches, safety and interface',ids:['53'],name:'Drip-overflow sensor',spec:'Two-electrode conductive probe (or capacitive pad) on a small custom PCB.',where:'Lower right, at the drip tray.'},
 {cat:'Switches, safety and interface',ids:['18'],name:'Status LED',spec:'5 mm green LED with a 330 Ω series resistor.',where:'Front face of the upper panel, left of the display.',note:'Drill a Ø5 mm hole in the upper front panel; it is not cut in the CAD.'},
 {cat:'Switches, safety and interface',ids:['19'],name:'Piezo buzzer',spec:'Passive piezo buzzer, driven with tone().',where:'Dry electronics tray, top right.'},
 {cat:'Switches, safety and interface',ids:['57'],name:'Service lock',spec:'Compact quarter-turn cam lock.',where:'Right edge of the door, mid height.'},
 {cat:'Switches, safety and interface',ids:['16'],name:'Display window',spec:'1 mm clear polycarbonate sheet, laser-cut.',where:'Front of the upper panel, over the 84 × 40 mm display opening.'},
 {cat:'Switches, safety and interface',ids:['17'],name:'QR label',spec:'Printed vinyl label, 27 × 27 mm.',where:'Front of the upper panel, right of the display.'},
 {cat:'Consumables',ids:['26'],name:'Urinalysis reagent test strips',spec:'10–14 parameter urine test strips; the CAD assumes a 125 × 5 × 0.5 mm strip (14-pad concept).',where:'Held by the strip datum carrier (25) under the sensor.',note:'Measure your supplier’s strip (length with handle, pad pitch, reaction times) before finalising the carrier.'},
 {cat:'Hardware',ids:['55','56'],name:'Door hinges',spec:'Stainless hinge knuckles, Ø8 mm × 16 mm, Ø4 mm pin.',where:'Left edge of the door, near the bottom and top.'},
 {cat:'Hardware',ids:['58'],name:'Tether eye',spec:'Stainless ring, Ø16 mm outside, Ø8 mm hole, 4 mm thick.',where:'Back of the enclosure, upper right.',note:'Anchor point for a safety tether (required for smooth-surface and magnetic mounts).'},
 {cat:'Hardware',ids:['59_M4_captive_fastener_0','59_M4_captive_fastener_1','59_M4_captive_fastener_2','59_M4_captive_fastener_3'],name:'M4 captive screws',spec:'M4 captive panel screws, A2 stainless, length to suit the plate stack.',where:'Back of the enclosure, through the mounting plate at x ±78 mm, y 49 and 281 mm.'},
 {cat:'Mount hardware',ids:['Partition_M8_screw_0','Partition_M8_screw_1'],cfg:'Partition_DC',name:'Partition clamp screws',spec:'M8 stainless clamp screws with knobs, long enough for 12–50 mm panels (the CAD shows a 16 mm stub).',where:'One per partition clamp, through the moving jaw.'},
 {cat:'Mount hardware',ids:['Magnet_pot_0','Magnet_pot_1','Magnet_pot_2','Magnet_pot_3'],cfg:'Magnetic_DC',name:'Pot magnets (magnetic mount)',spec:'Ø32 × 7 mm neodymium pot magnets with threaded boss.',where:'Four corners of the magnetic adapter plate.',note:'Reserved concept, not approved: holding force must be verified and an independent tether fitted.'},
 {cat:'Mount hardware',ids:['Smooth_pad_0','Smooth_pad_1','Smooth_pad_2','Smooth_pad_3'],cfg:'Smooth_DC',name:'Removable mounting pads (smooth-surface mount)',spec:'50 × 55 × 2 mm rated removable pads for glass or glazed tile.',where:'Four corners of the smooth-surface adapter plate.',note:'Reserved concept, not approved: use a rated product and an independent tether.'},
];
const bought=new Set(BUY.flatMap(b=>b.ids.map(id=>part(id).Part)));

// Needed to make it work but not modelled in the CAD.
const EXTRA=[
 ['16×2 character LCD with I²C backpack','1','LCD1602 with PCF8574 backpack (I²C address 0x27 or 0x3F), board 80 × 36 mm.','Behind the 84 × 40 mm opening in the upper front panel (03), under the window (16). In the battery version, check it clears the battery tray (top edge at y 257 mm).'],
 ['Stepper motor driver','1','DRV8834 low-voltage stepper driver carrier (2.5–10.8 V motor supply). Set its current limit to the motor’s rating.','Dry electronics tray, in the free area right of the fuse module (about x 30…95, y 225…290 mm).'],
 ['Reverse-polarity diode','1','3 A Schottky diode (e.g. 1N5822 or SS34) in series with the supply input.','Dry electronics tray, at the fuse module input.'],
 ['Resistors (¼ W)','5','2 × 150 Ω (white LEDs), 1 × 330 Ω (status LED), 2 × 10 kΩ (battery voltage divider, battery version).','On the wiring harness or a small perfboard in the dry tray.'],
 ['Wire, connectors and heat-shrink','—','22 AWG for power, 26 AWG for signals; JST-XH connectors so each module can be unplugged for service.','Routed through the cable channel (50) on the right side, above liquid-holding areas.'],
 ['Standoffs and screws for the Arduino','4 + 8','M3 × 5 mm nylon standoffs, M3 × 6 mm screws.','Dry tray back wall.'],
 ['Heat-set threaded inserts','4 + as needed','M4 brass inserts for the four mounting-plate screws; M3 inserts for lids and brackets.','Back wall of the main shell (01) at x ±78 mm, y 49 and 281 mm; lids and brackets.'],
 ['Power supply or charger','1','DC version: 9 V DC, ≥ 1 A, centre-positive adapter. Battery version: 2S (8.4 V) Li-ion charger.','Outside the enclosure.'],
 ['Seals and feed-throughs','—','Gaskets or sealant where cables pass the wet/dry barrier (38) and dry-tray lid (12).','Barrier and dry compartment.'],
];

// Fabricated parts: everything in the BOM that is not bought.
const fabricated=kind=>{const rows={};for(const p of bom){if(bought.has(p.Part))continue;const k=/Die cut/.test(p.Process)?'epdm':/Laser cut/.test(p.Process)?'steel':/print/.test(p.Process)?'print':'other';if(k!==kind)continue;const g=group(p.Part);(rows[g]=rows[g]||{p,qty:0}).qty++;}return Object.values(rows);};
const groupLabel=g=>g==='Core'?'All versions':g==='DC'?'DC version':g==='Battery'?'Battery version':g.startsWith('Mount_')?g.slice(6)+' mount':g;
const printNote=p=>{const n=[];const big=Math.max(p.Width_mm,p.Height_mm,p.Depth_mm);if(big>250)n.push(`Large: needs a build volume of at least ${Math.ceil(big/10)*10} mm in one axis, or split and bond.`);if(/Black/.test(p.Material))n.push('Light-tight black for the optics.');if(p.Material==='Polypropylene')n.push('Wetted part: polypropylene for service use; PETG is fine for a fit-check print.');return n.join(' ');};
const steelNote=p=>{const g=group(p.Part);if(/_adapter$|08_Universal/.test(g))return '4 × Ø5 mm holes, 12 mm from the side edges and 14 mm from the top and bottom edges.';if(/Rear_standoff/.test(g))return 'Ø4.5 mm screw clearances.';if(/Rail_(front|rear)_half/.test(g))return 'Half of a Ø54 × 4 mm stainless tube, 20 mm long.';if(/27_Scan_rail/.test(g))return '6 × 6 mm guide bar.';if(/ballast/.test(g))return 'About 60 kg steel. Stability limits are documented in ENGINEERING.md.';if(/tower/.test(g))return '60 × 6 mm section; stiffness not verified.';return '';};

// Layout diagrams drawn from BOM coordinates.
function diagram(view,items,opt={}){
 const s=1.15,[a,b]=view==='side'?['Z_mm','Depth_mm']:['X_mm','Width_mm'];
 const lo=view==='side'?-22:-122,hi=view==='side'?140:122,ylo=-6,yhi=336,W=(hi-lo)*s+16,H=(yhi-ylo)*s+30;
 const px=v=>8+(v-lo)*s,py=v=>8+(yhi-v)*s;let out='',labels=[];
 const shell=part('01');out+=`<rect class="shell" x="${px(shell[a])}" y="${py(shell.Y_mm+shell.Height_mm)}" width="${shell[b]*s}" height="${shell.Height_mm*s}" rx="4"/>`;
 for(const it of items){const p=part(it.id),x=px(p[a]),y=py(p.Y_mm+p.Height_mm),w=Math.max(p[b]*s,1.5),h=Math.max(p.Height_mm*s,1.5);
  out+=`<rect class="c-${it.c}${it.alt?' alt':''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"${it.faint?' fill-opacity=".35"':''}><title>${esc(num(p)?num(p)+' '+pretty(p.Part):pretty(p.Part))}</title></rect>`;
  if(it.label!==false)labels.push({t:it.t||num(p),ax:x+w/2,ay:y+h/2,x:x+w/2,y:y+h/2});}
 for(let k=0;k<400;k++)for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const A=labels[i],B=labels[j];let dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy);if(d<19){if(d<.01){dx=1;dy=.3;d=1.04;}const m=(19-d)/2;A.x-=dx/d*m;A.y-=dy/d*m;B.x+=dx/d*m;B.y+=dy/d*m;}}
 for(const L of labels){L.x=Math.min(W-10,Math.max(10,L.x));L.y=Math.min(H-24,Math.max(10,L.y));if(Math.hypot(L.x-L.ax,L.y-L.ay)>5)out+=`<line class="lead" x1="${L.ax.toFixed(1)}" y1="${L.ay.toFixed(1)}" x2="${L.x.toFixed(1)}" y2="${L.y.toFixed(1)}"/>`;}
 for(const L of labels)out+=`<g class="tag"><circle cx="${L.x.toFixed(1)}" cy="${L.y.toFixed(1)}" r="8.5"/><text x="${L.x.toFixed(1)}" y="${(L.y+3.5).toFixed(1)}" text-anchor="middle">${esc(L.t)}</text></g>`;
 const axis=view==='side'?`<text class="axis" x="8" y="${H-6}">◀ back</text><text class="axis" x="${W-8}" y="${H-6}" text-anchor="end">front ▶</text>`:`<text class="axis" x="8" y="${H-6}">◀ left</text><text class="axis" x="${W-8}" y="${H-6}" text-anchor="end">right ▶</text>`;
 const full=244*s+16;return `<svg class="layout" style="max-width:${(W/full*100).toFixed(1)}%;margin:0 auto" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" role="img" aria-label="${esc(opt.label)}">${out}${axis}</svg>`;}
const legend=items=>`<ol>${items.filter(i=>i.label!==false).map(i=>{const p=part(i.id);return `<li><span class="num">${esc(i.t||num(p))}</span> ${esc(i.name||pretty(p.Part))}${i.alt?' (battery version)':''}</li>`;}).join('')}</ol>`;
const figModules=[{id:'11',c:'structure',name:'Dry electronics tray'},{id:'38',c:'structure',name:'Wet/dry barrier'},{id:'20',c:'consumable',name:'Clean strip cassette'},{id:'22',c:'optics',name:'Optical chamber'},{id:'37',c:'consumable',name:'Sample drawer'},{id:'39',c:'consumable',name:'Drip tray'},{id:'40',c:'waste',name:'Waste cartridge'},{id:'43',c:'consumable',name:'Cleaning-fluid cartridge'},{id:'50',c:'structure',name:'Cable channel'},{id:'44',c:'power',alt:true,name:'Battery tray'}];
const figElectronics=[{id:'11',c:'structure',faint:true,label:false},{id:'22',c:'optics',faint:true,label:false},{id:'40',c:'waste',faint:true,label:false},{id:'16',c:'front',name:'Display window (display behind)'},{id:'45',c:'power',alt:true,name:'Battery pack'},{id:'13',c:'electronics',name:'Arduino Uno'},{id:'14',c:'power',name:'Fuse module'},{id:'19',c:'electronics',name:'Buzzer'},{id:'18',c:'electronics',name:'Status LED'},{id:'47',c:'power',name:'DC jack'},{id:'48',c:'power',name:'Cable gland'},{id:'51',c:'sensor',name:'Door interlock'},{id:'29',c:'sensor',name:'RGB sensor (TCS34725)'},{id:'32',c:'sensor',name:'Left LED'},{id:'33',c:'sensor',name:'Right LED'},{id:'35',c:'electronics',name:'Scan motor'},{id:'54',c:'sensor',name:'Home / jam sensor'},{id:'34',c:'sensor',name:'Reference tile'},{id:'57',c:'structure',name:'Service lock'},{id:'52',c:'sensor',name:'Cartridge sensor'},{id:'53',c:'sensor',name:'Overflow sensor'}];
const figSide=[{id:'08',c:'structure',name:'Mounting plate'},{id:'09',c:'structure',label:false},{id:'11',c:'structure',name:'Dry electronics tray'},{id:'12',c:'structure',name:'Dry-tray lid'},{id:'13',c:'electronics',name:'Arduino Uno'},{id:'44',c:'power',alt:true,name:'Battery tray'},{id:'38',c:'structure',name:'Wet/dry barrier'},{id:'20',c:'consumable',faint:true,label:false},{id:'22',c:'optics',name:'Optical chamber'},{id:'25',c:'consumable',label:false},{id:'26',c:'consumable',name:'Test strip'},{id:'29',c:'sensor',name:'RGB sensor'},{id:'37',c:'consumable',name:'Sample drawer'},{id:'40',c:'waste',name:'Waste cartridge'},{id:'03',c:'front',name:'Upper front panel'},{id:'05',c:'front',label:false},{id:'04',c:'front',label:false},{id:'02',c:'structure',name:'Door frame'}];

// Assembly steps; each lists the parts it installs and links to them highlighted in the 3D viewer.
const gap=(part('29').Z_mm-(part('26').Z_mm+part('26').Depth_mm));
const ledGap=((part('33').X_mm+part('33').Width_mm/2)-(part('32').X_mm+part('32').Width_mm/2));
const STEPS=[
 {t:'Prepare the parts',img:'step-shell.png',alt:'Main shell of the Luma reader highlighted, seen from the back',cfg:'Partition_DC',ids:['01'],body:`<ol>
<li>Print the enclosure, trays and brackets (see <a href="#printed">printed parts</a>). The main shell (01, ${size(part('01'))} mm) is the largest print.</li>
<li>Have the stainless-steel parts laser-cut and bent (see <a href="#steel">steel parts</a>), and die-cut the EPDM gaskets and pads (see <a href="#rubber">rubber parts</a>).</li>
<li>Melt four M4 heat-set inserts into the back wall of the shell at x ±78 mm, y 49 mm and y 281 mm. These carry the mounting plate.</li>
<li>Program the Arduino and test every electronic module on the bench before it goes into the enclosure.</li></ol>`,check:'Dry-fit the trays and cassettes in the shell before gluing or fastening anything.'},
 {t:'Fit the rear mounting interface',img:'step-rear-interface.png',alt:'Rear mounting plate, standoffs, tether eye and M4 screws highlighted on the back of the reader',cfg:'Partition_DC',ids:['08','09','10','58','59_M4_captive_fastener_0','59_M4_captive_fastener_1','59_M4_captive_fastener_2','59_M4_captive_fastener_3'],body:`<ol>
<li>Place the two rear standoffs (09, 10) vertically on the back of the shell (${at('09','10')}).</li>
<li>Lay the universal mounting plate (08, ${size(part('08'))} mm stainless) over them.</li>
<li>Fix the stack with the four M4 captive screws (59) into the heat-set inserts at x ±78 mm, y 49 and 281 mm.</li>
<li>Fit the tether eye (58) at the upper right of the back (${at('58')}).</li></ol>`,check:'The plate sits flat and the screws stay captive when undone. Every mount adapter uses the same four holes.'},
 {t:'Build the dry electronics compartment',img:'step-dry-electronics.png',alt:'Dry electronics compartment highlighted: wet/dry barrier, tray, Arduino, fuse module and buzzer',cfg:'Partition_DC',ids:['38','11','13','14','19','49'],body:`<ol>
<li>Fit the wet/dry barrier (38), a full-width horizontal shelf at y ${mm(part('38').Y_mm)}–${mm(part('38').Y_mm+part('38').Height_mm)} mm. Everything above it stays dry.</li>
<li>Seal the barrier and fit the dry electronics tray (11) above it against the back wall (${at('11')}). Leak-check this compartment <em>before</em> installing electronics.</li>
<li><strong>Arduino Uno (13):</strong> mount it upright on four 5 mm M3 standoffs on the tray’s back wall, in the upper-left corner (${at('13')}), headers facing the front.</li>
<li>Fit the fuse module (14) to the right of the Arduino (${at('14')}), the buzzer (19) at the top right (${at('19')}) and the strain relief (49) where cables leave at the top (${at('49')}).</li>
<li>Mount the stepper driver and any small boards that aren’t modelled in the free area right of the fuse module (about x 30…95, y 225…290 mm). Then wire everything (see <a href="#wiring">wiring</a>) and close the lid (12).</li></ol>`,check:'The USB port is still reachable, no wire is pinched by the lid, and the compartment passed its leak check.'},
 {t:'Assemble the optical module',img:'step-optics-closeup.png',alt:'Close-up of the optical scan carriage with RGB sensor, two LEDs, strip carrier, rail, lead screw and motor',cfg:'Partition_DC',ids:['22','24','25','26','27','28','29','30','31','32','33','34','35','36','54'],body:`<ol>
<li>Fit the black optical chamber (22, ${at('22')}) and its light baffle insert (24).</li>
<li>Fix the strip datum carrier (25). It holds the test strip (26) flat at z ${mm(part('26').Z_mm)} mm.</li>
<li>Mount the scan rail (27) and M3 lead screw (36) along the top of the chamber, and the micro stepper (35) at the right end.</li>
<li>Build the scan carriage (28): the TCS34725 sensor (29) in the centre facing the strip, and the two white LEDs (32, 33) on brackets 30 and 31, ${mm(ledGap)} mm apart, angled at the strip.</li>
<li>Place the white reference tile (34) at the right end of the travel, level with the strip, and the home / jam sensor (54) beside it.</li>
<li>Close the chamber with its removable lid (23).</li></ol>
<p>The CAD puts the sensor face <strong>${mm(gap)} mm</strong> above the pads; the engineering notes suggest testing 5–25 mm on a jig.</p>`,check:'With the lid closed, the sensor reads close to zero with the LEDs off (dark reading). The carriage reaches the reference tile at the end of its travel.'},
 {t:'Install strip handling and consumables',img:'step-consumables.png',alt:'Clean strip cassette, sample drawer, drip tray, waste cartridge and cleaning cartridge highlighted',cfg:'Partition_DC',ids:['20','21','37','39','40','41','42','43','52','53'],body:`<ol>
<li>Slide the sealed clean-strip cassette (20) and its lid (21) into the left column (${at('20')}).</li>
<li>Fit the sample drawer (37) behind the input shutter, with the drip tray (39) underneath it.</li>
<li>Insert the used-strip waste cartridge (40) at the bottom (${at('40')}), with its transport lid (41) and closure slide (42).</li>
<li>Fit the cleaning-fluid cartridge (43) at the bottom right (${at('43')}).</li>
<li>Mount the cartridge-present sensor (52) beside the waste cartridge and the drip-overflow sensor (53) at the drip tray.</li></ol>`,check:'Each cassette, tray and cartridge comes out from the front without exposing the clean strips. Prove the motion and jam recovery <em>without</em> samples before any fluid testing.'},
 {t:'Connect the power',img:'step-power-dc.png',alt:'DC jack, cable gland, cable channel and fuse module highlighted',cfg:'Partition_DC',ids:['46','47','48','50','14'],body:`<p><strong>DC version:</strong> mount the DC jack (47) on its bracket (46) at the upper right (${at('46','47')}), with the cable gland (48) beside it. Run the supply through the reverse-polarity diode and fuse module (14) to the Arduino and motor driver.</p>
<p><strong>Battery version:</strong> fit the battery tray (44) in front of the dry-compartment lid (${at('44')}) and place the protected 2S pack (45) in it. ${show3d('Partition_Battery',['44','45','14'],'Show the battery version')}</p>
<p>Route the harness down the cable channel (50) on the right side (${at('50')}), clipped above any area that can hold liquid.</p>`,check:'Polarity, fuse values and the 5 V rail are checked with a multimeter before the Arduino is connected.'},
 {t:'Fit the front panels and door',img:'step-front.png',alt:'Front panels, door frame, gasket, hinges, display window, interlock and lock highlighted',cfg:'Partition_DC',ids:['02','03','04','05','06','07','15','16','17','18','51','55','56','57'],body:`<ol>
<li>Fit the EPDM gasket (07) to the door frame (02), and hang the frame on the two hinges (55, 56) on the left edge.</li>
<li>Mount the display module behind the 84 × 40 mm opening in the upper front panel (03), then fit the polycarbonate window (16), bezel (15), status LED (18) and QR label (17).</li>
<li>Fit the optics front cover (05), the lower front panel (04) and the input shutter (06).</li>
<li>Fit the door interlock switch (51) at the upper right (${at('51')}) and the service lock (57) on the right edge (${at('57')}).</li></ol>`,check:'The door closes evenly on the gasket, the interlock switches when it opens, and the lock holds it shut.'},
 {t:'Choose and attach a mount',img:null,cfg:'Partition_DC',ids:[],body:`<p>Pick the mount that suits the site. Every adapter is a 180 × 260 × 4 mm stainless plate that bolts to the universal plate through the same four holes. Then fit the mount-specific parts (see <a href="#mounts">mount kits</a>):</p>
<div class="figs" style="grid-template-columns:repeat(3,1fr)">${[['Partition','partition','Padded jaws, 12–50 mm panels'],['Rail','rail','Split clamp, 32 mm post'],['Hook','hook','Over-partition hook'],['Pedestal','pedestal','Ballasted floor stand'],['Smooth','smooth','Removable pads + tether'],['Magnetic','magnetic','Pot magnets + tether']].map(([c,f,d])=>`<figure><a href="builds/${build}/Viewer.html#${c}_DC"><img src="docs/images/mount-${f}.png" width="960" height="720" loading="lazy" alt="Rear view of the ${c.toLowerCase()} mount"></a><figcaption><strong>${c}</strong>: ${d}</figcaption></figure>`).join('')}</div>`,check:'Do a site survey before choosing a mount, and proof-test the installation off-site before public use (see ENGINEERING.md).'},
];

// Page
const cats=[...new Set(BUY.map(b=>b.cat))];
const buyRows=cat=>BUY.filter(b=>b.cat===cat).map(b=>{const ps=b.ids.map(part),p=ps[0],ids=b.ids;const tag=ps.map(num).filter(Boolean);return `<tr><td><span class="num">${esc(tag.length?tag.join(', '):'—')}</span></td><td><strong>${esc(b.name)}</strong></td><td>${ps.length}</td><td>${esc(b.spec)}${b.note?`<small>${esc(b.note)}</small>`:''}</td><td>${size(p)} mm${ps.length>1&&ps.some(q=>size(q)!==size(p))?' (each)':''}</td><td>${esc(b.where)}<small>${esc(at(...ids))}</small></td><td>${show3d(b.cfg||'Partition_DC',ids,'3D')}</td></tr>`;}).join('');
const fabRows=(kind,note)=>fabricated(kind).sort((a,b)=>a.p.Part.localeCompare(b.p.Part,undefined,{numeric:true})).map(({p,qty})=>{const cfg=p.Configuration_group.startsWith('Mount_')?p.Configuration_group.slice(6)+'_DC':p.Configuration_group==='Battery'?'Partition_Battery':'Partition_DC';return `<tr><td><span class="num">${esc(num(p)||'—')}</span></td><td><strong>${esc(pretty(p.Part))}</strong><small>${esc(groupLabel(p.Configuration_group))}</small></td><td>${qty}</td><td>${esc(p.Material)}</td><td>${size(p)} mm${p.Wall_mm?`<small>wall ${mm(p.Wall_mm)} mm</small>`:''}</td><td>${esc(note(p)||'')}</td><td>${show3d(cfg,[p.Part],'3D')}</td></tr>`;}).join('');
const counts={print:fabricated('print').reduce((n,r)=>n+r.qty,0),steel:fabricated('steel').reduce((n,r)=>n+r.qty,0),epdm:fabricated('epdm').reduce((n,r)=>n+r.qty,0),buy:BUY.reduce((n,b)=>n+b.ids.length,0)};
const mountKit=m=>{const ps=bom.filter(p=>p.Configuration_group==='Mount_'+m);const g={};for(const p of ps)(g[group(p.Part)]=g[group(p.Part)]||{p,q:0}).q++;return `<li><strong>${m}</strong> ${show3d(m+'_DC',[],'Show in 3D')}<ul>${Object.values(g).map(({p,q})=>`<li>${q} × ${esc(pretty(p.Part))}: ${size(p)} mm, ${esc(p.Material)}</li>`).join('')}</ul></li>`;};
const howto={"@context":"https://schema.org","@type":"HowTo","name":"How to build the Luma urine test strip reader","description":"Parts list and step-by-step assembly for the open-source Luma retrofit urine test strip reader: Arduino Uno, TCS34725 colour sensor, 3D-printed enclosure and stainless-steel mounts.","image":SITE+"docs/guide/where-arduino.png","tool":['3D printer','Soldering iron','Multimeter','Heat-set insert tool','Hex keys','Computer with the Arduino IDE'].map(n=>({"@type":"HowToTool","name":n})),"supply":BUY.filter(b=>!/Mount/.test(b.cat)).map(b=>({"@type":"HowToSupply","name":b.name})),"step":STEPS.map((s,i)=>({"@type":"HowToStep","position":i+1,"name":s.t,"url":SITE+'build-guide.html#step-'+(i+1),...(s.img?{"image":SITE+'docs/guide/'+s.img}:{})}))};

const html=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Build Guide: Luma Urine Test Strip Reader Parts List and Assembly</title>
<meta name="description" content="How to build the open-source Luma urine test strip reader: full parts list with specifications (Arduino Uno, TCS34725, LEDs, stepper, battery) and step-by-step assembly.">
<meta name="author" content="tamnisan">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#103a46">
<link rel="canonical" href="${SITE}build-guide.html">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23103a46'/%3E%3Crect x='18' y='12' width='28' height='40' rx='3' fill='none' stroke='%237fd0cf' stroke-width='4'/%3E%3Crect x='24' y='19' width='16' height='9' fill='%237fd0cf'/%3E%3C/svg%3E">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Luma Retrofit">
<meta property="og:url" content="${SITE}build-guide.html">
<meta property="og:title" content="Build Guide: Luma Urine Test Strip Reader">
<meta property="og:description" content="Full parts list with specifications and step-by-step assembly for the open-source Luma urine test strip reader.">
<meta property="og:image" content="${SITE}docs/social-preview.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
${JSON.stringify(howto,null,1)}
</script>
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<!-- Generated by src/Guide.js from builds/${build}/BOM.csv. Edit the generator, not this file. -->

<nav class="nav" aria-label="Main">
  <div class="wrap">
    <a class="brand" href="./">Luma Retrofit</a>
    <span class="links"><a href="./#features">Features</a> &nbsp; <a href="./#mounts">Mounts</a> &nbsp; <a href="build-guide.html" aria-current="page">Build guide</a> &nbsp; <a href="./#download">Download</a> &nbsp; <a href="./#faq">FAQ</a></span>
    <a href="https://github.com/tamnisan/luma">GitHub</a>
  </div>
</nav>

<header class="hero compact">
  <div class="wrap">
    <div>
      <div class="eyebrow">Build guide · Rev A</div>
      <h1>How to build the Luma urine test strip reader</h1>
      <p class="lead">The complete parts list with specifications, where every component goes, and how to put it together. All sizes and positions come straight from the CAD model (build ${esc(build)}).</p>
      <div class="cta"><a class="btn primary" href="#parts">Parts list</a><a class="btn ghost" href="#assembly">Assembly steps</a><a class="btn ghost" href="#wiring">Wiring</a></div>
      <div class="stats" title="Totals cover every mount and power version"><div><b>${counts.buy}</b>purchased items (all versions)</div><div><b>${counts.print}</b>3D-printed parts</div><div><b>${counts.steel}</b>stainless-steel parts</div><div><b>${counts.epdm}</b>EPDM rubber parts</div></div>
    </div>
  </div>
</header>

<main>
  <div class="wrap">
    <p class="notice" role="note"><strong>Read this first.</strong> Luma Rev A is an engineering prototype, not a medical device or a finished product. The CAD reserves space for each purchased component (an “envelope”); the parts suggested here fit those envelopes, but the scan drive is still schematic, clamp hardware needs detailing, and <strong>no firmware is included yet</strong>. Treat this as a guide for building and testing a prototype.</p>
  </div>

  <section id="contents">
    <div class="wrap">
      <h2>Contents</h2>
      <ol class="toc">
        <li><a href="#layout">Where everything goes</a></li>
        <li><a href="#parts">Purchased components</a></li>
        <li><a href="#extra">Parts not in the CAD</a></li>
        <li><a href="#printed">3D-printed parts</a></li>
        <li><a href="#steel">Stainless-steel parts</a></li>
        <li><a href="#rubber">EPDM rubber parts</a></li>
        <li><a href="#mounts">Mount kits</a></li>
        <li><a href="#tools">Tools</a></li>
        <li><a href="#assembly">Assembly, step by step</a></li>
        <li><a href="#wiring">Wiring</a></li>
        <li><a href="#testing">First power-up and testing</a></li>
        <li><a href="#service">Servicing</a></li>
        <li><a href="#cost">Budget</a></li>
      </ol>
    </div>
  </section>

  <section id="layout">
    <div class="wrap">
      <h2>Where everything goes</h2>
      <p class="sub">Positions are in millimetres from the enclosure’s own origin: <strong>x</strong> runs across (0 = centre, negative = left when you face the front), <strong>y</strong> runs up from the bottom of the case, and <strong>z</strong> runs forward from the back wall. The front panels sit at z ≈ 130 mm. Numbers match the part numbers in the tables and the CAD files.</p>
      <div class="callout" id="arduino">
        <h3>Where does the Arduino go?</h3>
        <p>In the <strong>dry electronics compartment</strong> at the top of the enclosure, above the wet/dry barrier. The Uno stands upright against the back wall of the tray in the <strong>upper-left corner</strong> (${at('13')}), with the fuse module to its right and the buzzer at the top right. ${show3d('Partition_DC',['13'],'Show the Arduino in 3D')}</p>
      </div>
      <div class="figs">
        <figure>${diagram('front',figModules,{label:'Front view of the main modules inside the enclosure'})}<figcaption><strong>Front view: modules</strong> (front panels removed)</figcaption>${legend(figModules)}</figure>
        <figure>${diagram('front',figElectronics,{label:'Front view showing where the electronics and sensors are'})}<figcaption><strong>Front view: electronics and sensors</strong></figcaption>${legend(figElectronics)}</figure>
        <figure>${diagram('side',figSide,{label:'Side view showing the depth of each layer'})}<figcaption><strong>Side view: depth</strong> (back on the left)</figcaption>${legend(figSide)}</figure>
      </div>
      <figure class="callout" style="margin-top:18px"><img src="docs/guide/where-arduino.png" width="960" height="720" loading="lazy" alt="The Arduino Uno highlighted in green in the upper-left of the Luma reader's dry electronics compartment"><figcaption style="margin-top:8px;color:var(--muted);font-size:14px">The Arduino Uno (green) inside the enclosure. Dashed outlines in the diagrams are battery-version parts.</figcaption></figure>
    </div>
  </section>

  <section id="parts">
    <div class="wrap">
      <h2>Purchased components</h2>
      <p class="sub">Each part must fit the envelope the CAD reserves for it (W × H × D). Where a part is named, it is one that fits; equivalents are fine if they fit and match the specification. The # column is the part number used in the CAD files and the diagrams.</p>
      ${cats.map(c=>`<h3 style="margin:22px 0 10px">${esc(c)}</h3><div class="tablewrap"><table><thead><tr><th>#</th><th>Component</th><th>Qty</th><th>Specification</th><th>CAD envelope</th><th>Where it goes</th><th></th></tr></thead><tbody>${buyRows(c)}</tbody></table></div>`).join('\n')}
    </div>
  </section>

  <section id="extra">
    <div class="wrap">
      <h2>Parts not in the CAD</h2>
      <p class="sub">The model doesn’t include these, but you need them for a working prototype. They are suggestions that fit the free space.</p>
      <div class="tablewrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Specification</th><th>Where it goes</th></tr></thead><tbody>${EXTRA.map(r=>`<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}</tbody></table></div>
    </div>
  </section>

  <section id="printed">
    <div class="wrap">
      <h2>3D-printed parts</h2>
      <p class="sub">Designed as PC-ABS prototype prints, in black PC-ABS for the optics and polypropylene for parts that touch liquid. STL files for all of them are in <a href="https://github.com/tamnisan/luma/tree/main/builds/${build}/exports/stl"><code>exports/stl</code></a>.</p>
      <div class="tablewrap"><table><thead><tr><th>#</th><th>Part</th><th>Qty</th><th>Material</th><th>Size (W × H × D)</th><th>Notes</th><th></th></tr></thead><tbody>${fabRows('print',printNote)}</tbody></table></div>
    </div>
  </section>

  <section id="steel">
    <div class="wrap">
      <h2>Stainless-steel parts</h2>
      <p class="sub">304 stainless steel, laser-cut, bent or machined. Send the STL or STEP files to a sheet-metal service. Plate thickness is the smallest dimension.</p>
      <div class="tablewrap"><table><thead><tr><th>#</th><th>Part</th><th>Qty</th><th>Material</th><th>Size (W × H × D)</th><th>Notes</th><th></th></tr></thead><tbody>${fabRows('steel',steelNote)}</tbody></table></div>
    </div>
  </section>

  <section id="rubber">
    <div class="wrap">
      <h2>EPDM rubber parts</h2>
      <p class="sub">Die-cut or knife-cut from EPDM sheet. The rail inserts are half-shells (Ø46 mm outside, Ø32 mm inside, 20 mm long).</p>
      <div class="tablewrap"><table><thead><tr><th>#</th><th>Part</th><th>Qty</th><th>Material</th><th>Size (W × H × D)</th><th>Notes</th><th></th></tr></thead><tbody>${fabRows('epdm',()=> '')}</tbody></table></div>
    </div>
  </section>

  <section id="mounts">
    <div class="wrap">
      <h2>Mount kits</h2>
      <p class="sub">You only need <strong>one</strong> mount. Each kit also includes its own 180 × 260 × 4 mm adapter plate.</p>
      <ul class="kits">${['Partition','Rail','Hook','Pedestal','Smooth','Magnetic'].map(mountKit).join('')}</ul>
    </div>
  </section>

  <section id="tools">
    <div class="wrap">
      <h2>Tools</h2>
      <ul class="pill-list"><li>3D printer (≥ 330 mm build for the shell, or split it)</li><li>Enclosure or heated chamber for PC-ABS</li><li>Laser-cutting and bending service</li><li>Soldering iron and solder</li><li>Multimeter</li><li>Heat-set insert tip</li><li>Drill and Ø5 mm bit</li><li>Hex keys and screwdrivers</li><li>Wire strippers and crimper (JST-XH)</li><li>Computer with the Arduino IDE and a USB-B cable</li></ul>
    </div>
  </section>

  <section id="assembly">
    <div class="wrap">
      <h2>Assembly, step by step</h2>
      <p class="sub">Follow the order in the engineering notes: sealed compartments first, then optics, handling, power, front and mount. Each step links to the 3D viewer with its parts highlighted.</p>
      ${STEPS.map((s,i)=>`<article class="step" id="step-${i+1}">${s.img?`<figure><img src="docs/guide/${s.img}" width="960" height="720" loading="lazy" alt="${esc(s.alt)}"><figcaption>Highlighted: parts fitted in this step. ${s.ids.length?show3d(s.cfg,s.ids):''}</figcaption></figure>`:''}<div${s.img?'':' style="grid-column:1/-1"'}><h3><span class="stepno">${i+1}</span>${esc(s.t)}</h3>${s.body}<p class="check"><strong>Check:</strong> ${s.check}</p></div></article>`).join('\n')}
    </div>
  </section>

  <section id="wiring">
    <div class="wrap">
      <h2>Wiring</h2>
      <p class="sub">A suggested pin map for the Arduino Uno. The CAD does not define wiring and no firmware is included yet, so treat this as a starting point.</p>
      <div class="tablewrap"><table><thead><tr><th>Arduino pin</th><th>Connects to</th><th>#</th><th>Notes</th></tr></thead><tbody>
        <tr><td>A4 (SDA), A5 (SCL)</td><td>TCS34725 sensor and LCD backpack</td><td><span class="num">29</span></td><td>Shared I²C bus: sensor 0x29, LCD 0x27 or 0x3F</td></tr>
        <tr><td>5V, GND</td><td>Sensor, LCD, switches and sensor boards</td><td>—</td><td>Logic power only; the motor has its own fused supply</td></tr>
        <tr><td>D3 / D4</td><td>Stepper driver STEP / DIR</td><td><span class="num">35</span></td><td>DRV8834; set the current limit first</td></tr>
        <tr><td>D7</td><td>Stepper driver SLEEP (enable)</td><td><span class="num">35</span></td><td>Pull low whenever the door is open</td></tr>
        <tr><td>D5 / D6</td><td>Left / right white LED, each through 150 Ω</td><td><span class="num">32</span> <span class="num">33</span></td><td>PWM pins, so brightness can be trimmed</td></tr>
        <tr><td>D8</td><td>TCS34725 LED pin</td><td><span class="num">29</span></td><td>Held LOW to keep the board’s own LED off</td></tr>
        <tr><td>D2</td><td>TCS34725 INT (optional)</td><td><span class="num">29</span></td><td>Interrupt when a reading is ready</td></tr>
        <tr><td>D9</td><td>Piezo buzzer</td><td><span class="num">19</span></td><td>tone()</td></tr>
        <tr><td>D10</td><td>Status LED through 330 Ω</td><td><span class="num">18</span></td><td></td></tr>
        <tr><td>D11</td><td>Door interlock switch to GND</td><td><span class="num">51</span></td><td>INPUT_PULLUP</td></tr>
        <tr><td>D12</td><td>Cartridge-present sensor to GND</td><td><span class="num">52</span></td><td>INPUT_PULLUP</td></tr>
        <tr><td>A0</td><td>Drip-overflow probe</td><td><span class="num">53</span></td><td>Analog reading</td></tr>
        <tr><td>A1</td><td>Home / jam sensor output</td><td><span class="num">54</span></td><td>Use a breakout that includes its resistors</td></tr>
        <tr><td>A2</td><td>Battery voltage through a 10 kΩ / 10 kΩ divider</td><td><span class="num">45</span></td><td>Battery version: 8.4 V full reads as 4.2 V</td></tr>
        <tr><td>VIN</td><td>Supply after the diode and fuse F1</td><td><span class="num">14</span></td><td>7–12 V</td></tr>
        <tr><td>D0, D1, D13</td><td>Leave free</td><td>—</td><td>USB serial and the on-board LED</td></tr>
      </tbody></table></div>
      <div class="callout"><h3>Power path</h3><p>DC jack (47) or battery pack (45) → Schottky diode → fuse module (14): <strong>F1</strong> feeds the Arduino’s VIN and <strong>F2</strong> feeds the stepper driver’s motor supply. The Arduino’s 5 V rail powers the sensor, LCD, LEDs and switches. A 2S pack falls below the Uno’s recommended 7 V near the end of its charge: stop at about 7 V (read on A2), or add a 5 V regulator.</p></div>
    </div>
  </section>

  <section id="testing">
    <div class="wrap">
      <h2>First power-up and testing</h2>
      <ol>
        <li>Before power: check continuity, polarity and fuse values with a multimeter.</li>
        <li>Power up with the motor unplugged and check the 5 V rail.</li>
        <li>Run an I²C scanner sketch: the sensor should appear at 0x29 and the LCD at 0x27 or 0x3F.</li>
        <li>Close the optics lid and take a <strong>dark reading</strong> with the LEDs off; it should be close to zero.</li>
        <li>Read the white reference tile (34) repeatedly and check the readings are repeatable.</li>
        <li>Connect the motor and set the driver’s current limit. Check homing, full travel and jam recovery <strong>without samples</strong>.</li>
        <li>Check the interlocks: opening the door stops motion, a missing or full cartridge blocks testing, and an overflow stops sample intake.</li>
        <li>Only then move on to wet tests, and calibrate for each pad and strip supplier.</li>
      </ol>
    </div>
  </section>

  <section id="service">
    <div class="wrap">
      <h2>Servicing</h2>
      <ol>
        <li>Disable motion.</li>
        <li>Close the waste cartridge slide (42), then withdraw and replace the waste cartridge (40). Never empty it through the clean compartment.</li>
        <li>Remove and wash or replace the wetted insert, and inspect the seals.</li>
        <li>Refill the clean strips through the clean access path (20).</li>
        <li>Replace the protected battery if fitted.</li>
        <li>Close and lock the covers, then run the reference and sensor checks.</li>
      </ol>
    </div>
  </section>

  <section id="cost">
    <div class="wrap">
      <h2>Budget</h2>
      <p class="sub">Planning allowances from the engineering notes (INR). These are not supplier quotes.</p>
      <div class="tablewrap"><table style="min-width:0"><thead><tr><th>Category</th><th>Allowance (INR)</th></tr></thead><tbody>
        <tr><td>Sensor, Uno, LEDs and wiring</td><td>1,167</td></tr>
        <tr><td>100-strip pack</td><td>1,500</td></tr>
        <tr><td>Printed enclosure and removable trays</td><td>2,000–4,500</td></tr>
        <tr><td>One mechanical mount, locks, seals, fasteners</td><td>1,500–3,500</td></tr>
        <tr><td>Display and interface</td><td>500–1,500</td></tr>
        <tr><td>Motion, bearings, driver, interlocks</td><td>1,000–3,000</td></tr>
        <tr><td>Power and protection</td><td>700–2,000</td></tr>
        <tr><td>Optical finish, calibration, cleaning provisions</td><td>500–1,500</td></tr>
        <tr><td><strong>Total</strong> (before stand, connectivity, labour and validation)</td><td><strong>8,867–18,667</strong></td></tr>
      </tbody></table></div>
      <p>Before installing anything in a public toilet, complete the site survey and off-site proof test in <a href="https://github.com/tamnisan/luma/blob/main/ENGINEERING.md">ENGINEERING.md</a>. Found a problem or built one? <a href="https://github.com/tamnisan/luma/issues">Open an issue</a>.</p>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <span>© 2026 tamnisan · Released under the <a href="https://github.com/tamnisan/luma/blob/main/LICENSE">MIT License</a></span>
    <span><a href="./">Home</a> · <a href="START.html">3D model</a> · <a href="https://github.com/tamnisan/luma">Source on GitHub</a></span>
  </div>
</footer>
</body>
</html>
`;
fs.writeFileSync(path.join(root,'build-guide.html'),html);
console.log(`build-guide.html: ${counts.buy} purchased, ${counts.print} printed, ${counts.steel} steel, ${counts.epdm} EPDM parts; ${STEPS.length} steps`);
