using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.InteropServices;
using SolidWorks.Interop.sldworks;
class Verify {
 static SldWorks sw;static List<string> report=new List<string>();static List<string> sketches=new List<string>();static List<string> measured=new List<string>();
 static string F(double v){return v.ToString("0.########",CultureInfo.InvariantCulture);}
 [STAThread] static void Main(string[] args){
  CultureInfo.CurrentCulture=CultureInfo.InvariantCulture;string run=args[0];
  try{sw=(SldWorks)Marshal.GetActiveObject("SldWorks.Application");sw.CommandInProgress=true;sw.DocumentVisible(true,1);
   // Close only this generated assembly during part edits to avoid rebuilding every configuration after each sketch repair.
   var open=(ModelDoc2)sw.GetOpenDocumentByName(Path.Combine(run,"Luma_Retrofit.SLDASM"));if(open!=null){int se=0,swarn=0;open.Save3(1,ref se,ref swarn);sw.CloseDoc(open.GetTitle());}
   measured.Add("Part,Width_mm,Height_mm,Depth_mm,Volume_mm3,Solids,RebuildOK");
   string[] files=Directory.GetFiles(Path.Combine(run,"parts"),"*.SLDPRT").Where(f=>!Path.GetFileName(f).StartsWith("~$")).ToArray();
   if(args.Length>1)files=files.Where(f=>Path.GetFileName(f).StartsWith(args[1])).ToArray();
   foreach(string file in files){int er=0,wa=0;var d=(ModelDoc2)sw.OpenDoc6(file,1,1,"",ref er,ref wa);if(d==null)throw new Exception("Cannot reopen "+file+" error="+er);
    sw.ActivateDoc3(d.GetTitle(),false,0,ref er);d.FeatureManager.EnableFeatureTree=false;
    var visited=new HashSet<string>();for(var f=(Feature)d.FirstFeature();f!=null;f=(Feature)f.GetNextFeature())InspectFeature(d,f,visited);
    bool rebuilt=d.EditRebuild3();var eq=(EquationMgr)d.GetEquationMgr();for(int q=0;q<eq.GetCount();q++){int status=eq.Status;if(status<0)report.Add(Path.GetFileName(file)+" Equation manager status="+status);}
    var bodies=(object[])((PartDoc)d).GetBodies2(0,false);double volume=0;double[] bounds={double.MaxValue,double.MaxValue,double.MaxValue,double.MinValue,double.MinValue,double.MinValue};
    if(bodies!=null)foreach(Body2 body in bodies){var b=(double[])body.GetBodyBox();for(int k=0;k<3;k++){bounds[k]=Math.Min(bounds[k],b[k]);bounds[k+3]=Math.Max(bounds[k+3],b[k+3]);}var mp=(double[])body.GetMassProperties(1);volume+=mp[3];}
    measured.Add(Path.GetFileNameWithoutExtension(file)+","+F((bounds[3]-bounds[0])*1000)+","+F((bounds[4]-bounds[1])*1000)+","+F((bounds[5]-bounds[2])*1000)+","+F(volume*1e9)+","+(bodies==null?0:bodies.Length)+","+rebuilt);
    d.FeatureManager.EnableFeatureTree=true;int e=0,w=0;bool saved=d.Save3(1,ref e,ref w);report.Add(Path.GetFileName(file)+" reopen="+(er==0)+" rebuild="+rebuilt+" saved="+saved+" errors="+e+" solids="+(bodies==null?0:bodies.Length));Console.WriteLine("Verified "+Path.GetFileName(file));sw.CloseDoc(d.GetTitle());
   }
   if(args.Length==1){
    int er=0,wa=0;var d=(ModelDoc2)sw.OpenDoc6(Path.Combine(run,"Luma_Retrofit.SLDASM"),2,1,"",ref er,ref wa);if(d==null)throw new Exception("Assembly reopen failed "+er);sw.ActivateDoc3(d.GetTitle(),false,0,ref er);var a=(AssemblyDoc)d;
    foreach(string cfg in (string[])d.GetConfigurationNames()){
     if(cfg=="Default")continue;d.ShowConfiguration2(cfg);a.ResolveAllLightWeightComponents(false);bool rebuilt=d.EditRebuild3();var cs=(object[])a.GetComponents(false);int active=cs.Cast<Component2>().Count(c=>c.GetSuppression()!=0);report.Add("CONFIG "+cfg+" rebuild="+rebuilt+" active="+active);
     if(cfg=="Partition_DC"){
      var mgr=a.InterferenceDetectionManager;mgr.TreatCoincidenceAsInterference=false;var found=(object[])mgr.GetInterferences();report.Add("INTERFERENCE_COUNT "+(found==null?0:found.Length));if(found!=null)foreach(Interference f in found)report.Add("INTERFERENCE "+string.Join(" / ",((object[])f.Components).Cast<Component2>().Select(c=>c.Name2))+" mm3="+F(f.Volume*1e9));
     }
    }
    d.ShowConfiguration2("Partition_DC");d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();int e=0,w=0;d.Save3(1,ref e,ref w);
   }
  }catch(Exception e){report.Add("FAIL "+e);Console.WriteLine(e);System.Environment.ExitCode=1;}finally{if(sw!=null)sw.CommandInProgress=false;File.WriteAllLines(Path.Combine(run,"verification.txt"),report);File.WriteAllLines(Path.Combine(run,"verified-sketches.txt"),sketches);File.WriteAllLines(Path.Combine(run,"measured-geometry.csv"),measured);}
 }
 static void InspectFeature(ModelDoc2 d,Feature f,HashSet<string> visited){
  if(!visited.Add(f.Name))return;bool warning=false;int error=f.GetErrorCode2(out warning);if(error!=0)report.Add(d.GetTitle()+" FEATURE "+f.Name+" error="+error+" warning="+warning);
  if(f.GetTypeName2()=="ProfileFeature"){
   var sk=(Sketch)f.GetSpecificFeature2();int before=sk.GetConstrainedStatus();
   if(before==2){d.ClearSelection2(true);f.Select2(false,0);d.EditSketch();var pts=(object[])sk.GetSketchPoints2();if(pts!=null&&pts.Length>0){d.ClearSelection2(true);((SketchPoint)pts[0]).Select4(false,null);d.SketchAddConstraints("sgFIXED");d.ClearSelection2(true);d.SketchManager.FullyDefineSketch(true,true,518,true,0,null,0,null,0,0);}d.SketchManager.InsertSketch(true);d.EditRebuild3();}
   int after=sk.GetConstrainedStatus();sketches.Add(d.GetTitle()+" / "+f.Name+" before="+before+" after="+after);if(after!=3)report.Add("SKETCH_PENDING "+d.GetTitle()+" / "+f.Name+" status="+after);
  }
  for(var sub=(Feature)f.GetFirstSubFeature();sub!=null;sub=(Feature)sub.GetNextSubFeature())InspectFeature(d,sub,visited);
 }
}
