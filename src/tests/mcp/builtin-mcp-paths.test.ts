import path from 'path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getPath: () => '/tmp/qhcode-test',
  },
}));

vi.mock('../../main/utils/logger', () => ({
  log: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));
import {
  builtinScriptFromArg,
  isBuiltinMcpServerName,
  rewriteBuiltinMcpArg,
  rewriteBuiltinMcpServers,
  type McpPathContext,
} from '../../main/mcp/builtin-mcp-paths';

const packagedCtx: McpPathContext = {
  isPackaged: true,
  resourcesPath: 'F:\\qhcode\\resources',
  projectRoot: 'C:\\dev\\open-cowork',
};

describe('builtin MCP path rewrite', () => {
  it('recognizes Qinghong and GUI builtin server names', () => {
    expect(isBuiltinMcpServerName('晴红资讯')).toBe(true);
    expect(isBuiltinMcpServerName('晴红行情')).toBe(true);
    expect(isBuiltinMcpServerName('Chrome')).toBe(false);
  });

  it('maps placeholders and leftover script paths to bundled filenames', () => {
    expect(builtinScriptFromArg('{QINGHONG_FINANCE_SERVER_PATH}')).toBe(
      'qinghong-finance-server.js'
    );
    expect(
      builtinScriptFromArg('C:\\dev\\open-cowork\\dist-mcp\\qinghong-finance-server.js')
    ).toBe('qinghong-finance-server.js');
    expect(builtinScriptFromArg('npx')).toBeNull();
  });

  it('rewrites packaged leftover dev paths even if the old file still exists', () => {
    const rewritten = rewriteBuiltinMcpArg(
      'C:\\dev\\open-cowork\\dist-mcp\\qinghong-finance-server.js',
      packagedCtx
    );
    expect(rewritten).toBe(
      path.join('F:\\qhcode\\resources', 'mcp', 'qinghong-finance-server.js')
    );
  });

  it('migrates a stored server list in one pass', () => {
    const { servers, changed } = rewriteBuiltinMcpServers(
      [
        {
          name: '晴红资讯',
          command: 'node',
          args: ['C:\\dev\\open-cowork\\dist-mcp\\qinghong-finance-server.js'],
        },
        {
          name: 'Chrome',
          command: 'npx',
          args: ['-y', 'chrome-devtools-mcp@latest'],
        },
      ],
      packagedCtx
    );

    expect(changed).toBe(true);
    expect(servers[0].args?.[0]).toBe(
      path.join('F:\\qhcode\\resources', 'mcp', 'qinghong-finance-server.js')
    );
    expect(servers[1].args).toEqual(['-y', 'chrome-devtools-mcp@latest']);
  });
});
