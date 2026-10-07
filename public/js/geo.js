// Distance and formatting helpers. Pure functions, so they run in the browser and in node --test.

const EARTH_RADIUS_M = 6371000;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Straight-line distance in meters between two { lat, lng } points (haversine formula).
export function haversineMeters(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Spots within `meters` of a point, nearest first. Used for the "already here" check.
export function findNearby(spots, point, meters) {
  return spots
    .map((spot) => ({ spot, distance: haversineMeters(point, spot) }))
    .filter(({ distance }) => distance <= meters)
    .sort((x, y) => x.distance - y.distance)
    .map(({ spot }) => spot);
}

// "~5,000៛", "~$1.50", or "Price not listed".
export function formatPrice(amount, currency) {
  if (amount === null || amount === undefined) return 'Price not listed';
  const value = Number(amount);
  if (currency === 'USD') return `~$${value.toFixed(2)}`;
  return `~${Math.round(value).toLocaleString('en-US')}៛`;
}
