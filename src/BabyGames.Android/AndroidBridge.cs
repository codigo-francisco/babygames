using Android.Webkit;
using Java.Interop;

namespace BabyGames.Droid
{
    /// <summary>
    /// Objeto window.BabyGamesAndroid de la web. Hace lo que en Windows hace
    /// window.chrome.webview.postMessage (app/js/bridge.js) y da voz a Assets/speech-shim.js.
    /// Lo llama el hilo de JavaScript: lo que toca la pantalla se pasa al hilo principal.
    /// </summary>
    internal sealed class AndroidBridge : Java.Lang.Object
    {
        private readonly MainActivity activity;
        private readonly Speech speech;

        public AndroidBridge(MainActivity activity, Speech speech)
        {
            this.activity = activity;
            this.speech = speech;
        }

        [JavascriptInterface, Export("exit")]
        public void Exit() => activity.RunOnUiThread(activity.Exit);

        // Fijar aplicación (ver MainActivity.Pin): el peque no puede salir con gestos ni botones.
        [JavascriptInterface, Export("pin")]
        public void Pin() => activity.RunOnUiThread(activity.Pin);

        [JavascriptInterface, Export("unpin")]
        public void Unpin() => activity.RunOnUiThread(activity.Unpin);

        [JavascriptInterface, Export("isPinned")]
        public bool IsPinned() => activity.IsPinned;

        [JavascriptInterface, Export("toggleFullscreen")]
        public void ToggleFullscreen() => activity.RunOnUiThread(activity.ToggleFullScreen);

        // Idioma de la voz en español (p. ej. "es-ES"), o "" si todavía no hay ninguna.
        [JavascriptInterface, Export("voiceLang")]
        public string VoiceLang() => speech.Language ?? "";

        [JavascriptInterface, Export("speak")]
        public void Speak(string text, double rate, double pitch, double volume) =>
            speech.Speak(text, (float)rate, (float)pitch, (float)volume);

        [JavascriptInterface, Export("isSpeaking")]
        public bool IsSpeaking() => speech.IsSpeaking;

        [JavascriptInterface, Export("stop")]
        public void Stop() => speech.Stop();
    }
}
