import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const listingUrl = 'https://www.google.com/maps/search/Motive+Insurance+Solutions+Matteson/?hl=en';
const extractorPath = resolve(repositoryRoot, 'google-rating-extract.js');
const outputPath = resolve(repositoryRoot, 'data', 'site-rating.json');
const extractionTimeoutMs = 120_000;

export function isValidRating(value) {
  return value !== null &&
    typeof value === 'object' &&
    typeof value.rating === 'number' &&
    Number.isFinite(value.rating) &&
    value.rating >= 1 &&
    value.rating <= 5 &&
    Number.isSafeInteger(value.reviewCount) &&
    value.reviewCount > 0;
}

export async function saveRatingData(destination, value, updatedAt = new Date()) {
  if (!isValidRating(value)) {
    throw new Error('Invalid rating or review count; existing data was not changed.');
  }
  if (!(updatedAt instanceof Date) || !Number.isFinite(updatedAt.getTime())) {
    throw new Error('Invalid successful-sync timestamp; existing data was not changed.');
  }

  const record = {
    rating: value.rating,
    reviewCount: value.reviewCount,
    source: 'Google reviews',
    lastUpdated: updatedAt.toISOString(),
    verified: true,
  };
  const temporaryPath = `${destination}.${randomUUID()}.tmp`;

  await mkdir(dirname(destination), { recursive: true });
  try {
    await writeFile(temporaryPath, `${JSON.stringify(record, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
    });
    await rename(temporaryPath, destination);
  } finally {
    await rm(temporaryPath, { force: true });
  }

  return record;
}

async function collectRating() {
  const browser = await chromium.launch({ headless: process.env.MOTIVE_HEADFUL !== '1' });
  try {
    const page = await browser.newPage({ locale: 'en-US' });
    const response = await page.goto(listingUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    if (response && response.status() >= 400) {
      throw new Error(`Google Maps returned HTTP ${response.status()}.`);
    }

    await page.addScriptTag({ path: extractorPath });
    const deadline = Date.now() + extractionTimeoutMs;
    let pendingReason = 'The public business listing did not load.';

    while (Date.now() < deadline) {
      const result = await page.evaluate(() => window.readMotiveGoogleRating());
      if (result?.error) throw new Error(result.error);
      if (isValidRating(result)) return result;
      if (result?.pending) pendingReason = result.pending;
      await page.waitForTimeout(1_000);
    }

    throw new Error(`Google rating extraction timed out: ${pendingReason}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  await readFile(extractorPath, 'utf8');
  const values = await collectRating();
  if (!isValidRating(values)) {
    throw new Error('The Google listing did not produce a valid rating and review count.');
  }

  const saved = await saveRatingData(outputPath, values);
  console.log(
    `Verified Motive Insurance Solutions: ${saved.rating.toFixed(1)} from ` +
    `${saved.reviewCount} Google reviews; saved ${saved.lastUpdated}.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(`Google rating collection failed: ${error.message}`);
    process.exitCode = 1;
  });
}
