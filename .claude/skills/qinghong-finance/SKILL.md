---
name: qinghong-finance
description: 晴红财经资讯与热榜助手。用于拉金十/财联社/热榜、做财经早报、查巨潮公告或标的资料。
---

# 晴红 · 财经情报

使用前确认 MCP「晴红资讯」已启用，且环境变量 `QINGHONG_API_KEY` 已填写（设置 → MCP 连接器）。

## 常用说法

- 「测一下 Key」→ `check_key`
- 「拉金十最新」→ `get_source` id=`jin10`
- 「财经一键批量 / 做早报」→ `finance_entire`，再整理成中文早报
- 「微博热榜含茅台」→ `get_source` id=`weibo` searchkey=`茅台|白酒`
- 「查 600519 巨潮公告」→ `get_source` id=`cninfo-latest` stock=`600519`
- 「查贵州茅台资讯资料」→ `symbol_docs` name=`贵州茅台`（Pro）

## 注意

- 本服务是资讯/热榜/正文，不是实时股价或 K 线。
- 路径只能用 `/api/s?id=`，不要猜 `/v1/weibo/hot` 这类路径。
- 新闻联播 `cctv-news` 不要放进批量 `batch_sources`。
