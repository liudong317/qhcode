import { existsSync } from 'fs';
import path from 'path';
import { spawn, type ChildProcess, type SpawnOptions } from 'child_process';
import {
  SettingsManager as PiSettingsManager,
  type BashOperations,
} from '@mariozechner/pi-coding-agent';
import { getDefaultShell } from '../utils/shell-resolver';

const DEFAULT_TERMINATION_GRACE_MS = 5000;
const DEFAULT_TASKKILL_WAIT_MS = 3000;

type SpawnProcess = (command: string, args: string[], options: SpawnOptions) => ChildProcess;

export interface WindowsShellInvocation {
  shell: string;
  args: string[];
}

export interface WindowsBashOperationsOptions {
  spawnProcess?: SpawnProcess;
  shellResolver?: (cwd: string) => string;
  terminationGraceMs?: number;
  taskkillWaitMs?: number;
}

function normalizeShellPath(shellPath: string): string {
  const trimmed = shellPath.trim();
  const quoted = trimmed.match(/^"(.+)"$/);
  return quoted ? quoted[1] : trimmed;
}

const WINDOWS_ENV_KEYS = [
  'SYSTEMROOT',
  'SystemRoot',
  'WINDIR',
  'windir',
  'COMSPEC',
  'ComSpec',
  'PATHEXT',
  'SystemDrive',
  'USERPROFILE',
  'HOMEDRIVE',
  'HOMEPATH',
  'TEMP',
  'TMP',
  'USERNAME',
  'USERDOMAIN',
] as const;

function isUsableWindowsShell(shellPath: string): boolean {
  const name = path.win32.basename(shellPath).toLowerCase();
  return (
    name === 'cmd' ||
    name === 'cmd.exe' ||
    name === 'powershell' ||
    name === 'powershell.exe' ||
    name === 'pwsh' ||
    name === 'pwsh.exe'
  );
}

function isWslBashStub(shellPath: string): boolean {
  const normalized = shellPath.replace(/\//g, '\\').toLowerCase();
  return normalized.endsWith('\\system32\\bash.exe') || normalized.endsWith('\\sysnative\\bash.exe');
}

export function resolveWindowsCmdPath(): string {
  const systemRoot = process.env.SystemRoot || process.env.SYSTEMROOT || 'C:\\Windows';
  const candidate = path.join(systemRoot, 'System32', 'cmd.exe');
  return existsSync(candidate) ? candidate : process.env.ComSpec || process.env.COMSPEC || 'cmd.exe';
}

export function mergeWindowsShellEnv(
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>
): NodeJS.ProcessEnv {
  const merged: NodeJS.ProcessEnv = { ...process.env, ...(env || {}) };
  for (const key of WINDOWS_ENV_KEYS) {
    if (!merged[key] && process.env[key]) {
      merged[key] = process.env[key];
    }
  }
  if (!merged.SystemRoot && !merged.SYSTEMROOT) {
    merged.SystemRoot = 'C:\\Windows';
  }
  if (!merged.ComSpec && !merged.COMSPEC) {
    merged.ComSpec = resolveWindowsCmdPath();
  }
  if (!merged.PATHEXT) {
    merged.PATHEXT = '.COM;.EXE;.BAT;.CMD;.VBS;.JS;.MSC';
  }
  return merged;
}

function defaultShellResolver(cwd: string): string {
  try {
    const configuredShell = PiSettingsManager.create(cwd).getShellPath();
    if (configuredShell) {
      const normalized = normalizeShellPath(configuredShell);
      if (isUsableWindowsShell(normalized) && !isWslBashStub(normalized)) {
        return normalized;
      }
    }
  } catch {
    // Ignore broken per-cwd pi settings and fall back to cmd.exe.
  }
  return getDefaultShell();
}

export function buildWindowsShellInvocation(
  command: string,
  shellPath = getDefaultShell()
): WindowsShellInvocation {
  const shell = normalizeShellPath(shellPath);
  const shellName = path.win32.basename(shell).toLowerCase();

  if (shellName === 'cmd' || shellName === 'cmd.exe') {
    return { shell, args: ['/d', '/s', '/c', command] };
  }

  if (
    shellName === 'powershell' ||
    shellName === 'powershell.exe' ||
    shellName === 'pwsh' ||
    shellName === 'pwsh.exe'
  ) {
    return {
      shell,
      args: [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        command,
      ],
    };
  }

  return { shell, args: ['-c', command] };
}

function createSpawnProcess(): SpawnProcess {
  return (command, args, options) => spawn(command, args, options);
}

async function waitForProcessClose(child: ChildProcess, timeoutMs: number): Promise<void> {
  await new Promise<void>((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutHandle);
      child.off('close', finish);
      child.off('error', finish);
      resolve();
    };

    child.once('close', finish);
    child.once('error', finish);
    const timeoutHandle = setTimeout(() => {
      try {
        child.kill();
      } catch {
        // Ignore cleanup failures; the caller is already terminating a process tree.
      }
      finish();
    }, timeoutMs);
    timeoutHandle.unref?.();
  });
}

