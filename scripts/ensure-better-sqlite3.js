#!/usr/bin/env node
/**
 * Ensure better-sqlite3 has an Electron prebuild on Windows without Visual Studio.
 * Uses npmmirror when GitHub is slow/blocked.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const PKG = path.join(PROJECT_ROOT, 'node_modules', 'better-sqlite3');
const TARGET = path.join(PKG, 'build', 'Release', 'better_sqlite3.node');
const VERSION = require(path.join(PKG, 'package.json')).version;
const ELECTRON_VERSION = require(path.join(PROJECT_ROOT, 'node_modules', 'electron', 'package.json')).version;

function electronAbiMajor() {
  // Electron 41.x → ABI 145 (matches WiseLibs release naming electron-v145)
  const major = Number(String(ELECTRON_VERSION).split('.')[0]);
  const map = { 41: 145, 40: 143, 39: 141, 38: 139, 37: 136 };
  return map[major] || 145;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

async function main() {
  if (process.platform !== 'win32') {
    console.log('[ensure-sqlite] skip (non-Windows)');
    return;
  }
  if (fs.existsSync(TARGET) && fs.statSync(TARGET).size > 100000) {
    console.log('[ensure-sqlite] existing binary OK:', TARGET);
    return;
  }

  const abi = electronAbiMajor();
  const name = `better-sqlite3-v${VERSION}-electron-v${abi}-win32-x64.tar.gz`;
  const url = `https://cdn.npmmirror.com/binaries/better-sqlite3/v${VERSION}/${name}`;
  const tarPath = path.join(PKG, 'prebuild-electron.tgz');
  const extractDir = path.join(PKG, '_prebuild_extract');

  console.log('[ensure-sqlite] downloading', url);
  await download(url, tarPath);
  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });
  execSync(`tar -xzf "${tarPath}" -C "${extractDir}"`, { stdio: 'inherit' });
  const extracted = path.join(extractDir, 'build', 'Release', 'better_sqlite3.node');
  if (!fs.existsSync(extracted)) {
    throw new Error('prebuild archive missing better_sqlite3.node');
  }
  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.copyFileSync(extracted, TARGET);
  console.log('[ensure-sqlite] installed', TARGET);
}

main().catch((err) => {
  console.error('[ensure-sqlite] failed:', err.message || err);
  process.exit(1);
});
