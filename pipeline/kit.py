"""The Katha Clay Reel kit: a short story BRIEF in, a checked spec out.

SHORT FORM (use this): "beats" instead of "lines", and each beat has a "show": {"kind": ..., fields} from the
SCENE KINDS list below (hook, create, guard, arrive, clash, flash_cut, rage, demand, send, discover,
reveal, family, name_card, worship, finale, portrait, duo, custom). Example: briefs/000_kit_example.json. The raw "shot" format documented
below is what each kind expands into; write it only through {"kind": "custom"}.

  python pipeline/kit.py briefs/<id>.json      -> work/<id>/script.json + spec.json, prints "brief ok" or BRIEF PROBLEMS

You never write camera coordinates. Each line gets a SHOT: a set, named spots, approved characters with named
poses and actions, and named effects. The camera frames the listed characters automatically inside the safe area.

BRIEF (JSON)
{
 "id": "003_ganesha_moon", "snake": "neck" | "shoulder" (shoulder only for the blue-throat story),
 "title": {"en": ["Why Does Lord Ganesha Have", "AN ELEPHANT HEAD?"], "hi": ["...", "..."]},   (hook overlay, 2 lines)
 "lines": [ {
    "id": "hook", "en": "spoken English", "hi": "spoken Hindi",
    "cap_en": "caption | chunks | with *highlight*", "cap_hi": "...",        ("" for the hook: the title shows instead)
             (#Big word | ~small line under it   for a big name card)
    "src_en": "Shiva Purana, Rudra Samhita, Kumara Khanda 13", "src_hi": "...",  (required unless "no_claim": true)
    "dark": true (tense music), "bells": [0.6] (bell at that share of the shot), "gap": 0.4 (pause after),
    "shot": {
       "set": "kailash" | "home" | "forest",
       "sky": ["dawn", "gold"]   (dawn calm dusk fury gold night; from -> to over the shot),
       "light": "dim" | "warm_red" (optional),
       "cast": [ {"who": "parvati", "at": "left", "to": "door", "walk": [0, .5], "yaw": "face:boy" | "away" | "left" | "right" | 0.4,
                  "pose": "bless" | ["rest", "bless", .2, .4], "mood": "calm|happy|worried|angry", "mouth": "smile|oh|flat",
                  "mood_to": ["angry", .3], "talk": [.2, .8], "eyes_closed": .6, "seated": true (Shiva on Kailash only),
                  "raise": [.1, .4] (Shiva lifts the trident), "scale": 1,
                  "act": [{"do": "appear", "at": .3}, {"do": "bow"}, {"do": "knockback", "at": .4, "dir": [1.6, 1]}, ...]} ],
       "fx": [ {"kind": "petals"}, {"kind": "flash", "at": .42}, ... ],
       "cam": {"frame": ["parvati", "boy"] (or "spot": "center" to look at an empty spot), "angle": "front|low|high|left|right|high_left|high_right", "push": .12, "orbit": .25, "zoom": 1},
       "then": {"at": .45, "cast": [...], "fx": [...], "cam": {...}}   (second half of the shot, e.g. after a flash),
       "verse": {"en": ["Bhagavata Purana 8.7.43", "Sanskrit line", "meaning"], "hi": [...]}  (shows the verse block)
    } } ],
 "pills": [ {"line": "create", "a": .1, "b": .9, "on": "parvati", "style": "" | "or" | "gr", "text": {"en": "MATA PARVATI", "hi": "माता पार्वती"}} ],
 "sources": [ {"title": "...", "url": "https://...", "fetched": "YYYY-MM-DD", "supports": ["create", "guard"]} ],
 "math": [ {"expr": "18 - 13", "expect": "5", "note": "..."} ]   (only if the story has numbers),
 "cover": {"line": "son", "at": .5},
 "post": {"en": {"post_at": "2026-11-21T08:30:00+05:30", "instagram_caption": "...", "youtube_title": "...", "youtube_description": "...", "youtube_tags": [...]},
          "hi": {...}}
}
"""
import datetime as dt, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPROVED = json.load(open(os.path.join(ROOT, "engine", "approved.json")))

