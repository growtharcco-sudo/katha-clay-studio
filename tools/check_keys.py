"""Check that the Instagram and YouTube keys work, for English and Hindi. Reads account info only; posts nothing.
Prints account names and IDs, never secret values."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "poster"))
import requests
import accounts

ok = True
tok = accounts.env("IG_TOKEN")


def shape(name, v):
    """Describe a secret's shape without revealing it."""
    notes = []
    if name == "IG_TOKEN" and not v.startswith("EAA"): notes.append("should start with EAA (system user token)")
    if name.startswith("IG_USER_ID") and not v.isdigit(): notes.append("should be only digits")
    if name == "YT_CLIENT_ID" and not v.endswith(".apps.googleusercontent.com"): notes.append("should end with .apps.googleusercontent.com")
    if name == "YT_CLIENT_SECRET" and not v.startswith("GOCSPX-"): notes.append("usually starts with GOCSPX-")
    if name.startswith("YT_REFRESH_TOKEN") and not v.startswith("1//"): notes.append("usually starts with 1//")
    print(f"  {name}: " + ("not set" if not v else f"{len(v)} characters" + (" -> " + "; ".join(notes) if notes else " -> looks right")))


print("Secrets (shape only, never the value):")
for n in ("IG_TOKEN", "IG_USER_ID_EN", "IG_USER_ID_HI", "YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN_EN", "YT_REFRESH_TOKEN_HI"):
    shape(n, accounts.env(n))

if tok:
    # list every Instagram account this token can reach (handy for filling IG_USER_ID_EN / _HI)
    r = requests.get("https://graph.facebook.com/v26.0/me/accounts",
                     params={"fields": "name,instagram_business_account{id,username}", "access_token": tok}, timeout=30)
    print("\nInstagram accounts this token can post to:")
    for pg in (r.json().get("data", []) if r.ok else []):
        ig = pg.get("instagram_business_account")
        print(f"  Page '{pg.get('name')}' ->", f"@{ig['username']}  id {ig['id']}" if ig else "no Instagram account linked")
    if not r.ok: print("  could not list:", r.status_code, r.text[:300]); ok = False

for lang in accounts.LANGS:
    accounts.use(lang); L = lang.upper()
    print(f"\n== {('English' if lang == 'en' else 'Hindi')} ==")
    uid = os.environ.get("IG_USER_ID")
    if tok and uid:
        import instagram
        r = requests.get(f"{instagram._base(tok)}/{uid}", params={"fields": "username,name", "access_token": tok}, timeout=30)
        print("Instagram:", f"OK, @{r.json().get('username', '?')} (id {uid})" if r.ok else f"FAILED {r.status_code} {r.text[:300]}")
        ok &= r.ok
    else:
        print(f"Instagram: IG_USER_ID_{L} not set yet"); ok = False
    if os.environ.get("YT_REFRESH_TOKEN"):
        try:
            import youtube
            title, handle = youtube.channel_name()
            print(f"YouTube: OK, channel '{title}' ({handle})")
        except Exception as e:
            print("YouTube: FAILED", str(e)[:300]); ok = False
    else:
        print(f"YouTube: YT_REFRESH_TOKEN_{L} not set yet"); ok = False

print("\nALL KEYS OK" if ok else "\nSOMETHING IS MISSING OR WRONG (see above)")
sys.exit(0 if ok else 1)
