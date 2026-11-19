"""Write queue/<id>_en/post.json and queue/<id>_hi/post.json from the story's brief (run after rendering).
A language whose post block says "enabled": false is not queued."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sid = sys.argv[1]
B = json.load(open(os.path.join(ROOT, "stories", sid, "brief.json")))
for lang in ("en", "hi"):
    po = B["post"][lang]
    if po.get("enabled") is False: print("not queued:", lang); continue
    d = os.path.join(ROOT, "queue", f"{sid}_{lang}"); os.makedirs(d, exist_ok=True)
    out = {"lang": lang, "story": sid, "post_at": po["post_at"], "instagram_caption": po["instagram_caption"],
           "youtube_title": po["youtube_title"], "youtube_description": po["youtube_description"],
           "youtube_tags": po.get("youtube_tags", [])}
    json.dump(out, open(os.path.join(d, "post.json"), "w"), ensure_ascii=False, indent=1)
    print("queued", f"{sid}_{lang}", "for", po["post_at"])
