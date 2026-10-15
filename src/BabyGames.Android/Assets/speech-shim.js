// Voz de Bubu en Android. El WebView de Android no trae speechSynthesis, así que se imita
// con el motor de voz del sistema a través de window.BabyGamesAndroid (AndroidBridge.cs).
// MainActivity.cs lo inyecta antes que cualquier otro script, en la app y en los juegos, de
// modo que app/js/sounds.js y los juegos (p. ej. Bloques) hablan sin cambios.
(function () {
  var native = window.BabyGamesAndroid;
  if (!native) return;

  function voices() {
    var lang = native.voiceLang();
    return lang ? [{ name: 'Android ' + lang, lang: lang, voiceURI: 'android:' + lang, localService: true, default: true }] : [];
  }

  function num(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function Utterance(text) {
    this.text = text == null ? '' : String(text);
    this.lang = '';
    this.voice = null;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
  }

  var listeners = [];
  var synth = {
    pending: false,
    // app/js/sounds.js lo mira para no cortar una frase con la siguiente.
    get speaking() { return !!(native.isSpeaking && native.isSpeaking()); },
    paused: false,
    onvoiceschanged: null,
    getVoices: voices,
    speak: function (u) {
      native.speak(String(u.text), num(u.rate, 1), num(u.pitch, 1), num(u.volume, 1));
    },
    cancel: function () {
      native.stop();
    },
    pause: function () {},
    resume: function () {},
    addEventListener: function (type, fn) {
      if (type === 'voiceschanged' && listeners.indexOf(fn) < 0) listeners.push(fn);
    },
    removeEventListener: function (type, fn) {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    },
  };

  try {
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    window.SpeechSynthesisUtterance = Utterance;
  } catch (e) {
    return;
  }

  // El motor de voz tarda un poco en arrancar: cuando esté listo se avisa con 'voiceschanged'.
  if (voices().length) return;
  var tries = 0;
  var timer = setInterval(function () {
    var ready = voices().length > 0;
    if (!ready && ++tries < 60) return;
    clearInterval(timer);
    if (!ready) return;
    var event = { type: 'voiceschanged' };
    listeners.slice().forEach(function (fn) { fn.call(synth, event); });
    if (typeof synth.onvoiceschanged === 'function') synth.onvoiceschanged(event);
  }, 250);
})();