SPOTS = {"kailash": "seat front left right far_left far_right front_left front_right front_far off_left off_right",
         "home": "door inside center left right far_left far_right front_left front_right front step_left step_right off_left off_right",
         "forest": "center clearing left right front_left front_right off_left off_right"}
SPOTS = {k: set(v.split()) for k, v in SPOTS.items()}
SKIES = {"dawn", "calm", "dusk", "fury", "gold", "night"}
POSES = {"shiva": {"rest", "bless", "med", "hold", "point", "raise", "blessH", "drink"},
         "parvati": {"rest", "bless", "grief", "reach", "fury", "point", "namaste"},
         "person": {"rest", "namaste", "cheer", "afraid", "offer", "fight", "down"}}
MOODS = {"calm", "happy", "worried", "angry"}; MOUTHS = {"smile", "oh", "flat"}
ACTS = {"appear", "exit", "enter", "bow", "tremble", "hop", "lift", "lean_back", "head_tilt", "sway_trunk", "knockback", "staff", "walk_in_place"}
FX = {"petals", "flash", "rings", "light", "sparkle", "orb_reveal", "drops", "fallen_staff", "seat", "trident_glow", "doors", "tint", "dim"}
ANGLES = {"front", "low", "high", "left", "right", "high_left", "high_right"}
DASHES = re.compile("[–—‒―]")


# ---------------- SCENE KINDS: one short "show" per beat expands into a full, tested shot ----------------
# Each kind places approved characters on named spots with fixed poses, effects and camera (no coordinates).
# These were cut from the finished Ganesha Reel, so a kind looks exactly like that scene did.
# Optional overrides on any show: "set", "sky", "light", "verse", extra "fx" (added), "cam" (merged).
# {"kind": "custom", ...a full raw shot...} is the escape hatch for something no kind covers.
KINDS_DOC = {
 "hook":      "deity, child        title frame on Kailash: Shiva seated, the child hops in front, petals",
 "create":    "maker, made         maker blesses, the made one appears in sparkles",
 "guard":     "leaver, guard       leaver goes inside, the guard takes the door and blocks it",
 "arrive":    "who, waiting        'who' walks in from the right; the one waiting stands guard and speaks",
 "clash":     "hero, foes(3)       foes rush in and tumble back one by one (no wounds, no blood)",
 "flash_cut": "who                 raises the trident, white flash, cut to a fallen staff in dim light",
 "rage":      "who, witnesses(2)   'who' turns from grief to fury in red light, witnesses tremble",
 "demand":    "who                 close up, 'who' points and speaks in red light with power rings",
 "send":      "leader, group(3)    leader points, the group bows and walks off to the left (Kailash)",
 "discover":  "found, finders(2)   in the forest the finders walk up to what they found",
 "reveal":    "who, helpers(2)     helpers sprinkle holy water, golden light, 'who' wakes",
 "family":    "center, right, left  blessing tableau in golden light",
 "name_card": "who, group(2)       big name moment: 'who' hops, the group bows, petals (use #Name in the caption)",
 "worship":   "who, devotees(2)    'who' on the flower seat, devotees bow with eyes closed",
 "finale":    "center, right, left  last frame: family blessing on the flower seat, camera pulls back",
 "portrait":  "who, [pose], [mood], [talk]   one character, close up, at the centre",
 "duo":       "a, b, [speaker]     two characters facing each other, the speaker talks",
 "custom":    "a full raw shot (cast, fx, cam, then) for anything else",
}


def _bless(w, at, yaw, t0, t1):
    return {"who": w, "at": at, "yaw": yaw, "pose": ["hold", "blessH", t0, t1] if w == "shiva" else ["rest", "bless", t0, t1]}


