# BabyGames 🎈

Juego para peques de **2 a 5 años**, pensado para **tablets táctiles con Windows 11 o Android**
(también funciona en móviles Android, siempre en horizontal).

Es un "juego de juegos": la mascota **Bubu** recibe al niño y, desde un menú en
cuadrícula con fichas grandes, se abren **14 juegos**: 10 de código abierto sacados de
GitHub y 4 de animales hechos para BabyGames. El propio menú también es un juego:

- 🎈 **Globos** que suben por la pantalla y se explotan al tocarlos (cada 10 globos → ⭐).
- 📒 **Álbum de pegatinas**: jugar 20 segundos a un juego desbloquea su pegatina y da una ⭐.
- 🗣️ **Bubu habla** en español (si el dispositivo tiene una voz en español instalada).
- 🔇 **Sin internet**: todo funciona sin conexión y la app bloquea cualquier enlace externo.

## Los 14 juegos

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

### 4 juegos propios de animales

Escritos para BabyGames (sin código de terceros). Comparten los dibujos de
[`app/shared/animals.js`](app/shared/animals.js): perro, gato, cerdo, vaca, león, rana, oso y pollito.

| Menú | Cómo se juega |
|---|---|
| 🦁 Rompecabezas | Se arrastran las piezas de la bandeja al tablero (encajan solas si se sueltan cerca). Los dos primeros tienen 4 piezas y luego 6; al acabar, el animal habla y sale otro |
| 🖍️ Colorear | Se elige un color abajo y se toca una parte del dibujo para pintarla; las flechas cambian de animal. Con todo pintado hay celebración |
| 🐮 Granja | "¿Dónde está el perro?" (con su dibujo, para quien aún no lee): al tocar el animal correcto salta y hace su sonido; si se toca otro, dice quién es |
| 🏁 Carrera | Se elige animal y, tras la cuenta atrás, cada toque en la pantalla lo hace correr más. El tuyo también avanza solo, así que siempre se llega a la meta |

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
- **Android (tablet o móvil, Android 7 o superior):** copia `dist\BabyGames.apk` al
  dispositivo (cable USB, Drive, correo…) y ábrelo desde *Archivos*.
  - La primera vez Android pide permiso para *instalar apps desconocidas* desde esa app:
    actívalo. Si Play Protect avisa de que es una app desconocida, elige
    *Más detalles → Instalar de todas formas*.
  - Para actualizar, instala la APK nueva encima: se conserva el progreso.
  - **Solo se cierra desde el Rincón de mayores:** al abrirse, BabyGames pide a Android que
    la **fije** (*Fijar aplicación*): acepta el aviso (*Entendido* / *Got it*). Mientras está
    fijada, ni deslizar desde el borde ni los botones de inicio o recientes sacan del juego,
    ni se puede bajar la barra de notificaciones. Si se rechaza el aviso o se suelta con el
    gesto de Android (deslizar hacia arriba y mantener, o *Atrás* + *Recientes*), BabyGames
    vuelve a pedirlo a los 2–3 segundos. Para salir: Rincón de mayores → *Salir de BabyGames*.
    Se puede desactivar en el Rincón de mayores → *📌 Fijar BabyGames*. Si las barras del
    sistema se quedan a la vista tras un gesto, se esconden solas en un momento.

### Controles

| Qué | Cómo |
|---|---|
| Empezar | Tocar **¡A jugar!** |
| Abrir un juego | Tocar su ficha |
| Volver al menú | **Mantener pulsada la 🏠** medio segundo (así los toques sin querer no sacan del juego) |
| Ver las pegatinas | Tocar 📒 |
| Rincón de mayores | **Mantener pulsado el 🔒** 2,5 segundos → volumen, voz, globos, música de los juegos, fijar la app (Android), pantalla completa, créditos, borrar progreso y **Salir** |
| Con teclado (PC) | Flechas + Intro para elegir, `Esc` para volver |
| Botón Atrás (Android) | Cierra el Rincón de mayores o el álbum. **No** cierra el juego ni sale de BabyGames (los gestos sin querer son muy habituales) |

### Dónde se guardan las cosas

| Qué | Dónde |
|---|---|
| Progreso (estrellas, pegatinas, ajustes) | Windows: `%LOCALAPPDATA%\BabyGames`. Android: datos de la app. En los dos se borra al desinstalar |

## Requisitos

- **Windows 10 u 11.** Ya traen todo lo necesario:
  [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)
  (incluido en Windows 11) y .NET Framework 4.8.
- Para la voz de Bubu: una voz de Windows en español
  (*Configuración → Hora e idioma → Voz → Agregar voces*). Sin ella, el juego funciona igual, pero en silencio.
- **Android 7 o superior** con *Android System WebView* actualizado (se actualiza desde
  Google Play). Para la voz de Bubu: el motor de voz del sistema con español (*Ajustes →
  Sistema → Idiomas → Salida de texto a voz*; normalmente ya viene *Speech Services by Google*).
- En Android 12 o anterior puede que algunos emojis nuevos (🫧 en la ficha de Burbujas, 🪣 y
  🪕 en Pintar y Piano) se vean como un cuadrado.

## Cómo funciona

```
BabyGames.exe (C#, WinForms)                  BabyGames.apk (C#, .NET for Android)
 └─ WebView2 (motor de Edge)                   └─ WebView de Android, en horizontal
     └─ https://babygames.local/                   └─ https://appassets.androidplatform.net/app/
                    \_____________ la misma carpeta app\ (sin servidor) _____________/
         ├─ index.html            menú, globos, álbum, rincón de mayores
         └─ <iframe> games/<id>/  el juego elegido
              + shared/game-inject.css|js ajustes comunes (táctil, sin zoom, sin selección…)
              + overrides/<id>.css/.js   ajustes propios de ese juego
```

