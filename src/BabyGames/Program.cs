using System;
using System.Threading;
using System.Windows.Forms;

namespace BabyGames
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            // Una sola ventana de BabyGames a la vez (los peques tocan el icono muchas veces).
            using (var mutex = new Mutex(true, "BabyGames.SingleInstance", out bool isFirst))
            {
                if (!isFirst)
                {
                    NativeMethods.BringExistingWindowToFront("BabyGames");
                    return;
                }

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new MainForm());
            }
        }
    }
}
