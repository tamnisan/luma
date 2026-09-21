// Export neutral formats from a finished build so the model can be used without SolidWorks 2026:
//   exports/step/Luma_<configuration>.step  one STEP AP214 assembly per configuration (FreeCAD, Fusion, Onshape, ...)
//   exports/stl/<part>.stl                  one binary STL per unique part, millimetres, part coordinates (3D printing)
//   exports/scene.json                      per-configuration component placement, colour and measured box (browser viewer)
// Documents are opened read-only; the user's STL/STEP export preferences are restored afterwards.
using System;using System.IO;using System.Linq;using System.Text;using System.Globalization;using System.Collections.Generic;using System.Runtime.InteropServices;using SolidWorks.Interop.sldworks;using SolidWorks.Interop.swconst;
class Export{
 static SldWorks sw;static CultureInfo inv=CultureInfo.InvariantCulture;
 static string N(double v){return Math.Round(v,6).ToString("R",inv);}
 static string Arr(IEnumerable<double> a){return a==null?"null":"["+string.Join(",",a.Select(N))+"]";}
 static string Q(string s){return "\""+s.Replace("\\","\\\\").Replace("\"","\\\"")+"\"";}
 // Documents that were already open (e.g. left by the previous build stage) are used but never closed.
 static HashSet<string> keep=new HashSet<string>(StringComparer.OrdinalIgnoreCase);
 static void Close(ModelDoc2 d){if(!keep.Contains(d.GetPathName()))sw.CloseDoc(d.GetTitle());}
 static ModelDoc2 Open(string file,int type){if(sw.GetOpenDocumentByName(file)!=null)keep.Add(file);int e=0,w=0;var d=(ModelDoc2)sw.OpenDoc6(file,type,(int)(swOpenDocOptions_e.swOpenDocOptions_Silent|swOpenDocOptions_e.swOpenDocOptions_ReadOnly),"",ref e,ref w);if(d==null)throw new Exception("Cannot open "+file+" error="+e);return d;}
 static void SaveCopy(ModelDoc2 d,string file){int e=0,w=0;if(File.Exists(file))File.Delete(file);bool ok=d.Extension.SaveAs(file,(int)swSaveAsVersion_e.swSaveAsCurrentVersion,(int)(swSaveAsOptions_e.swSaveAsOptions_Silent|swSaveAsOptions_e.swSaveAsOptions_Copy),null,ref e,ref w);if(!ok||!File.Exists(file))throw new Exception("Export failed "+file+" error="+e);
  // SolidWorks upper-cases some extensions (x.STL); keep the requested name so links work on case-sensitive systems.
  string actual=Directory.GetFiles(Path.GetDirectoryName(file),Path.GetFileName(file))[0];if(actual!=file){File.Move(actual,file+".tmp");File.Move(file+".tmp",file);}}
 // Top-level visible components of the active configuration.
 static string Components(AssemblyDoc a,HashSet<string> parts){var rows=new List<string>();
  foreach(Component2 c in (object[])a.GetComponents(false)){string p=c.GetPathName();if(c.IsSuppressed()||c.Visible==(int)swComponentVisibilityState_e.swComponentHidden||!p.EndsWith(".SLDPRT",StringComparison.OrdinalIgnoreCase))continue;
   string k=Path.GetFileNameWithoutExtension(p);parts.Add(p);var m=(double[])((MathTransform)c.Transform2).ArrayData;var box=(double[])c.GetBox(false,false);var col=(double[])c.GetMaterialPropertyValues2((int)swInConfigurationOpts_e.swThisConfiguration,null);
   rows.Add("{\"part\":"+Q(k)+",\"name\":"+Q(c.Name2)+",\"m\":"+Arr(m)+",\"box\":"+Arr(box==null?null:box.Select(v=>v*1000))+",\"color\":"+Arr(col!=null&&col.Length>=3&&col[0]>=0?col.Take(3):null)+"}");}
  return "["+string.Join(",\n",rows)+"]";}
 [STAThread]static void Main(string[] args){string run=Path.GetFullPath(args[0]);bool launched=false;var prefs=new List<Action>();
  string outDir=Path.Combine(run,"exports"),stepDir=Path.Combine(outDir,"step"),stlDir=Path.Combine(outDir,"stl");Directory.CreateDirectory(stepDir);Directory.CreateDirectory(stlDir);
  try{
   try{sw=(SldWorks)Marshal.GetActiveObject("SldWorks.Application");}catch(COMException){sw=(SldWorks)Activator.CreateInstance(Type.GetTypeFromProgID("SldWorks.Application"));launched=true;Console.WriteLine("Started SolidWorks");}
   sw.CommandInProgress=true;
   Action<swUserPreferenceToggle_e,bool> tog=(k,v)=>{bool old=sw.GetUserPreferenceToggle((int)k);prefs.Add(()=>sw.SetUserPreferenceToggle((int)k,old));sw.SetUserPreferenceToggle((int)k,v);};
   Action<swUserPreferenceIntegerValue_e,int> num=(k,v)=>{int old=sw.GetUserPreferenceIntegerValue((int)k);prefs.Add(()=>sw.SetUserPreferenceIntegerValue((int)k,old));sw.SetUserPreferenceIntegerValue((int)k,v);};
   tog(swUserPreferenceToggle_e.swSTLBinaryFormat,true);tog(swUserPreferenceToggle_e.swSTLDontTranslateToPositive,true);tog(swUserPreferenceToggle_e.swSTLShowInfoOnSave,false);tog(swUserPreferenceToggle_e.swSTLPreview,false);
   num(swUserPreferenceIntegerValue_e.swSTLQuality,(int)swSTLQuality_e.swSTLQuality_Fine);num(swUserPreferenceIntegerValue_e.swExportStlUnits,(int)swLengthUnit_e.swMM);
   num(swUserPreferenceIntegerValue_e.swStepAP,214);tog(swUserPreferenceToggle_e.swStepExportAppearances,true);
   var parts=new HashSet<string>(StringComparer.OrdinalIgnoreCase);var configs=new List<string>();
   var d=Open(Path.Combine(run,"Luma_Retrofit.SLDASM"),(int)swDocumentTypes_e.swDocASSEMBLY);var a=(AssemblyDoc)d;string start=((Configuration)d.GetActiveConfiguration()).Name;
   foreach(string cfg in (string[])d.GetConfigurationNames()){if(cfg=="Default")continue; // template-created; same content as Partition_DC
    d.ShowConfiguration2(cfg);d.EditRebuild3();var conf=(Configuration)d.GetConfigurationByName(cfg);
    configs.Add("{\"name\":"+Q(cfg)+",\"description\":"+Q(conf.Comment??"")+",\"components\":"+Components(a,parts)+"}");
    SaveCopy(d,Path.Combine(stepDir,"Luma_"+cfg+".step"));Console.WriteLine("STEP "+cfg);}
   d.ShowConfiguration2(start);Close(d);
   var x=Open(Path.Combine(run,"Luma_Exploded.SLDASM"),(int)swDocumentTypes_e.swDocASSEMBLY);configs.Add("{\"name\":\"Exploded\",\"description\":\"Separated-parts review assembly (Luma_Exploded.SLDASM)\",\"components\":"+Components((AssemblyDoc)x,parts)+"}");Close(x);Console.WriteLine("Exploded layout");
   var partRows=new List<string>();
   foreach(string p in parts.OrderBy(s=>s)){var pd=Open(p,(int)swDocumentTypes_e.swDocPART);string k=Path.GetFileNameWithoutExtension(p);SaveCopy(pd,Path.Combine(stlDir,k+".stl"));var col=(double[])pd.MaterialPropertyValues;partRows.Add(Q(k)+":{\"color\":"+Arr(col==null?null:col.Take(3))+"}");Close(pd);}
   Console.WriteLine("STL parts "+parts.Count);
   File.WriteAllText(Path.Combine(outDir,"scene.json"),"{\"units\":\"mm\",\"transform\":\"SolidWorks MathTransform ArrayData: rotation[0..8], translation m[9..11], scale[12]\",\n\"parts\":{"+string.Join(",\n",partRows)+"},\n\"configurations\":[\n"+string.Join(",\n",configs)+"]}\n",new UTF8Encoding(false));
   Console.WriteLine("Exported "+configs.Count+" configurations to "+outDir);
  }catch(Exception e){Console.WriteLine(e);System.Environment.ExitCode=1;}
  finally{if(sw!=null){foreach(var restore in prefs)restore();sw.CommandInProgress=false;
   // SolidWorks started here is invisible; it occasionally stalls after ExitApp, so don't leave it running in the background.
   if(launched){int pid=sw.GetProcessID();sw.ExitApp();try{var proc=System.Diagnostics.Process.GetProcessById(pid);if(!proc.WaitForExit(90000)){proc.Kill();Console.WriteLine("SolidWorks did not exit; stopped it");}}catch(ArgumentException){}}}}}
}
