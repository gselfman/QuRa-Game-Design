"""Serve the packaged prototype on loopback; no account or network services required."""
import argparse
import functools
import json
import socket
import threading
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=5180)
parser.add_argument('--open', action='store_true')
options = parser.parse_args()
root = Path(__file__).resolve().parents[1] / 'dist'
if not (root / 'index.html').is_file():
    raise SystemExit('Game build not found. Run npm ci and npm run build first.')

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.glb': 'model/gltf-binary', '.js': 'application/javascript', '.wasm': 'application/wasm'}
    def log_message(self, *_args):
        pass

server = None
for port in range(options.port, options.port + 11):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=str(root)))
        break
    except OSError:
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{port}/kuro-prototype-info.json', timeout=.5) as response:
                if json.load(response).get('id') == 'qura-kuro-sniper-prototype':
                    print(f'Game already running: http://127.0.0.1:{port}/')
                    if options.open:
                        webbrowser.open(f'http://127.0.0.1:{port}/')
                    raise SystemExit(0)
        except (OSError, ValueError):
            continue
if server is None:
    raise SystemExit('No free local port found. Close an earlier game window and try again.')
url = f'http://127.0.0.1:{server.server_port}/'
print(f'Куро Снайпер: {url}', flush=True)
print('Закройте это окно или нажмите Ctrl+C, чтобы остановить игру.', flush=True)
if options.open:
    threading.Timer(.3, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