def expand(show, i):
    s = dict(show); k = s.get("kind"); S = lambda d: s.get("set", d)
    if k == "custom": return {x: y for x, y in s.items() if x != "kind"}
    if k == "hook":
        c = s["child"]
        sh = {"set": S("kailash"), "cast": [{"who": s.get("deity", "shiva"), "seated": True},
              {"who": c, "at": "front", "act": [{"do": "hop", "height": .05}, {"do": "head_tilt"}]}],
              "fx": [{"kind": "petals", "at": "front"}], "cam": {"frame": [c, s.get("deity", "shiva")], "fit_h": .56, "push": .1, "center_y": .46}}
    elif k == "create":
        m, c = s["maker"], s["made"]
        sh = {"set": S("home"), "cast": [{"who": m, "at": "step_left", "yaw": .45, "pose": ["rest", "bless", .15, .35]},
              {"who": c, "at": "step_right", "yaw": -.35, "act": [{"do": "appear", "at": .35, "dur": .35}], "eyes_closed": .7}],
              "fx": [{"kind": "sparkle", "on": c, "from": 0, "to": .75}], "cam": {"frame": [m, c], "include_hidden": True}}
    elif k == "guard":
        l, g = s["leaver"], s["guard"]
        sh = {"set": S("home"), "cast": [{"who": l, "at": "step_left", "to": "inside", "walk": [.05, .5], "act": [{"do": "exit", "at": .5}]},
              {"who": g, "at": "right", "to": "door", "walk": [.4, .65], "mood_to": ["angry", .65], "act": [{"do": "staff", "mode": "block", "from": .65}]}],
              "fx": [{"kind": "doors", "open": 0, "close": .6}], "cam": {"frame": [g, l], "angle": "right"}}
    elif k == "arrive":
        w, t = s["who"], s["waiting"]
        sh = {"set": S("home"), "cast": [{"who": w, "at": "off_right", "to": "right", "walk": [0, .5], "pose": "hold", "yaw": -1.0},
              {"who": t, "at": "door", "yaw": .35, "mood": "angry", "talk": [.6, .95], "act": [{"do": "staff", "mode": "block"}]}],
              "cam": {"frame": [t, w], "angle": "left"}}
    elif k == "clash":
        h, F = s["hero"], s["foes"][:3]
        cast = [{"who": h, "at": "door", "yaw": .45, "mood": "angry", "act": [{"do": "staff", "mode": "swing"}]}]
        for w, sp, at, d in zip(F, ["far_right", "right", "step_right"], [.3, .55, .8], [[1.6, 1.6], [2.4, .6], [1.8, -.4]]):
            cast.append({"who": w, "at": sp, "yaw": -1.2, "act": [{"do": "knockback", "at": at, "dir": d}]})
        sh = {"set": S("home"), "cast": cast, "cam": {"frame": [h] + F}}
    elif k == "flash_cut":
        w = s.get("who", "shiva")
        sh = {"set": S("home"), "sky": ["dawn", "dusk"],
              "cast": [{"who": w, "at": "right", "yaw": -1.0, "pose": ["hold", "raise", .05, .35], "raise": [.05, .35], "mouth": "flat"}],
              "fx": [{"kind": "trident_glow", "from": .05, "to": .4}, {"kind": "flash", "at": .42}], "cam": {"frame": [w], "angle": "low"},
              "then": {"at": .45, "cast": [], "fx": [{"kind": "fallen_staff", "at": "center"}, {"kind": "dim"}, {"kind": "tint", "rgb": [.92, .9, 1]}],
                       "cam": {"frame": [], "spot": "center", "angle": "high"}}}
    elif k == "rage":
        w, W = s["who"], s["witnesses"][:2]
        wit = lambda x, sp: {"who": x, "at": sp, "yaw": "away", "pose": "afraid", "mood": "worried", "mouth": "oh", "act": [{"do": "tremble"}]}
        sh = {"set": S("home"), "sky": ["dusk", "fury"], "light": "warm_red",
              "cast": [{"who": w, "at": "center", "pose": ["grief", "fury", .3, .45], "mood": "worried", "mood_to": ["angry", .35], "mouth": "flat", "act": [{"do": "tremble"}]}]
                      + [wit(x, sp) for x, sp in zip(W, ["front_left", "front_right"])],
              "fx": [{"kind": "rings", "on": w, "from": .35}, {"kind": "light", "on": w, "color": "red", "from": .35}, {"kind": "tint", "rgb": [1, .94, .93]}],
              "cam": {"frame": [w] + W}}
    elif k == "demand":
        w = s["who"]
        sh = {"set": S("home"), "sky": ["fury", "fury"], "light": "warm_red",
              "cast": [{"who": w, "at": "center", "pose": ["fury", "point", .1, .3], "mood": "angry", "mouth": "flat", "talk": [.1, .9]}],
              "fx": [{"kind": "rings", "on": w, "from": 0, "size": 2.6}, {"kind": "light", "on": w, "color": "red", "power": 3}, {"kind": "tint", "rgb": [1, .94, .93]}],
              "cam": {"frame": [w], "fit_h": .62}}
    elif k == "send":
        L, G = s["leader"], s["group"][:3]
        cast = [{"who": L, "at": "front", "pose": ["hold", "point", .2, .35]}]
        for w, sp, t0 in zip(G, ["front_left", "front_far", "front_right"], [.62, .65, .68]):
            cast.append({"who": w, "at": sp, "to": "off_left", "walk": [t0, 1], "yaw": "away", "pose": "namaste"})
        sh = {"set": S("kailash"), "sky": ["dusk", "calm"], "cast": cast, "cam": {"frame": [L, G[0], G[-1]], "angle": "high"}}
    elif k == "discover":
        f, Fs = s["found"], s["finders"][:2]
        cast = [{"who": f, "at": "clearing", "yaw": -.8, "act": [{"do": "sway_trunk"}] if f == "elephant" else []}]
        for w, sp, t0, t1 in zip(Fs, ["left", "front_left"], [0, .05], [.6, .62]):
            cast.append({"who": w, "at": "off_left", "to": sp, "walk": [t0, t1], "yaw": 1.3})
        if not cast[0]["act"]: cast[0].pop("act")
        sh = {"set": S("forest"), "sky": ["calm", "calm"], "cast": cast, "cam": {"frame": [f] + Fs}}
    elif k == "reveal":
        w, H = s["who"], s["helpers"][:2]
        sh = {"set": S("home"), "sky": ["calm", "gold"],
              "cast": [{"who": w, "at": "center", "eyes_closed": .75}] + [{"who": h, "at": sp, "yaw": y, "pose": "namaste"} for h, sp, y in zip(H, ["step_left", "step_right"], [1.2, -1.2])],
              "fx": [{"kind": "drops", "from": H, "to": w, "until": .62}, {"kind": "orb_reveal", "who": w, "at": .62}],
              "cam": {"frame": [w] + H, "include_hidden": True}}
    elif k in ("family", "finale"):
        c, r, l = s["center"], s["right"], s["left"]
        fin = k == "finale"
        sh = {"set": S("home"), "sky": ["gold", "dawn" if fin else "gold"],
              "cast": [{"who": c, "at": "center", "act": ([{"do": "lift", "y": .4}] if fin else []) + [{"do": "head_tilt"}]},
                       _bless(r, "right", -.3 if fin else -.45, 0 if fin else .05, .2 if fin else .25),
                       _bless(l, "left", .3 if fin else .4, 0 if fin else .1, .2 if fin else .3)],
              "cam": {"frame": [c, r, l]}}
        if fin: sh["fx"] = [{"kind": "seat", "at": "center"}, {"kind": "petals", "at": "center"}]; sh["cam"]["push"] = -.15
    elif k == "name_card":
        w, G = s["who"], s["group"][:2]
        sh = {"set": S("home"), "sky": ["gold", "gold"],
              "cast": [{"who": w, "at": "center", "act": [{"do": "hop", "height": .04}]}]
                      + [{"who": x, "at": sp, "yaw": y, "pose": "namaste", "act": [{"do": "bow"}]} for x, sp, y in zip(G, ["step_left", "step_right"], [.9, -.9])],
              "fx": [{"kind": "petals", "at": "center"}], "cam": {"frame": [w] + G, "orbit": .25}}
    elif k == "worship":
        w, D = s["who"], s["devotees"][:2]
        sh = {"set": S("home"), "sky": ["gold", "gold"],
              "cast": [{"who": w, "at": "center", "act": [{"do": "lift", "y": .4}]}]
                      + [{"who": x, "at": sp, "yaw": "away", "pose": "namaste", "act": [{"do": "bow", "amount": .35}], "eyes": "closed"} for x, sp in zip(D, ["front_left", "front_right"])],
              "fx": [{"kind": "seat", "at": "center"}, {"kind": "petals", "at": "center"}], "cam": {"frame": [w] + D, "angle": "high"}}
    elif k == "portrait":
        w = s["who"]; c = {"who": w, "at": "front" if S("home") == "kailash" else "center", "mood": s.get("mood", "calm")}
        if s.get("pose"): c["pose"] = ["hold" if w == "shiva" else "rest", s["pose"], .1, .3]
        if s.get("talk", True): c["talk"] = [.1, .9]
        sh = {"set": S("home"), "cast": [c], "cam": {"frame": [w], "fit_h": .62}}
    elif k == "duo":
        a, b = s["a"], s["b"]; sp = s.get("speaker", a)
        L, R = {"kailash": ("front_left", "front_right"), "forest": ("left", "front_left")}.get(S("home"), ("step_left", "step_right"))
        ca = {"who": a, "at": L, "yaw": .45}; cb = {"who": b, "at": R, "yaw": -.45}
        (ca if sp == a else cb)["talk"] = [.1, .9]
        sh = {"set": S("home"), "cast": [ca, cb], "cam": {"frame": [a, b]}}
    else:
        raise ValueError(f"beat {i}: unknown show kind '{k}'. Kinds: {', '.join(KINDS_DOC)}")
    for key in ("sky", "light", "verse"):
        if key in s: sh[key] = s[key]
    if "fx" in s: sh["fx"] = sh.get("fx", []) + s["fx"]
    if "cam" in s: sh["cam"] = {**sh.get("cam", {}), **s["cam"]}
    for c in sh["cast"]:
        if c.get("act") == []: c.pop("act")
    return sh


