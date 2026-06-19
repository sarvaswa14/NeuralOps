from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'ok')
    def log_message(self, *args):
        pass

def start_server():
    import os
    port = int(os.environ.get('PORT', 5001))
    HTTPServer(('0.0.0.0', port), Handler).serve_forever()

thread = threading.Thread(target=start_server, daemon=True)
thread.start()