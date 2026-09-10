# QhCode 产品说明与任务清单

> 基于 Open Cowork 二次封装的桌面 AI 助手  
> 品牌：**QhCode**（晴红出品）  
> 源码目录：`C:\dev\open-cowork`  
> 文档更新日期：2026-09-10

---

## 一、背景与目标

### 痛点
- 已有两套 API：
  1. **晴红资讯 / 50+ 平台**（热榜、财经快讯、全文、标的语料等）
  2. **晴红行情**（A 股报价、日 K、情绪、板块、资金、龙虎榜、基本面等）
- 很多买家不会用 HTTP / curl / MCP，售后成本高。
- 希望做一个可发货的 **桌面 GUI**，自然语言即可调用能力，并绑定私域续费。

### 商业策略（已拍板）
- **QhCode 软件本身免费**（获客 / 降低使用门槛 / 绑定私域）
- 变现靠：**大模型中转站 Key** + **资讯 Key** + **行情 Key** + 微信售后续费
- 大模型推荐默认走晴红中转站（OpenAI 兼容），也允许用户填任意兼容接口

### 产品目标
| 优先级 | 目标 |
|--------|------|
| P0 | Windows 桌面 App（exe），双击可用 |
| P0 | GUI 填大模型 API Key + 资讯 Key + 行情 Key |
| P0 | API 设置推荐晴红中转站（打开官网 + 一键填入 Base URL） |
| P0 | 预置 MCP / Skills，欢迎页快捷场景 |
| P0 | 飞书远程控制（沿用 Open Cowork 能力） |
| P0 | 设置内「联系助理」：微信号 + 二维码（报 bug / 续费 / 需求） |
| P1 | Gitee / GitHub **Releases** + electron-updater 提示升级（发版阶段再建仓即可） |
| P1 | 安装包尽量压缩体积 |
| P2 | macOS Apple Silicon（M 芯片）安装包 |
| P2 | 更完整的「资讯 + 行情」联合场景 |

### 非目标（当前不做）
- 不做完整炒股交易客户端（不下单）
- 不做个人微信**协议登录 / 微信 bot 扫码遥控电脑**（合规差）；飞书优先做远程
- 不基于 go-stock 大改（GPL + 数据源冲突）
- 不开放任意执行交易策略代码（先做配置型 / 对话型）
- **当前不必**为了开发立刻公开上传完整源码到 GitHub（见第七节）

---

## 二、品牌与命名

| 项 | 约定 |
|----|------|
| 显示名 | **QhCode** |
| 产品全称（文案可用） | 晴红 QhCode |
| appId | `com.qinghong.qhcode` |
| 安装包名 | `QhCode-{version}-win-x64.exe` / `QhCode-{version}-mac-arm64.dmg` |
| 狐狸 IP | logo / favicon 继续用现有狐狸图 |
| 旧名废弃 | 晴狐、QingHu、Qinghong Code、Open Cowork（界面不得再出现） |

---

## 三、能力范围（两套 API）

### 3.1 资讯 API（已接入方向）
- 基址：`http://124.223.180.129:3220`
- Header：`X-API-Key`
- Key 前缀：标准 `bobo_sk_` · 月 Pro `bobo_sk_pro_` · 年卡 `bobo_sk_year_`
- 热榜 / 财经 42 源 / 归档 / Pro 全文·标的·文书·联播等
- 状态页：`https://status.xiaobao317.site/`
- 在线调试（Apifox）：`https://oljdijncb6.apifox.cn/`
- 客户端侧：内置 **晴红资讯 MCP** + Skill `qinghong-finance`

### 3.2 行情 API（已接入 Node MCP）
- 基址：`https://api.qinghong888.cc.cd`
- Header：`X-API-Key`
- 报价 / 指数 / 日 K / 涨停 / 情绪 / 基本面 / 龙虎榜 / 资金(Pro) / 期货报价等
- Key 前缀：试用 `sk-qh-trial-` · 标准 `sk-market-` · Pro `sk-market-pro-`
- 官方 Python MCP（参考）：`https://api.qinghong888.cc.cd/mcp/qinghong_market_mcp.py`
- 客户端侧：内置 **晴红行情 MCP**（Node）+ Skill `qinghong-market`
- 设置 → MCP 连接器 →「晴红行情」填 `QINGHONG_MARKET_API_KEY`

### 3.3 接入方式结论（行情怎么加）

| 方式 | 作用 | 建议 |
|------|------|------|
| **MCP** | 真正调行情接口，对话可「拉茅台报价」 | **必须加**（与资讯并列） |
| **Skill** | 告诉模型何时用哪个工具、怎么汇总 | **建议加**（已加薄 Skill） |
| **仅提示词 / 欢迎按钮** | 引导用户说正确话术 | **可加**，但不能替代 MCP |

**结论：行情以 MCP 为主，Skill + 欢迎页快捷按钮为辅。**  
只写 Skill/提示词而不加 MCP，模型无法稳定调用你的行情 API。

