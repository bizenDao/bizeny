#!/usr/bin/env python3
"""Dev server: chat API + static files."""
import os, sys

# Import chat app (registers /api/chat route first)
sys.path.insert(0, os.path.dirname(__file__))
from chat import app
from flask import send_from_directory

STATIC = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Static files — only matches paths that don't start with /api
@app.route("/")
def index():
    return send_from_directory(STATIC, "index.html")

@app.route("/<path:path>")
def static_files(path):
    if path.startswith("api/"):
        from flask import abort
        abort(404)
    return send_from_directory(STATIC, path)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8787, debug=False, threaded=True)
