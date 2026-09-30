// Pintar (Kiddo Paint): el original no dibuja con el dedo (los objetos Touch no
// tienen coordenadas layerX/offsetX y en touchend no queda ningún toque). Aquí se
// convierten los toques sobre el lienzo en eventos de ratón, que sí funcionan.
(function () {
  var MAP = { touchstart: 'mousedown', touchmove: 'mousemove', touchend: 'mouseup', touchcancel: 'mouseup' };

  function forward(e) {
    var target = e.target;
    if (!(target instanceof HTMLCanvasElement)) return;
    var touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var type = MAP[e.type];
    target.dispatchEvent(new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY,
      button: 0,
      buttons: type === 'mouseup' ? 0 : 1,
    }));
  }

  Object.keys(MAP).forEach(function (type) {
    window.addEventListener(type, forward, { capture: true, passive: false });
  });
})();