推荐工具白名单（MVP）：
- `quote` / `indices` / `limit-up` / `sentiment` / `sectors` / `fundamentals` / `lhb` / `kline(1d)`  
Pro 再暴露：`dayfund` / `finance` / `stock-basic`

设置页建议两个 Key 字段：
- `QINGHONG_NEWS_API_KEY`（资讯）
- `QINGHONG_MARKET_API_KEY`（行情）

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

### 4.2 要不要二维码？放哪里？

**需要。** 微信号 alone 容易输错；二维码降低售后摩擦，也方便「加助理报 bug / 提需求」。

| 位置 | 是否推荐 | 说明 |
|------|----------|------|
| **设置 → 关于 / 帮助与反馈** | **强烈推荐（主入口）** | 标题如「联系助理」：展示二维码 + 微信号可复制 + 说明「报 bug / 续费 / 需求」 |
| 首次配置完成页 / API 未配置提示旁 | 可选 | 小字「遇到问题？微信联系助理」点开弹层出二维码，避免欢迎页太花 |
| 欢迎页主视觉大图常驻二维码 | **不推荐** | 干扰「先填 Key、先对话」主路径 |
| 报错弹窗底部 | 可选（后期） | 「复制日志 + 扫码反馈」 |
| 购后发货文案 / 说明书 PDF | 推荐 | 与 App 内一致 |

**素材状态：** 已放入 `resources/wechat-qr.png` + 渲染端 `src/renderer/assets/wechat-qr.png`，设置「帮助与反馈」展示。  
二维码变更时替换图片并发版即可（可选后续做成远程 URL，非必须）。

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
- [x] 拉源码到 `C:\dev\open-cowork`，开发模式可跑 GUI
- [x] 换狐狸 logo / icon
- [x] 预置资讯 MCP + Skill `qinghong-finance`
- [x] Skill `qinghong-market`（话术层；MCP 待接）
- [x] 欢迎页财经快捷场景（资讯向）
- [x] 关闭指向上游 Open Cowork 的自动更新
- [x] 开发端口改为 `6173`
- [x] 界面品牌改为 **QhCode**
- [x] 本需求文档（含微信 / 二维码规划 / Mac）
- [x] 设置「帮助与反馈」：微信 `ziyouxiaoqi123` + 二维码 + 闲鱼/淘宝渠道
- [x] 欢迎页「联系助理」入口；打包资源含 `resources/wechat-qr.png` / logo
- [x] 商业策略：软件免费；API 设置推荐晴红中转站（打开官网 + 一键填入 Base URL）
- [x] 内置行情 MCP（Node）+ 预置「晴红行情」连接器（可填 Key）
- [x] 欢迎页行情快捷：涨停 / 指数 / 报价 / 情绪
- [x] Gitee 公开仓：https://gitee.com/liudong59/qhcode （空仓推送后改公开）

### 进行中
- [ ] 打 Windows x64 安装包（第一版 exe）
- [ ] 上传 Releases + 验证 electron-updater

### 待办（Windows 发货前）
- [ ] 设置页：大模型 Key + 资讯 Key + 行情 Key（表单引导可再优化）
- [ ] electron-builder 产品名 / appId / 图标统一 QhCode（部分已改）
- [ ] 体积压缩：精简 resources、asar、去掉无用平台资源
- [ ] 购后说明：填 Key 三步走 + 飞书可选 + 微信助理
- [ ] 关于页展示版本号 + 检查更新按钮

### 待办（后续）
- [ ] macOS Apple Silicon（见第六节）
- [ ] 飞书远程开箱文档（中文 5 步）
- [ ] 联合场景：资讯早报 + 行情涨停同屏汇总
- [ ] 可选：Web 精简工作台（不会装桌面的用户）
- [ ] 错误弹窗附「导出日志 + 联系助理」

---

## 六、macOS Apple Silicon（M 芯片）规划

Open Cowork / Electron 本身支持 macOS arm64。后续单独开里程碑即可。

| 项 | 说明 |
|----|------|
| 目标产物 | `QhCode-{version}-mac-arm64.dmg` |
| 构建机 | 建议用 Apple Silicon Mac（或 CI：`macos-14` arm64 runner） |
| electron-builder | `mac.target` + `arch: [arm64]` |
| 签名公证 | 正式分发建议 Apple Developer 证书 + notarize；否则用户需「仍要打开」 |
| 沙箱差异 | Lima / GUI 自动化在 Mac 上路径不同，MVP 可先关掉重沙箱，保证对话 + MCP |
| Node 内置 | 需打包 `darwin-arm64` 的 Node，与 Win 的 `win32-x64` 分开 |
| 行情/资讯 MCP | 与 Win 共用逻辑；**行情 MCP 用纯 Node**（避免 Mac 再依赖 Python） |

**建议顺序：** 先稳定 Win exe → 验证自动更新 → 再出 Mac M 版。

---

## 七、自动更新与代码托管

### 7.1 自动更新（已拍板）
采用：**Gitee 或 GitHub Releases + electron-updater**。

流程：
1. 发版上传：`QhCode-x.y.z-win-x64.exe` + `latest.yml`（Mac 另有 `latest-mac.yml`）
2. 客户端启动检查版本，有新版本则提示「发现新版本，是否更新」
3. `publish` **不得**再指向上游 `OpenCoworkAI/open-cowork`

