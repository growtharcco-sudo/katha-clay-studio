#!/bin/bash
# One-time setup for a fresh cloud session (the scheduled run). Safe to run again.
set -e
cd "$(dirname "$0")/.."
pip install -q --break-system-packages kokoro-onnx sherpa-onnx soundfile numpy pillow playwright 2>&1 | tail -1 || true
python3 -m playwright install chromium >/dev/null 2>&1 || python3 -m playwright install --with-deps chromium
command -v ffmpeg >/dev/null || (sudo apt-get update -q && sudo apt-get install -y -q ffmpeg) >/dev/null 2>&1 || true
bash pipeline/get_models.sh pipeline/models
python3 engine/build.py >/dev/null
echo "setup ok"
