/**
 * Cross-platform PocketBase starter script
 * Detects OS and architecture to select the correct binary
 */

import { spawn } from 'child_process';
import { platform, arch } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Map of platform/arch to binary name
const binaryMap = {
  'darwin-arm64': 'pocketbase-darwin-arm64',
  'darwin-amd64': 'pocketbase-darwin-amd64',
  'linux-amd64': 'pocketbase-linux-amd64',
  'win32-amd64': 'pocketbase-windows-amd64.exe',
};

const key = `${platform()}-${arch()}`;
const binaryName = binaryMap[key];

if (!binaryName) {
  console.error(`No PocketBase binary found for platform: ${key} (${platform()} ${arch()})`);
  console.error('Supported platforms: darwin-arm64, darwin-amd64, linux-amd64, win32-amd64');
  process.exit(1);
}

const binaryPath = join(__dirname, '..', 'thirdparty', 'pocketbase', binaryName);
const args = process.argv.slice(2);

console.log(`Starting PocketBase: ${binaryPath}`);

const child = spawn(binaryPath, ['serve', '--http=0.0.0.0:8090', ...args], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
