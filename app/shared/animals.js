// Animales dibujados en SVG para los juegos propios de BabyGames (Rompecabezas,
// Colorear, Granja y Carrera). Todos miran de frente en un lienzo de 200x200.
// Cada parte es una figura SVG; las que tienen `c` (color) se pueden colorear en
// Colorear. Ojos, narices y bocas no se colorean y dejan pasar el toque a la parte
// de debajo (pointer-events: none).
(function () {
  var INK = '#3b3b4f';

  function eyes(x1, x2, y, r) {
    r = r || 9;
    var out = '';
    [x1, x2].forEach(function (x) {
      out += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r + 4) + '" ry="' + (r + 6) + '" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="' + (x + 2) + '" cy="' + (y + 3) + '" r="' + r + '" fill="' + INK + '"/>' +
        '<circle cx="' + (x + 5) + '" cy="' + (y - 1) + '" r="' + (r * 0.38) + '" fill="#fff"/>';
    });
    return out;
  }

  function smile(cx, y, w) {
    return '<path d="M' + (cx - w) + ' ' + y + ' Q' + cx + ' ' + (y + w * 0.9) + ' ' + (cx + w) + ' ' + y + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
  }

  // Partes: [etiqueta SVG, atributos, color]. Sin color = detalle fijo.
  var ANIMALS = [
    {
      id: 'perro', name: 'perro', art: 'el', sound: 'guau guau',
      parts: [
        ['ellipse', 'cx="48" cy="92" rx="22" ry="46" transform="rotate(22 48 92)"', '#8d6e63'],
        ['ellipse', 'cx="152" cy="92" rx="22" ry="46" transform="rotate(-22 152 92)"', '#8d6e63'],
        ['circle', 'cx="100" cy="105" r="62"', '#e0b07a'],
        ['ellipse', 'cx="128" cy="86" rx="22" ry="20"', '#a1785c'],
        ['ellipse', 'cx="100" cy="140" rx="32" ry="23"', '#fff3e0'],
        ['path', 'd="M90 152 Q100 178 110 152 Z"', '#ff7aa2'],
      ],
      face: function () {
        return eyes(78, 124, 92) + '<ellipse cx="100" cy="128" rx="12" ry="9" fill="' + INK + '"/>' +
          '<path d="M100 136 V146 M86 146 Q100 156 114 146" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
      },
    },
    {
      id: 'gato', name: 'gato', art: 'el', sound: 'miau',
      parts: [
        ['path', 'd="M44 92 L52 28 L96 58 Z"', '#ffb74d'],
        ['path', 'd="M156 92 L148 28 L104 58 Z"', '#ffb74d'],
        ['path', 'd="M56 76 L60 44 L82 60 Z"', '#ffcdd2'],
        ['path', 'd="M144 76 L140 44 L118 60 Z"', '#ffcdd2'],
        ['ellipse', 'cx="100" cy="112" rx="66" ry="58"', '#ffb74d'],
        ['ellipse', 'cx="100" cy="140" rx="30" ry="20"', '#fff8e1'],
      ],
      face: function () {
        var w = '';
        [[-1, 130], [-1, 142], [1, 130], [1, 142]].forEach(function (p) {
          var x = 100 + p[0] * 34;
          w += '<path d="M' + x + ' ' + p[1] + ' L' + (x + p[0] * 40) + ' ' + (p[1] + (p[1] - 136) * 0.8) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
        });
        return eyes(76, 124, 104) + '<path d="M92 128 H108 L100 137 Z" fill="#ff7aa2" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M100 137 V143 M88 146 Q94 152 100 143 Q106 152 112 146" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' + w;
      },
    },
    {
      id: 'cerdo', name: 'cerdo', art: 'el', sound: 'oinc oinc',
      parts: [
        ['path', 'd="M46 74 L40 30 L84 52 Z"', '#f48fb1'],
        ['path', 'd="M154 74 L160 30 L116 52 Z"', '#f48fb1'],
        ['circle', 'cx="100" cy="108" r="64"', '#f8bbd0'],
        ['ellipse', 'cx="100" cy="134" rx="30" ry="22"', '#f48fb1'],
        ['ellipse', 'cx="56" cy="128" rx="12" ry="8"', '#ff8a80'],
        ['ellipse', 'cx="144" cy="128" rx="12" ry="8"', '#ff8a80'],
      ],
      face: function () {
        return eyes(76, 124, 94, 8) + '<ellipse cx="90" cy="134" rx="5" ry="8" fill="' + INK + '"/><ellipse cx="110" cy="134" rx="5" ry="8" fill="' + INK + '"/>' +
          smile(100, 160, 14);
      },
    },
    {
      id: 'vaca', name: 'vaca', art: 'la', sound: 'muu',
      parts: [
        ['path', 'd="M62 54 Q44 40 46 18 Q60 34 74 42 Z"', '#fff59d'],
        ['path', 'd="M138 54 Q156 40 154 18 Q140 34 126 42 Z"', '#fff59d'],
        ['ellipse', 'cx="30" cy="80" rx="26" ry="13" transform="rotate(20 30 80)"', '#fafafa'],
        ['ellipse', 'cx="170" cy="80" rx="26" ry="13" transform="rotate(-20 170 80)"', '#fafafa'],
        ['rect', 'x="44" y="42" width="112" height="128" rx="50"', '#fafafa'],
        ['path', 'd="M58 60 Q80 50 88 72 Q82 96 60 92 Q48 80 58 60 Z"', '#5d4037'],
        ['ellipse', 'cx="136" cy="70" rx="14" ry="12"', '#5d4037'],
        ['ellipse', 'cx="100" cy="148" rx="48" ry="30"', '#f8bbd0'],
      ],
      face: function () {
        return eyes(78, 122, 100, 8) + '<ellipse cx="84" cy="146" rx="6" ry="9" fill="' + INK + '"/><ellipse cx="116" cy="146" rx="6" ry="9" fill="' + INK + '"/>' +
          smile(100, 164, 16);
      },
    },
    {
      id: 'leon', name: 'león', art: 'el', sound: 'grrr',
      parts: [
        ['path', 'd="M100 16 L118 34 L142 24 L148 50 L174 54 L166 78 L188 96 L168 114 L180 138 L156 144 L154 170 L130 164 L118 186 L100 170 L82 186 L70 164 L46 170 L44 144 L20 138 L32 114 L12 96 L34 78 L26 54 L52 50 L58 24 L82 34 Z"', '#e65100'],
        ['circle', 'cx="62" cy="62" r="15"', '#ffca28'],
        ['circle', 'cx="138" cy="62" r="15"', '#ffca28'],
        ['circle', 'cx="100" cy="104" r="56"', '#ffca28'],
        ['ellipse', 'cx="100" cy="134" rx="28" ry="20"', '#fff3e0'],
      ],
      face: function () {
        return eyes(80, 120, 96, 8) + '<path d="M90 124 H110 L100 136 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M100 136 V142 M88 146 Q94 152 100 142 Q106 152 112 146" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>';
      },
    },
    {
      id: 'rana', name: 'rana', art: 'la', sound: 'croac croac',
      parts: [
        ['circle', 'cx="62" cy="62" r="30"', '#66bb6a'],
        ['circle', 'cx="138" cy="62" r="30"', '#66bb6a'],
        ['ellipse', 'cx="100" cy="124" rx="84" ry="56"', '#66bb6a'],
        ['ellipse', 'cx="100" cy="148" rx="50" ry="22"', '#c5e1a5'],
        ['ellipse', 'cx="40" cy="132" rx="13" ry="8"', '#ff8a80'],
        ['ellipse', 'cx="160" cy="132" rx="13" ry="8"', '#ff8a80'],
      ],
      face: function () {
        return eyes(62, 138, 62, 11) + '<circle cx="92" cy="112" r="3" fill="' + INK + '"/><circle cx="108" cy="112" r="3" fill="' + INK + '"/>' +
          '<path d="M60 128 Q100 162 140 128" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
      },
    },
    {
      id: 'oso', name: 'oso', art: 'el', sound: 'grrr',
      parts: [
        ['circle', 'cx="50" cy="56" r="26"', '#8d6e63'],
        ['circle', 'cx="150" cy="56" r="26"', '#8d6e63'],
        ['circle', 'cx="50" cy="56" r="13"', '#d7ccc8'],
        ['circle', 'cx="150" cy="56" r="13"', '#d7ccc8'],
        ['circle', 'cx="100" cy="108" r="64"', '#8d6e63'],
        ['ellipse', 'cx="100" cy="138" rx="32" ry="24"', '#d7ccc8'],
      ],
      face: function () {
        return eyes(76, 124, 96, 8) + '<ellipse cx="100" cy="128" rx="12" ry="8" fill="' + INK + '"/>' +
          '<path d="M100 134 V142 M88 146 Q100 156 112 146" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
      },
    },
    {
      id: 'pollito', name: 'pollito', art: 'el', sound: 'pío pío',
      parts: [
        ['path', 'd="M92 32 Q96 10 104 28 Q112 8 112 34 Z"', '#ffb300'],
        ['ellipse', 'cx="36" cy="124" rx="18" ry="30" transform="rotate(30 36 124)"', '#fdd835'],
        ['ellipse', 'cx="164" cy="124" rx="18" ry="30" transform="rotate(-30 164 124)"', '#fdd835'],
        ['circle', 'cx="100" cy="106" r="70"', '#ffee58'],
        ['path', 'd="M84 118 L116 118 L100 140 Z"', '#ff9800'],
        ['ellipse', 'cx="56" cy="126" rx="12" ry="8"', '#ff8a80'],
        ['ellipse', 'cx="144" cy="126" rx="12" ry="8"', '#ff8a80'],
      ],
      face: function () {
        return eyes(76, 124, 96, 8) + '<path d="M84 118 H116" stroke="' + INK + '" stroke-width="3"/>';
      },
    },
  ];

  // SVG del animal. opts.fills: { índice de parte: color } (Colorear);
  // opts.blank: partes en blanco; opts.parts: añade data-part para tocar cada parte.
  function svg(animal, opts) {
    opts = opts || {};
    var out = '<svg class="bg-animal" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    animal.parts.forEach(function (p, i) {
      var fill = opts.fills && opts.fills[i] ? opts.fills[i] : (opts.blank ? '#ffffff' : p[2]);
      out += '<' + p[0] + ' ' + p[1] + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"' +
        (opts.parts ? ' data-part="' + i + '"' : '') + '/>';
    });
    out += '<g style="pointer-events:none">' + animal.face() + '</g></svg>';
    return out;
  }

  function byId(id) {
    for (var i = 0; i < ANIMALS.length; i++) if (ANIMALS[i].id === id) return ANIMALS[i];
    return null;
  }

  // "el perro", "la vaca"
  function named(animal) { return animal.art + ' ' + animal.name; }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Lluvia de estrellas/confeti sencilla con DOM (se quita sola).
  function sparkle(x, y, count) {
    count = count || 14;
    var glyphs = ['⭐', '✨', '💖', '🌟'];
    for (var i = 0; i < count; i++) {
      var s = document.createElement('div');
      s.className = 'bg-sparkle';
      s.textContent = glyphs[i % glyphs.length];
      var a = Math.random() * Math.PI * 2;
      var d = 60 + Math.random() * 140;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      document.body.appendChild(s);
      setTimeout(s.remove.bind(s), 1000);
    }
  }

  window.BabyAnimals = { ink: INK, list: ANIMALS, svg: svg, byId: byId, named: named, shuffle: shuffle, sparkle: sparkle };
})();
