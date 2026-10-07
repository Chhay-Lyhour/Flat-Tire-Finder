// Page state and startup. Every change to the state goes through render().
import { getSpots } from './api.js';
import { createMap, renderSpots, showYou } from './map.js';
import { initAddSpot, isPlacing, placePin, startAdding } from './addSpot.js';
import { initPanel, renderPanel, highlight } from './panel.js';
import { locateDriver } from './location.js';
import { nearestFirst } from './geo.js';

const state = {
  spots: [],
  here: null, // { lat, lng } once the driver's location is known
  waitingForTap: false, // location was denied: the next map tap sets it
  loaded: false,
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
  renderSpots(state.spots, highlight);
  if (state.here && state.loaded) {
    renderPanel(nearestFirst(state.spots, state.here, null), 'No repair spots near you yet. Add one!');
  }
}

function setLocation(point) {
  state.here = point;
  state.waitingForTap = false;
  showYou(point);
  render();
}

// What a map tap means: in add mode it places the stall's pin;
// otherwise, if location was denied, it sets where the driver is.
function handleMapTap(point) {
  if (isPlacing()) return placePin(point);
  if (state.waitingForTap) {
    showStatus('');
    setLocation(point);
  }
}

async function start() {
  createMap('map', handleMapTap);
  initPanel({ onAdd: startAdding });
  initAddSpot({
    getSpots: () => state.spots,
    onSaved: (spot) => {
      state.spots.push(spot);
      render();
    },
    showStatus,
    // Leaving add mode: remind the driver if we still need their location.
    onClosed: () => {
      if (state.waitingForTap) showStatus('Tap the map to set where you are.');
    },
  });

  locateDriver({
    onFound: (point) => {
      if (!state.here) setLocation(point);
    },
    onFallback: () => {
      if (!state.here) state.waitingForTap = true;
    },
    showStatus: (message) => {
      if (!state.here && !isPlacing()) showStatus(message);
    },
  });

  try {
    state.spots = await getSpots();
    state.loaded = true;
    render();
  } catch (error) {
    console.error(error);
    showStatus("Couldn't load repair spots. Check your connection.");
  }
}

start();
