import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { log, logWarn } from '../utils/logger';

export const BUILTIN_MCP_SCRIPT_FILES = [
  'qinghong-finance-server.js',
  'qinghong-market-server.js',
  'gui-operate-server.js',
  'software-dev-server-example.js',
] as const;

const PLACEHOLDER_TO_SCRIPT: Record<string, string> = {
  '{QINGHONG_FINANCE_SERVER_PATH}': 'qinghong-finance-server.js',
  '{QINGHONG_MARKET_SERVER_PATH}': 'qinghong-market-server.js',
  '{GUI_OPERATE_SERVER_PATH}': 'gui-operate-server.js',
  '{SOFTWARE_DEV_SERVER_PATH}': 'software-dev-server-example.js',
};

export type McpPathContext = {
  isPackaged: boolean;
  resourcesPath: string;
  projectRoot: string;
};

export type BuiltinMcpServerLike = {
  name: string;
  command?: string;
  args?: string[];
};

export function isBuiltinMcpServerName(name: string): boolean {
  const n = name.trim();
  return (
    n === '晴红资讯' ||
    n === 'Qinghong_Finance' ||
    n === '晴红行情' ||
    n === 'Qinghong_Market' ||
    n === 'GUI_Operate' ||
    n === 'GUI Operate' ||
    n === 'Software_Development' ||
    n === 'Software Development'
  );
}

export function resolveProjectRoot(fromDir = __dirname): string {
  const candidates = [
    path.join(fromDir, '..', '..'),
    path.join(fromDir, '..', '..', '..'),
    process.cwd(),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }
  return path.join(fromDir, '..', '..');
}

export function getDefaultMcpPathContext(): McpPathContext {
  return {
    isPackaged: app.isPackaged,
    resourcesPath: process.resourcesPath || '',
    projectRoot: resolveProjectRoot(),
  };
}

export function builtinScriptFromArg(arg: string): string | null {
  const trimmed = String(arg || '').trim();
  if (!trimmed) return null;
  if (PLACEHOLDER_TO_SCRIPT[trimmed]) {
    return PLACEHOLDER_TO_SCRIPT[trimmed];
  }

  const base = path.basename(trimmed).replace(/\.ts$/i, '.js');
  return BUILTIN_MCP_SCRIPT_FILES.includes(base as (typeof BUILTIN_MCP_SCRIPT_FILES)[number])
    ? base
    : null;
}

export function resolveMcpServerFile(jsFilename: string, ctx: McpPathContext): string {
  if (ctx.isPackaged) {
    return path.join(ctx.resourcesPath, 'mcp', jsFilename);
  }

  const devBundledPath = path.join(ctx.projectRoot, 'dist-mcp', jsFilename);
  if (fs.existsSync(devBundledPath)) {
    return devBundledPath;
  }

  const sourcePath = path.join(ctx.projectRoot, 'src', 'main', 'mcp', jsFilename.replace(/\.js$/i, '.ts'));
  if (fs.existsSync(sourcePath)) {
    return sourcePath;
  }

  return devBundledPath;
}

function normalizePath(value: string): string {
  return path.normalize(value).replace(/[\\/]+$/, '').toLowerCase();
}

export function rewriteBuiltinMcpArg(arg: string, ctx: McpPathContext): string {
  const script = builtinScriptFromArg(arg);
  if (!script) {
    return arg;
  }

  const resolved = resolveMcpServerFile(script, ctx);
  if (ctx.isPackaged) {
    return resolved;
  }

  if (PLACEHOLDER_TO_SCRIPT[arg] || !fs.existsSync(arg)) {
    return resolved;
  }

  return arg;
}

export function rewriteBuiltinMcpServerConfig<T extends BuiltinMcpServerLike>(
  config: T,
  ctx: McpPathContext = getDefaultMcpPathContext()
): T {
  const looksBuiltin =
    isBuiltinMcpServerName(config.name) ||
    (config.args || []).some((arg) => builtinScriptFromArg(String(arg)));
  if (!looksBuiltin) {
    return config;
  }

  const nextArgs = (config.args || []).map((arg) => rewriteBuiltinMcpArg(String(arg), ctx));
  const changed = JSON.stringify(nextArgs) !== JSON.stringify(config.args || []);
  if (!changed) {
    return config;
  }

  log('[MCP] Rewrote builtin server paths', {
    name: config.name,
    from: config.args,
    to: nextArgs,
  });
  return { ...config, args: nextArgs };
}

export function rewriteBuiltinMcpServers<T extends BuiltinMcpServerLike>(
  servers: T[],
  ctx: McpPathContext = getDefaultMcpPathContext()
): { servers: T[]; changed: boolean } {
  let changed = false;
  const next = servers.map((server) => {
    const rewritten = rewriteBuiltinMcpServerConfig(server, ctx);
    if (rewritten !== server) {
      changed = true;
    }
    return rewritten;
  });
  if (changed) {
    logWarn('[MCP] Migrated leftover builtin MCP paths (dev path / placeholder → current install)');
  }
  return { servers: next, changed };
}

export function pathsEqual(left: string, right: string): boolean {
  return normalizePath(left) === normalizePath(right);
}
