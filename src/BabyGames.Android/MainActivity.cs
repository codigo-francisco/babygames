using System.IO;
using Android.App;
using Android.Content.PM;
using Android.Graphics;
using Android.OS;
using Android.Util;
using Android.Views;
using Android.Webkit;
using Android.Widget;
using AndroidX.Activity;
using AndroidX.Core.View;
using AndroidX.WebKit;

namespace BabyGames.Droid
{
    /// <summary>
    /// Pantalla completa en horizontal que muestra el juego web (assets/app) con un WebView.
    /// La carpeta se sirve como https://appassets.androidplatform.net/app/ y cualquier otra dirección se bloquea.
    /// Es el equivalente de MainForm.cs en Windows.
    /// </summary>
    [Activity(
        Name = "com.babygames.app.MainActivity",
        Label = "BabyGames",
        MainLauncher = true,
        Exported = true,
        Theme = "@style/BabyGamesTheme",
        LaunchMode = LaunchMode.SingleTask,
        ScreenOrientation = ScreenOrientation.SensorLandscape,
        ResizeableActivity = false,
        ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.ScreenSize | ConfigChanges.SmallestScreenSize |
                               ConfigChanges.ScreenLayout | ConfigChanges.Keyboard | ConfigChanges.KeyboardHidden |
                               ConfigChanges.Navigation | ConfigChanges.UiMode | ConfigChanges.Density)]
    public sealed class MainActivity : ComponentActivity
    {
        internal const string HostName = "appassets.androidplatform.net"; // dominio de WebViewAssetLoader
        internal const string LogTag = "BabyGames";
        private const string StartUrl = "https://" + HostName + "/app/index.html";
        private static readonly Color Sky = Color.Rgb(110, 195, 255);

        private WebView web;
        private Speech speech;
        private bool fullScreen = true;

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            // Los botones de volumen cambian el volumen del juego aunque no esté sonando nada.
            VolumeControlStream = Android.Media.Stream.Music;

            speech = new Speech(this);
            web = new WebView(this);
            web.SetBackgroundColor(Sky);
            ConfigureKidMode(web);

