# QhCode 版本更新记录

> 源码目录：`C:\dev\open-cowork`  
> 文档日期：2026-09-14  
> **当前版本：1.0.4（Windows）**  
> **平台：当前仅发 Win x64；macOS 后续版本再更新（未排期）**

详细单版说明见：`docs/QhCode-1.0.4-优化记录.md`（及以后各版优化记录）。

---

## 一、仓库与推送路径

| Remote 名 | 平台 | 用途 | URL |
|-----------|------|------|-----|
| `github` | GitHub（主仓） | 开源 + **安装包 Releases** + 自动更新 | `https://github.com/liudong317/qhcode.git` |
| `origin` | Gitee（镜像） | 国内看代码 / 备份 | `https://gitee.com/liudong59/qhcode.git` |

网页入口：

- GitHub：https://github.com/liudong317/qhcode  
- Releases：https://github.com/liudong317/qhcode/releases  
- 当前 Win：https://github.com/liudong317/qhcode/releases/tag/v1.0.4  
- Gitee：https://gitee.com/liudong59/qhcode  

本机 remote 查看：

```bash
cd C:\dev\open-cowork
git remote -v
```

应类似：

```text
github  https://github.com/liudong317/qhcode.git (fetch/push)
origin  https://gitee.com/liudong59/qhcode.git (fetch/push)
```

### 推送代码（双仓）

```bash
cd C:\dev\open-cowork
git push origin main    # → Gitee
git push github main    # → GitHub
```

若 GitHub 443 失败，可走代理后再 `git push github main`（本机曾用 `ghproxy` 等验证可行）。

### 发版产物路径

| 项 | 路径 |
|----|------|
| 工程产物目录 | `C:\dev\open-cowork\release\` |
| Win 安装包 | `C:\dev\open-cowork\release\QhCode-{version}-win-x64.exe` |
| 更新清单 | `release\latest.yml` + `.blockmap` |
| 本机常用安装目录（示例） | `F:\qhcode\` |
| 用户数据 | `%APPDATA%\qhcode\` |

安装包只上传 **GitHub Releases**（Gitee 附件约 100MB 上限，装不下）。

### 发版最小步骤

1. 改 `package.json` 的 `version`，写本版优化记录  
2. `npm run build:win`  
3. `git push origin main` + `git push github main`  
4. GitHub Release 上传：`exe` + `latest.yml` + `.blockmap`  
5. 更新本文「版本一览」与飞书用户文档里的下载链接  

---

## 二、版本一览

| 版本 | 日期 | 一句话 |
|------|------|--------|
| **1.0.4** | 2026-09-14 | 修好 Agent「手和脚」：MCP 路径、Windows 命令、找文件工具、工作目录、狐狸图标落盘 |
| **1.0.3** | 2026-09-10 | Windows 重打包发版（当时推荐安装版） |
| **1.0.2** | 2026-09 | 保存设置时不再把自定义 Base URL 改回 `api.openai.com` |
| **1.0.1** | 2026-09 | 任务栏/窗口狐狸图标；AppUserModelId；API Base URL 可编辑 |
| **1.0.0** | 2026-09 | 首发：双仓、资讯+行情 MCP、Win 安装包、自动更新指本仓 |

---

## 三、各版改了什么

### 1.0.4（当前）

**要解决的问题：** 软件几乎是哑巴——能读文件，但列目录 / 跑命令 / 晴红 MCP 常挂。

| 项 | 说明 |
|----|------|
| MCP 路径卫生 | 安装版内置 MCP（资讯/行情/GUI 等）钉到 `resources/mcp/*.js`，不再沿用 `%APPDATA%` 里残留的 `C:\dev\open-cowork\dist-mcp\...` |
| Windows bash | 默认 `System32\cmd.exe`，补系统环境变量；忽略易空失败的 WSL `bash.exe` |
| 找文件工具 | 补 **ls / grep / find**（+ glob 别名）；目录误用 read 会提示改用 ls |
| 工作目录 | `defaultWorkdir` 空时写入 `%APPDATA%\qhcode\default_working_dir` |
| 狐狸图标 | 打包 `signAndEditExecutable` + afterPack 盖 ico；覆盖后若快捷方式仍是旧图，清图标缓存或重建快捷方式 |
| 产物 | `QhCode-1.0.4-win-x64.exe`（约 216MB） |

**升级后请手动：** 设置 → MCP → 晴红资讯/行情 → 填 Key 并启用 → 新开对话试命令与查股。

**本版明确没做：** Playwright/内嵌浏览器、完整权限引擎重写、执行树、Skill 市场、升 pi；**亦无 macOS 安装包**（Mac 留给后续版本再更新）。

详文：`docs/QhCode-1.0.4-优化记录.md`

### 1.0.3

- Windows 再次打正式包并作为当时推荐下载版  
- 文档 / Releases 指向 `v1.0.3`  
- 功能相对 1.0.2 无大改，主要是发版与文档对齐  

### 1.0.2

- 修复：保存 API 设置时，自定义 / 中转站 Base URL 被写回 OpenAI 预设地址  
- 保证「选提供商后仍可改 Base URL」真正落盘  

### 1.0.1

- 修复任务栏仍显示 Electron 原子图标：打入 `icon.ico`、`setAppUserModelId(com.qinghong.qhcode)`  
- API 页 Base URL 可编辑；晴红中转站仅作可选一键示例，不锁死  

### 1.0.0

- 品牌 QhCode + 狐狸 IP  
- 预置晴红资讯 / 晴红行情 MCP + Skills + 欢迎页快捷  
- 设置「帮助与反馈」微信与二维码  
- 双仓：GitHub（包）+ Gitee（码）  
- 自动更新改为本仓 GitHub Releases（不再指向上游 Open Cowork）  

---

## 四、与其它文档的关系

| 文档 | 给谁看 | 内容 |
|------|--------|------|
| `QhCode-版本更新记录.md`（本文） | 自己 / 开发 | 各版变更 + 双仓推送路径 |
| `QhCode-1.0.x-优化记录.md` | 自己 | 单版详细改动 |
| `QhCode-需求与任务说明.md` | 自己 | 产品目标、任务、发版清单 |
| `QhCode-飞书文档.md` | 买家 | 下载安装与填 Key 说明（勿写推送命令；Mac 写「后续版本再更新」） |

---

## 五、平台口径（防催单）

| 场景 | 建议写法 | 避免写法 |
|------|----------|----------|
| 仓库 / 飞书 / 买家 | 当前仅 **Windows**；**macOS 后续版本再更新** | 「正在准备」「今晚出」「很快有」 |
| 对内备忘 | 保留 Mac 构建清单，状态标 **未排期** | 写成「进行中」却没有任何进度 |
