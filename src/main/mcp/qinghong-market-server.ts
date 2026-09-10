/**
 * Qinghong Market MCP Server
 * 晴红 · A 股行情 / 指数 / 涨停 / 情绪 / 基本面 / 日K
 *
 * Env:
 *   QINGHONG_MARKET_API_KEY  (preferred)  or QINGHONG_API_KEY
 *   QINGHONG_MARKET_BASE_URL (optional)   default https://api.qinghong888.cc.cd
 *
 * Mirrors official Python MCP:
 *   https://api.qinghong888.cc.cd/mcp/qinghong_market_mcp.py
 */

import { type CallToolResult, type ListToolsResult, Server } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

const BASE_URL = (
  process.env.QINGHONG_MARKET_BASE_URL ||
  process.env.QINGHONG_BASE ||
  'https://api.qinghong888.cc.cd'
).replace(/\/$/, '');

const API_KEY = (
  process.env.QINGHONG_MARKET_API_KEY ||
  process.env.QINGHONG_API_KEY ||
  process.env.API_KEY ||
  ''
).trim();

async function apiGet(path: string, query: Record<string, string | undefined> = {}): Promise<unknown> {
  if (!API_KEY) {
    throw new Error(
      '未配置 QINGHONG_MARKET_API_KEY。请在设置 → MCP 连接器 → 晴红行情 中填写 Key（sk-qh-trial- / sk-market- / sk-market-pro-）。'
    );
  }
  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: {
      'X-API-Key': API_KEY,
      Accept: 'application/json',
      'User-Agent': 'qinghong-market-mcp/1.0',
    },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep text */
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
  return body;
}

function ok(data: unknown): CallToolResult {
  return {
    content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }],
  };
}

function fail(err: unknown): CallToolResult {
  const msg = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text', text: `错误: ${msg}` }], isError: true };
}

function str(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

function createMcpServer(): Server {
  const server = new Server(
    { name: 'qinghong-market', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler('tools/list', async (): Promise<ListToolsResult> => ({
    tools: [
      {
        name: 'qh_me',
        description: '查看当前晴红行情 Key 套餐/配额/权限（GET /v1/me）',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'qh_cn_quote',
        description: '大 A 近时报价（可批量，逗号分隔，最多约 20 个）',
        inputSchema: {
          type: 'object',
          properties: {
            symbols: { type: 'string', description: '如 600519,000001,300750' },
          },
          required: ['symbols'],
        },
      },
      {
        name: 'qh_cn_indices',
        description: '上证/深成/创业板/沪深300 等指数 + 沪深北成交额（亿元）',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'qh_cn_kline',
        description: '大 A / ETF 日K（period=1d）。分钟K不走本 API。',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: { type: 'string' },
            period: { type: 'string', description: '默认 1d' },
            start: { type: 'string' },
            end: { type: 'string' },
            limit: { type: 'number' },
          },
          required: ['symbol'],
        },
      },
      {
        name: 'qh_cn_limit_up',
        description: '涨停池；可传 date=YYYY-MM-DD',
        inputSchema: {
          type: 'object',
          properties: { date: { type: 'string', description: 'YYYY-MM-DD' } },
          required: [],
        },
      },
      {
        name: 'qh_cn_sentiment',
        description: '市场情绪摘要',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'qh_cn_fundamentals',
        description: '基本面估值 / 个股估值摘要',
        inputSchema: {
          type: 'object',
          properties: { symbol: { type: 'string' } },
          required: ['symbol'],
        },
      },
      {
        name: 'qh_cn_finance',
        description: '季频财务六表 + 业绩预告/快报（Pro）',
        inputSchema: {
          type: 'object',
          properties: { symbol: { type: 'string' } },
          required: ['symbol'],
        },
      },
      {
        name: 'qh_cn_lhb',
        description: '龙虎榜按日明细',
        inputSchema: {
          type: 'object',
          properties: { date: { type: 'string', description: 'YYYY-MM-DD' } },
          required: [],
        },
      },
      {
        name: 'qh_cn_dayfund',
        description: '日线资金（Pro）：超大/大/中/小单净额等，单位亿元',
        inputSchema: {
          type: 'object',
          properties: {
            symbols: { type: 'string', description: '逗号分隔代码，如 000001,600519' },
            date: { type: 'string', description: '交易日 YYYY-MM-DD' },
          },
          required: ['symbols'],
        },
      },
      {
        name: 'qh_cn_futures_quote',
        description: '国内期货近时报价（Key 需开通 cn_futures）',
        inputSchema: {
          type: 'object',
          properties: {
            symbols: { type: 'string', description: '如 rbm,IFM,sc2609' },
          },
          required: ['symbols'],
        },
      },
    ],
  }));

  server.setRequestHandler('tools/call', async (request): Promise<CallToolResult> => {
    const name = request.params.name;
    const args = (request.params.arguments || {}) as Record<string, unknown>;
    try {
      switch (name) {
        case 'qh_me':
          return ok(await apiGet('/v1/me'));
        case 'qh_cn_quote':
          return ok(await apiGet('/v1/cn/quote', { symbols: str(args.symbols) }));
        case 'qh_cn_indices':
          return ok(await apiGet('/v1/cn/indices'));
        case 'qh_cn_kline':
          return ok(
            await apiGet('/v1/cn/kline', {
              symbol: str(args.symbol),
              period: str(args.period) || '1d',
              start: str(args.start),
              end: str(args.end),
              limit: args.limit != null ? String(args.limit) : undefined,
            })
          );
        case 'qh_cn_limit_up':
          return ok(await apiGet('/v1/cn/limit-up', { date: str(args.date) }));
        case 'qh_cn_sentiment':
          return ok(await apiGet('/v1/cn/sentiment'));
        case 'qh_cn_fundamentals':
          return ok(await apiGet('/v1/cn/fundamentals', { symbol: str(args.symbol) }));
        case 'qh_cn_finance':
          return ok(await apiGet('/v1/cn/finance', { symbol: str(args.symbol) }));
        case 'qh_cn_lhb':
          return ok(await apiGet('/v1/cn/lhb', { date: str(args.date) }));
        case 'qh_cn_dayfund':
          return ok(
            await apiGet('/v1/cn/dayfund', {
              symbols: str(args.symbols),
              date: str(args.date),
            })
          );
        case 'qh_cn_futures_quote':
          return ok(await apiGet('/v1/cn-futures/quote', { symbols: str(args.symbols) }));
        default:
          return fail(`未知工具: ${name}`);
      }
    } catch (err) {
      return fail(err);
    }
  });

  return server;
}

async function main() {
  const handle = serveStdio(() => createMcpServer(), {
    onerror: (error) => console.error('[qinghong-market-mcp]', error.message),
  });
  process.on('SIGINT', () => {
    void handle.close().finally(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    void handle.close().finally(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
