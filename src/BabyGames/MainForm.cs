using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace BabyGames
{
    /// <summary>
    /// Ventana a pantalla completa que muestra el juego web (carpeta app\) con WebView2.
    /// La carpeta se sirve como https://babygames.local/ y cualquier otra dirección se bloquea.
    /// </summary>
    internal sealed class MainForm : Form
    {
        private const string HostName = "babygames.local";
        private static readonly Color Sky = Color.FromArgb(110, 195, 255);
        private const string WebView2DownloadUrl = "https://go.microsoft.com/fwlink/p/?LinkId=2124703";

        private readonly WebView2 web = new WebView2();
        private CoreWebView2Environment environment;
        private bool fullScreen;

        public MainForm()
        {
            Text = "BabyGames";
            BackColor = Sky;
            MinimumSize = new Size(640, 480);
            StartPosition = FormStartPosition.CenterScreen;
            Size = new Size(1280, 800);
            using (Stream icon = typeof(MainForm).Assembly.GetManifestResourceStream("BabyGames.app.ico"))
            {
                if (icon != null) Icon = new Icon(icon);
            }

            web.Dock = DockStyle.Fill;
            web.DefaultBackgroundColor = Sky;
            Controls.Add(web);

            SetFullScreen(true);
            Shown += async (s, e) => await InitializeWebAsync();
        }

        private async Task InitializeWebAsync()
        {
            string appDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app");
            if (!File.Exists(Path.Combine(appDir, "index.html")))
            {
                MessageBox.Show(this, "No se encuentra la carpeta 'app' junto a BabyGames.exe.\nVuelve a instalar BabyGames.",
                    "BabyGames", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
                return;
            }

            // Los datos (progreso, pegatinas) se guardan en %LOCALAPPDATA%\BabyGames.
            string dataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "BabyGames", "WebView2");
            var options = new CoreWebView2EnvironmentOptions("--autoplay-policy=no-user-gesture-required")
            {
                Language = "es-ES",
            };

            try
            {
                environment = await CoreWebView2Environment.CreateAsync(null, dataDir, options);
                await web.EnsureCoreWebView2Async(environment);
            }
            catch (WebView2RuntimeNotFoundException)
            {
                var answer = MessageBox.Show(this,
                    "Falta el componente Microsoft Edge WebView2 Runtime (viene con Windows 11).\n\n¿Abrir la página de descarga de Microsoft?",
                    "BabyGames", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
                if (answer == DialogResult.Yes) Process.Start(WebView2DownloadUrl);
                Close();
                return;
            }

            CoreWebView2 core = web.CoreWebView2;
            ConfigureKidMode(core.Settings);

            core.SetVirtualHostNameToFolderMapping(HostName, appDir, CoreWebView2HostResourceAccessKind.Allow);

            // Nada sale de BabyGames: ni navegación, ni ventanas nuevas, ni peticiones a internet.
            core.NavigationStarting += (s, e) => { if (!IsLocal(e.Uri)) e.Cancel = true; };
            core.FrameNavigationStarting += (s, e) => { if (!IsLocal(e.Uri)) e.Cancel = true; };
            core.NewWindowRequested += (s, e) => e.Handled = true;
            core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
            core.WebResourceRequested += (s, e) =>
            {
                if (!IsLocal(e.Request.Uri))
                    e.Response = environment.CreateWebResourceResponse(null, 403, "Bloqueado por BabyGames", "");
            };

            core.DownloadStarting += OnDownloadStarting;
            core.WebMessageReceived += OnWebMessage;
            core.ProcessFailed += (s, e) => core.Reload();

            core.Navigate($"https://{HostName}/index.html");
        }

        private static void ConfigureKidMode(CoreWebView2Settings settings)
        {
            settings.AreDefaultContextMenusEnabled = false;
            settings.IsZoomControlEnabled = false;
            settings.IsPinchZoomEnabled = false;
            settings.IsSwipeNavigationEnabled = false;
            settings.IsStatusBarEnabled = false;
            settings.IsGeneralAutofillEnabled = false;
            settings.IsPasswordAutosaveEnabled = false;
            settings.IsBuiltInErrorPageEnabled = false;
#if DEBUG
            settings.AreDevToolsEnabled = true;
            settings.AreBrowserAcceleratorKeysEnabled = true;
#else
            settings.AreDevToolsEnabled = false;
            settings.AreBrowserAcceleratorKeysEnabled = false;
#endif
        }

        private static bool IsLocal(string uri)
        {
            if (uri.StartsWith("about:", StringComparison.OrdinalIgnoreCase) ||
                uri.StartsWith("data:", StringComparison.OrdinalIgnoreCase) ||
                uri.StartsWith("blob:", StringComparison.OrdinalIgnoreCase))
                return true;
            return Uri.TryCreate(uri, UriKind.Absolute, out Uri parsed) &&
                   parsed.Scheme == Uri.UriSchemeHttps &&
                   string.Equals(parsed.Host, HostName, StringComparison.OrdinalIgnoreCase);
        }

        // Los dibujos que se guardan en "Pintar" van a Imágenes\BabyGames sin preguntar.
        private void OnDownloadStarting(object sender, CoreWebView2DownloadStartingEventArgs e)
        {
            string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyPictures), "BabyGames");
            Directory.CreateDirectory(dir);
            e.ResultFilePath = Path.Combine(dir, Path.GetFileName(e.ResultFilePath));
            e.Handled = true;
        }

        private void OnWebMessage(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            string message;
            try { message = e.TryGetWebMessageAsString(); }
            catch (ArgumentException) { return; }

            switch (message)
            {
                case "salir":
                    Close();
                    break;
                case "pantalla-completa":
                    SetFullScreen(!fullScreen);
                    break;
            }
        }

        private void SetFullScreen(bool on)
        {
            fullScreen = on;
            if (on)
            {
                // Sin bordes y maximizada = cubre también la barra de tareas.
                WindowState = FormWindowState.Normal;
                FormBorderStyle = FormBorderStyle.None;
                WindowState = FormWindowState.Maximized;
            }
            else
            {
                FormBorderStyle = FormBorderStyle.Sizable;
                WindowState = FormWindowState.Normal;
            }
        }
    }
}
