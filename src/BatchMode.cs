using System;
using System.Runtime.InteropServices;
using SolidWorks.Interop.sldworks;
class BatchMode{
 [STAThread]static void Main(string[] args){var sw=(SldWorks)Marshal.GetActiveObject("SldWorks.Application");bool on=args.Length==0||args[0]!="off";sw.CommandInProgress=on;sw.DocumentVisible(!on,1);Console.WriteLine("CommandInProgress="+sw.CommandInProgress);}
}
