// Checks a new spot from the browser before it goes into Supabase.
// Mirrors the checks in db/schema.sql so bad input gets a clear 400 instead of a database error.

export const VEHICLES = ['moto', 'tuktuk', 'car'];
export const CURRENCIES = ['KHR', 'USD'];

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export function validateSpot(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Send the spot as JSON.' };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 1) return { ok: false, error: 'Add a name.' };
  if (name.length > 100) return { ok: false, error: 'Keep the name under 100 characters.' };

  const { lat, lng } = body;
  if (!isNumber(lat) || lat < -90 || lat > 90 || !isNumber(lng) || lng < -180 || lng > 180) {
    return { ok: false, error: 'Tap the map where the stall is.' };
  }

  const vehicles = Array.isArray(body.vehicles) ? [...new Set(body.vehicles)] : [];
  if (vehicles.length < 1) return { ok: false, error: 'Add at least one vehicle type.' };
  if (!vehicles.every((v) => VEHICLES.includes(v))) return { ok: false, error: 'Unknown vehicle type.' };

  let price_amount = body.price_amount ?? null;
  let price_currency = body.price_currency ?? null;
  if (price_amount === null) {
    price_currency = null;
  } else {
    if (!isNumber(price_amount) || price_amount < 0) return { ok: false, error: 'The price must be a positive number.' };
    if (!CURRENCIES.includes(price_currency)) return { ok: false, error: 'Choose riel or dollars for the price.' };
  }

  // is_sample is never accepted from the browser: everything posted is driver-added.
  return { ok: true, value: { name, lat, lng, vehicles, price_amount, price_currency, is_sample: false } };
}
