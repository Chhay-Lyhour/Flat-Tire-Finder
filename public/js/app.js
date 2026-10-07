// Page state and startup. Every change to the state goes through render().
import { getSpots } from './api.js';
import { createMap, renderSpots } from './map.js';

const state = {
  spots: [],
};

const statusEl = document.getElementById('status');

export function showStatus(message) {
  statusEl.textContent = message;
  statusEl.hidden = !message;
}

function render() {
  renderSpots(state.spots);
}

function handleMapTap() {
  // Add mode and tap-to-set-location arrive in later slices.
}

async function start() {
  createMap('map', handleMapTap);
  try {
    state.spots = await getSpots();
    render();
  } catch (error) {
    console.error(error);
    showStatus("Couldn't load repair spots. Check your connection.");
  }
}

start();
