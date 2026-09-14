import Store, { type Options as StoreOptions } from 'electron-store';
import * as fs from 'fs';
import * as crypto from 'crypto';
import type { MCPServerConfig } from './mcp-manager';
import { log, logError } from '../utils/logger';
import {
  getDefaultMcpPathContext,
  resolveMcpServerFile,
  rewriteBuiltinMcpServers,
} from './builtin-mcp-paths';

/**
 * Preset MCP Server Configurations
 * These are common MCP servers that users can quickly add
 */
export const MCP_SERVER_PRESETS: Record<string, Omit<MCPServerConfig, 'id' | 'enabled'> & { requiresEnv?: string[]; envDescription?: Record<string, string> }> = {
  chrome: {
    name: 'Chrome',
    type: 'stdio',
    command: 'npx',
    args: ['-y', 'chrome-devtools-mcp@latest', '--browser-url', 'http://localhost:9222'],
  },
  notion: {
    name: 'Notion',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@notionhq/notion-mcp-server'],
    env: {
      NOTION_TOKEN: '',
    },
    requiresEnv: ['NOTION_TOKEN'],
    envDescription: {
      NOTION_TOKEN: 'Notion Internal Integration Token (get from notion.so/profile/integrations)',
    },
  },
  'software-development': {
    name: 'Software_Development',
    type: 'stdio',
    command: 'node',
    args: ['{SOFTWARE_DEV_SERVER_PATH}'], // Path will be resolved at runtime (compiled JS in production)
    env: {
      WORKSPACE_DIR: '',
      TEST_ENV: 'development',
    },
    requiresEnv: [],
    envDescription: {
      WORKSPACE_DIR: 'Workspace directory for code development (optional)',
      TEST_ENV: 'Test environment: development, staging, or production (optional)',
    },
  },
  'gui-operate': {
    name: 'GUI_Operate',
    type: 'stdio',
    command: 'node',
    args: ['{GUI_OPERATE_SERVER_PATH}'], // Path will be resolved at runtime (compiled JS in production)
    env: {},
    requiresEnv: [],
    envDescription: {
      // No environment variables required
    },
  },
  'qinghong-finance': {
    name: '晴红资讯',
    type: 'stdio',
    command: 'node',
    args: ['{QINGHONG_FINANCE_SERVER_PATH}'],
    env: {
      QINGHONG_BASE_URL: 'http://124.223.180.129:3220',
      QINGHONG_API_KEY: '',
    },
    requiresEnv: ['QINGHONG_API_KEY'],
    envDescription: {
      QINGHONG_BASE_URL: '晴红资讯 API 基址（默认即可）',
      QINGHONG_API_KEY: '晴红资讯 Key（标准 bobo_sk_ / Pro bobo_sk_pro_ / 年卡 bobo_sk_year_）',
    },
  },
  'qinghong-market': {
    name: '晴红行情',
    type: 'stdio',
    command: 'node',
    args: ['{QINGHONG_MARKET_SERVER_PATH}'],
    env: {
      QINGHONG_MARKET_BASE_URL: 'https://api.qinghong888.cc.cd',
      QINGHONG_MARKET_API_KEY: '',
    },
    requiresEnv: ['QINGHONG_MARKET_API_KEY'],
    envDescription: {
      QINGHONG_MARKET_BASE_URL: '晴红行情 API 基址（默认即可）',
      QINGHONG_MARKET_API_KEY: '晴红行情 Key（试用 sk-qh-trial- / 标准 sk-market- / Pro sk-market-pro-）',
    },
  },
};

/**
 * MCP Server Configuration Store
 */
class MCPConfigStore {
  private store: Store<{ servers: MCPServerConfig[] }>;

  constructor() {
    const storeOptions: StoreOptions<{ servers: MCPServerConfig[] }> & { projectName?: string } = {
      name: 'mcp-config',
      projectName: 'qinghong',
      defaults: {
        servers: [],
      },
    };

    this.store = new Store<{ servers: MCPServerConfig[] }>(storeOptions);
    this.ensureQinghongPresets();
    this.migrateBuiltinServerPaths();
  }

  /**
   * Packaged builds must not keep leftover C:\dev\...\dist-mcp paths from a
   * developer machine sharing %APPDATA%\qhcode. Always pin builtin servers
   * to extraResources/mcp.
   */
  private migrateBuiltinServerPaths(): void {
    try {
      const { servers, changed } = rewriteBuiltinMcpServers(this.getServers());
      if (changed) {
        this.setServers(servers);
        log('[MCPConfigStore] Persisted rewritten builtin MCP server paths');
      }
    } catch (error) {
      logError('[MCPConfigStore] Failed to migrate builtin MCP paths:', error);
    }
  }

  /**
   * Seed Qinghong finance + market MCP presets once if missing.
   */
  private ensureQinghongPresets(): void {
    this.ensureQinghongFinancePreset();
    this.ensureQinghongMarketPreset();
  }

