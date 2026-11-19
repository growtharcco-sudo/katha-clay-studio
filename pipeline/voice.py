"""Make the English and Hindi voiceovers for a story, the shared timeline, the music and the final mixes.

  python pipeline/voice.py work/<id>            (reads work/<id>/script.json written by kit.py)
  python pipeline/voice.py work/<id> hook end   (redo only these lines, keep the rest)

Writes work/<id>/: takes/<lang>/<line>.wav, report.json, timeline.json, spec.js (STORY + TL), mix_en.wav, mix_hi.wav.
Rules learned the hard way:
  * never slow a voice below 0.97x (it slurs); the shorter language simply gets a pause after its line
  * best of 6 takes per line, chosen by what Whisper hears (Hindi padded with silence so Whisper doesn't cut it)
"""
import json, os, re, subprocess, sys, unicodedata, wave
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tts, asr_score
from kokoro_onnx import Kokoro

VOICE = "hm_psi"           # one voice for both languages (Indian accent, warm)
LEAD, START, TAIL = .2, .35, 2.0
MIN_SPEED = .97


def models():
    m = os.environ.get("KC_MODELS", os.path.join(HERE, "models"))
    need = [f"{m}/kokoro-v1.0.onnx", f"{m}/voices-v1.0.bin", f"{m}/wh/sherpa-onnx-whisper-small/small-encoder.int8.onnx"]
    if not all(os.path.exists(p) for p in need):
        subprocess.run(["bash", os.path.join(HERE, "get_models.sh"), m], check=True)
    return m


def trim(a, sr):
    nz = np.where(np.abs(a) > 0.01)[0]
    return a[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.06 * sr)] if len(nz) else a


def make_takes(W, S, only):
    m = models(); tts.VOICE = VOICE
    k = Kokoro(f"{m}/kokoro-v1.0.onnx", f"{m}/voices-v1.0.bin")
    rp = f"{W}/report.json"; rep = json.load(open(rp)) if os.path.exists(rp) else {}
    for lang in ("en", "hi"):
        os.makedirs(f"{W}/takes/{lang}", exist_ok=True)
        for L in S:
            if only and L["id"] not in only and os.path.exists(f"{W}/takes/{lang}/{L['id']}.wav"): continue
            p = tts.phon(k, L[lang], lang); best = None
            base = float(L.get(f"speed_{lang}", 1.0))
            for lead in ["", ", "]:
                for f in (1.0, 1.03, 1.06):
                    a, sr = k.create(lead + p, voice=VOICE, speed=max(MIN_SPEED, base * f), is_phonemes=True)
                    a = trim(np.asarray(a, np.float32), sr)
                    txt = asr_score.transcribe(a, sr, lang); e = asr_score.err(L[lang], txt, lang)
                    if best is None or e < best[0] - 1e-9 or (abs(e - best[0]) < 1e-9 and abs(f - 1) < abs(best[3] - 1)):
                        best = (e, a, txt, f, lead, sr)
            sf.write(f"{W}/takes/{lang}/{L['id']}.wav", best[1], best[5])
            rep[f"{lang}:{L['id']}"] = {"err": round(best[0], 3), "heard": best[2], "dur": round(len(best[1]) / best[5], 2)}
            print(f"{lang} {L['id']:10s} err {best[0]:.2f}  {len(best[1]) / best[5]:.2f}s | {best[2]}", flush=True)
    json.dump(rep, open(rp, "w"), ensure_ascii=False, indent=1)
    return rep


# ---------------- timeline (shared by both languages) ----------------
def pauses(a, sr):
    fr = int(sr * .01); e = np.array([np.sqrt(np.mean(a[i:i + fr] ** 2)) for i in range(0, len(a) - fr, fr)])
    q = e < max(.012, .06 * e.max()); out = []; i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if (j - i) >= 11 and i > 0 and j < len(q): out.append((i + j) / 2 * .01)
            i = j
        else: i += 1
    return out


