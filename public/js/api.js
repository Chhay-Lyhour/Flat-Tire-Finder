// Thin wrappers around our Express API. Both throw when the request fails,
// so callers can show the right message.

export async function getSpots() {
  const response = await fetch('/api/spots');
  if (!response.ok) throw new Error(`GET /api/spots failed with ${response.status}`);
  return response.json();
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