- `BabyGames.exe` sirve la carpeta `app\` como el dominio virtual `babygames.local` y
  **cancela cualquier navegación, ventana o petición a otro dominio**. También desactiva
  el menú contextual, el zoom, los gestos del navegador y las herramientas de desarrollo.
- La web avisa al `.exe` con `window.chrome.webview.postMessage('salir' | 'pantalla-completa')`.
- En Android, `MainActivity.cs` hace lo mismo: sirve `app\` desde dentro de la APK con
  `WebViewAssetLoader`, bloquea todo lo demás (la app ni siquiera tiene permiso de
  internet), la pone a pantalla completa y aparta el juego de la cámara del móvil.
  - La web llama a la app con `window.BabyGamesAndroid` (`exit()`, `toggleFullscreen()`)
    y el botón Atrás llama a `window.BabyGamesBack()` (en `host.js`).
  - El WebView de Android no trae voz (`speechSynthesis`), así que `Assets/speech-shim.js`
    la imita con el motor de voz del sistema en la app y en todos los juegos.
- Al salir de la app (o minimizarla) se para el sonido y la música; al volver, siguen.
- Los juegos no se editan a mano: `tools\fetch-games.ps1` los clona, copia solo lo
  necesario, aplica los parches de `games.json` y enlaza en su HTML los archivos
  `shared/` y `overrides/`.

## Estructura del proyecto

```
app/                     Juego web (lo que se ve)
  index.html             Pantallas del anfitrión
  css/host.css           Estilos
  js/host.js             Lógica: menú, abrir/cerrar juegos, pegatinas, rincón de mayores
  js/catalog.js          Las 14 fichas del menú (nombre, emoji, colores, frase de Bubu)
  js/sounds.js           Efectos sintetizados con WebAudio y voz
  js/balloons.js         Minijuego de globos
  js/rewards.js          Estrellas, pegatinas y ajustes (localStorage)
  js/confetti.js         Confeti de las celebraciones
  js/bridge.js           Mensajes hacia BabyGames.exe o la app de Android
  shared/                CSS y JS comunes inyectados en todos los juegos (táctil, "¡Toca para jugar!",
                         cuenta atrás, pantalla de fin, canvas nítido, voz y sonidos del menú)
  overrides/<id>.css|js  Ajustes de cada juego
  fonts/                 Fuente Fredoka (SIL OFL 1.1)
  games/<id>/            Juegos ya parcheados (los genera fetch-games.ps1)
src/BabyGames/           App de Windows: Program.cs, MainForm.cs, app.ico
src/BabyGames.Android/   App de Android: MainActivity.cs (WebView), AndroidBridge.cs, Speech.cs (voz),
                         Assets/speech-shim.js, AndroidManifest.xml, Resources/ (iconos, tema)
installer/BabyGames.iss  Instalador (Inno Setup 6)
tools/
  games.json             Repos, commits, archivos y parches de cada juego
  patches/               Traducciones (p. ej. bloques.es.json, chino → español)
  fetch-games.ps1        Descarga y parchea los juegos
  build.ps1              Compila el .exe, el zip portable y el instalador
  build-android.ps1      Compila dist/BabyGames.apk (y la instala por adb con -Install)
  make-icon.ps1          Dibuja src/BabyGames/app.ico y los iconos de Android
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

La versión se cambia en `<Version>` de `src/BabyGames/BabyGames.csproj` (vale también para Android).

### Android

Necesitas Visual Studio 2022 o posterior con la carga de trabajo
*Desarrollo de .NET Multi-platform App UI*: trae el SDK de .NET con `android`, el Android
SDK y el JDK (`build-android.ps1` los encuentra solos; si no, define `ANDROID_HOME` y `JAVA_HOME`).

```powershell
powershell -ExecutionPolicy Bypass -File tools\build-android.ps1
```

Genera `dist\BabyGames.apk` (tablets y móviles de 32 y 64 bits). Con `-Install` además la
instala y la abre en el emulador o en el dispositivo conectado por USB (con la *depuración
USB* activada); si hay varios, elige uno con la variable `ANDROID_SERIAL`.

> **Guarda la clave de firma.** La primera compilación crea
> `src\BabyGames.Android\signing\` (no va a git). Las actualizaciones de la app tienen que
> firmarse con esa misma clave: si se pierde, hay que desinstalar BabyGames (y se pierde
> el progreso) antes de instalar la versión nueva.

**Emulador** (para probar sin dispositivo). El SDK de Visual Studio está en *Program Files* y
no se puede escribir, así que el emulador va en un SDK del usuario:

```powershell
$env:JAVA_HOME = (Get-ChildItem "$env:ProgramFiles\Android\openjdk" -Directory)[0].FullName
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
& "${env:ProgramFiles(x86)}\Android\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root=$sdk emulator platform-tools cmdline-tools`;latest "system-images;android-35;google_apis_playstore;x86_64"
$env:ANDROID_HOME = $sdk
& "$sdk\cmdline-tools\latest\bin\avdmanager.bat" create avd -n BabyGames_Tablet -d pixel_tablet -k "system-images;android-35;google_apis_playstore;x86_64"
& "$sdk\emulator\emulator.exe" -avd BabyGames_Tablet
```

Los errores de JavaScript de la app salen en `adb logcat -s BabyGames`.

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
| Bubu no habla | Instala una voz en español en Windows (en Android, el motor de voz del sistema con español) y revisa que la voz esté activada en el Rincón de mayores |
| Android: "No se ha instalado la aplicación" al actualizar | La APK nueva está firmada con otra clave: desinstala BabyGames y vuelve a instalar (ver *Guarda la clave de firma*) |
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
