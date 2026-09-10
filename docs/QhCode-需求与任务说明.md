# QhCode 产品说明与任务清单

> 基于 Open Cowork 二次封装的桌面 AI 助手  
> 品牌：**QhCode**（晴红出品）  
> 源码目录：`C:\dev\open-cowork`  
> 文档更新日期：2026-09-10（**当前发版 v1.0.3**；今晚计划打 Mac M）

---

## 一、背景与目标

### 痛点
- 已有两套 API：
  1. **晴红资讯 / 50+ 平台**（热榜、财经快讯、全文、标的语料等）
  2. **晴红行情**（A 股报价、日 K、情绪、资金、龙虎榜、基本面等）
- 很多买家不会用 HTTP / curl / MCP，售后成本高。
- 希望做一个可发货的 **桌面 GUI**，自然语言即可调用能力，并绑定私域续费。

### 商业策略（已拍板）
- **QhCode 软件本身免费**（获客 / 降低使用门槛 / 绑定私域）
- 变现靠：**大模型中转站 Key** + **资讯 Key** + **行情 Key** + 微信售后续费
- 大模型：**任意厂商 / 中转 / 自建均可**；晴红中转站仅作可选示例一键填入，**不写死 Base URL**

### 产品目标
| 优先级 | 目标 | 状态 |
|--------|------|------|
| P0 | Windows 桌面 App（exe），双击可用 | **已出 v1.0.3** |
| P0 | GUI 填大模型 API Key + 资讯 Key + 行情 Key | 大模型 + MCP 双连接器可用；OpenAI 页可改 Base URL |
| P0 | API 设置可选推荐晴红中转站（不锁死） | **已完成** |
| P0 | 预置 MCP / Skills，欢迎页快捷场景 | **资讯 + 行情均已完成** |
| P0 | 设置内「联系助理」：微信号 + 二维码 | **已完成** |
| P0 | 任务栏 / 窗口狐狸图标 | **v1.0.1 已修** |
| P1 | GitHub Releases + electron-updater | **通道已接**；待验证检查更新 |
| P1 | 安装包尽量压缩体积 | 当前约 **204MB**（1.0.1）；待压 |
| P0→P1 | **macOS Apple Silicon（M 芯片）** | **今晚回家做**（见第六节清单） |
| P2 | 飞书远程中文开箱 + 资讯×行情联合场景 | 未开始 |

### 非目标（当前不做）
- 不做完整炒股交易客户端（不下单）
- 不做个人微信**协议登录 / 微信 bot 扫码遥控电脑**（合规差）；飞书优先做远程
- 不基于 go-stock 大改（GPL + 数据源冲突）
- 不开放任意执行交易策略代码（先做配置型 / 对话型）
- 产品显示名保持 **QhCode**（不是 IDE / ADE）

---

## 二、品牌与命名

| 项 | 约定 |
|----|------|
| 显示名 | **QhCode** |
| 产品全称（文案可用） | 晴红 QhCode |
| appId | `com.qinghong.qhcode` |
| npm / 包名 | `qhcode` |
| 安装包名 | `QhCode-{version}-win-x64.exe` / `QhCode-{version}-mac-arm64.dmg` |
| 狐狸 IP | logo / favicon 继续用现有狐狸图 |
| 旧名废弃 | 晴狐、QingHu、Qinghong Code、Open Cowork（界面不得再出现） |

---

## 三、能力范围（两套 API）

### 3.1 资讯 API（已接入）
- 基址：`http://124.223.180.129:3220`
- Header：`X-API-Key`
- 环境变量：`QINGHONG_API_KEY`（连接器名「晴红资讯」）
- Key 前缀：标准 `bobo_sk_` · 月 Pro `bobo_sk_pro_` · 年卡 `bobo_sk_year_`
- 热榜 / 财经 42 源 / 归档 / Pro 全文·标的·文书·联播等
- 状态页：`https://status.xiaobao317.site/`
- 在线调试（Apifox）：`https://oljdijncb6.apifox.cn/`
- 客户端：`src/main/mcp/qinghong-finance-server.ts` + Skill `qinghong-finance`