async function killWindowsProcessTree(
  pid: number,
  spawnProcess: SpawnProcess,
  taskkillWaitMs: number
): Promise<void> {
  try {
    const taskkill = spawnProcess('taskkill', ['/F', '/T', '/PID', String(pid)], {
      detached: false,
      stdio: 'ignore',
      windowsHide: true,
    });
    await waitForProcessClose(taskkill, taskkillWaitMs);
  } catch {
    try {
      process.kill(pid);
    } catch {
      // Process may already be gone.
    }
  }
}

export function createWindowsBashOperations(
  options: WindowsBashOperationsOptions = {}
): BashOperations {
  const spawnProcess = options.spawnProcess ?? createSpawnProcess();
  const shellResolver = options.shellResolver ?? defaultShellResolver;
  const terminationGraceMs = options.terminationGraceMs ?? DEFAULT_TERMINATION_GRACE_MS;
  const taskkillWaitMs = options.taskkillWaitMs ?? DEFAULT_TASKKILL_WAIT_MS;

  return {
    exec: (command, cwd, { onData, signal, timeout, env }) =>
      new Promise((resolve, reject) => {
        if (!existsSync(cwd)) {
          reject(
            new Error(`Working directory does not exist: ${cwd}\nCannot execute bash commands.`)
          );
          return;
        }

        if (signal?.aborted) {
          reject(new Error('aborted'));
          return;
        }

        const resolvedShell = isUsableWindowsShell(shellResolver(cwd))
          ? shellResolver(cwd)
          : resolveWindowsCmdPath();
        const shell =
          path.win32.basename(resolvedShell).toLowerCase() === 'cmd.exe' ||
          path.win32.basename(resolvedShell).toLowerCase() === 'cmd'
            ? resolveWindowsCmdPath()
            : resolvedShell;
        const { shell: invocationShell, args } = buildWindowsShellInvocation(command, shell);
        const child = spawnProcess(invocationShell, args, {
          cwd,
          detached: false,
          env: mergeWindowsShellEnv(env),
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          windowsVerbatimArguments: true,
        });

        let settled = false;
        let timedOut = false;
        let timeoutHandle: NodeJS.Timeout | undefined;
        let forcedSettleHandle: NodeJS.Timeout | undefined;

        const cleanup = () => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          if (forcedSettleHandle) clearTimeout(forcedSettleHandle);
          child.stdout?.off('data', onData);
          child.stderr?.off('data', onData);
          child.off('close', onClose);
          child.off('error', onError);
          signal?.removeEventListener('abort', onAbort);
        };

        const settleResolve = (value: { exitCode: number | null }) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(value);
        };

        const settleReject = (error: Error) => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(error);
        };

        const terminateChild = (reason: 'aborted' | 'timeout') => {
          if (child.pid) {
            void killWindowsProcessTree(child.pid, spawnProcess, taskkillWaitMs);
          } else {
            try {
              child.kill();
            } catch {
              // Ignore cleanup failures; the close/error path will settle or the grace timer will.
            }
          }

          forcedSettleHandle = setTimeout(() => {
            settleReject(
              reason === 'timeout' ? new Error(`timeout:${timeout}`) : new Error('aborted')
            );
          }, terminationGraceMs);
          forcedSettleHandle.unref?.();
        };

        function onClose(code: number | null) {
          if (signal?.aborted) {
            settleReject(new Error('aborted'));
            return;
          }
          if (timedOut) {
            settleReject(new Error(`timeout:${timeout}`));
            return;
          }
          settleResolve({ exitCode: code });
        }

        function onError(error: Error) {
          settleReject(error);
        }

        function onAbort() {
          terminateChild('aborted');
        }

        child.stdout?.on('data', onData);
        child.stderr?.on('data', onData);
        child.once('close', onClose);
        child.once('error', onError);

        if (timeout !== undefined && timeout > 0) {
          timeoutHandle = setTimeout(() => {
            timedOut = true;
            terminateChild('timeout');
          }, timeout * 1000);
          timeoutHandle.unref?.();
        }

        signal?.addEventListener('abort', onAbort, { once: true });
      }),
  };
}
