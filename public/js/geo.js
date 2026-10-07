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

// Spots that fix `vehicle` (all spots when vehicle is null), each with a `distance`
// in meters from `here`, nearest first. No distance limit.
export function nearestFirst(spots, here, vehicle) {
  return spots
    .filter((spot) => !vehicle || spot.vehicles.includes(vehicle))
    .map((spot) => ({ ...spot, distance: haversineMeters(here, spot) }))
    .sort((a, b) => a.distance - b.distance);
}

// "350 m" under 1 km, "1.2 km" from there up.
export function formatDistance(meters) {
  const rounded = Math.max(10, Math.round(meters / 10) * 10);
  if (rounded < 1000) return `${rounded} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Opens Google Maps with directions to the spot.
export function directionsUrl(spot) {
  return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
}

// The message a driver forwards: name, price, phone if listed, and a directions link.
export function shareText(spot) {
  const lines = [spot.name, formatPrice(spot.price_amount, spot.price_currency)];
  if (spot.phone) lines.push(`Phone: ${spot.phone}`);
  lines.push(directionsUrl(spot));
  return lines.join('\n');
}

// WhatsApp with the message ready to send, for browsers without a share sheet.
export function whatsappUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// "~5,000៛", "~$1.50", or "Price not listed".
export function formatPrice(amount, currency) {
  if (amount === null || amount === undefined) return 'Price not listed';
  const value = Number(amount);
  if (currency === 'USD') return `~$${value.toFixed(2)}`;
  return `~${Math.round(value).toLocaleString('en-US')}៛`;
}