def from_beats(B):
    """A brief with "beats" (each beat = one spoken line, an optional "show" starts a new scene) -> lines with shots."""
    if "lines" in B and "beats" not in B: return B
    out = []; last = None
    for i, bt in enumerate(B["beats"]):
        L = {x: y for x, y in bt.items() if x not in ("show", "say", "cap", "src", "pause")}
        for key, pre in (("say", ""), ("cap", "cap_"), ("src", "src_")):
            v = bt.get(key)
            if isinstance(v, dict): L.update({pre + lg: t for lg, t in v.items()})
            elif isinstance(v, str) and key == "src": L["src_en"] = L["src_hi"] = v
        if "pause" in bt: L["gap"] = bt["pause"]
        if bt.get("show"): last = expand(bt["show"], i)
        elif i == 0: raise ValueError("beat 0 must have a show (the hook frame)")
        L["shot"] = json.loads(json.dumps(last)); L.setdefault("id", f"b{i:02d}")
        out.append(L)
    B = dict(B); B["lines"] = out; B.pop("beats"); return B


def check(B, today):
    P = []; ids = [L["id"] for L in B["lines"]]
    who_ok = set(APPROVED["characters"])
    if len(set(ids)) != len(ids): P.append("line ids repeat")
    if not (8 <= len(ids) <= 18): P.append(f"{len(ids)} lines: keep a story between 8 and 18 lines (about 45 to 85 s)")
    for l in ("en", "hi"):
        t = B.get("title", {}).get(l)
        if not t or len(t) != 2: P.append(f"title.{l} needs 2 lines")
    if B.get("snake") not in ("neck", "shoulder"): P.append("snake must be neck or shoulder")

    def walk_text(x, path):
        if isinstance(x, str):
            if DASHES.search(x): P.append(f"{path}: has an em/en dash, use a comma or colon")
        elif isinstance(x, dict):
            for k, v in x.items(): walk_text(v, f"{path}.{k}")
        elif isinstance(x, list):
            for i, v in enumerate(x): walk_text(v, f"{path}[{i}]")
    walk_text(B, "brief")

    for i, L in enumerate(B["lines"]):
        p = f"line {L.get('id')}"
        for k in ("en", "hi"):
            if not L.get(k): P.append(f"{p}: missing spoken {k}")
        if i > 0:
            for k in ("cap_en", "cap_hi"):
                if not L.get(k): P.append(f"{p}: missing {k}")
        for k in ("cap_en", "cap_hi"):
            c = L.get(k, "")
            if c.count("*") % 2: P.append(f"{p}: {k} has an unclosed *highlight*")
            for ch in c.split("|"):
                n = len(ch.replace("*", "").replace("#", "").replace("~", "").split())
                if n > 7: P.append(f"{p}: {k} chunk '{ch.strip()}' has {n} words (max 7 per chunk, split with |)")
            words = lambda s: re.sub(r"[*#~|]", " ", s).split()
            spoken = L.get(k[-2:], "")
            if c and len(words(c)) and abs(len(words(c)) - len(spoken.split())) > 3:
                P.append(f"{p}: {k} does not match what is spoken ({len(words(c))} vs {len(spoken.split())} words)")
        if i > 0 and not L.get("no_claim") and not (L.get("src_en") and L.get("src_hi")):
            P.append(f"{p}: needs src_en and src_hi (or \"no_claim\": true for an outro line)")
        S = L.get("shot")
        if not S: P.append(f"{p}: missing shot"); continue
        st = S.get("set", "kailash")
        if st not in SPOTS: P.append(f"{p}: unknown set {st}"); continue
        for s in S.get("sky", []):
            if s not in SKIES: P.append(f"{p}: unknown sky {s}")

        def shot_part(part, pp):
            names = set()
            for c in part.get("cast", []):
                w = c.get("who")
                if w not in who_ok: P.append(f"{pp}: '{w}' is not an approved character ({', '.join(sorted(who_ok))})"); continue
                names.add(w)
                for key in ("at", "to"):
                    v = c.get(key)
                    if v is None and key == "at" and not c.get("seated"): P.append(f"{pp}: {w} has no 'at'")
                    if isinstance(v, str) and v not in SPOTS[st]: P.append(f"{pp}: {w} {key} '{v}' is not a spot in {st}: {sorted(SPOTS[st])}")
                if c.get("seated") and (w != "shiva" or st != "kailash"): P.append(f"{pp}: only Shiva sits, and only on Kailash")
                kind = w if w in ("shiva", "parvati") else "person" if re.match(r"(deva|asura|sage|gana)\d", w) else None
                pose = c.get("pose", "rest"); ps = [pose] if isinstance(pose, str) else pose[:2]
                for q in ps:
                    if kind and q not in POSES[kind]: P.append(f"{pp}: {w} has no pose '{q}' ({sorted(POSES[kind])})")
                    if not kind and q != "rest": P.append(f"{pp}: {w} only has the rest pose")
                if c.get("mood", "calm") not in MOODS: P.append(f"{pp}: mood {c.get('mood')}")
                if c.get("mouth", "smile") not in MOUTHS: P.append(f"{pp}: mouth {c.get('mouth')}")
                for a in c.get("act", []):
                    if a.get("do") not in ACTS: P.append(f"{pp}: unknown act {a.get('do')} ({sorted(ACTS)})")
                    if a.get("do") == "staff" and w != "boy": P.append(f"{pp}: only the boy has a staff")
                    if a.get("do") == "knockback" and not kind == "person": P.append(f"{pp}: knockback is only for devas/asuras/sages/ganas")
            for e in part.get("fx", []):
                if e.get("kind") not in FX: P.append(f"{pp}: unknown fx {e.get('kind')} ({sorted(FX)})")
                for key in ("on", "who", "to"):
                    if isinstance(e.get(key), str) and e[key] not in names and e[key] not in who_ok: P.append(f"{pp}: fx {e['kind']} refers to '{e[key]}'")
            cam = part.get("cam")
            if cam:
                for w in cam.get("frame", []):
                    if w not in names and w not in who_ok: P.append(f"{pp}: camera frames '{w}', who is not in the shot")
                if cam.get("spot") and cam["spot"] not in SPOTS[st]: P.append(f"{pp}: camera spot '{cam['spot']}' is not in {st}")
                if cam.get("angle", "front") not in ANGLES: P.append(f"{pp}: camera angle {cam.get('angle')}")
            elif not part.get("cast") and part is S: P.append(f"{pp}: a shot needs a cast or a cam.frame")
            return names
        shot_part(S, p)
        if S.get("then"): shot_part(S["then"], p + " (then)")
        if "verse" in S:
            for l in ("en", "hi"):
                if len(S["verse"].get(l, [])) != 3: P.append(f"{p}: verse.{l} needs [source, sanskrit, meaning]")

    for q in B.get("pills", []):
        if q.get("line") not in ids: P.append(f"pill {q.get('text')}: unknown line")
        if q.get("on") and q["on"] not in who_ok: P.append(f"pill {q.get('text')}: unknown character {q['on']}")
        for l in ("en", "hi"):
            if not q.get("text", {}).get(l): P.append(f"pill on {q.get('line')}: missing text.{l}")

    srcs = B.get("sources", [])
    if not srcs: P.append("no sources")
    for s in srcs:
        if s.get("fetched") != today: P.append(f"source '{s.get('title')}' was not fetched today ({s.get('fetched')})")
        if not str(s.get("url", "")).startswith("http"): P.append(f"source '{s.get('title')}' has no url")
    covered = {x for s in srcs for x in s.get("supports", [])}
    for L in B["lines"][1:]:
        if not L.get("no_claim") and L["id"] not in covered: P.append(f"line {L['id']}: no fetched source supports it (sources[].supports)")

    for m in B.get("math", []):
        try:
            got = eval(m["expr"], {"__builtins__": {}}, {})
            if str(got) != str(m["expect"]) and not (isinstance(got, float) and abs(got - float(m["expect"])) < 1e-9):
                P.append(f"math '{m['expr']}' = {got}, not {m['expect']}")
        except Exception as e: P.append(f"math '{m.get('expr')}' failed: {e}")

    cv = B.get("cover", {})
    if cv.get("line") not in ids: P.append("cover.line must be a line id")
    for l, tag in (("en", "#kathaclay"), ("hi", "#kathaclayhindi")):
        po = B.get("post", {}).get(l)
        if not po: P.append(f"post.{l} missing"); continue
        try:
            when = dt.datetime.fromisoformat(po["post_at"])
            if when.utcoffset() is None: P.append(f"post.{l}.post_at needs a timezone (+05:30)")
        except Exception: P.append(f"post.{l}.post_at is not an ISO time")
        cap = po.get("instagram_caption", "").rstrip()
        lines = [x for x in cap.split("\n") if x.strip()]
        tags = re.findall(r"#\w+", lines[-1]) if lines else []
        if len(tags) != 5 or tag not in [t.lower() for t in tags]: P.append(f"post.{l}: last caption line must be exactly 5 hashtags including {tag}")
        if len(lines) < 2 or not lines[-2].rstrip().endswith("?"): P.append(f"post.{l}: the line before the hashtags must be a question")
        yt = po.get("youtube_title", "")
        if not yt or len(yt) > 70 or "#" in yt: P.append(f"post.{l}: youtube_title must be under 70 characters, no hashtags")
        d = po.get("youtube_description", "")
        if "Sources:" not in d and "स्रोत:" not in d: P.append(f"post.{l}: youtube_description needs a Sources: list")
        dl = [x for x in d.strip().split("\n") if x.strip()]
        ht = re.findall(r"#\w+", dl[-1]) if dl else []
        if len(ht) != 3 or "#Shorts" not in ht: P.append(f"post.{l}: description must end with exactly 3 hashtags including #Shorts")
    return P


def build(path, today=None):
    B = from_beats(json.load(open(path))); today = today or dt.datetime.now(dt.timezone(dt.timedelta(hours=5, minutes=30))).date().isoformat()
    P = check(B, today)
    W = os.path.join(ROOT, "work", B["id"]); os.makedirs(W, exist_ok=True)
    script = {"lines": [{k: L[k] for k in L if k != "shot"} for L in B["lines"]]}
    spec = {"id": B["id"], "snake": B["snake"], "throat": 2, "title": B["title"], "order": [L["id"] for L in B["lines"]],
            "shots": {L["id"]: L["shot"] for L in B["lines"]}, "pills": B.get("pills", []), "cover": B.get("cover")}
    json.dump(script, open(f"{W}/script.json", "w"), ensure_ascii=False, indent=1)
    json.dump(spec, open(f"{W}/spec.json", "w"), ensure_ascii=False, indent=1)
    json.dump(B, open(f"{W}/brief.json", "w"), ensure_ascii=False, indent=1)
    if P:
        print("BRIEF PROBLEMS:"); [print("  -", x) for x in P]; return False
    print("brief ok ->", W); return True


if __name__ == "__main__":
    sys.exit(0 if build(sys.argv[1], *(sys.argv[2:3])) else 1)