国内优先：**Gitee Releases** 或自有 OSS + CDN（下载更快）。

### 7.2 现在要不要先上传 GitHub？
| 时机 | 建议 |
|------|------|
| **现在（开发中）** | **不必**。当前 `C:\dev\open-cowork` 甚至还没 `git init`；优先行情 MCP + Win 安装包 |
| **本机备份** | 建议尽快本地 `git init` + 私有远程（Gitee/GitHub Private），防丢代码；**可不公开** |
| **发第一版 exe 前后** | 再建 **Releases 仓**（可仅放安装包，不必开源全部二次开发细节）并接 electron-updater |
| **是否公开源码** | 可选。底座 MIT 允许；公开会暴露定制逻辑与竞品可见度，默认 **私有仓 + 公开发布安装包** 更稳 |

结论：**GitHub/Gitee 不是现在卡点；M3 发版更新时再建即可。国内用户下载优先 Gitee。**

---

## 八、安装包体积与压缩策略

### 原则
- 依赖 **打进安装包**（用户无需预装 Node）
- 尽量压缩；安装后释放到用户目录 / resources 即可
- 目标体感：安装包 **尽量压到 ~120–180MB**（视裁剪程度）

### 压缩手段
1. 只打当前平台（Win 包不含 Mac/Linux Node）
2. asar 打包渲染进程与主逻辑
3. 去掉开发资源、测试、多余 Skills（保留 qinghong-* + 必要文档类）
4. 行情 MCP 优先 **Node 内置**，避免再塞 Python 运行时
5. 可选：NSIS 压缩、差分更新（后续）

官方 Open Cowork Win 约 120MB 级；我们加 MCP/Skills 后预计 **150–250MB**，压缩后争取落在可接受区间。

---

## 九、开箱体验（购后）

1. 安装 QhCode → 打开（软件免费）  
2. **设置 → API**：点「打开晴红中转站」注册/充值 →「一键填入推荐配置」→ 粘贴中转站 Key 并保存（也可用其他兼容接口）  
3. **设置 → MCP / 连接器**：填资讯 Key、行情 Key 并启用  
4. （可选）飞书远程；卡壳则 **设置 → 帮助**：扫码加微信 `ziyouxiaoqi123`

欢迎页快捷：资讯向（早报/金十/热榜/巨潮/标的）+ 行情向（报价/涨停/指数，待 MCP 就绪后启用）。

---

## 十、技术备忘

| 项 | 值 |
|----|-----|
| 底座 | Open Cowork 3.x（MIT） |
| 开发命令 | `cd C:\dev\open-cowork && npm run dev` |
| 开发端口 | `http://localhost:6173` |
| 用户数据 | 当前 electron-store `projectName: qinghong` → `%APPDATA%\qinghong\`（包名已是 `qhcode`，是否改目录可发版前再定） |
| 中转站常量 | `src/renderer/constants/qinghong-relay.ts` |
| 行情 MCP | `src/main/mcp/qinghong-market-server.ts` |
| 资讯 MCP | `src/main/mcp/qinghong-finance-server.ts` |
| 资讯 Skill | `.claude/skills/qinghong-finance/` |
| 行情 Skill | `.claude/skills/qinghong-market/` |
| 微信二维码 | `resources/wechat-qr.png`（已接入帮助页） |
| 代码托管 | https://gitee.com/liudong59/qhcode |

---

## 十一、风险与合规

- 界面与文档统一声明：**资讯/行情仅供学习复盘，不构成投资建议**
- Key 仅本机配置，不上传云端
- GPL 项目（如 go-stock）不做商业闭源底座
- 不做个人微信协议登录；**展示微信号/二维码加人**属于正常客服入口，与「微信 bot」不同

---

## 十二、里程碑建议

1. **M1（基本完成）**：QhCode 品牌 + 文档 + 资讯 MCP + 帮助页微信/二维码/渠道 + **免费 + 中转站推荐**  
2. **M2（进行中）**：行情 MCP（已完成）+ Win 第一版安装包 + Gitee Releases 更新  
3. **M3**：设置双 Key 引导优化 + 体积压缩  
4. **M4**：macOS arm64  
5. **M5**：资讯×行情联合场景与飞书开箱文档  

---

## 十三、销售渠道与相关服务

| 类型 | 说明 |
|------|------|
| 闲鱼 | 程序员317呀 / 行囊鱼777 |
| 淘宝 | 晴红的小店 |
| 微信 | ziyouxiaoqi123 |
| 晴红中转站 | [https://www.qinghong.tech/](https://www.qinghong.tech/)（大模型，软件免费配套） |
| 资讯 API | 热榜 / 快讯 / 全文 / 标的语料 |
| 行情 API | 报价 / K 线 / 情绪资金 / 财务因子 |
| QhCode | 免费桌面入口；变现靠中转站 + 资讯/行情 Key + 私域 |

数据供学习复盘，不构成投资建议；据此操作风险自担。