### 3.2 行情 API（已接入 Node MCP）
- 基址：`https://api.qinghong888.cc.cd`
- Header：`X-API-Key`
- 环境变量：`QINGHONG_MARKET_API_KEY`（连接器名「晴红行情」）
- Key 前缀：试用 `sk-qh-trial-` · 标准 `sk-market-` · Pro `sk-market-pro-`
- 官方 Python MCP（参考）：`https://api.qinghong888.cc.cd/mcp/qinghong_market_mcp.py`
- 客户端：`src/main/mcp/qinghong-market-server.ts`（与官方工具对齐）+ Skill `qinghong-market`

**已暴露工具（与官方 MCP 对齐）：**  
`qh_me` · `qh_cn_quote` · `qh_cn_indices` · `qh_cn_kline` · `qh_cn_limit_up` · `qh_cn_sentiment` · `qh_cn_fundamentals` · `qh_cn_finance` · `qh_cn_lhb` · `qh_cn_dayfund` · `qh_cn_futures_quote`

### 3.3 接入结论（已落地）

| 方式 | 状态 |
|------|------|
| **MCP** | 资讯 + 行情均已内置 Node 进程，设置里可填 Key |
| **Skill** | `qinghong-finance` / `qinghong-market` 已预置 |
| **欢迎页快捷** | 早报/金十（资讯）+ 涨停/指数/报价/情绪（行情） |

设置 → **MCP 连接器**：
- 「晴红资讯」→ `QINGHONG_API_KEY`
- 「晴红行情」→ `QINGHONG_MARKET_API_KEY`

> 说明：早期只有文档/Skill、没有行情 MCP 进程时，界面无法稳定填行情 Key；现已预置「晴红行情」连接器。

---

## 四、联系方式与微信二维码（私域）

### 4.1 对外联系（固定写进产品与文档）

