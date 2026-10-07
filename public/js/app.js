// Page state and startup. Every change to the state goes through render().
import { getSpots } from './api.js';
import { createMap, renderSpots } from './map.js';
import { initAddSpot, isPlacing, placePin } from './addSpot.js';

const state = {
  spots: [],
};

const statusEl = document.getElementById('status');
let statusTimer;

// Shows a short message at the top. With `hideAfterMs`, it disappears on its own.
export function showStatus(message, hideAfterMs) {
  clearTimeout(statusTimer);
  statusEl.textContent = message;
  statusEl.hidden = !message;
  if (message && hideAfterMs) statusTimer = setTimeout(() => showStatus(''), hideAfterMs);
}

function render() {
  renderSpots(state.spots);
}

// What a map tap means: in add mode it places the stall's pin.
// Tap-to-set-location arrives in a later slice.
function handleMapTap(point) {
  if (isPlacing()) placePin(point);
}

async function start() {
  createMap('map', handleMapTap);
  initAddSpot({
    getSpots: () => state.spots,
    onSaved: (spot) => {
      state.spots.push(spot);
      render();
    },
    showStatus,
  });
  try {
    state.spots = await getSpots();
    render();
  } catch (error) {
    console.error(error);
    showStatus("Couldn't load repair spots. Check your connection.");
  }
}

start();
