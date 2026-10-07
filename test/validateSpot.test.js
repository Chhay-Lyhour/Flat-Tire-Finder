import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSpot } from '../lib/validateSpot.js';

const good = { name: '  Roadside stall near Chbar Ampov bridge ', lat: 11.545, lng: 104.938, vehicles: ['moto'] };

test('accepts a spot with no price and forces is_sample to false', () => {
  const result = validateSpot({ ...good, is_sample: true });
  assert.equal(result.ok, true);
  assert.equal(result.value.name, 'Roadside stall near Chbar Ampov bridge');
  assert.equal(result.value.price_amount, null);
  assert.equal(result.value.price_currency, null);
  assert.equal(result.value.is_sample, false);
});

test('accepts a price in riel or dollars', () => {
  assert.equal(validateSpot({ ...good, price_amount: 5000, price_currency: 'KHR' }).ok, true);
  assert.equal(validateSpot({ ...good, price_amount: 1.5, price_currency: 'USD' }).ok, true);
});

test('rejects a missing or blank name', () => {
  assert.equal(validateSpot({ ...good, name: '   ' }).error, 'Add a name.');
  assert.equal(validateSpot({ ...good, name: undefined }).ok, false);
});

test('rejects empty or unknown vehicles', () => {
  assert.equal(validateSpot({ ...good, vehicles: [] }).error, 'Add at least one vehicle type.');
  assert.equal(validateSpot({ ...good, vehicles: ['bus'] }).ok, false);
});

test('rejects a missing location', () => {
  assert.equal(validateSpot({ ...good, lat: undefined }).ok, false);
  assert.equal(validateSpot({ ...good, lng: 500 }).ok, false);
});

test('rejects a price without a currency, or a negative price', () => {
  assert.equal(validateSpot({ ...good, price_amount: 5000 }).ok, false);
  assert.equal(validateSpot({ ...good, price_amount: -1, price_currency: 'KHR' }).ok, false);
});

test('phone is optional, but trimmed and checked when given', () => {
  assert.equal(validateSpot(good).value.phone, null);
  assert.equal(validateSpot({ ...good, phone: '  ' }).value.phone, null);
  assert.equal(validateSpot({ ...good, phone: ' 012 345 678 ' }).value.phone, '012 345 678');
  assert.equal(validateSpot({ ...good, phone: '+855 12 345 678' }).ok, true);
});

test('rejects a phone number that is too short or has letters', () => {
  assert.equal(validateSpot({ ...good, phone: '123' }).error, 'Enter a valid phone number.');
  assert.equal(validateSpot({ ...good, phone: 'call me' }).ok, false);
});