| 渠道 | 内容 |
|------|------|
| **微信（主）** | `ziyouxiaoqi123`（加好友请备注：QhCode / 资讯 / 行情 / 续费） |
| **晴红中转站（大模型）** | 官网 [https://www.qinghong.tech/](https://www.qinghong.tech/) · Base URL `https://www.qinghong.tech/v1` |
| 闲鱼 | 搜：程序员317呀 或 行囊鱼777 |
| 淘宝 | 晴红的小店 |
| 用途 | 购 Key、续费、报 bug、提需求、远程指导（若套餐含） |

### 4.2 二维码位置

| 位置 | 状态 |
|------|------|
| **设置 → 帮助与反馈** | **已接入**（主入口） |
| 欢迎页「联系助理」 | **已接入** |
| 欢迎页大图常驻二维码 | 不做 |

**素材：** `resources/wechat-qr.png` + `src/renderer/assets/wechat-qr.png`

### 4.3 App 内文案示例（设置 → 帮助）

```
联系助理
微信：ziyouxiaoqi123（点击复制）
[二维码图片]
晴红中转站：https://www.qinghong.tech/（大模型 Key）
用途：续费 / 开通 Key · 报 bug · 提需求 · 使用指导
加好友请备注：QhCode
```

---

## 五、已完成 / 进行中 / 待办

### 已完成
- [x] 选定底座：Open Cowork（非 Pi / 非 go-stock 主线）
- [x] 源码 `C:\dev\open-cowork`，开发模式可跑 GUI（端口 `6173`）
- [x] 品牌 **QhCode** + 狐狸 logo / icon
- [x] 预置资讯 MCP + Skill `qinghong-finance`
- [x] 预置行情 MCP（Node）+ Skill `qinghong-market` + 连接器可填 Key
- [x] 欢迎页快捷：资讯（早报/金十）+ 行情（涨停/指数/报价/情绪）
- [x] 软件免费；API 页可选晴红中转站示例（**不写死** Base URL；OpenAI 页可改链接）
- [x] 设置「帮助与反馈」：微信 `ziyouxiaoqi123` + 二维码 + 闲鱼/淘宝 + 中转站
- [x] 欢迎页「联系助理」入口
- [x] 关闭指向上游 Open Cowork 的自动更新；改为本仓 GitHub Releases
- [x] **Gitee 公开仓（代码，国内）**：https://gitee.com/liudong59/qhcode
- [x] **GitHub 公开仓（代码 + 安装包）**：https://github.com/liudong317/qhcode
- [x] **v1.0.3 安装包**（保留；已删旧版）：`QhCode-1.0.3-win-x64.exe`
  - 本机：`E:\文件\QhCode-1.0.3-win-x64.exe`
  - 工程：`C:\dev\open-cowork\release\QhCode-1.0.3-win-x64.exe`
  - 下载：https://github.com/liudong317/qhcode/releases/tag/v1.0.3
- [x] v1.0.1：任务栏狐狸图标
- [x] v1.0.2：保存设置不再把自定义 Base URL 改回 `api.openai.com`
- [x] v1.0.3：Windows 重打包发版（当前推荐安装此版）

### 进行中 / 今晚
- [ ] **macOS Apple Silicon（M）安装包**（今晚回家做，见第六节）
- [ ] 客户端「关于 / 检查更新」端到端验证
- [ ] 体积压缩（1.0.1 偏大）

### 待办（下一阶段）
- [ ] 设置页：大模型 + 资讯 + 行情 Key 更清晰的表单引导
- [ ] 购后说明 PDF / 发货模板（飞书文档已有）
- [ ] 关于页展示版本号 + 检查更新按钮
- [ ] 飞书远程中文 5 步文档
- [ ] 资讯×行情联合场景
- [ ] 错误弹窗附「导出日志 + 联系助理」
- [ ] 国内用户从 GitHub 下包体感（必要时 OSS/CDN 镜像）

---

## 六、macOS Apple Silicon（M 芯片）— 今晚回家做

| 项 | 说明 |
|----|------|
| 目标产物 | `QhCode-{version}-mac-arm64.dmg`（建议与 Win 同版本号，或 `1.0.1` / `1.1.0`） |
| 构建机 | **必须用 Apple Silicon Mac**（或 CI：`macos-14` arm64 runner） |
| 源码 | 先 `git pull` Gitee 或 GitHub：`liudong59/qhcode` / `liudong317/qhcode` |
| electron-builder | 已有 `mac` 段；打 `arm64`；图标用 `resources/icon.icns` |
| 签名公证 | 有 Apple Developer 证书则 notarize；否则用户需「仍要打开」 |
| 沙箱 | MVP 可先关重沙箱，保证对话 + MCP |
| Node | 需 `darwin-arm64` 的 Node（`npm run download:node` 在 Mac 上拉） |
| MCP | 与 Win 共用 Node MCP（资讯/行情），**不要依赖 Python** |
| better-sqlite3 | Mac 上用对应 Electron ABI 预编译或本机 rebuild |
| 发版 | 上传 GitHub Release：`dmg` + `latest-mac.yml` + blockmap |

### 今晚建议步骤（简版）
1. Mac 上装 Node ≥22，克隆/拉最新 `main`
2. `npm ci`（或 `npm install`）
3. 确认 `resources/icon.icns`、狐狸品牌资源齐全
4. `npm run build` / 或 `npx electron-builder --mac dir` / `dmg`（按本机脚本）
5. 本地打开验证：任务栏/Dock 狐狸图标、API Base URL 可改、资讯/行情 MCP
6. 打 tag → 上传 GitHub Releases（与 Win 并列）
7. 更新飞书文档增加「Mac 下载」一节

**注意：** Windows 本机打不出真正的 Mac arm64 正式包；今晚务必在 M 芯片机器上编。

---

## 七、代码托管与自动更新（已落地结论）

### 7.1 双仓分工（公开）

| 仓 | 用途 | 地址 |
|----|------|------|
| **Gitee** | 国内看代码 / 备份 | https://gitee.com/liudong59/qhcode |
| **GitHub** | **安装包 Releases + electron-updater** | https://github.com/liudong317/qhcode |

账号：Gitee `liudong59` · GitHub `liudong317`

### 7.2 为什么安装包不放 Gitee？
- Gitee Release **附件上限约 100MB**
- 当前 Win 安装包约 **204MB（1.0.1）**，放不下
- 故：大安装包只放 **GitHub Releases**；Gitee 放源码  
- 本机 Git 推 GitHub 若 443 失败，可用 `ghproxy.net` 等代理推送（已验证可行）

### 7.3 自动更新配置
- `electron-builder.yml` → `publish.provider: github`，`owner: liudong317`，`repo: qhcode`
- 主进程已启用 `electron-updater`
- **不得**再指向上游 `OpenCoworkAI/open-cowork`

### 7.4 发版清单（Windows）
1. 改 `package.json` version  
2. `npm run build:win`  
3. 产物：`release/QhCode-{ver}-win-x64.exe` + `latest.yml` + `.blockmap`  
4. 推 Gitee + GitHub；GitHub Release 上传三件套  
5. **删除本机旧版 exe**，只留当前版（已执行：保留 1.0.1，删 1.0.0）

### 7.5 打包踩坑备忘（Windows）
| 问题 | 处理 |
|------|------|
| `better-sqlite3` 需 VS | `npmRebuild: false` + `ensure-better-sqlite3.js` |
| NSIS 下载超时 | `ELECTRON_BUILDER_BINARIES_MIRROR=npmmirror` |
| 任务栏 Electron 原子图标 | 把 `icon.ico` 打进 `extraResources` + `setAppUserModelId` |
| Base URL 像写死 | OpenAI 页展示可编辑 Base URL；中转站仅为可选示例 |

---

## 八、安装包体积与压缩策略

### 现状
- v1.0.1 Win x64 NSIS ≈ **204MB**（偏大，后续优先压缩）
- 旧版 v1.0.0 已从本机删除，以 1.0.1 为准

### 原则
- 依赖打进安装包（用户无需预装 Node / Python）
- 行情 MCP 用 **Node**
- 目标：压到更舒服区间；&lt;100MB 前不要指望挂 Gitee 附件

---

## 九、开箱体验（购后）

1. 安装 [QhCode-1.0.3-win-x64.exe](https://github.com/liudong317/qhcode/releases/tag/v1.0.3) → 打开（软件免费）  
2. **设置 → API**：选提供商 → 填 Key + **可改的 Base URL** → 保存（可选：一键填入晴红示例，仍可改）  
3. **设置 → MCP 连接器**：资讯 Key + 行情 Key 并启用  
4. 卡壳 → **设置 → 帮助** 微信 `ziyouxiaoqi123`

欢迎页：财经早报 / 金十 / 今日涨停 / 大盘指数 / 茅台报价 / 市场情绪。

---

## 十、技术备忘

| 项 | 值 |
|----|-----|
| 底座 | Open Cowork 3.x（MIT） |
| 当前版本 | **1.0.3** |
| 开发 | `cd C:\dev\open-cowork && npm run dev` |
| 开发端口 | `http://localhost:6173` |
| 打 Win 包 | `npm run build:win` |
| AppUserModelId | `com.qinghong.qhcode` |
| 用户数据 | `%APPDATA%\qinghong\` |
| 中转站常量 | `src/renderer/constants/qinghong-relay.ts`（仅示例） |
| 资讯 / 行情 MCP | `qinghong-finance-server.ts` / `qinghong-market-server.ts` |
| 飞书用户文档 | `E:\文件\QhCode-飞书文档.md` · 仓库 `docs/QhCode-飞书文档.md` |
| Gitee / GitHub | 见第七节 |
| 当前 Win Release | https://github.com/liudong317/qhcode/releases/tag/v1.0.3 |

---

## 十一、风险与合规

- 界面与文档统一声明：**资讯/行情仅供学习复盘，不构成投资建议**
- Key 仅本机配置，不上传云端
- GPL 项目不做商业闭源底座
- 源码已公开；**密钥不得进仓库**

---

## 十二、里程碑

1. **M1（完成）**：品牌 + 文档 + 资讯 MCP + 帮助页/中转站 + 免费策略  
2. **M2（完成）**：行情 MCP + Win 安装包 + 双仓 + Releases  
3. **M2.1（完成）**：v1.0.1 狐狸图标 · v1.0.3 Base URL 保存修复  
4. **M3（今晚）**：**macOS arm64（M 芯片）**  
5. **M4**：检查更新验证 + 体积压缩 + 购后完善  
6. **M5**：资讯×行情联合 + 飞书远程开箱  

---

## 十三、销售渠道与相关服务

| 类型 | 说明 |
|------|------|
| 闲鱼 | 程序员317呀 / 行囊鱼777 |
| 淘宝 | 晴红的小店 |
| 微信 | ziyouxiaoqi123 |
| 晴红中转站 | [https://www.qinghong.tech/](https://www.qinghong.tech/)（可选，不强制） |
| 资讯 / 行情 API | 见第三节 |
| QhCode 下载（Win） | [Releases v1.0.3](https://github.com/liudong317/qhcode/releases/tag/v1.0.3) |
| QhCode | 免费桌面入口；变现靠 Key + 私域 |

数据供学习复盘，不构成投资建议；据此操作风险自担。
