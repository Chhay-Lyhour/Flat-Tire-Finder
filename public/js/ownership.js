// Remembers which spots this browser created, so it can offer Edit/Delete on them.
// No accounts: the server hands back a one-time owner_token on POST (see routes/spots.js)
// and this is the only place that token lives. Lost if the browser's storage is cleared.
const STORAGE_KEY = 'flatfinder:owned-spots';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function writeAll(owned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
  } catch {
    // Storage unavailable (private mode, quota, ...): editing just won't be offered next visit.
  }
}

export function rememberOwner(spotId, token) {
  const owned = readAll();
  owned[spotId] = token;
  writeAll(owned);
}

export function getOwnerToken(spotId) {
  return readAll()[spotId] ?? null;
}

export function isOwned(spotId) {
  return getOwnerToken(spotId) !== null;
}

export function forgetOwner(spotId) {
  const owned = readAll();
  delete owned[spotId];
  writeAll(owned);
}
