"""Katha Clay posts to two sets of accounts: English (@kathaclay) and Hindi (@kathaclayhindi).

GitHub Secrets (values never printed):
  IG_TOKEN                          one Meta system-user token (EAA...) that has both Instagram accounts as assets
  IG_USER_ID_EN, IG_USER_ID_HI      the two Instagram account IDs
  YT_CLIENT_ID, YT_CLIENT_SECRET    the existing Google Cloud OAuth client
  YT_REFRESH_TOKEN_EN, _HI          one refresh token per YouTube channel (pick that channel at sign-in)
"""
import os

LANGS = ("en", "hi")


def clean(v):
    """Secrets pasted from a terminal sometimes carry a label ("NAME = ...") or quotes/spaces: strip them."""
    v = (v or "").strip()
    if "=" in v[:40] and v.split("=", 1)[0].strip().replace("_", "").isalnum() and v.split("=", 1)[0].strip().isupper():
        v = v.split("=", 1)[1].strip()
    return v.strip().strip('"').strip("'").strip()


def env(name):
    return clean(os.environ.get(name, ""))


def use(lang):
    """Point the generic variables (IG_USER_ID, YT_REFRESH_TOKEN) at this language's account."""
    s = lang.upper()
    for k in ("IG_USER_ID", "YT_REFRESH_TOKEN"):
        v = env(f"{k}_{s}")
        if v: os.environ[k] = v
        else: os.environ.pop(k, None)
    for k in ("IG_TOKEN", "YT_CLIENT_ID", "YT_CLIENT_SECRET"):
        if os.environ.get(k): os.environ[k] = env(k)
