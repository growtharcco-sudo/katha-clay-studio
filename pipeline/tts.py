"""Kokoro (Apache-2.0) phonemes + pronunciation fixes for names.
ADD A FIX here whenever a new name is mispronounced (key = espeak output, value = how it should sound)."""
import sys, os, json, unicodedata
import numpy as np, soundfile as sf
VOICE = ""
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.environ.get("KC_MODELS", os.path.join(HERE, "models"))
FIX = {
 "en": {  # espeak output -> how the name should be said
  "ʃˈiːvəz": "ʃˈɪvəz", "ʃˈiːvə": "ʃˈɪvə", "dˈɛvᵻs": "dˈeɪvəz", "ɐsjˈʊɹɹəz": "ˈʌsʊɹəz", "æmɹˈiːɾə": "ˈʌmɹɪtə",
  "mændˈɑːɹɹə": "mˈʌndəɹə", "vˈæsuːki": "vˈɑːsʊki", "hˌælɐhˈɑːlə": "hˈɑːləhˌɑːlə", "kˈaɪlæʃ": "kaɪlˈɑːʃ",
  "mˌæhɐbhɐɹˈɑːɾə": "məhˌɑːbˈɑːɹətə", "niːlkˈænθə": "nˈiːlkˌʌntə", "bˈæɡɐvˌæɾæm": "bˈʌɡəvətˌʌm",
  "hˈɑːɹ hˈɑːɹ mˈæheɪdəv": "hˈʌɹ hˈʌɹ məhˌɑːdˈeɪv",
  "ɡˈeɪnʃə": "ɡənˈeɪʃə", "mˈɑːɾə": "mˈɑːtɑː", "pɑːɹvˈɑːɾi": "pˈɑːɾvəti", "ɡˈɑːnəz": "ɡˈʌnəz", "ɡˌænɐpˈɑːɾi": "ɡˈʌnəpəti",
  "ɡænpˈɑːɾi bˈæpə mˈɔːɹɪə": "ɡˈʌnpəti bˈʌppɑː mˈoːɾjɑː", "dᵻfˈiːɾᵻd": "dɪfˈiːtɪd", "fjˈʊɹɹi": "fjˈʊɹi", "dɪdnˌɑːt": "dˈɪd nˈɑːt", "pˈɑːɾvəti": "pˈɑːrvəti", "bˈæk,": "bˈæk,",
  "vˈɪɡnɐhˌɑːɹɾə": "vˈɪɡnəhˌʌɾtɑː", "dˈɜːvə": "dˈuːɾvɑː", "ʃɹˈaɪ ɡˈeɪnʃeɪə nˈæmə": "ʃɾˈiː ɡəɳˈeːʃɑːjə nˈʌməhə"},
 "hi": {
  "kːjˈõkɪ": "kjˈõːki", "kːjˈõ": "kjˈõː", "dˌeːʋtˈaːw": "dˌeːʋtˈaːõ", "mahˈaːbhaːɾˌat": "məhˈaːbʰaːɾət",
  "pˈʌr. ɡˈʌjaː": "pˈʌɽ ɡˈʌjaː", "nɪlkˈanʈʰ": "nˈiːlkˌʌɳʈʰ", "ʃɾˌiːmdbʰˈaːɡəʋˌət": "ʃɾˌiːməd bʰˈaːɡəʋət",
  "ˈaːtmaːj": "ˈaːtmaːẽː", "sʋˈʌjən": "sʋˈʌjəm", "mˌahaːdˈeʋ": "məhaːdˈeːʋ", " ki ": " kiː ", " ki": " kiː",
  "kʃˌiːɾsˈaːɡəɾ": "kʃˈiːɾ sˈaːɡəɾ", "mˌəndəɾˈaːcəl": "mˌəndəɾˈaːtʃəl", "hˈʌɾ hˈʌɾ": "hˈəɾ hˈəɾ",
  "kiːː": "kiː", "ɡˈʌɳəptɪ": "ɡˈəɳəpəti", "cʰˈɪr.kˌaː": "tʃʰˈɪɽkaː", "kʰˈʌr.aː": "kʰˈəɽaː", "bˈʌpːaː mˈoːɾjˌaː": "bˈəppaː mˈoːɾjaː",
  "ɡˌəɳeːʃˈaːj nˈʌməh": "ɡəɳˈeːʃaːjə nˈʌməhə"},
}

def phon(k, text, lang):
    p = unicodedata.normalize("NFC", k.tokenizer.phonemize(text, "en-us" if lang == "en" else "hi"))
    for a, b in FIX[lang].items():
        p = p.replace(unicodedata.normalize("NFC", a), unicodedata.normalize("NFC", b))
    if lang == "en" and VOICE.startswith("h"):   # Hindi-trained voice reading English: Indian-English r sounds
        p = p.replace("ɜː", "ʌɾ").replace("ɚ", "əɾ").replace("hˈʌɹ hˈʌɹ", "hˈəɾ hˈəɾ")
    p = unicodedata.normalize("NFD", p)
    lost = [c for c in p if c not in k.tokenizer.vocab]
    if lost: print("  WARNING dropped symbols:", set(lost), file=sys.stderr)
    return p

