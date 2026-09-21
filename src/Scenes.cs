using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using SolidWorks.Interop.sldworks;
class Scenes {
 static SldWorks sw;static string run;static string[] names={"Partition","Rail","Pedestal","Smooth"};
 static double[][] sizes={new[]{350.0,850,50},new[]{32.0,32,1300},new[]{950.0,20,950},new[]{650.0,850,30}};
 static double[][] origins={new[]{-20.0,-250,-72},new[]{-16.0,500,-63},new[]{-475.0,-1050,-470},new[]{-300.0,-250,-48}};
 [STAThread]static void Main(string[] args){run=args[0];try{sw=(SldWorks)Marshal.GetActiveObject("SldWorks.Application");sw.CommandInProgress=true;string model=Path.Combine(run,"Luma_Retrofit.SLDASM");int e=0,w=0;var d=(ModelDoc2)sw.OpenDoc6(model,2,1,"",ref e,ref w);var ass=(AssemblyDoc)d;var refs=new List<Component2>();
  for(int i=0;i<4;i++){
   var p=(ModelDoc2)sw.NewDocument(@"C:\ProgramData\SOLIDWORKS\SOLIDWORKS 2026\templates\Part.PRTDOT",0,0,0);p.SetUnits(0,0,2,0,false);p.Extension.SelectByID2("Front Plane","PLANE",0,0,0,false,0,null,0);p.SketchManager.InsertSketch(true);p.SketchManager.AddToDB=true;
   if(i==1)p.SketchManager.CreateCircleByRadius(.016,.016,0,.016);else p.SketchManager.CreateCornerRectangle(0,0,0,sizes[i][0]/1000,sizes[i][1]/1000,0);p.SketchManager.AddToDB=false;var sk=(Sketch)p.GetActiveSketch2();var pts=(object[])sk.GetSketchPoints2();p.ClearSelection2(true);((SketchPoint)pts[0]).Select4(false,null);p.SketchAddConstraints("sgFIXED");p.ClearSelection2(true);p.SketchManager.FullyDefineSketch(true,true,518,true,0,null,0,null,0,0);p.SketchManager.InsertSketch(true);((Feature)sk).Select2(false,0);
   var f=p.FeatureManager.FeatureExtrusion3(true,false,false,0,0,sizes[i][2]/1000,0,false,false,false,false,0,0,false,false,false,false,true,true,true,0,0,false);if(f==null)throw new Exception("Reference geometry failed");f.Name="Reference_only";p.MaterialPropertyValues=new double[]{.74,.79,.81,.3,.7,.1,.05,0,0};string file=Path.Combine(run,"parts","REFERENCE_"+names[i]+".SLDPRT");p.Extension.SaveAs(file,0,1,null,ref e,ref w);sw.ActivateDoc3(d.GetTitle(),false,0,ref e);var c=ass.AddComponent5(file,0,"",false,"",0,0,0);d.ClearSelection2(true);c.Select4(false,null,false);ass.UnfixComponent();double[] o=origins[i];double[] tr=i==1?new[]{1.0,0,0,0,0,1,0,-1,0,o[0]/1000,o[1]/1000,o[2]/1000,1,0,0,0}:new[]{1.0,0,0,0,1,0,0,0,1,o[0]/1000,o[1]/1000,o[2]/1000,1,0,0,0};c.Transform2=(MathTransform)((MathUtility)sw.GetMathUtility()).CreateTransform(tr);ass.FixComponent();refs.Add(c);c.SetSuppression2(0);
  }
  for(int i=0;i<4;i++){d.ShowConfiguration2(names[i]+"_DC");SetRefs(ass,"");d.ConfigurationManager.AddConfiguration2("Installed_"+names[i],"Illustrative host infrastructure; reference geometry only","",0,"","",false);d.ShowConfiguration2("Installed_"+names[i]);SetRefs(ass,names[i]);d.EditRebuild3();d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();d.SaveBMP(Path.Combine(run,"views","Installed_"+names[i]+".bmp"),1400,1200);Console.WriteLine("Scene "+names[i]);}
  foreach(string cfg in (string[])d.GetConfigurationNames())if(!cfg.StartsWith("Installed_")){d.ShowConfiguration2(cfg);SetRefs(ass,"");}
  d.ShowConfiguration2("Partition_DC");
  d.ConfigurationManager.AddConfiguration2("Service_Open","Front panels removed for packaging review; not door sweep","",0,"","",false);d.ShowConfiguration2("Service_Open");
  foreach(Component2 c in (object[])ass.GetComponents(false)){if(c.Name2.StartsWith("0")&&!c.Name2.StartsWith("01_")&&!c.Name2.StartsWith("08_")&&!c.Name2.StartsWith("09_"))c.SetSuppression2(0);if(c.Name2.StartsWith("12_")||c.Name2.StartsWith("23_"))c.SetSuppression2(0);}
  d.EditRebuild3();d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();d.SaveBMP(Path.Combine(run,"views","Service_Open.bmp"),1400,1200);
  d.ShowConfiguration2("Partition_DC");d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();d.Save3(1,ref e,ref w);Console.WriteLine("Scenes saved errors="+e);
 }catch(Exception e){Console.WriteLine(e);System.Environment.ExitCode=1;}finally{if(sw!=null)sw.CommandInProgress=false;}}
 static void SetRefs(AssemblyDoc a,string selected){foreach(Component2 c in (object[])a.GetComponents(false)){string file=Path.GetFileNameWithoutExtension(c.GetPathName());if(file.StartsWith("REFERENCE_"))c.SetSuppression2(file=="REFERENCE_"+selected?2:0);}}
}
