from pathlib import Path

BRAND = "晴红 / Qinghong Code"
OLD = "Open Cowork"

files = [
    Path(r"C:\dev\open-cowork\src\renderer\components\WelcomeView.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\Sidebar.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\SettingsPanel.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\ChatView.tsx"),
    Path(r"C:\dev\open-cowork\src\renderer\components\settings\SettingsGeneral.tsx"),
    Path(r"C:\dev\open-cowork\src\main\index.ts"),
    Path(r"C:\dev\open-cowork\index.html"),
]

for p in files:
    t = p.read_text(encoding="utf-8")
    n = t.count(OLD)
    if n:
        t = t.replace(OLD, BRAND)
        p.write_text(t, encoding="utf-8")
        print(f"{p.name}: replaced {n}")

# product / window naming
eb = Path(r"C:\dev\open-cowork\electron-builder.yml")
t = eb.read_text(encoding="utf-8")
t = t.replace("productName: Qinghong", "productName: Qinghong Code")
t = t.replace("name: 'Qinghong.app'", "name: 'Qinghong Code.app'")
eb.write_text(t, encoding="utf-8")
print("electron-builder updated")

idx = Path(r"C:\dev\open-cowork\index.html")
t = idx.read_text(encoding="utf-8")
t = t.replace("<title>晴红 Qinghong</title>", f"<title>{BRAND}</title>")
t = t.replace("<title>晴红 / Qinghong Code</title>", f"<title>{BRAND}</title>")
idx.write_text(t, encoding="utf-8")
print("index.html title:", [line for line in idx.read_text(encoding="utf-8").splitlines() if "title" in line][0])

# verify UI leftovers
for p in files:
    t = p.read_text(encoding="utf-8")
    if OLD in t:
        print("STILL HAS", p)
print("ok")
