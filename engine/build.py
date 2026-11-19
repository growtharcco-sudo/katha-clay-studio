"""Join engine/src/*.js into engine/engine.html (run after editing any part)."""
import os
D = os.path.dirname(os.path.abspath(__file__))
parts = ["head.js", "chars.js", "sets.js", "director.js"]
open(os.path.join(D, "engine.html"), "w", encoding="utf-8").write("\n".join(open(os.path.join(D, "src", p), encoding="utf-8").read() for p in parts))
print("engine.html built")
