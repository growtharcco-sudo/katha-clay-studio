"""Transcribe generated lines with Whisper (offline) and score them against the script."""
import sys, os, json, re, unicodedata
import numpy as np, soundfile as sf, sherpa_onnx
HERE = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(os.environ.get("KC_MODELS", os.path.join(HERE, "models")), "wh/sherpa-onnx-whisper-small")
_rec = {}
def R(lang):
    if lang not in _rec: _rec[lang] = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{W}/small-encoder.int8.onnx", decoder=f"{W}/small-decoder.int8.onnx",
        tokens=f"{W}/small-tokens.txt", language=lang, task="transcribe", num_threads=2)
    return _rec[lang]
def sk(s):
    # fold common Hindi spelling variants: halant, nukta, nasal marks, long/short vowel signs
    for a,b in {"्":"","़":"","ँ":"ं","ी":"ि","ू":"ु","ई":"इ","ऊ":"उ","ष":"श","ण":"न","ङ":"ं","ञ":"ं"}.items(): s=s.replace(a,b)
    return s
def norm(s):
    s = unicodedata.normalize("NFC", s.lower())
    s = re.sub(r"[^\w\s]", " ", s)
    return s.split()
def err(ref, hyp, lang):
    r, h = (norm(ref), norm(hyp)) if lang=="en" else (list(sk("".join(norm(ref)))), list(sk("".join(norm(hyp))))); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = d[j]; d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1])); prev = cur
    return d[len(h)] / max(1, len(r))

def transcribe(a, sr, lang):
    x = np.interp(np.arange(0, len(a), sr / 16000), np.arange(len(a)), a).astype(np.float32)
    if lang == "hi": x = np.concatenate([x, np.zeros(16000 * 12, np.float32)])
    r = R(lang); s = r.create_stream(); s.accept_waveform(16000, x); r.decode_stream(s); return s.result.text.strip()
