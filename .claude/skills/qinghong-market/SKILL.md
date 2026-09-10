---
name: qinghong-market
description: 晴红 A 股行情助手。用于近时报价、大盘指数、涨停池、情绪板块、基本面、日K（需配置行情 Key）。
---

# 晴红 · 行情

使用前确认 MCP「晴红行情」已启用，环境变量 `QINGHONG_MARKET_API_KEY` 已填写。
基址默认：`https://api.qinghong888.cc.cd`

## 常用说法

- 「拉茅台报价」→ `qh_cn_quote` symbols=`600519`
- 「大盘指数和成交额」→ `qh_cn_indices`
- 「今日涨停」→ `qh_cn_limit_up`
- 「市场情绪」→ `qh_cn_sentiment`
- 「查 600519 基本面」→ `qh_cn_fundamentals`
- 「茅台日K」→ `qh_cn_kline` period=`1d`
- 「龙虎榜」→ `qh_cn_lhb`
- 「日线资金（Pro）」→ `qh_cn_dayfund`

## 注意

- 本服务是行情 / K 线 / 资金情绪，不是热榜快讯（资讯用另一套 MCP）。
- 上证与成交额用 indices，不要 `quote?symbols=000001`（那是平安银行）。
- 分钟线 / Level-2 不走本 API（501）。
- 数据仅供学习复盘，不构成投资建议。
