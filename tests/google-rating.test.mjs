import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { isValidRating, saveRatingData } from '../scripts/update-google-rating.mjs';

test('accepts only a valid numeric rating and positive safe-integer review count', () => {
  assert.equal(isValidRating({ rating: 5, reviewCount: 157 }), true);
  for (const value of [
    { rating: '5', reviewCount: 157 },
    { rating: 5.1, reviewCount: 157 },
    { rating: 0, reviewCount: 157 },
    { rating: 5, reviewCount: 0 },
    { rating: 5, reviewCount: 1.5 },
    { rating: 5, reviewCount: Number.MAX_SAFE_INTEGER + 1 },
    null,
  ]) {
    assert.equal(isValidRating(value), false);
  }
});

test('writes a validated record with a successful-sync timestamp', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'motive-rating-'));
  const destination = join(directory, 'site-rating.json');
  try {
    const result = await saveRatingData(
      destination,
      { rating: 5, reviewCount: 157 },
      new Date('2026-10-30T13:00:00.000Z'),
    );
    assert.deepEqual(result, {
      rating: 5,
      reviewCount: 157,
      source: 'Google reviews',
      lastUpdated: '2026-10-30T13:00:00.000Z',
      verified: true,
    });
    assert.deepEqual(JSON.parse(await readFile(destination, 'utf8')), result);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects failed extraction without changing existing data', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'motive-rating-'));
  const destination = join(directory, 'site-rating.json');
  const previous = '{ "verified": true, "lastUpdated": "unchanged" }\n';
  try {
    await writeFile(destination, previous, 'utf8');
    await assert.rejects(
      saveRatingData(destination, { rating: 5, reviewCount: 0 }),
      /existing data was not changed/,
    );
    assert.equal(await readFile(destination, 'utf8'), previous);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
