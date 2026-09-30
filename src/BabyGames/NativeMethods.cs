using System;
using System.Runtime.InteropServices;

namespace BabyGames
{
    internal static class NativeMethods
    {
        private const int SW_RESTORE = 9;

        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern IntPtr FindWindow(string className, string windowName);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool IsIconic(IntPtr hWnd);

        public static void BringExistingWindowToFront(string title)
        {
            IntPtr hWnd = FindWindow(null, title);
            if (hWnd == IntPtr.Zero) return;
            // Solo se restaura si está minimizada (restaurar una ventana maximizada la encogería).
            if (IsIconic(hWnd)) ShowWindow(hWnd, SW_RESTORE);
            SetForegroundWindow(hWnd);
        }
    }
}
