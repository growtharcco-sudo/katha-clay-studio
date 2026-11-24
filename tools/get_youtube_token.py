"""One-time, once per channel: get a YouTube refresh token. Run on your Mac.
  python3 get_youtube_token.py en      (sign in, pick Katha Clay)
  python3 get_youtube_token.py hi      (sign in, pick Katha Clay Hindi)
It uses the NEWEST client_secret*.json in your Downloads folder (or a path you give)."""
import glob, json, os, sys
from google_auth_oauthlib.flow import InstalledAppFlow

args = sys.argv[1:]
lang = next((a for a in args if a.lower() in ("en", "hi")), None)
if not lang: sys.exit("Add en or hi at the end, for example:  python3 get_youtube_token.py en")
files = [a for a in args if a.endswith(".json")] or glob.glob(os.path.expanduser("~/Downloads/client_secret*.json"))
if not files: sys.exit("No client_secret*.json found in Downloads")
path = max(files, key=os.path.getmtime)
cfg = json.load(open(path)); cfg = cfg.get("installed") or cfg.get("web")
print("Using", os.path.basename(path), "(created", __import__("time").ctime(os.path.getmtime(path)) + ")")
flow = InstalledAppFlow.from_client_secrets_file(path, ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"])
creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")
print("\nAdd these in GitHub > Settings > Secrets and variables > Actions:\n")
print("YT_CLIENT_ID     =", cfg["client_id"])
print("YT_CLIENT_SECRET =", cfg["client_secret"])
print()
print(f"Secret name:  YT_REFRESH_TOKEN_{lang.upper()}")
print("Secret value (copy the whole next line):")
print(creds.refresh_token)
