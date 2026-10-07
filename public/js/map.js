// The Leaflet map: OpenStreetMap tiles, repair-spot pins and the legend.
/* global L */

export const PHNOM_PENH = { lat: 11.5564, lng: 104.9282 };

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

let map;
let spotLayer;
let draftPin;

export function createMap(elementId, onMapTap) {
  map = L.map(elementId, { zoomControl: false }).setView([PHNOM_PENH.lat, PHNOM_PENH.lng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  spotLayer = L.layerGroup().addTo(map);
  addLegend();

  map.on('click', (event) => onMapTap({ lat: event.latlng.lat, lng: event.latlng.lng }));
  return map;
}

function addLegend() {
  const legend = L.control({ position: 'topright' });
  legend.onAdd = () => {
    const box = L.DomUtil.create('div', 'legend');
    box.innerHTML =
      '<div><span class="legend-dot sample"></span><span data-i18n="sampleShop">Sample shop</span></div>' +
      '<div><span class="legend-dot driver"></span><span data-i18n="addedByDriver">Added by a driver</span></div>';
    return box;
  };
  legend.addTo(map);
}

let youDot;

// The driver's position: a blue dot, and the map moves there.
export function showYou(point) {
  if (!youDot) {
    youDot = L.circleMarker([point.lat, point.lng], {
      radius: 9,
      color: '#FFFFFF',
      weight: 3,
      fillColor: cssVar('--you'),
      fillOpacity: 1,
      interactive: false,
    }).addTo(map);
  } else {
    youDot.setLatLng([point.lat, point.lng]);
  }
  map.setView([point.lat, point.lng], 15);
}

// The orange pin a driver places while adding a spot. Tapping again moves it.
export function showDraftPin(point) {
  if (!draftPin) {
    draftPin = L.circleMarker([point.lat, point.lng], {
      radius: 13,
      color: '#FFFFFF',
      weight: 4,
      fillColor: cssVar('--accent'),
      fillOpacity: 1,
      interactive: false,
    }).addTo(map);
  } else {
    draftPin.setLatLng([point.lat, point.lng]);
  }
}

export function clearDraftPin() {
  draftPin?.remove();
  draftPin = null;
}

// Redraws every spot pin. Sample shops are slate, driver-added spots are green.
export function renderSpots(spots, onPinTap) {
  spotLayer.clearLayers();
  for (const spot of spots) {
    const pin = L.circleMarker([spot.lat, spot.lng], {
      radius: 10,
      color: '#FFFFFF',
      weight: 3,
      fillColor: spot.is_sample ? cssVar('--pin-sample') : cssVar('--pin-driver'),
      fillOpacity: 1,
    });
    pin.on('click', (event) => {
      L.DomEvent.stopPropagation(event);
      onPinTap?.(spot.id);
    });
    pin.addTo(spotLayer);
  }
}
