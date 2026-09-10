/**
 * Qinghong Finance MCP Server
 * 晴红 · 50+ 资讯热榜 / 财经快讯 / 标的资料
 *
 * Env:
 *   QINGHONG_API_KEY  (required)  X-API-Key
 *   QINGHONG_BASE_URL (optional)  default http://124.223.180.129:3220
 */

import { type CallToolResult, type ListToolsResult, Server } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

const BASE_URL = (process.env.QINGHONG_BASE_URL || 'http://124.223.180.129:3220').replace(/\/$/, '');
const API_KEY = process.env.QINGHONG_API_KEY || process.env.API_KEY || '';

async function apiGet(path: string, query: Record<string, string | undefined> = {}): Promise<unknown> {
  if (!API_KEY) {
    throw new Error('未配置 QINGHONG_API_KEY。请在设置 → MCP 连接器 → 晴红资讯 中填写 Key。');
  }
  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { 'X-API-Key': API_KEY },
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

async function apiPost(path: string, body?: unknown): Promise<unknown> {
  if (!API_KEY) {
    throw new Error('未配置 QINGHONG_API_KEY。请在设置 → MCP 连接器 → 晴红资讯 中填写 Key。');
  }
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* keep text */
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
  }
  return parsed;
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

function createMcpServer(): Server {
  const server = new Server(
    { name: 'qinghong-finance', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler('tools/list', async (): Promise<ListToolsResult> => ({
    tools: [
      {
        name: 'check_key',
        description: '检测晴红资讯 API Key 是否有效（GET /api/latest）',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'get_source',
        description:
          '拉取单个平台最新列表。id 示例: weibo, douyin, zhihu, jin10, cls-telegraph, xueqiu-live, cninfo-latest。巨潮/互动易可用 stock 代码筛选。',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '平台 id，如 weibo / jin10 / cninfo-latest' },
            stock: { type: 'string', description: '可选股票代码，如 600519（巨潮/互动易）' },
            searchkey: { type: 'string', description: '可选关键词，竖线 OR，如 茅台|白酒（热榜筛 title）' },
            latest: { type: 'boolean', description: '强制刷新' },
          },
          required: ['id'],
        },
      },
      {
        name: 'finance_entire',
        description: '一键拉取全部财经源最新列表（POST /api/finance/entire），适合做财经早报素材',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'finance_sources',
        description: '获取财经源 id 清单（约 42 路）',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'batch_sources',
        description: '自定义多平台批量拉取（POST /api/s/entire）',
        inputSchema: {
          type: 'object',
          properties: {
            sources: {
              type: 'array',
              items: { type: 'string' },
              description: '平台 id 数组，如 ["weibo","jin10","cls-telegraph"]',
            },
          },
          required: ['sources'],
        },
      },
      {
        name: 'symbol_docs',
        description:
          '按股票代码或名称查标的资讯/定期报告资料包（Pro）。注意：不是股价 K 线。',
        inputSchema: {
          type: 'object',
          properties: {
            code: { type: 'string', description: '股票代码，如 000001' },
            name: { type: 'string', description: '股票简称，如 贵州茅台' },
            section: {
              type: 'string',
              description: '合集|资讯|定期报告|结构化数据',
            },
            limit: { type: 'number', description: '条数，建议 5～20' },
          },
          required: [],
        },
      },
      {
        name: 'news_history',
        description: '按日查财经归档（部分源自 2026-06-12 起）。Pro 可用 keyword。',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'YYYY-MM-DD' },
            source: { type: 'string', description: '如 jin10 / cls-telegraph' },
            keyword: { type: 'string', description: 'Pro：标题关键词，竖线 OR' },
            limit: { type: 'number' },
            offset: { type: 'number' },
          },
          required: ['date', 'source'],
        },
      },
    ],
  }));

  server.setRequestHandler('tools/call', async (request): Promise<CallToolResult> => {
    const name = request.params.name;
    const args = (request.params.arguments || {}) as Record<string, unknown>;
    try {
      switch (name) {
        case 'check_key':
          return ok(await apiGet('/api/latest'));
        case 'get_source':
          return ok(
            await apiGet('/api/s', {
              id: String(args.id || ''),
              stock: args.stock != null ? String(args.stock) : undefined,
              searchkey: args.searchkey != null ? String(args.searchkey) : undefined,
              latest: args.latest ? 'true' : undefined,
            })
          );
        case 'finance_entire':
          return ok(await apiPost('/api/finance/entire'));
        case 'finance_sources':
          return ok(await apiGet('/api/finance/sources'));
        case 'batch_sources':
          return ok(await apiPost('/api/s/entire', { sources: args.sources || [] }));
        case 'symbol_docs':
          return ok(
            await apiGet('/api/symbol/docs', {
              code: args.code != null ? String(args.code) : undefined,
              name: args.name != null ? String(args.name) : undefined,
              section: args.section != null ? String(args.section) : undefined,
              limit: args.limit != null ? String(args.limit) : '10',
            })
          );
        case 'news_history':
          return ok(
            await apiGet('/api/crawler/news/history', {
              date: String(args.date || ''),
              source: String(args.source || ''),
              keyword: args.keyword != null ? String(args.keyword) : undefined,
              limit: args.limit != null ? String(args.limit) : '500',
              offset: args.offset != null ? String(args.offset) : '0',
            })
          );
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
    onerror: (error) => console.error('[qinghong-mcp]', error.message),
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