  private ensureQinghongFinancePreset(): void {
    try {
      const servers = this.getServers();
      const exists = servers.some(
        (s) =>
          s.name === '晴红资讯' ||
          s.id.startsWith('mcp-qinghong-finance') ||
          (s.args || []).some((a) => String(a).includes('qinghong-finance'))
      );
      if (exists) return;
      const seeded = this.createFromPreset('qinghong-finance', false);
      if (seeded) {
        this.saveServer(seeded);
        log('[MCPConfigStore] Seeded 晴红资讯 MCP preset');
      }
    } catch (error) {
      logError('[MCPConfigStore] Failed to seed 晴红资讯 preset:', error);
    }
  }

  private ensureQinghongMarketPreset(): void {
    try {
      const servers = this.getServers();
      const exists = servers.some(
        (s) =>
          s.name === '晴红行情' ||
          s.id.startsWith('mcp-qinghong-market') ||
          (s.args || []).some((a) => String(a).includes('qinghong-market'))
      );
      if (exists) return;
      const seeded = this.createFromPreset('qinghong-market', false);
      if (seeded) {
        this.saveServer(seeded);
        log('[MCPConfigStore] Seeded 晴红行情 MCP preset');
      }
    } catch (error) {
      logError('[MCPConfigStore] Failed to seed 晴红行情 preset:', error);
    }
  }

  /**
   * Get all MCP server configurations
   */
  getServers(): MCPServerConfig[] {
    return this.store.get('servers', []);
  }

  /**
   * Get a specific server configuration
   */
  getServer(serverId: string): MCPServerConfig | undefined {
    const servers = this.getServers();
    return servers.find((s) => s.id === serverId);
  }

  /**
   * Add or update a server configuration
   */
  saveServer(config: MCPServerConfig): void {
    const servers = this.getServers();
    const index = servers.findIndex((s) => s.id === config.id);
    
    if (index >= 0) {
      servers[index] = config;
    } else {
      servers.push(config);
    }
    
    this.store.set('servers', servers);
  }

  /**
   * Delete a server configuration
   */
  deleteServer(serverId: string): void {
    const servers = this.getServers();
    const filtered = servers.filter((s) => s.id !== serverId);
    this.store.set('servers', filtered);
  }

  /**
   * Update all server configurations
   */
  setServers(servers: MCPServerConfig[]): void {
    this.store.set('servers', servers);
  }

  /**
   * Get enabled servers only
   */
  getEnabledServers(): MCPServerConfig[] {
    return this.getServers().filter((s) => s.enabled);
  }

  /**
   * Get preset configurations
   */
  getPresets(): Record<string, Omit<MCPServerConfig, 'id' | 'enabled'>> {
    return MCP_SERVER_PRESETS;
  }

  /**
   * Get the path to a MCP server file in the mcp directory
   */
  private getMcpServerPath(filename: string): string | null {
    const jsFilename = filename.replace(/\.ts$/, '.js');
    const resolved = resolveMcpServerFile(jsFilename, getDefaultMcpPathContext());
    if (fs.existsSync(resolved)) {
      return resolved;
    }
    logError(`[MCPConfigStore] File not found at:`, resolved);
    return resolved;
  }

  /**
   * Get the path to the Software Development MCP server file
   */
  private getSoftwareDevServerPath(): string | null {
    return this.getMcpServerPath('software-dev-server-example.ts');
  }

  /**
   * Get the path to the GUI Operate MCP server file
   */
  private getGuiOperateServerPath(): string | null {
    return this.getMcpServerPath('gui-operate-server.ts');
  }

  private getQinghongFinanceServerPath(): string | null {
    return this.getMcpServerPath('qinghong-finance-server.ts');
  }

  private getQinghongMarketServerPath(): string | null {
    return this.getMcpServerPath('qinghong-market-server.ts');
  }

  /**
   * Create a server config from a preset
   */
  createFromPreset(presetKey: string, enabled: boolean = false): MCPServerConfig | null {
    const preset = MCP_SERVER_PRESETS[presetKey];
    if (!preset) {
      return null;
    }

    // Resolve path placeholders for presets
    let resolvedPreset = { ...preset };

    if (preset.args) {
      resolvedPreset = {
        ...preset,
        args: preset.args.map(arg => {
          // Software Development server path
          if (arg === '{SOFTWARE_DEV_SERVER_PATH}') {
            return this.getSoftwareDevServerPath() || arg;
          }
          // GUI Operate server path
          if (arg === '{GUI_OPERATE_SERVER_PATH}') {
            return this.getGuiOperateServerPath() || arg;
          }
          if (arg === '{QINGHONG_FINANCE_SERVER_PATH}') {
            return this.getQinghongFinanceServerPath() || arg;
          }
          if (arg === '{QINGHONG_MARKET_SERVER_PATH}') {
            return this.getQinghongMarketServerPath() || arg;
          }
          return arg;
        }),
      };
    }

    return {
      ...resolvedPreset,
      id: `mcp-${presetKey}-${crypto.randomUUID()}`,
      enabled,
    };
  }
}

// Singleton instance
export const mcpConfigStore = new MCPConfigStore();
