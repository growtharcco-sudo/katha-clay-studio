"""Render one part of a story video (both languages share the 3D frame; only the text differs).

  python pipeline/render.py work/<id> --part 3 --parts 8     -> work/<id>/seg/en_03.mp4, hi_03.mp4
  python pipeline/render.py work/<id> --cover                -> work/<id>/cover_en.png, cover_hi.png

Parts split the video by exact frame numbers, so joined parts have exactly the right length.
GitHub Actions runs all parts at the same time on separate machines (see .github/workflows/render.yml).
"""
import argparse, json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from browser import open_story

FPS = 30


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("work"); ap.add_argument("--part", type=int, default=0)
    ap.add_argument("--parts", type=int, default=1); ap.add_argument("--cover", action="store_true")
    ap.add_argument("--mac", action="store_true", help="use the Mac GPU (Metal)")
    a = ap.parse_args(); W = a.work.rstrip("/"); wid = os.path.basename(W)
    TL = json.load(open(f"{W}/timeline.json")); spec = json.load(open(f"{W}/spec.json"))
    with sync_playwright() as p:
        b, pg = open_story(p, wid, "en", pr=1.0, mac=a.mac)
        print("drawing with:", pg.evaluate("(()=>{const g=document.createElement('canvas').getContext('webgl2');const e=g.getExtension('WEBGL_debug_renderer_info');return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'?'})()"), flush=True)
        if a.cover:
            cv = spec.get("cover") or {"line": spec["order"][-2], "at": .5}; x = TL["lines"][cv["line"]]
            t = x["s0"] + (min(x["s1"], TL["dur"]) - x["s0"]) * cv.get("at", .5)
            for l in ("en", "hi"):
                pg.evaluate(f"setLang('{l}');render({t});window.coverText()")
                pg.screenshot(path=f"{W}/cover_{l}.png"); print("cover", l, round(t, 2))
            b.close(); return
        n = int(round(TL["dur"] * FPS)); fs = n * a.part // a.parts; fe = n * (a.part + 1) // a.parts
        os.makedirs(f"{W}/seg", exist_ok=True)
        tmp = {l: f"{W}/seg/{l}_{a.part:02d}.tmp.mp4" for l in ("en", "hi")}
        enc = {l: subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "png", "-i", "-",
               "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", str(FPS), tmp[l]], stdin=subprocess.PIPE) for l in tmp}
        t0 = time.time()
        for f in range(fs, fe):
            t = f / FPS
            pg.evaluate(f"setLang('en');render({t})"); enc["en"].stdin.write(pg.screenshot(type="png"))
            pg.evaluate(f"setLang('hi');textOnly({t})"); enc["hi"].stdin.write(pg.screenshot(type="png"))
            k = f - fs + 1
            if k % 60 == 0: el = time.time() - t0; print(f"  part {a.part}: {k}/{fe - fs} frames, {el / k:.2f}s each, ~{el / k * (fe - fs - k) / 60:.1f} min left", flush=True)
        b.close()
        for l, e in enc.items():
            e.stdin.close()
            if e.wait() != 0: raise SystemExit(f"ffmpeg failed for {l}")
            os.replace(tmp[l], f"{W}/seg/{l}_{a.part:02d}.mp4")   # only a finished part gets its real name
        print(f"part {a.part} done: frames {fs} to {fe - 1}")


if __name__ == "__main__":
    main()
