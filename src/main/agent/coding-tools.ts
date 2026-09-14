import {
  createCodingTools,
  createReadTool,
  createBashTool,
  createEditTool,
  createWriteTool,
  createGrepTool,
  createFindTool,
  createLsTool,
  type BashToolOptions,
} from '@mariozechner/pi-coding-agent';
import { createWindowsBashOperations } from './windows-bash-operations';
import { logWarn } from '../utils/logger';

type CoworkTool = ReturnType<typeof createCodingTools>[number];

function isDirectoryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return /eisdir|illegal operation on a directory/i.test(String(error));
  }
  const err = error as { code?: string; message?: string };
  return (
    err.code === 'EISDIR' || /eisdir|illegal operation on a directory/i.test(err.message || '')
  );
}

function wrapReadTool(tool: CoworkTool): CoworkTool {
  const originalExecute = tool.execute.bind(tool);
  return {
    ...tool,
    description:
      `${tool.description} If the path is a directory, do not use this tool — call ls (or find/glob) instead.`,
    execute: async (
      toolCallId: string,
      params: { path: string; offset?: number; limit?: number },
      signal: AbortSignal | undefined,
      onUpdate: ((partial: unknown) => void) | undefined
    ) => {
      try {
        return await originalExecute(toolCallId, params, signal, onUpdate);
      } catch (error) {
        if (isDirectoryError(error)) {
          const target = typeof params?.path === 'string' ? params.path : '(unknown path)';
          return {
            content: [
              {
                type: 'text' as const,
                text:
                  `Path is a directory, not a file: ${target}\n` +
                  `Do not retry read on a folder. Use the ls tool to list it, or glob/find to search files inside.`,
              },
            ],
            details: { code: 'EISDIR', retryable: false, hint: 'ls' },
          };
        }
        throw error;
      }
    },
  } as CoworkTool;
}

function windowsBashOptions(): BashToolOptions | undefined {
  if (process.platform !== 'win32') {
    return undefined;
  }
  return { operations: createWindowsBashOperations() };
}

/**
 * pi's createCodingTools() only ships read/bash/edit/write.
 * Expose grep/find/ls (and a glob alias) so the agent can search without guessing paths.
 */
export function buildCoworkCodingTools(cwd: string): CoworkTool[] {
  if (!cwd) {
    logWarn('[coding-tools] Empty cwd; tools will use process.cwd() fallback');
  }

  const bashOptions = windowsBashOptions();
  const findTool = createFindTool(cwd);
  const globTool = {
    ...findTool,
    name: 'glob',
    label: 'glob',
    description: `${findTool.description} Alias of find, for clients that expect a glob tool.`,
  } as CoworkTool;

  return [
    wrapReadTool(createReadTool(cwd)),
    createBashTool(cwd, bashOptions),
    createEditTool(cwd),
    createWriteTool(cwd),
    createGrepTool(cwd),
    findTool,
    globTool,
    createLsTool(cwd),
  ];
}
