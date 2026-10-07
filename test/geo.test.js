import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineMeters, findNearby, formatPrice } from '../public/js/geo.js';

test('haversine: same point is 0 m', () => {
  assert.equal(haversineMeters({ lat: 11.5564, lng: 104.9282 }, { lat: 11.5564, lng: 104.9282 }), 0);
});

test('haversine: 0.009° of latitude is about 1 km', () => {
  const d = haversineMeters({ lat: 11.5564, lng: 104.9282 }, { lat: 11.5654, lng: 104.9282 });
  assert.ok(Math.abs(d - 1000.8) < 5, `got ${d}`);
});

test('haversine: Independence Monument to Wat Phnom is about 2.3 km', () => {
  const d = haversineMeters({ lat: 11.5564, lng: 104.9282 }, { lat: 11.5765, lng: 104.9235 });
  assert.ok(d > 2200 && d < 2400, `got ${d}`);
});

const spots = [
  { id: 'far', lat: 11.5600, lng: 104.9282 },
  { id: 'near', lat: 11.5565, lng: 104.9282 },
  { id: 'edge', lat: 11.55665, lng: 104.9282 },
];

test('findNearby: keeps only spots within 30 m, nearest first', () => {
  const found = findNearby(spots, { lat: 11.5564, lng: 104.9282 }, 30);
  assert.deepEqual(found.map((s) => s.id), ['near', 'edge']);
});

test('findNearby: nothing nearby gives an empty list', () => {
  assert.deepEqual(findNearby(spots, { lat: 11.60, lng: 104.95 }, 30), []);
});

test('formatPrice: riel, dollars and missing', () => {
  assert.equal(formatPrice(5000, 'KHR'), '~5,000៛');
  assert.equal(formatPrice(2.5, 'USD'), '~$2.50');
  assert.equal(formatPrice('5', 'USD'), '~$5.00');
  assert.equal(formatPrice(null, null), 'Price not listed');
});
