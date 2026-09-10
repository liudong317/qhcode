from pathlib import Path

p = Path(r"C:\dev\open-cowork\src\renderer\i18n\locales\en.json")
t = p.read_text(encoding="utf-8")
old = '''    "general": "General",
    "generalDesc": "Appearance, language, and general preferences"
  },
  "general": {'''
# try alternate phrasings
alts = [
('''    "general": "General",
    "generalDesc": "Appearance, language, and preferences"
  },
  "general": {'''),
('''    "general": "General",
    "generalDesc": "Appearance, language, and general preferences"
  },
  "general": {'''),
]
new = '''    "general": "General",
    "generalDesc": "Appearance, language, and preferences",
    "help": "Help & Feedback",
    "helpDesc": "WeChat support, shops, and bug reports"
  },
  "help": {
    "assistantTitle": "Contact assistant",
    "assistantDesc": "Scan the QR code or add WeChat for renewals, bug reports, feature requests, and setup help.",
    "remarkTip": "When adding, please remark: QhCode (or news / market / renew)",
    "qrAlt": "WeChat QR code for ziyouxiaoqi123",
    "wechatLabel": "WeChat ID",
    "copy": "Copy",
    "copied": "Copied",
    "useBug": "Report bugs / issues",
    "useRenew": "Renew or unlock news / market API keys",
    "useFeature": "Feature requests and custom APIs",
    "useGuide": "Usage guidance and Feishu remote setup",
    "channelsTitle": "Purchase & contact channels",
    "channelWechat": "WeChat",
    "channelXianyu": "Xianyu",
    "channelTaobao": "Taobao",
    "wechatHint": "Primary support channel — WeChat ID: ziyouxiaoqi123",
    "xianyuHint": "Search shop names to order; Key is sent in private chat",
    "taobaoHint": "Taobao shop: Qinghong store",
    "disclaimer": "News and market data are for study only, not investment advice. You bear your own risk.",
    "docsHint": "API docs ship with purchase materials; QhCode makes them usable in the desktop app."
  },
  "general": {'''
ok = False
for a in alts:
    if a in t:
        t = t.replace(a, new, 1)
        ok = True
        print("replaced")
        break
if not ok:
    # show nearby
    i = t.find('"general": "General"')
    print("NOT FOUND nearby:", repr(t[i:i+120]))
else:
    p.write_text(t, encoding="utf-8")
    print("ok")
