using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.InteropServices;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;

// Prototype design generator. Geometry uses mm; SW API uses metres.
// Each output is timestamped, preserving all previous builds and user models.
class LumaBuilder {
 static SldWorks sw; static string root,run,parts; static StreamWriter log;
 static List<Item> items=new List<Item>(); static List<string> checks=new List<string>();
 // Templates come from SolidWorks' own default-template settings, so any install location or version works.
 static string Template(swUserPreferenceStringValue_e kind){string t=sw.GetUserPreferenceStringValue((int)kind);if(string.IsNullOrEmpty(t)||!File.Exists(t))throw new Exception("Set a default template in SolidWorks: Tools > Options > Default Templates ("+kind+")");return t;}
 class Item { public string Name,Group,Shape,Material,Process,Path; public double W,H,D,T,X,Y,Z,Rho; public double[] Color; public Component2 Comp; public Item(string n,string g,string s,double w,double h,double d,double t,double x,double y,double z,string m,double rho,double[] color){Name=n;Group=g;Shape=s;W=w;H=h;D=d;T=t;X=x;Y=y;Z=z;Material=m;Rho=rho;Color=color;Process=m.Contains("steel")?"Laser cut / bend / machine":m.Contains("EPDM")?"Die cut":m.Contains("COTS")?"Purchased envelope - VERIFY":"Prototype print; production tooling review";} }
 static double[] white={.82,.88,.90},teal={.02,.42,.43},black={.08,.09,.11},metal={.58,.62,.65},blue={.06,.30,.65},orange={.95,.50,.08},green={.18,.58,.32};
 static void Say(string s){Console.WriteLine(s);log.WriteLine(s);log.Flush();}
 static string Num(double v){return v.ToString("0.########",CultureInfo.InvariantCulture);}
 static void Add(string n,string g,string s,double w,double h,double d,double t,double x,double y,double z,string m,double rho,double[] c){items.Add(new Item(n,g,s,w,h,d,t,x,y,z,m,rho,c));}
 static void Layout(){
  // origin: x centre, y bottom, z back face; installed surface z=-16
  Add("01_Main_shell","Core","tray",230,330,128,3,-115,0,0,"PC-ABS",1150,white);
  Add("02_Service_door_frame","Core","ring",224,324,5,14,-112,3,129,"PC-ABS",1150,teal);
  Add("03_Upper_front_panel","Core","box",194,106,3,0,-97,207,130,"PC-ABS",1150,white);
  Add("04_Lower_front_panel","Core","box",194,67,3,0,-97,17,130,"PC-ABS",1150,white);
  Add("05_Optics_front_cover","Core","box",194,93,3,0,-97,114,130,"PC-ABS",1150,white);
  Add("06_Input_shutter","Core","box",154,25,3,0,-70,86,131,"PC-ABS",1150,teal);
  Add("07_Door_EPDM_gasket","Core","ring",224,324,1,3,-112,3,128,"EPDM",1200,black);
  Add("08_Universal_mount_plate","Core","plate",180,260,4,0,-90,35,-8,"304 stainless steel",8000,metal);
  Add("09_Rear_standoff_L","Core","box",12,245,4,0,-84,43,-4,"304 stainless steel",8000,metal);
  Add("10_Rear_standoff_R","Core","box",12,245,4,0,72,43,-4,"304 stainless steel",8000,metal);
  Add("11_Dry_electronics_tray","Core","tray",196,96,66,3,-98,224,12,"PC-ABS",1150,white);
  Add("12_Dry_electronics_lid","Core","box",190,90,2,0,-95,227,78,"PC-ABS",1150,teal);
  Add("13_Controller_UNO_envelope","Core","box",69,54,16,0,-89,250,20,"COTS PCB envelope",1100,green);
  Add("14_Dual_power_fuse_module","Core","box",37,27,16,0,-10,278,20,"COTS electrical envelope",1700,blue);
  Add("15_Display_bezel","Core","ring",101,57,1,7,-47,246,133,"PC-ABS",1150,teal);
  Add("16_Display_protective_window","Core","box",86,42,1,0,-39.5,253.5,133,"Polycarbonate",1200,black);
  Add("17_QR_label_area","Core","box",27,27,.4,0,63,268,133,"Label",1000,white);
  Add("18_Status_LED","Core","disk",5,5,1,0,-81,268,133,"COTS LED",1200,green);
  Add("19_Buzzer_envelope","Core","disk",14,14,7,0,65,292,30,"COTS buzzer",1500,black);
  Add("20_Sealed_strip_cassette","Core","tray",34,130,45,2,-106,87,22,"Polypropylene",900,blue);
  Add("21_Cassette_sealed_lid","Core","box",30,126,2,0,-104,89,67,"Polypropylene",900,teal);
  Add("22_Optical_chamber","Core","tray",158,59,66,2,-64,145,22,"Black PC-ABS",1150,black);
  Add("23_Optical_removable_lid","Core","box",154,55,2,0,-62,147,88,"Black PC-ABS",1150,black);
  Add("24_Optical_insert_baffle","Core","ring",148,49,7,3,-59,150,79,"Black PC-ABS",1150,black);
  Add("25_Strip_datum_carrier","Core","tray",137,13,8,1,-55,156,50,"Polypropylene",900,teal);
  Add("26_Reagent_strip_envelope","Core","box",125,5,.5,0,-49,160,52,"COTS strip envelope",800,white);
  Add("27_Scan_rail","Core","box",142,6,6,0,-57,191,43,"304 stainless steel",8000,metal);
  Add("28_Optical_scan_carriage","Core","ring",28,28,3,5,-52,159,64,"Black PC-ABS",1150,black);
  Add("29_RGB_sensor_envelope","Core","box",21,21,5,0,-48.5,162.5,67,"COTS PCB envelope",1100,green);
  Add("30_Left_LED_bracket","Core","ring",10,16,3,2,-62,164,61,"Black PC-ABS",1150,black);
  Add("31_Right_LED_bracket","Core","ring",10,16,3,2,-24,164,61,"Black PC-ABS",1150,black);
  Add("32_Left_LED_envelope","Core","box",6,8,2,0,-60,168,64,"COTS LED",1400,white);
  Add("33_Right_LED_envelope","Core","box",6,8,2,0,-22,168,64,"COTS LED",1400,white);
  Add("34_Calibration_tile","Core","box",8,8,1,0,78,158,54,"Ceramic reference placeholder",2400,white);
  Add("35_Scan_motor_envelope","Core","box",20,20,20,0,69,175,26,"COTS motor",3000,metal);
  Add("36_Lead_screw_envelope","Core","box",132,3,3,0,-54,188,52,"304 stainless steel",8000,metal);
  Add("37_Sample_drawer_module","Core","tray",154,24,51,2,-70,89,78,"Polypropylene",900,teal);
  Add("38_Wet_dry_barrier","Core","box",198,3,112,0,-99,219,8,"PC-ABS",1150,white);
  Add("39_Drip_tray","Core","tray",148,12,72,2,-68,75,48,"Polypropylene",900,blue);
  Add("40_Used_strip_waste_cartridge","Core","tray",142,56,93,2,-66,16,17,"Polypropylene",900,orange);
  Add("41_Waste_transport_lid","Core","ring",138,52,2,6,-64,18,110,"Polypropylene",900,orange);
  Add("42_Waste_closure_slide","Core","box",125,38,1,0,-57,25,112,"Polypropylene",900,orange);
  Add("43_Cleaning_fluid_cartridge","Core","tray",24,60,48,2,81,20,25,"Polypropylene",900,blue);
  Add("44_Battery_tray","Battery","tray",81,29,47,2,-91,228,82,"PC-ABS",1150,black);
  Add("45_Battery_protected_pack_envelope","Battery","box",75,23,39,0,-88,231,84,"COTS battery envelope",2200,blue);
  Add("46_DC_connector_bracket","DC","ring",20,16,3,4,66,230,93,"PC-ABS",1150,teal);
  Add("47_DC_connector_envelope","DC","disk",8,8,13,0,72,234,96,"COTS connector",2500,metal);
  Add("48_Cable_gland","Core","tube",12,12,9,3,81,231,107,"COTS gland",1400,black);
  Add("49_Strain_relief","Core","ring",18,12,5,3,58,305,25,"EPDM",1200,black);
  Add("50_Cable_channel","Core","ring",8,188,7,2,99,114,103,"PC-ABS",1150,black);
  Add("51_Door_interlock","Core","box",10,14,7,0,99,284,118,"COTS switch",1500,black);
  Add("52_Cartridge_present_switch","Core","box",8,10,6,0,-76,53,97,"COTS switch",1500,black);
  Add("53_Drip_overflow_sensor","Core","box",12,6,2,0,63,77,90,"COTS PCB envelope",1100,green);
  Add("54_Strip_jam_home_sensor","Core","box",8,8,5,0,79,146,58,"COTS sensor",1500,black);
  Add("55_Hinge_lower","Core","tube",8,8,16,2,-110,42,111,"304 stainless steel",8000,metal);
  Add("56_Hinge_upper","Core","tube",8,8,16,2,-110,282,111,"304 stainless steel",8000,metal);
  Add("57_Service_lock","Core","disk",12,12,13,0,98,158,114,"COTS lock",5000,metal);
  Add("58_Tether_eye","Core","tube",16,16,4,4,69,280,-12,"304 stainless steel",8000,metal);
  for(int i=0;i<4;i++) Add("59_M4_captive_fastener_"+i,"Core","disk",4,4,7,0,(i%2==0?-80:76),i<2?47:279,-7,"304 stainless steel",8000,metal);
  // Adapter plate is shared at z=-16..-12; replaceable mount hardware extends behind surface.
  foreach(string g in new[]{"Partition","Rail","Hook","Pedestal","Smooth","Magnetic"}){
   Add(g+"_adapter","Mount_"+g,"plate",180,260,4,0,-90,35,-16,"304 stainless steel",8000,metal);
  }
  for(int i=0;i<2;i++){
   double y=60+i*190;
   Add("Partition_fixed_jaw_"+i,"Mount_Partition","box",40,35,4,0,-20,y,-20,"304 stainless steel",8000,metal);
   Add("Partition_bridge_"+i,"Mount_Partition","box",4,35,66,0,-24,y,-82,"304 stainless steel",8000,metal);
   Add("Partition_moving_jaw_"+i,"Mount_Partition","box",40,35,4,0,-20,y,-76,"304 stainless steel",8000,metal);
   Add("Partition_pad_front_"+i,"Mount_Partition","box",36,31,2,0,-18,y+2,-22,"EPDM",1200,black);
   Add("Partition_pad_rear_"+i,"Mount_Partition","box",36,31,2,0,-18,y+2,-72,"EPDM",1200,black);
   Add("Partition_M8_screw_"+i,"Mount_Partition","disk",8,8,16,0,-4,y+13,-90,"304 stainless steel",8000,metal);
   Add("Rail_front_half_"+i,"Mount_Rail","half_front",54,54,20,4,-27,y+20,-74,"304 stainless steel",8000,metal);
   Add("Rail_rear_half_"+i,"Mount_Rail","half_rear",54,54,20,4,-27,y+20,-74,"304 stainless steel",8000,metal);
   Add("Rail_insert_front_32mm_"+i,"Mount_Rail","half_front",46,46,20,7,-23,y+20,-70,"EPDM",1200,black);
   Add("Rail_insert_rear_32mm_"+i,"Mount_Rail","half_rear",46,46,20,7,-23,y+20,-70,"EPDM",1200,black);
   Add("Rail_bridge_"+i,"Mount_Rail","box",12,20,5,0,-6,y,-21,"304 stainless steel",8000,metal);
  }
  Add("Hook_top_bridge","Mount_Hook","box",70,4,68,0,-35,335,-80,"304 stainless steel",8000,metal);
  Add("Hook_front_drop","Mount_Hook","box",70,75,4,0,-35,260,-16,"304 stainless steel",8000,metal);
  Add("Hook_rear_drop","Mount_Hook","box",70,60,4,0,-35,275,-80,"304 stainless steel",8000,metal);
  Add("Hook_protective_pad","Mount_Hook","box",66,2,55,0,-33,333,-73,"EPDM",1200,black);
  Add("Pedestal_ballast_base","Mount_Pedestal","box",500,30,500,0,-250,-1030,-245,"304 stainless steel",8000,metal);
  Add("Pedestal_tower","Mount_Pedestal","box",60,1200,6,0,-30,-1000,-66,"304 stainless steel",8000,metal);
  Add("Pedestal_head","Mount_Pedestal","box",100,90,44,0,-50,95,-60,"PC-ABS",1150,teal);
  for(int i=0;i<4;i++){
   Add("Smooth_pad_"+i,"Mount_Smooth","box",50,55,2,0,i%2==0?-70:20,i<2?55:215,-18,"COTS removable pad UNRATED",1100,black);
   Add("Magnet_pot_"+i,"Mount_Magnetic","disk",32,32,7,0,i%2==0?-65:33,i<2?60:218,-23,"COTS magnet UNRATED",7000,metal);
  }
 }
 [STAThread] static void Main(string[] args){
  CultureInfo.CurrentCulture=CultureInfo.InvariantCulture;
  root=args.Length>0?args[0]:Directory.GetCurrentDirectory();run=Path.Combine(root,"builds",DateTime.Now.ToString("yyyyMMdd-HHmmss"));parts=Path.Combine(run,"parts");Directory.CreateDirectory(parts);Directory.CreateDirectory(Path.Combine(run,"views"));log=new StreamWriter(Path.Combine(run,"build.log"));
  try{
   try{sw=(SldWorks)Marshal.GetActiveObject("SldWorks.Application");}catch{sw=(SldWorks)Activator.CreateInstance(Type.GetTypeFromProgID("SldWorks.Application"));}
   sw.Visible=true;sw.CommandInProgress=true; Say("SOLIDWORKS "+sw.RevisionNumber()); Layout();WriteBOM();
   string resume=args.Length>1?args[1]:"";
   if(Directory.Exists(resume)&&File.Exists(Path.Combine(resume,"sketch_checks.txt")))File.Copy(Path.Combine(resume,"sketch_checks.txt"),Path.Combine(run,"sketch_checks.txt"));
   foreach(var item in items){string cached=Path.Combine(resume,"parts",item.Name+".SLDPRT");if(resume!=""&&File.Exists(cached)){item.Path=Path.Combine(parts,item.Name+".SLDPRT");File.Copy(cached,item.Path);Say("Reuse "+item.Name);}else BuildPart(item);}
   BuildAssembly(); WriteBOM(); File.WriteAllLines(Path.Combine(run,"checks.txt"),checks); File.WriteAllText(Path.Combine(root,"LATEST.txt"),run); Say("COMPLETE "+run);
  }catch(Exception e){Say("FAILED "+e);System.Environment.ExitCode=1;}finally{if(sw!=null)sw.CommandInProgress=false;log.Dispose();}
 }
 static ModelDoc2 NewPart(){var d=(ModelDoc2)sw.NewDocument(Template(swUserPreferenceStringValue_e.swDefaultTemplatePart),0,0,0);if(d==null)throw new Exception("Part template failed");d.SetUnits(0,0,2,0,false);return d;}
 static void Sketch(ModelDoc2 d){d.ClearSelection2(true);if(!d.Extension.SelectByID2("Front Plane","PLANE",0,0,0,false,0,null,0))throw new Exception("Front plane not found");d.SketchManager.InsertSketch(true);d.SketchManager.AddToDB=true;}
 static void Rect(ModelDoc2 d,double x,double y,double w,double h){d.SketchManager.CreateCornerRectangle(x/1000,y/1000,0,(x+w)/1000,(y+h)/1000,0);}
 static void Circle(ModelDoc2 d,double x,double y,double r){d.SketchManager.CreateCircleByRadius(x/1000,y/1000,0,r/1000);}
 static Feature Extrude(ModelDoc2 d,string name,double depth,double start){
  d.SketchManager.AddToDB=false;var sk=(Sketch)d.GetActiveSketch2();
  var points=(object[])sk.GetSketchPoints2();if(points!=null&&points.Length>0){d.ClearSelection2(true);((SketchPoint)points[0]).Select4(false,null);d.SketchAddConstraints("sgFIXED");}
  d.ClearSelection2(true);
  int res=d.SketchManager.FullyDefineSketch(true,true,518,true,0,null,0,null,0,0);
  int constrained=sk.GetConstrainedStatus();checks.Add(d.GetTitle()+" "+name+" sketch status="+constrained+" fullyDefine="+res);
  d.SketchManager.InsertSketch(true);
  var sf=(Feature)sk;sf.Select2(false,0);
  var f=d.FeatureManager.FeatureExtrusion3(true,false,false,0,0,depth/1000,0,false,false,false,false,0,0,false,false,false,false,true,true,true,start==0?0:3,start/1000,false);
  if(f==null)throw new Exception("Extrusion failed "+name);f.Name=name;
  var eq=(EquationMgr)d.GetEquationMgr();string v=name+"_Depth";eq.Add2(-1,"\""+v+"\" = "+Num(depth)+"mm",true);eq.Add2(-1,"\"D1@"+name+"\" = \""+v+"\"",true);
  // Every auto-generated sketch dimension becomes an editable global variable.
  var dd=(DisplayDimension)sf.GetFirstDisplayDimension();int index=0;
  while(dd!=null){var dim=dd.GetDimension2(0);string full=dim.FullName;var names=full.Split('@');string shortName=names[0]+"@"+names[1];string gv=name+"_Sketch_"+(++index);eq.Add2(-1,"\""+gv+"\" = "+Num(dim.SystemValue*1000)+"mm",true);eq.Add2(-1,"\""+shortName+"\" = \""+gv+"\"",true);dd=(DisplayDimension)sf.GetNextDisplayDimension(dd);}
  File.AppendAllText(Path.Combine(run,"sketch_checks.txt"),d.GetTitle()+" "+name+" status="+constrained+" result="+res+System.Environment.NewLine);
  return f;
 }
 static void BuildPart(Item a){
  Say("Part "+a.Name);var d=NewPart();
  Sketch(d);
  if(a.Shape.StartsWith("half_")){
   double cx=a.W/2,cy=a.H/2,r=a.W/2,ri=r-a.T,sgn=a.Shape=="half_front"?1:-1;
   d.SketchManager.Create3PointArc((cx-r)/1000,cy/1000,0,(cx+r)/1000,cy/1000,0,cx/1000,(cy+sgn*r)/1000,0);
   d.SketchManager.CreateLine((cx+r)/1000,cy/1000,0,(cx+ri)/1000,cy/1000,0);
   d.SketchManager.Create3PointArc((cx+ri)/1000,cy/1000,0,(cx-ri)/1000,cy/1000,0,cx/1000,(cy+sgn*ri)/1000,0);
   d.SketchManager.CreateLine((cx-ri)/1000,cy/1000,0,(cx-r)/1000,cy/1000,0);
  }
  else if(a.Shape=="disk"||a.Shape=="tube"){Circle(d,a.W/2,a.H/2,a.W/2);if(a.Shape=="tube")Circle(d,a.W/2,a.H/2,a.W/2-a.T);}
  else {Rect(d,0,0,a.W,a.H);if(a.Shape=="ring"||a.Shape=="tray")Rect(d,a.T,a.T,a.W-2*a.T,a.H-2*a.T);if(a.Shape=="plate"){foreach(double x in new[]{12.0,a.W-12})foreach(double y in new[]{14.0,a.H-14})Circle(d,x,y,2.5);}if(a.Name=="03_Upper_front_panel")Rect(d,58,47,84,40);}
  Extrude(d,"Profile",a.D,0);
  if(a.Shape=="tray"){Sketch(d);Rect(d,a.T,a.T,a.W-2*a.T,a.H-2*a.T);Extrude(d,"Back",a.T,0);}
  var eq=(EquationMgr)d.GetEquationMgr();eq.Add2(-1,"\"EnvelopeWidth\" = "+Num(a.W)+"mm",true);eq.Add2(-1,"\"EnvelopeHeight\" = "+Num(a.H)+"mm",true);
  d.MaterialPropertyValues=new double[]{a.Color[0],a.Color[1],a.Color[2],.3,.7,.3,.1,0,0};
  var cp=d.Extension.get_CustomPropertyManager("");cp.Add3("Material_spec",30,a.Material,2);cp.Add3("Design_stage",30,"REV A: prototype engineering layout; see limitations",2);cp.Add3("Group",30,a.Group,2);cp.Add3("Process",30,a.Process,2);
  d.EditRebuild3();d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();
  a.Path=Path.Combine(parts,a.Name+".SLDPRT");Save(d,a.Path);
  sw.CloseDoc(d.GetTitle());
 }
 static void Save(ModelDoc2 d,string path){int err=0,warn=0;bool ok=d.Extension.SaveAs(path,0,1,null,ref err,ref warn);if(!ok||err!=0)throw new Exception("Save failed "+path+" "+err);checks.Add("Saved "+Path.GetFileName(path)+" warnings="+warn);}
 static void Place(Component2 c,double x,double y,double z){var mu=(MathUtility)sw.GetMathUtility();bool rot=c.Name2.Contains("Rail_front_half")||c.Name2.Contains("Rail_rear_half")||c.Name2.Contains("Rail_insert");double[] data=rot?new double[]{1,0,0,0,0,1,0,-1,0,x/1000,y/1000,z/1000,1,0,0,0}:new double[]{1,0,0,0,1,0,0,0,1,x/1000,y/1000,z/1000,1,0,0,0};c.Transform2=(MathTransform)mu.CreateTransform(data);}
 static void BuildAssembly(){
  Say("Assembly");var d=(ModelDoc2)sw.NewDocument(Template(swUserPreferenceStringValue_e.swDefaultTemplateAssembly),0,0,0);var a=(AssemblyDoc)d;d.SetUnits(0,0,2,0,false);int er=0,wa=0;
  foreach(var it in items){sw.OpenDoc6(it.Path,1,1,"",ref er,ref wa);sw.ActivateDoc3(d.GetTitle(),false,0,ref er);var c=a.AddComponent5(it.Path,0,"",false,"",0,0,0);if(c==null)throw new Exception("Insert failed "+it.Name);it.Comp=c;Place(c,it.X,it.Y,it.Z);d.ClearSelection2(true);c.Select4(false,null,false);a.FixComponent();d.ClearSelection2(true);}
  foreach(string m in new[]{"Partition","Rail","Hook","Pedestal","Smooth","Magnetic"})foreach(string p in new[]{"DC","Battery"}){
   string cfg=m+"_"+p;d.ConfigurationManager.AddConfiguration2(cfg,"Prototype "+m+" / "+p,"",0,"","",false);d.ShowConfiguration2(cfg);
   foreach(var it in items){bool on=it.Group=="Core"||it.Group==p||it.Group=="Mount_"+m;it.Comp.SetSuppression2(on?2:0);}
   d.EditRebuild3();Say("Configuration "+cfg);
  }
  d.ShowConfiguration2("Partition_DC");d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();Save(d,Path.Combine(run,"Luma_Retrofit.SLDASM"));
  foreach(string m in new[]{"Partition","Rail","Hook","Pedestal","Smooth","Magnetic"}){
   d.ShowConfiguration2(m+"_DC");d.EditRebuild3();d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();d.SaveBMP(Path.Combine(run,"views",m+".bmp"),1400,1000);
  }
  d.ShowConfiguration2("Partition_DC");
  try{var mgr=a.InterferenceDetectionManager;mgr.TreatCoincidenceAsInterference=false;var found=(object[])mgr.GetInterferences();checks.Add("SolidWorks interference count="+(found==null?0:found.Length));if(found!=null)foreach(Interference itf in found){var cs=(object[])itf.Components;checks.Add("INTERFERENCE "+string.Join(" / ",cs.Cast<Component2>().Select(c=>c.Name2))+" volume(m3)="+itf.Volume);}}catch(Exception e){checks.Add("Interference API unavailable: "+e.Message);}
  // Explicit exploded configuration: full component transforms preserved separately.
  d.ConfigurationManager.AddConfiguration2("Exploded_Core","Exploded component layout","",0,"","",false);d.ShowConfiguration2("Exploded_Core");
  int ix=0;foreach(var it in items){if(it.Group=="Core"){it.Comp.SetSuppression2(2);d.ClearSelection2(true);it.Comp.Select4(false,null,false);a.UnfixComponent();Place(it.Comp,it.X+(ix%4-1.5)*180,it.Y+(ix/4)*100,it.Z+(ix%4)*130);a.FixComponent();ix++;}else it.Comp.SetSuppression2(0);}
  d.ClearSelection2(true);d.EditRebuild3();d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();d.SaveBMP(Path.Combine(run,"views","Exploded.bmp"),1600,1200);Save(d,Path.Combine(run,"Luma_Retrofit.SLDASM"));
  d.ShowConfiguration2("Partition_DC");foreach(var it in items){if(it.Comp.GetSuppression()!=0){d.ClearSelection2(true);it.Comp.Select4(false,null,false);a.UnfixComponent();Place(it.Comp,it.X,it.Y,it.Z);a.FixComponent();}}d.ClearSelection2(true);d.EditRebuild3();d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();Save(d,Path.Combine(run,"Luma_Retrofit.SLDASM"));
  try{var dr=(ModelDoc2)sw.NewDocument(Template(swUserPreferenceStringValue_e.swDefaultTemplateDrawing),0,0,0);if(dr!=null){var draw=(DrawingDoc)dr;draw.Create3rdAngleViews2(Path.Combine(run,"Luma_Retrofit.SLDASM"));dr.ViewZoomtofit2();Save(dr,Path.Combine(run,"Luma_GA.SLDDRW"));sw.CloseDoc(dr.GetTitle());}}catch(Exception e){checks.Add("Drawing: "+e.Message);}
  Say("Assembly complete");
 }
 static void WriteBOM(){var rows=new List<string>{"Part,Configuration_group,Shape,Width_mm,Height_mm,Depth_mm,Wall_mm,X_mm,Y_mm,Z_mm,Material,Process,Qty"};foreach(var i in items)rows.Add(string.Join(",",new[]{i.Name,i.Group,i.Shape,Num(i.W),Num(i.H),Num(i.D),Num(i.T),Num(i.X),Num(i.Y),Num(i.Z),i.Material,i.Process,"1"}));File.WriteAllLines(Path.Combine(run,"BOM.csv"),rows);}
}