def chunks_for(text, t0, dur, pz):
    raw = [c.strip() for c in text.split("|") if c.strip()]; toks = []
    for c in raw:
        kind = "big" if c.startswith("#") else "sub" if c.startswith("~") else "n"; c = c.lstrip("#~")
        ws = []; hl = False
        for w in c.split():
            on = hl
            if w.startswith("*"): on = hl = True; w = w[1:]
            if w.endswith("*"): hl = False; w = w[:-1]
            ws.append({"w": w, "hl": on})
        toks.append((kind, ws))
    wt = lambda w: len(re.sub(r"[ा-्ँ-ः,.?।]", "", w)) + 1.6
    PZ = {",": .22, ".": .38, "?": .38, "।": .38, ":": .25}
    total_w = sum(wt(w["w"]) for _, ws in toks for w in ws)
    total_p = sum(PZ.get(ws[-1]["w"][-1], 0) for _, ws in toks[:-1])
    rate = max(.3, dur - total_p) / total_w; t = t0; out = []
    for ci, (kind, ws) in enumerate(toks):
        if ci > 0 and pz:
            near = min(pz, key=lambda x: abs(t0 + x - t))
            if abs(t0 + near - t) < .45: t = t0 + near + .06
        c = {"t0": t - .06, "words": []}
        for w in ws: c["words"].append({**w, "t": round(t, 3)}); t += wt(w["w"]) * rate
        t += PZ.get(ws[-1]["w"][-1], 0); out.append((kind, c))
    return out


def timeline(W, S):
    aud = {l: {L["id"]: sf.read(f"{W}/takes/{l}/{L['id']}.wav", dtype="float32") for L in S} for l in ("en", "hi")}
    TL = {"lines": {}, "cap": {"en": [], "hi": []}}; t = START; order = [L["id"] for L in S]
    for k, L in enumerate(S):
        d = {l: len(aud[l][L["id"]][0]) / aud[l][L["id"]][1] for l in aud}; dm = max(d.values())
        x = {"s0": 0 if k == 0 else round(t - LEAD, 3), "t0": round(t, 3), "t1": round(t + dm, 3), "dur": {l: round(d[l], 3) for l in d}}
        if L.get("src_en"): x["src"] = {"en": L["src_en"], "hi": L["src_hi"], "plain": bool(L.get("src_plain"))}
        TL["lines"][L["id"]] = x
        for l in aud:
            if not L.get("cap_" + l): continue
            a, sr = aud[l][L["id"]]; merged = []
            for kind, c in chunks_for(L["cap_" + l], t, d[l], pauses(a, sr)):
                if kind == "big": merged.append({"t0": c["t0"], "big": " ".join(w["w"] for w in c["words"]).rstrip(".।"), "words": []})
                elif kind == "sub" and merged and "big" in merged[-1]: merged[-1]["sub"] = " ".join(w["w"] for w in c["words"]); merged[-1]["tsub"] = c["t0"]
                else: merged.append(c)
            for i, c in enumerate(merged): c["t1"] = round(merged[i + 1]["t0"] if i + 1 < len(merged) else t + d[l] + .45, 3)
            TL["cap"][l] += merged
        gap = L.get("gap", .55 if k == 0 else 0 if k == len(S) - 1 else .4)
        t += dm + gap
    for k, i in enumerate(order): TL["lines"][i]["s1"] = TL["lines"][order[k + 1]]["s0"] if k + 1 < len(order) else 999
    TL["dur"] = round(TL["lines"][order[-1]]["t1"] + TAIL, 2)
    for l in aud:
        sr = aud[l][order[0]][1]; v = np.zeros(int(TL["dur"] * sr), np.float32)
        for L in S:
            a = aud[l][L["id"]][0]; i = int(TL["lines"][L["id"]]["t0"] * sr); v[i:i + len(a)] += a
        sf.write(f"{W}/voice_{l}.wav", v, sr)
    json.dump(TL, open(f"{W}/timeline.json", "w"), ensure_ascii=False, indent=1)
    return TL