            var loader = new WebViewAssetLoader.Builder()
                .AddPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this)) // /app/... -> assets/app/...
                .Build();
            web.SetWebViewClient(new KidWebViewClient(this, loader));
            web.SetWebChromeClient(new KidChromeClient());
            web.AddJavascriptInterface(new AndroidBridge(this, speech), "BabyGamesAndroid");

            // El WebView de Android no trae speechSynthesis: se imita con la voz del sistema en la
            // página y en los juegos (iframes), antes de que se ejecute ningún otro script.
            if (WebViewFeature.IsFeatureSupported(WebViewFeature.DocumentStartScript))
                WebViewCompat.AddDocumentStartJavaScript(web, ReadAsset("speech-shim.js"), new[] { "https://" + HostName });
            else
                Log.Warn(LogTag, "Este WebView no permite inyectar scripts: Bubu no hablará.");

            // El juego no se mete bajo la cámara ni bajo las barras del sistema (cuando se ven).
            var root = new FrameLayout(this);
            root.SetBackgroundColor(Sky);
            root.AddView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, ViewGroup.LayoutParams.MatchParent));
            SetContentView(root);
            WindowCompat.SetDecorFitsSystemWindows(Window, false);
            ViewCompat.SetOnApplyWindowInsetsListener(root, new SafeAreaPadding(this));
            ApplyFullScreen();

            OnBackPressedDispatcher.AddCallback(this, new BackToGame(web));
            web.LoadUrl(StartUrl);
        }

        private void ConfigureKidMode(WebView view)
        {
            WebSettings settings = view.Settings;
            settings.JavaScriptEnabled = true;
            settings.DomStorageEnabled = true;              // progreso, pegatinas y ajustes (localStorage)
            settings.MediaPlaybackRequiresUserGesture = false; // como --autoplay-policy en Windows
            settings.AllowFileAccess = false;
            settings.AllowContentAccess = false;
            settings.SetSupportZoom(false);
            settings.BuiltInZoomControls = false;
            settings.DisplayZoomControls = false;
            settings.TextZoom = 100;                        // ignora el tamaño de letra del sistema
            settings.SetSupportMultipleWindows(false);
            settings.JavaScriptCanOpenWindowsAutomatically = false;
            settings.SetGeolocationEnabled(false);
            settings.MixedContentMode = MixedContentHandling.NeverAllow;

            // Sin menús ni selección de texto al mantener pulsado, y sin rebote al arrastrar.
            view.LongClickable = false;
            view.HapticFeedbackEnabled = false;
            view.LongClick += (s, e) => e.Handled = true;
            view.OverScrollMode = OverScrollMode.Never;
            view.VerticalScrollBarEnabled = false;
            view.HorizontalScrollBarEnabled = false;

            bool debuggable = (ApplicationInfo.Flags & ApplicationInfoFlags.Debuggable) != 0;
            WebView.SetWebContentsDebuggingEnabled(debuggable);
        }

        private string ReadAsset(string name)
        {
            using (var reader = new StreamReader(Assets.Open(name)))
                return reader.ReadToEnd();
        }

        internal void ToggleFullScreen()
        {
            fullScreen = !fullScreen;
            ApplyFullScreen();
        }

        // "Fijar aplicación" (screen pinning): mientras está fijada, ni los gestos del borde ni los
        // botones de inicio/recientes sacan al peque de BabyGames, y no se puede bajar la barra de
        // notificaciones. Android pide confirmarlo al abrir la app; si se rechaza o se suelta con el
        // gesto de Android, se vuelve a pedir (ver CheckPin). Solo se suelta desde el Rincón de mayores.
        internal void Pin()
        {
            keepPinned = true;
            WatchPin();
            if (IsPinned) return;
            try
            {
                StartLockTask();
            }
            catch (Java.Lang.Exception e)
            {
                Log.Warn(LogTag, "No se pudo fijar la aplicación: " + e.Message);
            }
        }

        internal void Unpin()
        {
            keepPinned = false;
            if (!IsPinned) return;
            try
            {
                StopLockTask();
            }
            catch (Java.Lang.Exception e)
            {
                Log.Warn(LogTag, "No se pudo soltar la aplicación: " + e.Message);
            }
        }

        // La app solo se cierra desde el Rincón de mayores (Unpin/Exit). Si deja de estar fijada
        // de otra forma (se rechazó el aviso, o se soltó con el gesto largo de Android), se vuelve
        // a pedir al momento. Mientras el aviso está en pantalla la ventana no tiene el foco y no
        // se repite.
        private bool keepPinned;
        private bool watching;
        private const int PinCheckMs = 2500;

        private void WatchPin()
        {
            if (watching) return;
            watching = true;
            web.PostDelayed(CheckPin, PinCheckMs);
        }

        private void CheckPin()
        {
            if (!keepPinned || IsFinishing || IsDestroyed)
            {
                watching = false;
                return;
            }
            if (HasWindowFocus && !IsPinned)
            {
                try
                {
                    StartLockTask();
                }
                catch (Java.Lang.Exception e)
                {
                    Log.Warn(LogTag, "No se pudo fijar la aplicación: " + e.Message);
                }
            }
            web.PostDelayed(CheckPin, PinCheckMs);
        }

        internal bool IsPinned =>
            ((ActivityManager)GetSystemService(ActivityService)).LockTaskModeState != LockTaskMode.None;

        internal void Exit()
        {
            Unpin();
            FinishAndRemoveTask();
        }

        // Pantalla completa "inmersiva": las barras del sistema aparecen un momento al deslizar desde el borde.
        private void ApplyFullScreen()
        {
            WindowInsetsControllerCompat controller = WindowCompat.GetInsetsController(Window, Window.DecorView);
            if (fullScreen)
            {
                controller.SystemBarsBehavior = WindowInsetsControllerCompat.BehaviorShowTransientBarsBySwipe;
                controller.Hide(WindowInsetsCompat.Type.SystemBars());
            }
            else
            {
                controller.Show(WindowInsetsCompat.Type.SystemBars());
            }
        }

        public override void OnWindowFocusChanged(bool hasFocus)
        {
            base.OnWindowFocusChanged(hasFocus);
            if (hasFocus) ApplyFullScreen();
        }

        // Al salir a la pantalla de inicio la página pasa a "oculta" y el juego para su música (host.js).
        protected override void OnPause()
        {
            speech.Stop();
            web.OnPause();
            base.OnPause();
        }

        protected override void OnResume()
        {
            base.OnResume();
            web.OnResume();
            ApplyFullScreen();
        }

        protected override void OnDestroy()
        {
            speech.Shutdown();
            web.Destroy();
            base.OnDestroy();
        }

        private static bool IsLocal(Android.Net.Uri uri)
        {
            string scheme = uri.Scheme;
            if (scheme == "about" || scheme == "data" || scheme == "blob") return true;
            return scheme == "https" && string.Equals(uri.Host, HostName, System.StringComparison.OrdinalIgnoreCase);
        }

        private static WebResourceResponse Response(int status, string reason) =>
            new WebResourceResponse("text/plain", "utf-8", status, reason, null, new MemoryStream());

        // Nada sale de BabyGames: ni navegación, ni peticiones a internet.
        private sealed class KidWebViewClient : WebViewClient
        {
            private readonly MainActivity activity;
            private readonly WebViewAssetLoader loader;

            public KidWebViewClient(MainActivity activity, WebViewAssetLoader loader)
            {
                this.activity = activity;
                this.loader = loader;
            }

            public override bool ShouldOverrideUrlLoading(WebView view, IWebResourceRequest request) => !IsLocal(request.Url);

            public override WebResourceResponse ShouldInterceptRequest(WebView view, IWebResourceRequest request)
            {
                if (!IsLocal(request.Url)) return Response(403, "Bloqueado por BabyGames");
                if (request.Url.Scheme != "https") return null;
                return loader.ShouldInterceptRequest(request.Url) ?? Response(404, "No encontrado");
            }

            // Si el motor del WebView se cae, se vuelve a empezar (como ProcessFailed en Windows).
            public override bool OnRenderProcessGone(WebView view, RenderProcessGoneDetail detail)
            {
                Log.Warn(LogTag, "El WebView se ha cerrado; se reinicia BabyGames.");
                activity.Recreate();
                return true;
            }
        }

        private sealed class KidChromeClient : WebChromeClient
        {
            // Los mensajes de la consola JS van a logcat (adb logcat -s BabyGames).
            public override bool OnConsoleMessage(ConsoleMessage message)
            {
                string text = $"{message.Message()} ({message.SourceId()}:{message.LineNumber()})";
                ConsoleMessage.MessageLevel level = message.InvokeMessageLevel();
                if (level == ConsoleMessage.MessageLevel.Error) Log.Error(LogTag, text);
                else if (level == ConsoleMessage.MessageLevel.Warning) Log.Warn(LogTag, text);
                else Log.Debug(LogTag, text);
                return true;
            }

            public override void OnPermissionRequest(PermissionRequest request) => request.Deny();
        }

        // Atrás nunca sale de la app ni cierra un juego: solo cierra el Rincón de mayores, el álbum…
        private sealed class BackToGame : OnBackPressedCallback
        {
            private readonly WebView web;

            public BackToGame(WebView web) : base(true)
            {
                this.web = web;
            }

            public override void HandleOnBackPressed() =>
                web.EvaluateJavascript("window.BabyGamesBack && window.BabyGamesBack()", null);
        }

        // Si las barras del sistema se quedan a la vista (algunos móviles no las esconden solas
        // tras el gesto del borde), se vuelven a ocultar en un momento.
        private void RehideBarsSoon()
        {
            if (!fullScreen || rehidePending) return;
            rehidePending = true;
            web.PostDelayed(() =>
            {
                rehidePending = false;
                ApplyFullScreen();
            }, 1500);
        }

        private bool rehidePending;

        private sealed class SafeAreaPadding : Java.Lang.Object, IOnApplyWindowInsetsListener
        {
            private readonly MainActivity activity;

            public SafeAreaPadding(MainActivity activity)
            {
                this.activity = activity;
            }

            public WindowInsetsCompat OnApplyWindowInsets(View view, WindowInsetsCompat insets)
            {
                if (insets.IsVisible(WindowInsetsCompat.Type.SystemBars())) activity.RehideBarsSoon();
                AndroidX.Core.Graphics.Insets safe = insets.GetInsets(
                    WindowInsetsCompat.Type.SystemBars() | WindowInsetsCompat.Type.DisplayCutout());
                view.SetPadding(safe.Left, safe.Top, safe.Right, safe.Bottom);
                return WindowInsetsCompat.Consumed;
            }
        }
    }
}
