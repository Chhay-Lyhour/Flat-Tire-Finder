// Page state and startup. Every change to the state goes through render().
import { getSpots, getCachedSpots, deleteSpot } from './api.js';
import { createMap, renderSpots, showYou } from './map.js';
import { initAddSpot, isPlacing, placePin, startAdding, startEditing } from './addSpot.js';
import { initPanel, renderPanel, highlight } from './panel.js';
import { getOwnerToken, forgetOwner } from './ownership.js';
import { locateDriver } from './location.js';
import { nearestFirst } from './geo.js';
import { initFilter, VEHICLE_NAMES } from './filter.js';

const state = {
  spots: [],
  vehicle: 'moto', // moto riders are the main users
  here: null, // { lat, lng } once the driver's location is known
  waitingForTap: false, // location was denied: the next map tap sets it
  loaded: false,
};

const statusEl = document.getElementById('status');
const statusText = document.getElementById('status-text');
const retryButton = document.getElementById('status-retry');
let statusTimer;

// Shows a short message at the top. With `hideAfterMs`, it disappears on its own.
export function showStatus(message, hideAfterMs) {
  clearTimeout(statusTimer);
  statusText.textContent = message;
  retryButton.hidden = true;
  statusEl.hidden = !message;
  if (message && hideAfterMs) statusTimer = setTimeout(() => showStatus(''), hideAfterMs);
}

// The pins, the nearest card and the list all follow the vehicle filter.
function render() {
  const matching = state.spots.filter((spot) => spot.vehicles.includes(state.vehicle));
  renderSpots(matching, highlight);
  if (state.here && state.loaded) {
    renderPanel(
      nearestFirst(state.spots, state.here, state.vehicle),
      `No ${VEHICLE_NAMES[state.vehicle]} repair spots near you yet. Add one!`,
    );
  }
}

// Returns true when the spots loaded. Offline, it falls back to the last saved list
// (with Retry so the driver can refresh); with nothing saved, it shows the error with Retry.
async function loadSpots() {
  try {
    state.spots = await getSpots();
    state.loaded = true;
    render();
    return true;
  } catch (error) {
    console.error(error);
    const cached = getCachedSpots();
    if (cached) {
      state.spots = cached;
      state.loaded = true;
      render();
      showStatus("You're offline. Showing shops saved from your last visit.");
    } else {
      showStatus("Couldn't load repair spots. Check your connection.");
    }
    retryButton.hidden = false;
    return false;
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

// Delete flow lives here (not in addSpot.js) since it needs state.spots and api.js directly.
async function deleteSpotFlow(spot) {
  try {
    await deleteSpot(spot.id, getOwnerToken(spot.id));
    forgetOwner(spot.id);
    state.spots = state.spots.filter((s) => s.id !== spot.id);
    render();
    showStatus('Spot deleted', 2500);
  } catch (error) {
    console.error(error);
    showStatus("Couldn't delete. Try again.", 2500);
  }
}

async function start() {
  createMap('map', handleMapTap);
  initPanel({ onAdd: startAdding, onEdit: startEditing, onDelete: deleteSpotFlow });
  initFilter({
    initial: state.vehicle,
    onChange: (vehicle) => {
      state.vehicle = vehicle;
      render();
    },
  });
  retryButton.addEventListener('click', async () => {
    showStatus('Loading repair spots...');
    if (await loadSpots()) showStatus(state.waitingForTap ? 'Tap the map to set where you are.' : '');
  });
  initAddSpot({
    getSpots: () => state.spots,
    onSaved: (spot) => {
      state.spots.push(spot);
      render();
    },
    onUpdated: (spot) => {
      state.spots = state.spots.map((s) => (s.id === spot.id ? spot : s));
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
    // Location messages never cover a load error (the Retry button is showing).
    showStatus: (message) => {
      if (!state.here && !isPlacing() && retryButton.hidden) showStatus(message);
    },
  });

  await loadSpots();
}

start();
