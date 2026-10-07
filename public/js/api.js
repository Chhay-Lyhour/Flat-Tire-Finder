// Thin wrappers around our Express API. Both throw when the request fails,
// so callers can show the right message.

const CACHE_KEY = 'flatfinder:spots-cache';

// Every successful load is saved, so a later load on a bad connection can still show shops.
export async function getSpots() {
  const response = await fetch('/api/spots');
  if (!response.ok) throw new Error(`GET /api/spots failed with ${response.status}`);
  const spots = await response.json();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(spots));
  } catch {
    // Storage full or blocked: the app still works, just without the offline copy.
  }
  return spots;
}

// The last list getSpots() loaded, or null if there isn't one.
export function getCachedSpots() {
  try {
    const spots = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(spots) ? spots : null;
  } catch {
    return null;
  }
}

export async function createSpot(spot) {
  const response = await fetch('/api/spots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spot),
  });
  if (!response.ok) throw new Error(`POST /api/spots failed with ${response.status}`);
  return response.json();
}

export async function updateSpot(id, spot, ownerToken) {
  const response = await fetch(`/api/spots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Owner-Token': ownerToken },
    body: JSON.stringify(spot),
  });
  if (!response.ok) throw new Error(`PATCH /api/spots/${id} failed with ${response.status}`);
  return response.json();
}

export async function deleteSpot(id, ownerToken) {
  const response = await fetch(`/api/spots/${id}`, {
    method: 'DELETE',
    headers: { 'X-Owner-Token': ownerToken },
  });
  if (!response.ok) throw new Error(`DELETE /api/spots/${id} failed with ${response.status}`);
}
