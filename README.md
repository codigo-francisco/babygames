# BabyGames 🎈

Juego para peques de **2 a 5 años**, pensado para **tablets táctiles con Windows 11**.

Es un "juego de juegos": la mascota **Bubu** recibe al niño y, desde un menú en
cuadrícula con fichas grandes, se abren **10 juegos de código abierto** sacados de
GitHub. El propio menú también es un juego:

- 🎈 **Globos** que suben por la pantalla y se explotan al tocarlos (cada 10 globos → ⭐).
- 📒 **Álbum de pegatinas**: jugar 20 segundos a un juego desbloquea su pegatina y da una ⭐.
- 🗣️ **Bubu habla** en español (si Windows tiene una voz en español instalada).
- 🔇 **Sin internet**: todo funciona sin conexión y la app bloquea cualquier enlace externo.

## Los 10 juegos

Cada juego se descarga en un commit fijo (ver [`tools/games.json`](tools/games.json)) y se
adapta a tablet y a español mediante pequeños parches.

| Menú | Proyecto original | Licencia | Ajustes de BabyGames |
|---|---|---|---|
| 🃏 Memoria | [bence-toth/daniel-memory-game](https://github.com/bence-toth/daniel-memory-game) | MIT (iconos CC BY 3.0) | Sin la mano fotográfica que seguía al puntero; transiciones mucho más rápidas |
| 🎨 Pintar | [vikrum/kiddopaint](https://github.com/vikrum/kiddopaint) | MIT | Barra sencilla con botones grandes que escalan con la pantalla (lápiz, brocha, sellos, cubo, deshacer, 💣) y 10 colores; se pinta con el dedo (el original no funcionaba en táctil); trazo continuo y sellos grandes; lienzo nuevo en cada partida |
| 🎹 Piano | [eagnespuerto/librepiano](https://github.com/eagnespuerto/librepiano) | MIT | Teclas de colores gigantes y 6 instrumentos con botones grandes; deslizar el dedo toca las teclas seguidas |
| 🐹 Topos | [JivkoJelev91/Whack-A-Mole](https://github.com/JivkoJelev91/Whack-A-Mole) | MIT | Empieza solo tras una cuenta atrás; reloj que cuenta los 30 s hacia atrás; el topo tocado se esconde con sonido y ⭐; al acabar se anuncia el resultado con un botón 🔄 ¡Otra vez!; topos más lentos |
| 🏢 Torre | [iamkun/tower_game](https://github.com/iamkun/tower_game) | MIT | Empieza sola tras una cuenta atrás; sin botones (al perder, un toque reinicia); textos en español |
| 🧱 Bloques | [kidseek/tiny-tetris-land](https://github.com/kidseek/tiny-tetris-land) | MIT | Sin botones ni ajustes: arrastrar mueve la pieza y tocar la gira (el original no giraba); letra grande; traducido del chino (textos y voz) |
| 🧩 Puzle | [playjigsaw/play-jigsaw-puzzles-online](https://github.com/playjigsaw/play-jigsaw-puzzles-online) | MIT | Solo el tablero y las piezas colocadas, 6 piezas; ventana final grande con iconos; al terminar, un toque carga otro dibujo; sin publicidad |
| 🫧 Burbujas | [rembound/Bubble-Shooter-HTML5](https://github.com/rembound/Bubble-Shooter-HTML5) | MIT | Apuntar arrastrando el dedo y disparar al soltar; pantalla completa y nítida en alta resolución (burbujas vectoriales); música y efectos de sonido |
| 🌈 Colores | [rembound/Match-3-Game-HTML5](https://github.com/rembound/Match-3-Game-HTML5) | MIT | Sin botones: tocar o arrastrar intercambia; al acabar, un toque reinicia; nítido en alta resolución; música y efectos de sonido |
| 🦖 Dino | [wayou/t-rex-runner](https://github.com/wayou/t-rex-runner) | BSD-3-Clause | Empieza solo tras una cuenta atrás; tocar en cualquier sitio salta al instante o reinicia; más lento; textos en español ("FIN DEL JUEGO", "MÁX") |

**Todos los juegos son 100 % táctiles**: no necesitan teclado. Se juega tocando o
arrastrando directamente sobre el juego (solo *Pintar* tiene botones, grandes).
*Topos*, *Torre* y *Dino* empiezan solos tras una cuenta atrás 3-2-1-¡Ya!, y cuando hay
que volver a jugar aparece el cartel *"¡Toca para jugar!"*: vale tocar en cualquier sitio.
Los textos y controles escalan con la resolución de la pantalla.

## Instalar y jugar

> La carpeta `dist/` no se guarda en git: si acabas de clonar el proyecto, primero
> [compílalo](#compilar).

- **Instalador (recomendado):** ejecuta `dist\BabyGames-Setup.exe`. Se instala sin
  permisos de administrador en `%LOCALAPPDATA%\Programs\BabyGames` y crea accesos directos
  en el Escritorio y en el menú Inicio. Se desinstala desde *Configuración → Aplicaciones*.
- **Portable:** descomprime `dist\BabyGames-portable.zip` y abre `BabyGames.exe`.

### Controles

| Qué | Cómo |
|---|---|
| Empezar | Tocar **¡A jugar!** |
| Abrir un juego | Tocar su ficha |
| Volver al menú | **Mantener pulsada la 🏠** medio segundo (así los toques sin querer no sacan del juego) |
| Ver las pegatinas | Tocar 📒 |
| Rincón de mayores | **Mantener pulsado el 🔒** 2,5 segundos → volumen, voz, globos, música de los juegos, pantalla completa, créditos, borrar progreso y **Salir** |
| Con teclado (PC) | Flechas + Intro para elegir, `Esc` para volver |

### Dónde se guardan las cosas

| Qué | Dónde |
|---|---|
| Progreso (estrellas, pegatinas, ajustes) | `%LOCALAPPDATA%\BabyGames` (se borra al desinstalar) |

## Requisitos

- **Windows 10 u 11.** Ya traen todo lo necesario:
  [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)
  (incluido en Windows 11) y .NET Framework 4.8.
- Para la voz de Bubu: una voz de Windows en español
  (*Configuración → Hora e idioma → Voz → Agregar voces*). Sin ella, el juego funciona igual, pero en silencio.

## Cómo funciona

```
BabyGames.exe (C#, WinForms)
 └─ WebView2 (motor de Edge) a pantalla completa
     └─ https://babygames.local/  →  carpeta app\ (sin servidor, sin puertos)
         ├─ index.html            menú, globos, álbum, rincón de mayores
         └─ <iframe> games/<id>/  el juego elegido
              + shared/game-inject.css|js ajustes comunes (táctil, sin zoom, sin selección…)
              + overrides/<id>.css/.js   ajustes propios de ese juego
```

- `BabyGames.exe` sirve la carpeta `app\` como el dominio virtual `babygames.local` y
  **cancela cualquier navegación, ventana o petición a otro dominio**. También desactiva
  el menú contextual, el zoom, los gestos del navegador y las herramientas de desarrollo.
- La web avisa al `.exe` con `window.chrome.webview.postMessage('salir' | 'pantalla-completa')`.
- Los juegos no se editan a mano: `tools\fetch-games.ps1` los clona, copia solo lo
  necesario, aplica los parches de `games.json` y enlaza en su HTML los archivos
  `shared/` y `overrides/`.

## Estructura del proyecto

```
app/                     Juego web (lo que se ve)
  index.html             Pantallas del anfitrión
  css/host.css           Estilos
  js/host.js             Lógica: menú, abrir/cerrar juegos, pegatinas, rincón de mayores
  js/catalog.js          Las 10 fichas del menú (nombre, emoji, colores, frase de Bubu)
  js/sounds.js           Efectos sintetizados con WebAudio y voz
  js/balloons.js         Minijuego de globos
  js/rewards.js          Estrellas, pegatinas y ajustes (localStorage)
  js/confetti.js         Confeti de las celebraciones
  js/bridge.js           Mensajes hacia BabyGames.exe
  shared/                CSS y JS comunes inyectados en todos los juegos (táctil, "¡Toca para jugar!",
                         cuenta atrás, pantalla de fin, canvas nítido, voz y sonidos del menú)
  overrides/<id>.css|js  Ajustes de cada juego
  fonts/                 Fuente Fredoka (SIL OFL 1.1)
  games/<id>/            Juegos ya parcheados (los genera fetch-games.ps1)
src/BabyGames/           App nativa: Program.cs, MainForm.cs, app.ico
installer/BabyGames.iss  Instalador (Inno Setup 6)
tools/
  games.json             Repos, commits, archivos y parches de cada juego
  patches/               Traducciones (p. ej. bloques.es.json, chino → español)
  fetch-games.ps1        Descarga y parchea los juegos
  build.ps1              Compila el .exe, el zip portable y el instalador
  make-icon.ps1          Dibuja src/BabyGames/app.ico
  dev-server.py          Servidor local sin caché para probar app/ en el navegador
```

## Compilar

Necesitas:

- [git](https://git-scm.com/)
- [SDK de .NET](https://dotnet.microsoft.com/download) 6 o superior (compila para .NET Framework 4.8)
- [Inno Setup 6](https://jrsoftware.org/isinfo.php), solo para el instalador:
  `winget install JRSoftware.InnoSetup`

```powershell
powershell -ExecutionPolicy Bypass -File tools\build.ps1
```

Genera en `dist\`: la carpeta `BabyGames\`, `BabyGames-portable.zip` y `BabyGames-Setup.exe`.

| Opción de `build.ps1` | Qué hace |
|---|---|
| `-Fetch` | Vuelve a descargar y parchear los juegos antes de compilar |
| `-SkipInstaller` | No genera el instalador (no hace falta Inno Setup) |

La versión se cambia en `<Version>` de `src/BabyGames/BabyGames.csproj`.

### Probar la parte web en un navegador

```powershell
py tools\dev-server.py
```

Y abre <http://127.0.0.1:8765>. Es solo para desarrollo: la app real no usa servidor.

## Añadir o cambiar un juego

1. Añade una entrada en `tools/games.json`:

   ```json
   {
     "id": "nuevo",
     "entry": "index.html",
     "repo": "usuario/repositorio",
     "branch": "main",
     "commit": "<sha completo>",
     "license": "MIT",
     "include": ["index.html", "js", "img", "LICENSE", "README.md"],
     "patches": [
       { "file": "index.html", "find": "Play", "replace": "Jugar" },
       { "file": "index.html", "regex": true, "find": "<script[^>]*analytics[^>]*></script>", "replace": "" }
     ]
   }
   ```

   Si un `find` deja de aparecer (porque cambió el repo), el script falla y avisa en lugar
   de generar un juego roto. `"all": true` reemplaza todas las apariciones.
2. Crea `app/overrides/<id>.css` y `app/overrides/<id>.js` (pueden quedarse casi vacíos).
3. Añade su ficha en `app/js/catalog.js`. Con `home: 'right'`, la 🏠 va a la derecha si a
   la izquierda tapa algo del juego.
4. Ejecuta:

   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\fetch-games.ps1 -Only nuevo
   powershell -ExecutionPolicy Bypass -File tools\build.ps1
   ```

El juego debe ser HTML5 estático (sin paso de compilación) y funcionar sin internet.

## Solución de problemas

| Problema | Solución |
|---|---|
| "Falta el componente Microsoft Edge WebView2 Runtime" | Instálalo desde la página de Microsoft que ofrece el propio mensaje |
| Bubu no habla | Instala una voz en español en Windows y revisa que la voz esté activada en el Rincón de mayores |
| No hay sonido | Revisa el volumen del Rincón de mayores y el de Windows |
| Quiero salir de la pantalla completa | Rincón de mayores → *Pantalla completa* |
| `fetch-games.ps1` dice "parche no encontrado" | El commit o el parche de `games.json` no coinciden; revisa ese juego |

## Licencias y créditos

- Cada juego conserva su licencia original en `app/games/<id>/LICENSE` (y `NOTICE`
  cuando existe); la lista completa aparece en *Rincón de mayores → Créditos y licencias*.
- Iconos del juego Memoria: [game-icons.net](https://game-icons.net) (Delapouite, Lorc), CC BY 3.0.
- Fuente [Fredoka](https://github.com/hafontia/Fredoka-One): The Fredoka Project Authors,
  SIL Open Font License 1.1 (`app/fonts/OFL.txt`).
- Los sonidos del menú y la música y efectos de Topos, Burbujas y Colores se sintetizan en el
  propio juego; no usan archivos de terceros.
