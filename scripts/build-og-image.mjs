/* Renders scripts/templates/og-image.html to site/assets/og-image.png with headless Chrome.
 * Usage: node scripts/build-og-image.mjs   (set CHROME_PATH if Chrome is elsewhere)
 */
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const source = pathToFileURL(path.join(root, 'scripts/templates/og-image.html')).href;
const target = path.join(root, 'site/assets/og-image.png');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'og-chrome-'));

execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--user-data-dir=${profile}`, '--window-size=1200,630', `--screenshot=${target}`, source], { stdio: 'ignore' });
fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
console.log('wrote', path.relative(root, target), fs.statSync(target).size, 'bytes');
