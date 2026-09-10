# QhCode 产品说明与任务清单

> 基于 Open Cowork 二次封装的桌面 AI 助手  
> 品牌：**QhCode**（晴红出品）  
> 源码目录：`C:\dev\open-cowork`  
> 文档更新日期：2026-09-10（第一版 exe / 双仓发版后）

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
- 大模型推荐默认走晴红中转站（OpenAI 兼容），也允许用户填任意兼容接口

### 产品目标
| 优先级 | 目标 | 状态 |
|--------|------|------|
| P0 | Windows 桌面 App（exe），双击可用 | **已出 v1.0.0** |
| P0 | GUI 填大模型 API Key + 资讯 Key + 行情 Key | 大模型 + MCP 双连接器可用；表单可再优化 |
| P0 | API 设置推荐晴红中转站（打开官网 + 一键填入 Base URL） | **已完成** |
| P0 | 预置 MCP / Skills，欢迎页快捷场景 | **资讯 + 行情均已完成** |
| P0 | 飞书远程控制（沿用 Open Cowork 能力） | 底座自带，待中文开箱文档 |
| P0 | 设置内「联系助理」：微信号 + 二维码 | **已完成** |
| P1 | GitHub Releases + electron-updater | **通道已接**；待客户端侧验证「检查更新」 |
| P1 | 安装包尽量压缩体积 | 当前约 **144MB**；可继续压 |
| P2 | macOS Apple Silicon（M 芯片）安装包 | 未开始 |
| P2 | 更完整的「资讯 + 行情」联合场景 | 未开始 |

### 非目标（当前不做）
- 不做完整炒股交易客户端（不下单）
- 不做个人微信**协议登录 / 微信 bot 扫码遥控电脑**（合规差）；飞书优先做远程
- 不基于 go-stock 大改（GPL + 数据源冲突）
- 不开放任意执行交易策略代码（先做配置型 / 对话型）

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
- [x] 软件免费；API 页推荐晴红中转站（打开官网 + 一键填入 Base URL）
- [x] 设置「帮助与反馈」：微信 `ziyouxiaoqi123` + 二维码 + 闲鱼/淘宝 + 中转站
- [x] 欢迎页「联系助理」入口
- [x] 关闭指向上游 Open Cowork 的自动更新；改为本仓 GitHub Releases
- [x] **Gitee 公开仓（代码，国内）**：https://gitee.com/liudong59/qhcode
- [x] **GitHub 公开仓（代码 + 安装包）**：https://github.com/liudong317/qhcode
- [x] **v1.0.0 安装包**：`QhCode-1.0.0-win-x64.exe` ≈ **144MB**
  - 本机：`E:\文件\QhCode-1.0.0-win-x64.exe`
  - 工程：`C:\dev\open-cowork\release\QhCode-1.0.0-win-x64.exe`
  - 下载：https://github.com/liudong317/qhcode/releases/tag/v1.0.0

### 进行中 / 待验证
- [ ] 客户端「关于 / 检查更新」走 GitHub Releases 的端到端验证
- [ ] 国内用户从 GitHub 下包体感（必要时再加 OSS/CDN 镜像）

### 待办（下一阶段）
- [ ] 设置页：大模型 + 资讯 + 行情 Key 更清晰的表单引导
- [ ] 体积压缩（asar / 资源裁剪）
- [ ] 购后说明：飞书用户文档已写（`QhCode-飞书文档.md`），可再做成 PDF / 发货模板
- [ ] 关于页展示版本号 + 检查更新按钮
- [ ] macOS Apple Silicon
- [ ] 飞书远程中文 5 步文档
- [ ] 资讯×行情联合场景
- [ ] 错误弹窗附「导出日志 + 联系助理」

---

## 六、macOS Apple Silicon（M 芯片）规划

| 项 | 说明 |
|----|------|
| 目标产物 | `QhCode-{version}-mac-arm64.dmg` |
| 构建机 | Apple Silicon Mac 或 CI `macos-14` arm64 |
| 签名公证 | 正式分发建议 Apple Developer + notarize |
| MCP | 与 Win 共用 Node MCP（免 Python） |

**顺序：** Win 稳定 + 自动更新验证 → 再出 Mac。

---

## 七、代码托管与自动更新（已落地结论）

### 7.1 双仓分工（公开）

| 仓 | 用途 | 地址 |
|----|------|------|
| **Gitee** | 国内看代码 / 备份；可挂小附件（yml 等） | https://gitee.com/liudong59/qhcode |
| **GitHub** | **安装包 Releases + electron-updater** | https://github.com/liudong317/qhcode |

账号对应关系（当前）：
- Gitee：`liudong59`
- GitHub：`liudong317`

### 7.2 为什么安装包不放 Gitee？
- Gitee Release **附件上限约 100MB**
- 当前 Win 安装包约 **144MB**，上传被拒
- 故：**exe / blockmap / latest.yml 放在 GitHub Releases**；Gitee 继续放源码

### 7.3 自动更新配置
- `electron-builder.yml` → `publish.provider: github`，`owner: liudong317`，`repo: qhcode`
- 主进程已启用 `electron-updater`（生产包启动检查）
- **不得**再指向上游 `OpenCoworkAI/open-cowork`
- 下一次发版：升 `package.json` version → `npm run build:win` → 上传 GitHub Release（可同时推 Gitee 源码 tag）

