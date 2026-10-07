import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineMeters,
  findNearby,
  formatPrice,
  nearestFirst,
  formatDistance,
  directionsUrl,
} from '../public/js/geo.js';

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

// The seeded sample shops (scripts/seed.js), trimmed to what sorting needs.
const samples = [
  { id: 'independence', lat: 11.5564, lng: 104.9310, vehicles: ['moto', 'tuktuk'] },
  { id: 'central', lat: 11.5700, lng: 104.9200, vehicles: ['moto'] },
  { id: 'russian', lat: 11.5405, lng: 104.9195, vehicles: ['moto', 'tuktuk'] },
  { id: 'monivong', lat: 11.5620, lng: 104.9165, vehicles: ['moto', 'tuktuk', 'car'] },
  { id: 'chbar-ampov', lat: 11.5450, lng: 104.9380, vehicles: ['moto'] },
  { id: 'olympic', lat: 11.5580, lng: 104.9120, vehicles: ['car'] },
  { id: 'wat-phnom', lat: 11.5765, lng: 104.9235, vehicles: ['moto', 'tuktuk'] },
];

test('nearestFirst: from Independence Monument the monument stall is first, Wat Phnom last', () => {
  const sorted = nearestFirst(samples, { lat: 11.5564, lng: 104.9282 }, null);
  assert.equal(sorted.length, 7);
  assert.equal(sorted[0].id, 'independence');
  assert.equal(sorted.at(-1).id, 'wat-phnom');
  for (let i = 1; i < sorted.length; i += 1) assert.ok(sorted[i - 1].distance <= sorted[i].distance);
});

test('nearestFirst: from Russian Market the Russian Market stall is first, with its distance', () => {
  const [first] = nearestFirst(samples, { lat: 11.5400, lng: 104.9190 }, null);
  assert.equal(first.id, 'russian');
  assert.ok(first.distance < 100, `got ${first.distance}`);
});

test('nearestFirst: a vehicle filter drops shops that do not fix it', () => {
  const moto = nearestFirst(samples, { lat: 11.5564, lng: 104.9282 }, 'moto');
  assert.ok(!moto.some((s) => s.id === 'olympic'));
  assert.deepEqual(
    nearestFirst(samples, { lat: 11.5564, lng: 104.9282 }, 'car').map((s) => s.id),
    ['monivong', 'olympic'],
  );
});

test('formatDistance: meters under 1 km, kilometers above', () => {
  assert.equal(formatDistance(347), '350 m');
  assert.equal(formatDistance(4), '10 m');
  assert.equal(formatDistance(1234), '1.2 km');
  assert.equal(formatDistance(999.9), '1.0 km');
});

test('directionsUrl: Google Maps directions to the shop', () => {
  assert.equal(
    directionsUrl({ lat: 11.5405, lng: 104.9195 }),
    'https://www.google.com/maps/dir/?api=1&destination=11.5405,104.9195',
  );
});
