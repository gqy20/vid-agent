#!/usr/bin/env python3
import base64
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit


PROJECT_ROOT = os.path.abspath(sys.argv[1])
PORT = int(sys.argv[2])
USERS = {"reader": "readpass", "writer": "writepass"}


class GitHandler(BaseHTTPRequestHandler):
    server_version = "GitCourseLab/1.0"

    def log_message(self, _format, *_args):
        return

    def _user(self):
        header = self.headers.get("Authorization", "")
        if not header.startswith("Basic "):
            return None
        try:
            user, password = base64.b64decode(header[6:]).decode().split(":", 1)
        except (ValueError, UnicodeDecodeError):
            return None
        return user if USERS.get(user) == password else None

    def _unauthorized(self):
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="git-course-lab"')
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _forbidden(self):
        body = b"authenticated but not authorized for receive-pack\n"
        self.send_response(403)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_git(self):
        parsed = urlsplit(self.path)
        if parsed.path == "/health":
            body = b"ok\n"
            self.send_response(200)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        user = self._user()
        if user is None:
            self._unauthorized()
            return
        receive = parsed.path.endswith("/git-receive-pack") or "service=git-receive-pack" in parsed.query
        if receive and user != "writer":
            self._forbidden()
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b""
        env = {
            **os.environ,
            "GIT_PROJECT_ROOT": PROJECT_ROOT,
            "GIT_HTTP_EXPORT_ALL": "1",
            "PATH_INFO": parsed.path,
            "QUERY_STRING": parsed.query,
            "REQUEST_METHOD": self.command,
            "CONTENT_TYPE": self.headers.get("Content-Type", ""),
            "CONTENT_LENGTH": str(length),
            "REMOTE_USER": user,
        }
        result = subprocess.run(["git", "http-backend"], input=body, env=env, capture_output=True, check=False)
        raw_headers, separator, response_body = result.stdout.partition(b"\r\n\r\n")
        if not separator:
            raw_headers, separator, response_body = result.stdout.partition(b"\n\n")
        status = 200
        headers = []
        for raw_line in raw_headers.replace(b"\r", b"").split(b"\n"):
            if not raw_line:
                continue
            name, value = raw_line.decode("latin1").split(":", 1)
            if name.lower() == "status":
                status = int(value.strip().split(" ", 1)[0])
            else:
                headers.append((name, value.strip()))
        self.send_response(status)
        for name, value in headers:
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(response_body)

    do_GET = _serve_git
    do_POST = _serve_git


ThreadingHTTPServer(("127.0.0.1", PORT), GitHandler).serve_forever()
