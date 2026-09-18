#!/usr/bin/env python3
"""Minimal fake external-logs server for the Dashboard --external-logs hackathon demo.

Serves canned log text at GET /logs/{namespace}/{pod}/{container}, ignoring any
query params (startTime/completionTime) the Dashboard appends. Its only job is
to prove that logs for a PipelineRun/TaskRun can be served from something that
is NOT the cluster's pod log API.
"""
import http.server
import re
import socketserver

PORT = 8080
PATH_RE = re.compile(r"^/logs/(?P<namespace>[^/]+)/(?P<pod>[^/]+)/(?P<container>[^/?]+)/?$")

# The pod name (not the container name -- Tekton names every step's
# container "step-<step-name>", which is usually the same across pipeline
# tasks) contains the pipeline task name, e.g. "<run>-clone-pod". Matched
# against that so different pipeline steps show visibly different log
# content instead of one generic canned message.
STEP_LOG_BODIES = {
    "clone": "Cloning repository from git remote...\nremote: Enumerating objects: 214, done.\nReceiving objects: 100% (214/214), done.\nCheckout complete.",
    "test": "Running unit test suite...\n42 tests passed, 0 failed, 0 skipped.\nCoverage: 87%",
    "build": "Building and pushing container image...\nStep 1/5 : FROM golang:1.24\nSuccessfully built and pushed image.",
    "fail": "Running step...\nERROR: task failed with exit code 1\nSee above output for details."
}


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?", 1)[0]
        match = PATH_RE.match(path)
        if not match:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"not found\n")
            return

        namespace = match.group("namespace")
        pod = match.group("pod")
        container = match.group("container")
        step_body = next(
            (body for key, body in STEP_LOG_BODIES.items() if key in pod),
            f"step '{container}' completed successfully."
        )
        body = (
            f"[external-logs-server] namespace={namespace} pod={pod} container={container}\n"
            f"[external-logs-server] this log came from the fake external logs endpoint,\n"
            f"[external-logs-server] not from a live pod in the cluster.\n"
            f"{step_body}\n"
        ).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f"[fake-logs-server] {self.address_string()} - {fmt % args}")


if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"[fake-logs-server] listening on :{PORT}")
        httpd.serve_forever()
