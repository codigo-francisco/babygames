"""Servidor local SOLO para desarrollo: sirve app/ sin caché en http://127.0.0.1:8765.
La app real no lo necesita (BabyGames.exe usa WebView2 con carpeta virtual)."""
import functools
import http.server
import pathlib
import sys

APP = pathlib.Path(__file__).resolve().parent.parent / "app"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory=str(APP))
http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler).serve_forever()
