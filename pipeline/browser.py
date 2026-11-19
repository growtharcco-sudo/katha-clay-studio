"""Open the engine page for a story in headless Chrome (GPU if present, otherwise SwiftShader)."""
import os, shutil, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def chrome():
    for c in (os.environ.get("CHROME"), "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", shutil.which("google-chrome") or ""):
        if c and os.path.exists(c): return c
    return None


def open_story(p, wid, lang="en", pr=1.0, mac=False):
    args = ["--no-sandbox", "--allow-file-access-from-files", "--use-gl=angle",
            "--use-angle=metal" if mac else "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
    b = p.chromium.launch(executable_path=chrome(), args=args)
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    spec = f"../work/{wid}/spec.js"
    pg.goto(f"file://{ROOT}/engine/engine.html?spec={spec}&lang={lang}&pr={pr}")
    try:
        pg.wait_for_function("window.done===true", timeout=240000)
    except Exception:
        raise SystemExit("engine did not start: " + "; ".join(errs))
    if errs: raise SystemExit("engine error: " + "; ".join(errs))
    return b, pg
