// Comunicación con la app nativa: BabyGames.exe (WebView2, Windows) o la app de
// Android (window.BabyGamesAndroid, ver src/BabyGames.Android/AndroidBridge.cs).
// En un navegador normal (pruebas) se usan alternativas web.

const webview = window.chrome && window.chrome.webview;
const android = window.BabyGamesAndroid;

export const isNative = !!(webview || android);

export function exitApp() {
  if (webview) webview.postMessage('salir');
  else if (android) android.exit();
  else window.close();
}

export function toggleFullscreen() {
  if (webview) {
    webview.postMessage('pantalla-completa');
    return;
  }
  if (android) {
    android.toggleFullscreen();
    return;
  }
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

// "Fijar aplicación" de Android: el peque no puede salir con los gestos del borde
// ni con los botones del sistema. En Windows y en el navegador no hace nada.
export const canPin = !!(android && android.pin);

export function setPinned(on) {
  if (!canPin) return;
  if (on) android.pin();
  else android.unpin();
}