### 7.4 发版清单（Windows）
1. 改版本号（如 `1.0.1`）
2. `npm run build:win`（国内需 NSIS 镜像；脚本已默认 `ELECTRON_BUILDER_BINARIES_MIRROR=npmmirror`）
3. 产物：`release/QhCode-{ver}-win-x64.exe` + `latest.yml` + `.blockmap`
4. 推代码到 Gitee + GitHub
5. 在 GitHub 创建 Release（tag `v{ver}`）并上传上述三个文件
6. （可选）Gitee 同步 tag / 发版说明，**不必**强传大 exe

### 7.5 打包踩坑备忘（Windows 本机）
| 问题 | 处理 |
|------|------|
| `better-sqlite3` 需 VS 编译 | `npmRebuild: false` + `scripts/ensure-better-sqlite3.js`（npmmirror 预编译） |
| NSIS 从 GitHub 下载超时 | `ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/` |
| `app-builder-lib` 缺 `templates/nsis/*.yml` | 重装 `app-builder-lib`（不完整安装会导致 NSIS 失败） |
| MCP / Slack 类型文件缺失 | 强制重装对应包后再 `tsc` |

---

## 八、安装包体积与压缩策略

### 现状
- v1.0.0 Win x64 NSIS ≈ **144MB**（已含 Node 运行时 + 双 MCP 等）

### 原则
- 依赖打进安装包（用户无需预装 Node / Python）
- 行情 MCP 用 **Node**，不塞 Python
- 目标：继续压到更舒服区间；若将来压到 **&lt;100MB**，可再评估是否回传 Gitee 附件

### 手段
1. 只打当前平台  
2. asar + after-pack 清理多余原生平台目录  
3. 精简 Skills / 文档资源  
4. 后续：差分更新（blockmap 已生成）

---

## 九、开箱体验（购后）

1. 安装 [QhCode-1.0.0-win-x64.exe](https://github.com/liudong317/qhcode/releases/tag/v1.0.0) → 打开（软件免费）  
2. **设置 → API**：打开晴红中转站 →「一键填入推荐配置」→ 粘贴中转站 Key 并保存  
3. **设置 → MCP 连接器**：  
   - 「晴红资讯」填资讯 Key 并启用  
   - 「晴红行情」填行情 Key 并启用  
4. （可选）飞书远程；卡壳则 **设置 → 帮助** 扫码加微信 `ziyouxiaoqi123`

欢迎页可点：财经早报 / 金十 / 今日涨停 / 大盘指数 / 茅台报价 / 市场情绪。

---

## 十、技术备忘

| 项 | 值 |
|----|-----|
| 底座 | Open Cowork 3.x（MIT） |
| 开发 | `cd C:\dev\open-cowork && npm run dev` |
| 开发端口 | `http://localhost:6173` |
| 打 Win 包 | `npm run build:win` |
| 用户数据 | electron-store `projectName: qinghong` → `%APPDATA%\qinghong\` |
| 中转站常量 | `src/renderer/constants/qinghong-relay.ts` |
| 资讯 MCP | `src/main/mcp/qinghong-finance-server.ts` |
| 行情 MCP | `src/main/mcp/qinghong-market-server.ts` |
| MCP 预置 | `src/main/mcp/mcp-config-store.ts`（晴红资讯 / 晴红行情） |
| Skills | `.claude/skills/qinghong-finance/` · `qinghong-market/` |
| 微信二维码 | `resources/wechat-qr.png` |
| Gitee | https://gitee.com/liudong59/qhcode |
| GitHub | https://github.com/liudong317/qhcode |
| v1.0.0 Release | https://github.com/liudong317/qhcode/releases/tag/v1.0.0 |

---

## 十一、风险与合规

- 界面与文档统一声明：**资讯/行情仅供学习复盘，不构成投资建议**
- Key 仅本机配置，不上传云端
- GPL 项目（如 go-stock）不做商业闭源底座
- 不做个人微信协议登录；展示微信号/二维码属正常客服入口
- 源码已公开（MIT 底座 + 二次开发）；**密钥与业务 Key 不得进仓库**

---

## 十二、里程碑

1. **M1（完成）**：品牌 + 文档 + 资讯 MCP + 帮助页/中转站 + 免费策略  
2. **M2（完成）**：行情 MCP + Win v1.0.0 exe + Gitee/GitHub 双仓 + GitHub Releases  
3. **M3（下一步）**：检查更新验证 + 设置双 Key 引导 + 体积压缩 + 购后说明书  
4. **M4**：macOS arm64  
5. **M5**：资讯×行情联合场景 + 飞书开箱文档  

---

## 十三、销售渠道与相关服务

| 类型 | 说明 |
|------|------|
| 闲鱼 | 程序员317呀 / 行囊鱼777 |
| 淘宝 | 晴红的小店 |
| 微信 | ziyouxiaoqi123 |
| 晴红中转站 | [https://www.qinghong.tech/](https://www.qinghong.tech/) |
| 资讯 API | 热榜 / 快讯 / 全文 / 标的语料 |
| 行情 API | 报价 / K 线 / 情绪资金 / 财务因子 |
| QhCode 下载 | [GitHub Releases v1.0.0](https://github.com/liudong317/qhcode/releases/tag/v1.0.0) |
| QhCode | 免费桌面入口；变现靠中转站 + 资讯/行情 Key + 私域 |

数据供学习复盘，不构成投资建议；据此操作风险自担。
