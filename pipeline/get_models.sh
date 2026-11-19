#!/bin/bash
# Download the free offline models (Kokoro TTS + Whisper small) from GitHub releases into $1.
set -e
M=${1:-$(dirname "$0")/models}; mkdir -p "$M/wh"
[ -f "$M/kokoro-v1.0.onnx" ] || curl -sSL -o "$M/kokoro-v1.0.onnx" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f "$M/voices-v1.0.bin" ] || curl -sSL -o "$M/voices-v1.0.bin" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
if [ ! -f "$M/wh/sherpa-onnx-whisper-small/small-encoder.int8.onnx" ]; then
  curl -sSL -o "$M/wh.tar.bz2" https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
  tar -xjf "$M/wh.tar.bz2" -C "$M/wh" && rm "$M/wh.tar.bz2"
fi
echo "models ready in $M"
