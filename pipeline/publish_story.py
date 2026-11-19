"""Hand a checked story to GitHub for rendering: copies work/<id>/ essentials into stories/<id>/ and marks it READY.
Then: git add stories/<id> && git commit -m "story <id>" && git pull --rebase && git push   (render.yml starts by itself)."""
import os, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sid = sys.argv[1]; W = os.path.join(ROOT, "work", sid); S = os.path.join(ROOT, "stories", sid); os.makedirs(S, exist_ok=True)
for f in ("brief.json", "spec.json", "timeline.json", "spec.js", "mix_en.flac", "mix_hi.flac", "sheet_en.png", "report.json"):
    if os.path.exists(os.path.join(W, f)): shutil.copy(os.path.join(W, f), S)
for f in ("spec.js", "mix_en.flac", "mix_hi.flac"):
    if not os.path.exists(os.path.join(S, f)): raise SystemExit(f"missing {f}: run pipeline/voice.py first")
open(os.path.join(S, "READY"), "w").write("ready\n")
print("stories/" + sid, "ready to push")
