from pathlib import Path

p = Path(r"C:\dev\open-cowork\src\renderer\i18n\locales\en.json")
t = p.read_text(encoding="utf-8")

reps = [
    ('"title": "How can I help you today?"', '"title": "What market intel can I pull for you?"'),
    (
        '"placeholder": "Describe what you\'d like to do..."',
        '"placeholder": "e.g. Jin10 flash, finance briefing, Moutai docs..."',
    ),
    ('"createFile": "Create a file"', '"createFile": "Finance briefing"'),
    ('"crunchData": "Crunch data"', '"crunchData": "Jin10 flash"'),
    ('"organizeFiles": "Organize files"', '"organizeFiles": "Weibo hot radar"'),
    ('"checkEmails": "Check emails"', '"checkEmails": "Cninfo notices"'),
    ('"searchPapers": "Search & summarize papers"', '"searchPapers": "Symbol docs"'),
    ('"summarizePapersToNotion": "Summarize papers to Notion"', '"summarizePapersToNotion": "Finance batch"'),
    ('"logoAlt": "Open Cowork logo"', '"logoAlt": "QingHu logo"'),
    (
        '"firstRunSubtitle": "Configure a provider to start using Open Cowork"',
        '"firstRunSubtitle": "Configure a model provider; set Qinghong key for finance tools"',
    ),
    (
        '"remoteDesc": "Use Open Cowork from Feishu and other channels"',
        '"remoteDesc": "Use QingHu from Feishu and other channels"',
    ),
    (
        '"disclaimer": "Open Cowork is AI-powered and may make mistakes. Please double-check responses."',
        '"disclaimer": "QingHu is AI-powered and may make mistakes. News is not investment advice."',
    ),
    (
        '"apiNotConfigured": "API is not configured yet. Please go to Settings to fill in an API provider and key."',
        '"apiNotConfigured": "Configure a model provider first, then set QINGHONG_API_KEY on the Qinghong MCP connector."',
    ),
]

for a, b in reps:
    if a in t:
        t = t.replace(a, b, 1)
        print("ok", b[:60])
    else:
        print("miss", a[:60])

p.write_text(t, encoding="utf-8")
print("done")
