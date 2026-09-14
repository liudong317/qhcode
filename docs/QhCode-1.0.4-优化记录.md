# QhCode 1.0.4 优化记录

日期：2026-09-14  
版本：1.0.3 → **1.0.4**  
范围：先能用（MCP 卫生 + Windows bash + 找文件工具 + 工作目录 + 狐狸图标）  
**未做**：浏览器产品化、OS 级沙箱重写、对标 WorkBuddy 全家桶。打包等审核后再打。

## 为什么做

实测里软件几乎是哑巴：读文件可以，列目录 / 跑命令 / 晴红 MCP 都挂。主卖点（资讯 + A 股行情 Key）和自用办公（docx/xlsx/pptx）都跑不起来。

本轮只修挡路的手和脚，不和大厂比功能清单。

## 改了什么

1. **MCP 路径卫生**  
   安装版不再沿用 `%APPDATA%\qhcode` 里残留的 `C:\dev\open-cowork\dist-mcp\...` 开发路径。启动时把晴红资讯 / 行情 / GUI 等内置 MCP 脚本钉到 `resources/mcp/*.js`。  
   关键文件：`src/main/mcp/builtin-mcp-paths.ts`、`mcp-config-store.ts`、`mcp-manager.ts`、`agent-runner.ts`。

2. **Windows bash**  
   默认用 `System32\cmd.exe`，补 `SystemRoot` / `ComSpec` 等系统环境变量；忽略 WSL 的 `System32\bash.exe`（它经常 exit 1 且没输出）。  
   关键文件：`src/main/agent/windows-bash-operations.ts`。

3. **找文件工具**  
   pi 自带的 `createCodingTools()` 只有 read / bash / edit / write。现补 **ls / grep / find**，并加 **glob 别名**。对目录误用 `read` 不再丢裸 EISDIR，会提示改用 `ls`。  
   关键文件：`src/main/agent/coding-tools.ts`。

4. **工作目录**  
   `defaultWorkdir` 为空时，写入并使用 `%APPDATA%\qhcode\default_working_dir`，同时设置 `COWORK_WORKDIR`。新会话不再 cwd 对不上。

5. **桌面狐狸图标**  
   `resources/icon.png` 本来就是小狐狸，但 `signAndEditExecutable: false` 导致 exe 仍是 Electron 原子图标。已改为打包时打 ico，并在 afterPack 再盖一次图标。覆盖安装后若桌面仍是旧图，刷新一下图标缓存即可。

## 你升级后要做的（手动）

软件**不会**擅自打开 MCP（没 Key 开了也会失败）：

1. 设置 → MCP 连接器 → 晴红资讯 / 晴红行情  
2. 填 Key，启用，看连接状态  
3. 新开一轮对话，试：`echo hello`、列目录、查一支股票

## 明确没做

Playwright / 内嵌浏览器、完整权限引擎重写、执行树、Skill 市场、升 pi 版本。

## 仓库

- GitHub：https://github.com/liudong317/qhcode  
- Gitee：https://gitee.com/liudong59/qhcode  
