from PIL import Image
from pathlib import Path
import shutil

src = Path(r"E:\文件\logo.png")
out_dir = Path(r"C:\dev\open-cowork\resources")
out_dir.mkdir(parents=True, exist_ok=True)
img = Image.open(src).convert("RGBA")

img.resize((512, 512), Image.Resampling.LANCZOS).save(out_dir / "icon.png")

sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
icons = [img.resize(s, Image.Resampling.LANCZOS) for s in sizes]
icons[0].save(out_dir / "icon.ico", format="ICO", sizes=sizes, append_images=icons[1:])

shutil.copy(r"E:\文件\favicon.ico", out_dir / "favicon-user.ico")

targets = [
    Path(r"C:\dev\open-cowork\src\renderer\assets\logo.png"),
    Path(r"C:\dev\open-cowork\public\logo.png"),
    Path(r"C:\dev\open-cowork\public\favicon.png"),
]
for p in targets:
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.name == "favicon.png":
        img.resize((64, 64), Image.Resampling.LANCZOS).save(p)
    else:
        img.resize((512, 512), Image.Resampling.LANCZOS).save(p)

print("icons ok", (out_dir / "icon.ico").stat().st_size, (out_dir / "icon.png").stat().st_size)
