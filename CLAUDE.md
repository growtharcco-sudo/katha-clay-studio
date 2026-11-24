# Katha Clay studio

Owner: Samrit (address him as Samrit). Sacred Hindu stories in cute 3D clay animation, English + Hindi.
Daily work: follow ROUTINE.md. The scene kinds and brief format are documented at the top of pipeline/kit.py.

## Rules that never change
- Religious accuracy first: every line backed by scripture fetched the same day. If unsure, leave it out.
- Only characters in engine/approved.json. Their look (colours, hands, tusk, trunk side) is fixed in engine/src.
- Voice: Kokoro hm_psi for both languages (free). Never slow a voice below 0.97x; pad pauses instead.
- Quality: 1080x1920, 30 fps, CRF 14 (render.py). Never lower it to save size or time.
- No em or en dashes in any text, caption, title or description.
- Never post directly. GitHub Actions posts at post_at, public, with the AI label (Instagram) and
  containsSyntheticMedia (YouTube). Tokens live only in GitHub Secrets: never in files, chat or logs.
- Keep messages to Samrit short and simple, one recommendation, no jargon.

## New characters
A story that needs someone not in approved.json (Kartikeya, Vishnu, Ganga, Hanuman...) waits. Build the
character in engine/src in the same clay style from scripture iconography, render 3 stills (front, side, with
Shiva or Parvati for scale), send them to Samrit with the iconography sources, and add the name to
approved.json only after he says yes.

## Files
briefs/ (what you write) -> work/<id>/ (built, not committed) -> stories/<id>/ (handed to render.yml)
-> media branch + queue/<id>_<lang>/post.json -> post.yml publishes at post_at.