# ---------------- music made in code: tanpura, pad, temple bells, a dark tremor for tense lines ----------------
def music(W, S, TL):
    LN = TL["lines"]; SR = 48000; D = TL["dur"]; n = int(SR * D); t = np.arange(n) / SR; rng = np.random.default_rng(7)
    def place(y, t0):
        out = np.zeros(n); i = int(t0 * SR); e = min(n, i + len(y))
        if e > i: out[i:e] = y[:e - i]
        return out
    def pluck(f, t0, dur=5.5, amp=1.0):
        m = int(dur * SR); tt = np.arange(m) / SR; y = np.zeros(m)
        for h in range(1, 16):
            a = (1 / h ** .9) * (1 + .9 * np.exp(-((h - 7) / 3.0) ** 2))
            y += a * np.sin(2 * np.pi * f * h * tt * (1 + .0004 * h) + rng.uniform(0, 6.28)) * np.exp(-tt * (.35 + .09 * h))
        return place(y * np.minimum(1, tt / .02) * amp, t0)
    def bell(f, t0, amp=1.0, dur=6):
        m = int(dur * SR); tt = np.arange(m) / SR; y = np.zeros(m)
        for r, a, d in [(1, 1, .7), (2.01, .6, 1.0), (2.76, .45, 1.4), (5.4, .25, 2.4), (8.9, .12, 3.5)]:
            y += a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * d)
        return place(y * amp, t0)
    sa = 138.59; Lc = np.zeros(n); Rc = np.zeros(n)
    cyc = [(sa * 1.5, .9), (sa * 2, .8), (sa * 2, .8), (sa, 1.0)]; k = 0; t0 = 0.0
    while t0 < D - 1:
        f, a = cyc[k % 4]; p = pluck(f, t0, amp=a * .16); pan = .35 + .3 * ((k % 4) / 3)
        Lc += p * (1 - pan); Rc += p * pan; t0 += 1.15; k += 1
    pad = sum(np.sin(2 * np.pi * f * t + ph) * (.5 + .5 * np.sin(2 * np.pi * r * t)) for f, ph, r in [(sa / 2, 0, .07), (sa, 1, .05), (sa * 1.5, 2, .09), (sa * 2, 3, .06)]) * .035
    env = np.zeros(n)
    for L in S:
        if L.get("dark"):
            x = LN[L["id"]]; env = np.maximum(env, np.clip((t - x["s0"]) / 1.5, 0, 1) * np.clip((min(x["s1"], D) + .8 - t) / 1.5, 0, 1))
    dark = (np.sin(2 * np.pi * sa / 2 * 1.06 * t) + np.sin(2 * np.pi * sa * .5 * 1.414 * t) + .6 * np.sin(2 * np.pi * sa * 1.06 * t)) * (.7 + .3 * np.sin(2 * np.pi * 5.5 * t)) * .07 * env
    b = bell(sa * 4, .05, .2)
    for L in S:
        for at in L.get("bells", []):
            x = LN[L["id"]]; b += bell(sa * (6 if at < .5 else 4), x["s0"] + (min(x["s1"], D) - x["s0"]) * at, .22)
    last = LN[S[-1]["id"]]; b += bell(sa * 3, last["t0"], .26) + bell(sa * 4, last["t0"] + .9, .18)
    Lc += pad + dark + b * .9; Rc += pad + dark * .95 + b
    fade = np.clip(t / .6, 0, 1) * np.clip((D - t) / 2.0, 0, 1)
    st = np.stack([Lc, Rc], 1) * fade[:, None]; st = st / np.abs(st).max() * .85
    w = wave.open(f"{W}/music.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype("<i2").tobytes()); w.close()


def mix(W):
    for l in ("en", "hi"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{W}/voice_{l}.wav", "-i", f"{W}/music.wav", "-filter_complex",
            "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=70,acompressor=threshold=0.1:ratio=3:attack=5:release=120,volume=1.6[v];"
            "[v]asplit=2[v1][v2];[1:a]volume=0.55[m];[m][v1]sidechaincompress=threshold=0.03:ratio=8:attack=30:release=500[md];"
            "[md][v2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "pcm_s16le", f"{W}/mix_{l}.wav"], check=True)
        # small lossless copy that lives in the repo for the GitHub render
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{W}/mix_{l}.wav", "-c:a", "flac", f"{W}/mix_{l}.flac"], check=True)


if __name__ == "__main__":
    W = sys.argv[1].rstrip("/"); only = set(sys.argv[2:])
    S = json.load(open(f"{W}/script.json"))["lines"]
    rep = make_takes(W, S, only)
    TL = timeline(W, S); music(W, S, TL); mix(W)
    spec = json.load(open(f"{W}/spec.json"))
    open(f"{W}/spec.js", "w").write("window.STORY=" + json.dumps(spec, ensure_ascii=False) + ";\nwindow.TL=" + json.dumps(TL, ensure_ascii=False) + ";\n")
    bad = {k: v for k, v in rep.items() if v["err"] > (.12 if k.startswith("en") else .2)}
    print(f"\nduration {TL['dur']} s")
    if bad:
        print("VOICE PROBLEMS (respell the word in the script, or add a FIX in pipeline/tts.py, then rerun for that line):")
        for k, v in bad.items(): print(f"  {k}: heard '{v['heard']}' (error {v['err']})")
    else: print("voice ok")
