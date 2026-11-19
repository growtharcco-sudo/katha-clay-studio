"""ONE check image for a story instead of dozens of stills, plus automatic layout checks.

  python pipeline/sheet.py work/<id> [en|hi]

Draws two frames per shot (just after it starts, and late in the line) and the cover, at full layout size,
then shrinks them into work/<id>/sheet_<lang>.png. It also checks, in the real page:
  * every framed character stays inside the safe area (not cut off, not under the title, not in the captions)
  * every caption chunk fits in 2 lines, the title lines fit, pills and source tags fit
Prints "layout ok" or LAYOUT PROBLEMS. Fix the BRIEF (shorter caption chunk, different spot, camera angle) and rerun.
"""
import json, os, sys
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from browser import open_story

TEXT_CHECK = """() => {
 const P=[], cap=document.getElementById('cap'), CH=TL.cap[LANG];
 for (const c of CH) {
   cap.className='ol'+(c.big?' big':''); cap.innerHTML='';
   const words=c.big?[{w:c.big}]:c.words.filter(w=>!w.br);
   for (const w of words){const s=document.createElement('span');s.className='w';s.textContent=w.w;cap.appendChild(s)}
   cap.style.opacity=1; const r=cap.getBoundingClientRect(), lh=parseFloat(getComputedStyle(cap).lineHeight);
   const lines=Math.round(r.height/lh); const txt=words.map(w=>w.w).join(' ');
   if (c.big && lines>1) P.push(`big card "${txt}" is too wide for one line`);
   else if (lines>2) P.push(`caption "${txt}" needs ${lines} lines (max 2): split it with |`);
   for (const s of cap.querySelectorAll('.w')) if (s.getBoundingClientRect().width>960) P.push(`word "${s.textContent}" is wider than the screen`);
 }
 const t=document.getElementById('title');
 for (const d of t.children){const s=document.createElement('span');s.textContent=d.textContent;s.style.whiteSpace='nowrap';d.textContent='';d.appendChild(s);
   if (s.getBoundingClientRect().width>1010) P.push(`title line "${s.textContent}" is too wide`); if (parseFloat(getComputedStyle(d).fontSize)<44) P.push(`title line "${s.textContent}" had to shrink a lot: shorten it`); d.textContent=s.textContent}
 for (const p of document.querySelectorAll('.pill')) { p.style.opacity=1; if (p.getBoundingClientRect().width>900) P.push(`pill "${p.textContent}" is too wide`); }
 const st=document.getElementById('src'); for (const id in TL.lines){const x=TL.lines[id]; if(!x.src) continue; st.textContent=(x.src.plain?'':'Source: ')+x.src[LANG];
   if (st.getBoundingClientRect().height>60) P.push(`source tag of ${id} wraps to 2 lines: shorten it`)}
 return P;
}"""


def main(W, lang="en"):
    wid = os.path.basename(W.rstrip("/"))
    spec = json.load(open(f"{W}/spec.json")); TL = json.load(open(f"{W}/timeline.json")); LN = TL["lines"]
    times, labels = [], []
    for i in spec["order"]:
        x = LN[i]; s1 = min(x["s1"], TL["dur"])
        for f, tag in ((.15, "start"), (.8, "late")):
            times.append(round(x["s0"] + (s1 - x["s0"]) * f, 2)); labels.append(f"{i} {tag}")
        th = spec["shots"][i].get("then")
        if th: times.append(round(x["s0"] + (s1 - x["s0"]) * min(.97, th["at"] + .1), 2)); labels.append(f"{i} then")
    cv = spec.get("cover") or {"line": spec["order"][-2], "at": .5}; x = LN[cv["line"]]
    tc = round(x["s0"] + (min(x["s1"], TL["dur"]) - x["s0"]) * cv.get("at", .5), 2)
    ims = []; probs = []
    with sync_playwright() as p:
        b, pg = open_story(p, wid, lang, pr=.5)
        for t, lab in zip(times, labels):
            pg.evaluate(f"render({t},{{check:true}})"); f = f"/tmp/kc_sheet.png"; pg.screenshot(path=f)
            im = Image.open(f).convert("RGB").resize((270, 480)); ImageDraw.Draw(im).text((6, 6), f"{lab} {t}s", fill="yellow"); ims.append(im)
        probs += pg.evaluate("window.CHECK")
        pg.evaluate(f"window.LANG='{lang}'"); probs += pg.evaluate(TEXT_CHECK)
        # cover: clean frame without any text
        pg.evaluate(f"document.body.classList.add('poster');render({tc});document.getElementById('flash').style.opacity=0")
        pg.screenshot(path=f"{W}/cover_raw_{lang}.png")
        b.close()
    cols = 6; rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (270 * cols, 480 * rows), "white")
    for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * 270, (i // cols) * 480))
    sheet.save(f"{W}/sheet_{lang}.png")
    # keep the list short: one line per character problem per shot
    seen = set(); out = []
    for q in probs:
        k = q.split("@")[0] + q.split(":", 1)[-1] if "@" in q else q
        if k not in seen: seen.add(k); out.append(q)
    print(f"sheet: {W}/sheet_{lang}.png ({len(ims)} frames)")
    if out: print("LAYOUT PROBLEMS:"); [print("  -", q) for q in out]; return False
    print("layout ok"); return True


if __name__ == "__main__":
    sys.exit(0 if main(sys.argv[1], *(sys.argv[2:3])) else 1)
