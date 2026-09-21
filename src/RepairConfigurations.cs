using System;using System.IO;using System.Linq;using System.Collections.Generic;using System.Runtime.InteropServices;using SolidWorks.Interop.sldworks;
class RepairConfigurations{
 static SldWorks sw;
 [STAThread]static void Main(string[] args){string run=args[0];try{sw=(SldWorks)Marshal.GetActiveObject("SldWorks.Application");sw.CommandInProgress=true;sw.DocumentVisible(true,1);int e=0,w=0;var d=(ModelDoc2)sw.OpenDoc6(Path.Combine(run,"Luma_Retrofit.SLDASM"),2,1,"",ref e,ref w);sw.ActivateDoc3(d.GetTitle(),false,0,ref e);var a=(AssemblyDoc)d;
  var rows=File.ReadAllLines(Path.Combine(run,"BOM.csv")).Skip(1).Select(l=>l.Split(',')).ToDictionary(r=>r[0]);var logs=new List<string>();
  foreach(string cfg in (string[])d.GetConfigurationNames()){
   d.ShowConfiguration2(cfg);string mount=cfg=="Default"?"Partition":cfg.Split('_')[0];string power=cfg.EndsWith("Battery")?"Battery":"DC";bool exploded=cfg=="Exploded_Core";int ix=0,count=0;
   // Component pointers are obtained AFTER configuration activation; cached pointers became stale.
   foreach(Component2 c in (object[])a.GetComponents(false)){
    string key=Path.GetFileNameWithoutExtension(c.GetPathName());if(!rows.ContainsKey(key))continue;var r=rows[key];string group=r[1];bool on=group=="Core"||(!exploded&&(group==power||group=="Mount_"+mount));int target=on?2:0;if(c.GetSuppression()!=target){int ret=c.SetSuppression2(target);if(c.GetSuppression()!=target)throw new Exception("Suppression failed "+cfg+" "+key+" status="+ret);}
    if(on)count++;
    if(on&&(exploded||key=="35_Scan_motor_envelope"||key=="54_Strip_jam_home_sensor"||key=="34_Calibration_tile")){d.ClearSelection2(true);c.Select4(false,null,false);a.UnfixComponent();double x=double.Parse(r[7]),y=double.Parse(r[8]),z=double.Parse(r[9]);
     if(key=="35_Scan_motor_envelope")y=169;if(key=="54_Strip_jam_home_sensor")y=148;if(key=="34_Calibration_tile")x=83;
     if(exploded){x+=(ix%5-2)*200;y+=(ix/5)*110;z+=(ix%5)*160;ix++;}
     bool rot=key.StartsWith("Rail_front_half")||key.StartsWith("Rail_rear_half")||key.StartsWith("Rail_insert");double[] tr=rot?new[]{1.0,0,0,0,0,1,0,-1,0,x/1000,y/1000,z/1000,1,0,0,0}:new[]{1.0,0,0,0,1,0,0,0,1,x/1000,y/1000,z/1000,1,0,0,0};c.Transform2=(MathTransform)((MathUtility)sw.GetMathUtility()).CreateTransform(tr);a.FixComponent();}
   }
   d.ClearSelection2(true);d.EditRebuild3();logs.Add(cfg+" active="+count);Console.WriteLine(logs.Last());d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();if(cfg.EndsWith("_DC")||exploded)d.SaveBMP(Path.Combine(run,"views",exploded?"Exploded.bmp":mount+".bmp"),1400,1100);
  }
  foreach(var r in rows.Values){if(r[0]=="35_Scan_motor_envelope")r[8]="169";if(r[0]=="54_Strip_jam_home_sensor")r[8]="148";if(r[0]=="34_Calibration_tile")r[7]="83";}
  File.WriteAllLines(Path.Combine(run,"BOM.csv"),new[]{File.ReadLines(Path.Combine(run,"BOM.csv")).First()}.Concat(rows.Values.Select(r=>string.Join(",",r))));
  d.ShowConfiguration2("Partition_DC");d.ShowNamedView2("*Isometric",7);d.ViewZoomtofit2();d.Save3(1,ref e,ref w);File.WriteAllLines(Path.Combine(run,"configuration-checks.txt"),logs);
 }catch(Exception e){Console.WriteLine(e);System.Environment.ExitCode=1;}finally{if(sw!=null){sw.CommandInProgress=false;sw.DocumentVisible(true,1);}}}
}
