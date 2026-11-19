"""End-to-end test of both upload paths, for English and Hindi. Publishes NOTHING publicly.
Instagram: creates a Reel container from the hosted test video and waits until Instagram has processed it
(proves token, permission, hosting and video format). The container is never published and expires in 24h.
YouTube: uploads the test video as UNLISTED, checks it stays unlisted (so public uploads will work), sets the
test cover as thumbnail, then DELETES the test video."""
import os, sys, time, requests
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "poster"))
import accounts, instagram

PAGES = os.environ["PAGES_BASE"].rstrip("/"); url = f"{PAGES}/_test/video.mp4"; cover = f"{PAGES}/_test/cover.png"; ok = True
only = os.environ.get("ONLY_LANG", "").strip()
r = requests.head(url, timeout=30); print("Hosting:", "OK" if r.ok else "FAILED", r.status_code, url); ok &= r.ok
local = "/tmp/t.mp4"; open(local, "wb").write(requests.get(url, timeout=120).content)
lc = "/tmp/t.png"; open(lc, "wb").write(requests.get(cover, timeout=60).content)

for lang in accounts.LANGS:
    if only and lang != only: continue
    accounts.use(lang); print(f"\n== {lang.upper()} ==")
    tok, uid = accounts.env("IG_TOKEN"), os.environ.get("IG_USER_ID", "")
    if not (tok and uid): print("Instagram: keys not set"); ok = False
    else:
        B = instagram._base(tok)
        c = requests.post(f"{B}/{uid}/media", data={"media_type": "REELS", "video_url": url, "caption": "test",
                          "share_to_feed": "false", "access_token": tok}, timeout=60)
        if not c.ok: print("Instagram: FAILED to create container", c.status_code, c.text[:400]); ok = False
        else:
            cid = c.json()["id"]; st = {}
            for _ in range(40):
                st = requests.get(f"{B}/{cid}", params={"fields": "status_code,status", "access_token": tok}, timeout=30).json()
                if st.get("status_code") in ("FINISHED", "ERROR", "EXPIRED"): break
                time.sleep(10)
            print("Instagram: processed the video ->", st.get("status_code"), "(not published)" if st.get("status_code") == "FINISHED" else st)
            ok &= st.get("status_code") == "FINISHED"
    if os.environ.get("SKIP_YT") == "1": print("YouTube: skipped this run"); continue
    if not os.environ.get("YT_REFRESH_TOKEN"): print("YouTube: key not set"); ok = False; continue
    import youtube
    try:
        name = youtube.channel_name(); print("YouTube channel:", name)
        res = youtube.upload_short(local, "Pipeline test (deleted automatically)", "Automated test upload.", privacy="unlisted", lang=lang)
        vid = res["yt_video_id"]; print("YouTube: upload OK ->", res["yt_url"], "API says:", res["yt_privacy"])
        verdict = None
        for _ in range(10):      # an unlisted video answers oEmbed; one locked to private does not
            time.sleep(30)
            r = requests.get("https://www.youtube.com/oembed", params={"url": f"https://www.youtube.com/watch?v={vid}", "format": "json"}, timeout=30)
            verdict = r.status_code
            if r.status_code in (401, 403): break
        stayed = verdict == 200
        print("YouTube visibility:", "STAYED UNLISTED -> public uploads will work" if stayed else f"LOCKED TO PRIVATE (oEmbed {verdict}) -> the project needs the API audit")
        ok &= stayed
        print("YouTube thumbnail:", youtube.set_thumbnail(vid, lc, tries=4, wait=30))
        youtube.delete(vid); print("YouTube: test video deleted")
    except Exception as e:
        print("YouTube: FAILED", str(e)[:400]); ok = False

print("\nALL OK" if ok else "\nSOMETHING FAILED"); sys.exit(0 if ok else 1)
