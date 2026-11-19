"""Post every queued Reel whose time has come. Runs in GitHub Actions.

queue/<id>/post.json   lang (en or hi), post_at (ISO time with timezone), captions and titles
queue/<id>/SKIP        if present, the post is cancelled (the veto)
media branch <id>/video.mp4, <id>/cover.png, served at $PAGES_BASE/<id>/...

Safe to re-run: what was already posted is recorded in queue/<id>/result.json and never posted twice.
"""
import datetime as dt, json, os, shutil, sys, tempfile, time, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import accounts
import media_branch

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRY = "--dry-run" in sys.argv
BREAKING_ONLY = "--breaking-only" in sys.argv   # used by the instant "post now" workflow
PAGES = os.environ.get("PAGES_BASE", "").rstrip("/")


def wait_public(url, tries=40):
    """GitHub Pages can take a few minutes to serve a new file: wait until it really answers 200."""
    for _ in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=20) as r:
                if r.status == 200 and int(r.headers.get("Content-Length") or 1) > 0: return True
        except Exception:
            pass
        time.sleep(15)
    raise RuntimeError(f"not reachable yet: {url}")


def main():
    now = dt.datetime.now(dt.timezone.utc)
    if not PAGES and not DRY: raise SystemExit("PAGES_BASE is not set")
    qdir = os.path.join(ROOT, "queue"); failures = 0; changed = False
    os.makedirs(os.path.join(ROOT, "posted"), exist_ok=True)
    for vid in sorted(os.listdir(qdir)) if os.path.isdir(qdir) else []:
        d = os.path.join(qdir, vid); pj = os.path.join(d, "post.json")
        if not os.path.exists(pj): continue
        post = json.load(open(pj))
        if os.path.exists(os.path.join(d, "SKIP")):
            print(f"{vid}: skipped (veto)"); shutil.move(d, os.path.join(ROOT, "posted", vid + "__skipped")); changed = True; continue
        when = dt.datetime.fromisoformat(post["post_at"])
        if BREAKING_ONLY and not post.get("breaking"): continue
        if not BREAKING_ONLY and post.get("breaking") and (now - when).total_seconds() < 1800: continue
        if when > now:
            print(f"{vid}: not due until {when.isoformat()}"); continue
        lang = post.get("lang", "en"); accounts.use(lang)
        rp = os.path.join(d, "result.json")
        res = json.load(open(rp)) if os.path.exists(rp) else {}
        video_url, cover_url = f"{PAGES}/{vid}/video.mp4", f"{PAGES}/{vid}/cover.png"
        print(f"{vid} ({lang}): due, posting. video {video_url}")
        if DRY: continue
        try:
            if not media_branch.has(vid): raise RuntimeError("the media branch does not have this video")
            wait_public(video_url); wait_public(cover_url)
            if "yt_video_id" not in res:
                if not os.environ.get("YT_REFRESH_TOKEN"): raise RuntimeError(f"YT_REFRESH_TOKEN_{lang.upper()} is not set")
                import youtube
                local = os.path.join(tempfile.gettempdir(), f"{vid}.mp4")
                urllib.request.urlretrieve(video_url, local)
                res.update(youtube.upload_short(local, post["youtube_title"], post["youtube_description"],
                                                post.get("youtube_tags"), lang=lang))
                json.dump(res, open(rp, "w"), indent=1); print("  YouTube:", res["yt_url"], res.get("yt_privacy"))
                try:   # thumbnail = the cover; never blocks the post
                    cov = os.path.join(tempfile.gettempdir(), f"{vid}_cover.png")
                    urllib.request.urlretrieve(cover_url, cov)
                    res["yt_thumbnail"] = youtube.set_thumbnail(res["yt_video_id"], cov)
                except Exception as e:
                    res["yt_thumbnail"] = f"failed ({type(e).__name__})"
                print("  YouTube thumbnail:", res.get("yt_thumbnail"))
                os.remove(local); json.dump(res, open(rp, "w"), indent=1)
            if "ig_media_id" not in res:
                if not os.environ.get("IG_USER_ID"): raise RuntimeError(f"IG_USER_ID_{lang.upper()} is not set")
                import instagram
                res.update(instagram.publish_reel(video_url, post["instagram_caption"], cover_url))
                json.dump(res, open(rp, "w"), indent=1); print("  Instagram:", res.get("ig_permalink"))
            res["posted_at"] = now.isoformat(); json.dump(res, open(rp, "w"), indent=1)
            shutil.move(d, os.path.join(ROOT, "posted", vid)); changed = True
        except Exception as e:                      # record and keep going; the run is marked failed at the end
            failures += 1; res["last_error"] = f"{now.isoformat()} {e}"
            json.dump(res, open(rp, "w"), indent=1); changed = True
            print(f"  FAILED: {e}")
    open(os.path.join(ROOT, ".changed"), "w").write("1" if changed else "0")
    if failures: sys.exit(1)


if __name__ == "__main__":
    main()
