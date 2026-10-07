// Page state and startup. Every change to the state goes through render().
import { getSpots, getCachedSpots, deleteSpot } from './api.js';
import { createMap, renderSpots, showYou } from './map.js';
import { initAddSpot, isPlacing, placePin, startAdding, startEditing } from './addSpot.js';
import { initPanel, renderPanel, highlight } from './panel.js';
import { getOwnerToken, forgetOwner } from './ownership.js';
import { locateDriver } from './location.js';
import { nearestFirst } from './geo.js';
import { initFilter } from './filter.js';
import { t, getLang, setLang, applyLanguage } from './i18n.js';

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
let statusKey = '';

// Shows a short message at the top, by i18n key ('' hides it). Keeping the key, not the text,
// lets a language switch re-translate a message that's on screen. With `hideAfterMs`, it disappears on its own.
function showStatus(key, hideAfterMs) {
  clearTimeout(statusTimer);
  statusKey = key;
  statusText.textContent = key ? t(key) : '';
  retryButton.hidden = true;
  statusEl.hidden = !key;
  if (key && hideAfterMs) statusTimer = setTimeout(() => showStatus(''), hideAfterMs);
}

// The pins, the nearest card and the list all follow the vehicle filter.
function render() {
  const matching = state.spots.filter((spot) => spot.vehicles.includes(state.vehicle));
  renderSpots(matching, highlight);
  if (state.here && state.loaded) {
    renderPanel(
      nearestFirst(state.spots, state.here, state.vehicle),
      t('noSpotsNear', { vehicle: t(state.vehicle) }),
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
      showStatus('offlineSaved');
    } else {
      showStatus('loadFailed');
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
    showStatus('spotDeleted', 2500);
  } catch (error) {
    console.error(error);
    showStatus('deleteFailed', 2500);
  }
}

async function start() {
  createMap('map', handleMapTap);
  applyLanguage();
  document.getElementById('lang-toggle').addEventListener('click', () => setLang(getLang() === 'en' ? 'km' : 'en'));
  // Static text is already switched by setLang(); redraw what JS builds.
  window.addEventListener('flatfinder:langchange', () => {
    if (statusKey) statusText.textContent = t(statusKey);
    render();
  });
  initPanel({ onAdd: startAdding, onEdit: startEditing, onDelete: deleteSpotFlow });
  initFilter({
    initial: state.vehicle,
    onChange: (vehicle) => {
      state.vehicle = vehicle;
      render();
    },
  });
  retryButton.addEventListener('click', async () => {
    showStatus('loading');
    if (await loadSpots()) showStatus(state.waitingForTap ? 'tapToSetLocation' : '');
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
      if (state.waitingForTap) showStatus('tapToSetLocation');
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
    showStatus: (key) => {
      if (!state.here && !isPlacing() && retryButton.hidden) showStatus(key);
    },
  });

  await loadSpots();
}

start();
