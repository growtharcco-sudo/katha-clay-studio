"""Join the rendered parts, add the voice + music, and check the result.

  python pipeline/assemble.py work/<id>    -> work/<id>/<id>_en.mp4, <id>_hi.mp4 (1080x1920, 30 fps, H.264 CRF 14, AAC 256k)
"""
import glob, json, os, subprocess, sys

W = sys.argv[1].rstrip("/"); wid = os.path.basename(W)
TL = json.load(open(f"{W}/timeline.json"))
for l in ("en", "hi"):
    parts = sorted(glob.glob(f"{W}/seg/{l}_[0-9][0-9].mp4"))
    if not parts: raise SystemExit(f"no rendered parts for {l}")
    lst = f"{W}/seg/{l}.txt"; open(lst, "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in parts))
    v = f"{W}/seg/{l}_video.mp4"; out = f"{W}/{wid}_{l}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-an", "-c:v", "copy", v], check=True)
    audio = f"{W}/mix_{l}.flac" if os.path.exists(f"{W}/mix_{l}.flac") else f"{W}/mix_{l}.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", v, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out], check=True)
    info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,nb_frames:format=duration",
                                      "-of", "json", out], capture_output=True, text=True).stdout)
    vs = [s for s in info["streams"] if s["codec_type"] == "video"][0]
    frames, want = int(vs["nb_frames"]), int(round(TL["dur"] * 30))
    ok = vs["width"] == 1080 and vs["height"] == 1920 and abs(frames - want) <= 1
    print(f"{out}: {vs['width']}x{vs['height']}, {frames} frames (expected {want}), {float(info['format']['duration']):.2f}s", "OK" if ok else "PROBLEM")
    if not ok: sys.exit(1)
