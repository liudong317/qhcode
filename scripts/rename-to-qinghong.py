from pathlib import Path
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

reps = {
    Path(r"C:\dev\open-cowork\index.html"): [
        ("晴狐 QingHu", "晴红 Qinghong"),
        ("QingHu", "Qinghong"),
    ],
    Path(r"C:\dev\open-cowork\package.json"): [
        ('"name": "qinghu"', '"name": "qinghong"'),
        ("晴狐 QingHu", "晴红 Qinghong"),
        ("QingHu Team", "Qinghong Team"),
        ("QingHu", "Qinghong"),
        ("qinghu", "qinghong"),
    ],
    Path(r"C:\dev\open-cowork\electron-builder.yml"): [
        ("com.qinghu.app", "com.qinghong.app"),
        ("productName: QingHu", "productName: Qinghong"),
        ("晴狐 QingHu", "晴红 Qinghong"),
        ("QingHu needs", "Qinghong needs"),
        ("name: 'QingHu.app'", "name: 'Qinghong.app'"),
        ("QingHu", "Qinghong"),
    ],
    Path(r"C:\dev\open-cowork\src\renderer\i18n\locales\zh.json"): [
        ("晴狐标志", "晴红标志"),
        ("远程使用晴狐", "远程使用晴红"),
        ("晴狐由 AI", "晴红由 AI"),
        ("晴狐", "晴红"),
    ],
    Path(r"C:\dev\open-cowork\src\renderer\i18n\locales\en.json"): [
        ("QingHu logo", "Qinghong logo"),
        ("Use QingHu from", "Use Qinghong from"),
        ("QingHu is AI-powered", "Qinghong is AI-powered"),
        ("QingHu", "Qinghong"),
    ],
    Path(r"C:\dev\open-cowork\src\main\config\config-store.ts"): [
        ("qinghu", "qinghong"),
    ],
    Path(r"C:\dev\open-cowork\src\main\mcp\mcp-config-store.ts"): [
        ("qinghu", "qinghong"),
    ],
    Path(r"C:\dev\open-cowork\src\main\index.ts"): [
        ("QingHu fork", "Qinghong fork"),
        ("QingHu", "Qinghong"),
    ],
    Path(r"C:\dev\open-cowork\src\main\agent\agent-runner.ts"): [
        ("晴狐 (QingHu)", "晴红 (Qinghong)"),
        ("晴狐", "晴红"),
        ("QingHu", "Qinghong"),
    ],
}

for path, pairs in reps.items():
    t = path.read_text(encoding="utf-8")
    for a, b in pairs:
        c = t.count(a)
        if c:
            t = t.replace(a, b)
            print(f"{path.name}: replaced {c} x")
    path.write_text(t, encoding="utf-8")

# verify
for p in [
    Path(r"C:\dev\open-cowork\electron-builder.yml"),
    Path(r"C:\dev\open-cowork\package.json"),
    Path(r"C:\dev\open-cowork\index.html"),
]:
    text = p.read_text(encoding="utf-8")
    bad = [w for w in ["晴狐", "QingHu", "qinghu"] if w in text]
    print(p.name, "BAD" if bad else "OK", bad)
