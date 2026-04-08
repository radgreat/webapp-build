import puppeteer from 'puppeteer';
import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dir = join(__dirname, 'temporary screenshots');
mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Auto-increment screenshot number
const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0', 10));
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
const viewportWidth = Number(process.env.SCREENSHOT_WIDTH || 3840);
const viewportHeight = Number(process.env.SCREENSHOT_HEIGHT || 2160);
const deviceScaleFactor = Number(process.env.SCREENSHOT_DSF || 2);
await page.setViewport({ width: viewportWidth, height: viewportHeight, deviceScaleFactor });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.screenshot({ path: join(dir, filename), fullPage: true });
await browser.close();

console.log(`Screenshot saved: temporary screenshots/${filename}`);
