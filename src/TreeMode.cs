using System;using System.Runtime.InteropServices;using SolidWorks.Interop.sldworks;
class TreeMode{[STAThread]static void Main(string[] args){var sw=(SldWorks)Marshal.GetActiveObject("SldWorks.Application");var d=(ModelDoc2)sw.ActiveDoc;if(d!=null){d.FeatureManager.EnableFeatureTree=args.Length>0;Console.WriteLine("Tree refresh="+d.FeatureManager.EnableFeatureTree);}}}
