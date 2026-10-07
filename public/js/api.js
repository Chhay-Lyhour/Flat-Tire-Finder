// Thin wrappers around our Express API. Both throw when the request fails,
// so callers can show the right message.

export async function getSpots() {
  const response = await fetch('/api/spots');
  if (!response.ok) throw new Error(`GET /api/spots failed with ${response.status}`);
  return response.json();
}
