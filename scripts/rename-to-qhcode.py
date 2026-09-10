from pathlib import Path

OLD_VARIANTS = [
    "晴红 / Qinghong Code",
    "Qinghong Code",
    "晴红 Qinghong",
]
NEW = "QhCode"

files = [
    Path(r"C:\dev\open-cowork\src\renderer\components\WelcomeView.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\Sidebar.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\SettingsPanel.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\ChatView.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\settings\SettingsGeneral.tsx"),
    Path(r"C:\dev\open-cowork\src\main\index.ts"),
    Path(r"C:\dev\open-cowork\index.html"),
    Path(r"C:\dev\open-cowork\electron-builder.yml"),
    Path(r"C:\dev\open-cowork\package.json"),
]

for p in files:
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8")
    orig = t
    for old in OLD_VARIANTS:
        if old in t:
            t = t.replace(old, NEW)
            print(f"{p.name}: {old!r} -> {NEW}")
    # productName / app naming
    if p.name == "electron-builder.yml":
        t = t.replace("productName: Qinghong", "productName: QhCode")
        t = t.replace("productName: QhCode Code", "productName: QhCode")  # safety
        t = t.replace("com.qinghong.app", "com.qinghong.qhcode")
        t = t.replace("name: 'Qinghong.app'", "name: 'QhCode.app'")
        t = t.replace("name: 'QhCode Code.app'", "name: 'QhCode.app'")
        t = t.replace("name: 'Qinghong Code.app'", "name: 'QhCode.app'")
    if p.name == "package.json":
        t = t.replace('"name": "qinghong"', '"name": "qhcode"')
        if "QhCode" not in t and "description" in t:
            pass
    if p.name == "index.html":
        t = t.replace("<title>QhCode</title>", "<title>QhCode</title>")
        if "<title>" in t and "QhCode" not in t.split("<title>")[1].split("</title>")[0]:
            import re
            t = re.sub(r"<title>.*?</title>", "<title>QhCode</title>", t)
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print(f"wrote {p.name}")
    else:
        print(f"no change {p.name}")

# verify UI
for p in [
    Path(r"C:\dev\open-cowork\src\renderer\components\WelcomeView.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\Sidebar.tsx"),
]:
    t = p.read_text(encoding="utf-8")
    for bad in ["Open Cowork", "Qinghong Code", "晴红 /"]:
        if bad in t:
            print("STILL", p.name, bad)
print("done")
