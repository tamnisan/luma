using System;using System.Text;using System.Runtime.InteropServices;
class WindowDiagnostic{
 delegate bool EnumProc(IntPtr h,IntPtr p);
 [DllImport("user32.dll")]static extern bool EnumWindows(EnumProc cb,IntPtr p);
 [DllImport("user32.dll")]static extern bool EnumChildWindows(IntPtr h,EnumProc cb,IntPtr p);
 [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]static extern int GetWindowText(IntPtr h,StringBuilder s,int n);
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr h);
 static string Title(IntPtr h){var s=new StringBuilder(1024);GetWindowText(h,s,1024);return s.ToString();}
 static void Main(){EnumWindows((h,p)=>{uint id;GetWindowThreadProcessId(h,out id);if(id==16124&&IsWindowVisible(h)){Console.WriteLine(h+" "+Title(h));if(!Title(h).StartsWith("SOLIDWORKS Design"))EnumChildWindows(h,(c,q)=>{var t=Title(c);if(t!="")Console.WriteLine("  "+c+" "+t);return true;},IntPtr.Zero);}return true;},IntPtr.Zero);}
}
