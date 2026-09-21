using System;
using System.Runtime.InteropServices;
using SolidWorks.Interop.sldworks;
class Probe {
 [STAThread] static void Main(){
  try {
   SldWorks app;
   try { app=(SldWorks)Marshal.GetActiveObject("SldWorks.Application"); }
   catch { app=(SldWorks)Activator.CreateInstance(Type.GetTypeFromProgID("SldWorks.Application")); }
   app.Visible=true;
   Console.WriteLine("Revision="+app.RevisionNumber());
   var doc=(ModelDoc2)app.NewDocument(@"C:\ProgramData\SOLIDWORKS\SOLIDWORKS 2026\templates\Part.PRTDOT",0,0,0);
   Console.WriteLine("NewPart="+(doc!=null));
   if(doc!=null) app.CloseDoc(doc.GetTitle());
  } catch(Exception e){Console.WriteLine(e); System.Environment.ExitCode=1;}
 }
}
