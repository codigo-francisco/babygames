using System;
using Android.Content;
using Android.OS;
using Android.Speech.Tts;
using Android.Util;
using Java.Util;

namespace BabyGames.Droid
{
    /// <summary>
    /// Voz de Bubu con el motor de voz de Android (TextToSpeech). Solo habla si hay una voz
    /// en español, igual que en Windows (app/js/sounds.js).
    /// </summary>
    internal sealed class Speech : Java.Lang.Object, TextToSpeech.IOnInitListener
    {
        private static readonly string[] Spanish = { "es-ES", "es-US", "es-MX", "es" };

        private readonly TextToSpeech tts;
        private volatile string language;

        public Speech(Context context)
        {
            tts = new TextToSpeech(context, this);
        }

        /// <summary>Idioma de la voz elegida (p. ej. "es-ES"), o null si no hay voz en español.</summary>
        public string Language => language;

        public void OnInit(OperationResult status)
        {
            if (status != OperationResult.Success)
            {
                Log.Warn(MainActivity.LogTag, "No hay motor de voz en el dispositivo.");
                return;
            }
            foreach (string tag in Spanish)
            {
                Locale locale = Locale.ForLanguageTag(tag);
                if (tts.IsLanguageAvailable(locale) < LanguageAvailableResult.Available) continue;
                tts.SetLanguage(locale);
                language = locale.ToLanguageTag();
                Log.Info(MainActivity.LogTag, $"Voz en español: {language}");
                return;
            }
            Log.Warn(MainActivity.LogTag, "No hay ninguna voz en español instalada.");
        }

        public void Speak(string text, float rate, float pitch, float volume)
        {
            if (language == null || string.IsNullOrWhiteSpace(text)) return;
            tts.SetSpeechRate(rate);
            tts.SetPitch(pitch);
            var args = new Bundle();
            args.PutFloat(TextToSpeech.Engine.KeyParamVolume, Math.Clamp(volume, 0f, 1f));
            tts.Speak(text, QueueMode.Flush, args, "bubu");
        }

        public void Stop() => tts.Stop();

        public void Shutdown() => tts.Shutdown();
    }
}
