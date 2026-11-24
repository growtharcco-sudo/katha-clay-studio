"""Tests the scene kinds that the example Reel does not use (portrait, duo, custom) through the real layout check.

  python tools/test_kinds.py      (needs work/000_kit_example built by kit.py, with its timeline.json)
Prints "layout ok" or LAYOUT PROBLEMS, and writes work/000_kit_kinds/sheet.png.
"""
import json, os, shutil, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "pipeline"))
import kit
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
S, W = "work/000_kit_example", "work/000_kit_kinds"
os.makedirs(W, exist_ok=True)
spec = json.load(open(f"{S}/spec.json")); TL = json.load(open(f"{S}/timeline.json"))
tests = {"create": {"kind": "duo", "a": "parvati", "b": "boy", "speaker": "parvati"},
         "guard": {"kind": "portrait", "who": "parvati", "pose": "point", "mood": "angry"},
         "arrive": {"kind": "portrait", "who": "shiva", "set": "kailash", "pose": "blessH"},
         "battle": {"kind": "duo", "a": "shiva", "b": "parvati", "set": "kailash", "speaker": "shiva"},
         "strike": {"kind": "custom", "set": "forest", "cast": [{"who": "elephant", "at": "clearing"}], "cam": {"frame": ["elephant"]}}}
for i, sh in tests.items(): spec["shots"][i] = kit.expand(sh, i)
spec["order"] = [i for i in spec["order"] if i in tests or i == spec["order"][0]]
json.dump(spec, open(f"{W}/spec.json", "w")); shutil.copy(f"{S}/timeline.json", W)
open(f"{W}/spec.js", "w").write("window.STORY=" + json.dumps(spec, ensure_ascii=False) + ";\nwindow.TL=" + json.dumps(TL, ensure_ascii=False) + ";\n")
sys.exit(subprocess.call([sys.executable, "pipeline/sheet.py", W, "en"]))
