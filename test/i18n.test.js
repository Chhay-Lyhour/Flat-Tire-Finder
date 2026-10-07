import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, translate } from '../public/js/i18n.js';

test('every English string has a Khmer version, and no extras', () => {
  assert.deepEqual(Object.keys(STRINGS.km).sort(), Object.keys(STRINGS.en).sort());
});

test('translate: picks the language', () => {
  assert.equal(translate('save', 'en'), 'Save');
  assert.equal(translate('save', 'km'), 'រក្សាទុក');
});

test('translate: fills {placeholders}', () => {
  assert.equal(
    translate('noSpotsNear', 'en', { vehicle: 'Moto' }),
    'No Moto repair spots near you yet. Add one!',
  );
  assert.ok(translate('noSpotsNear', 'km', { vehicle: 'ម៉ូតូ' }).includes('ម៉ូតូ'));
});

test('translate: unknown language falls back to English, unknown key to the key', () => {
  assert.equal(translate('save', 'fr'), 'Save');
  assert.equal(translate('noSuchKey', 'km'), 'noSuchKey');
});
