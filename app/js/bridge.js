// Comunicación con BabyGames.exe (WebView2). En un navegador normal (pruebas)
// los mensajes se ignoran y se usan alternativas web.

const webview = window.chrome && window.chrome.webview;

export const isNative = !!webview;

export function exitApp() {
  if (webview) webview.postMessage('salir');
  else window.close();
}

export function toggleFullscreen() {
  if (webview) {
    webview.postMessage('pantalla-completa');
    return;
  }
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}
