// Add a repair spot: add mode, the draft pin, the form, validation, duplicate check and saving.
import { createSpot } from './api.js';
import { showDraftPin, clearDraftPin } from './map.js';
import { findNearby } from './geo.js';

const DUPLICATE_RADIUS_M = 30;

const addButton = document.getElementById('add-button');
const form = document.getElementById('add-form');
const nameInput = document.getElementById('spot-name');
const vehicleInputs = [...form.querySelectorAll('input[name="vehicle"]')];
const priceInput = document.getElementById('spot-price');
const currencyButtons = [...form.querySelectorAll('.currency-option')];
const phoneInput = document.getElementById('spot-phone');
const saveButton = document.getElementById('save-spot');
const formMessage = document.getElementById('form-message');
const formActions = document.getElementById('form-actions');
const duplicateConfirm = document.getElementById('duplicate-confirm');
const fields = {
  name: document.getElementById('name-field'),
  vehicles: document.getElementById('vehicle-field'),
  price: document.getElementById('price-field'),
  phone: document.getElementById('phone-field'),
};
// Digits, spaces and the punctuation real phone numbers use (+855 12 345 678, 012-345-678, ...).
const PHONE_PATTERN = /^[0-9+()\-\s]{6,20}$/;

let placing = false;
let point = null;
let currency = 'KHR';
let saving = false;
const touched = new Set();
let deps;

// deps: { getSpots(), onSaved(spot), showStatus(message), onClosed() }
export function initAddSpot(dependencies) {
  deps = dependencies;

  addButton.addEventListener('click', startAdding);
  document.getElementById('cancel-add').addEventListener('click', stopAdding);

  nameInput.addEventListener('input', () => touch('name'));
  vehicleInputs.forEach((input) => input.addEventListener('change', () => touch('vehicles')));
  priceInput.addEventListener('input', () => touch('price'));
  phoneInput.addEventListener('input', () => touch('phone'));
  currencyButtons.forEach((button) =>
    button.addEventListener('click', () => setCurrency(button.dataset.currency)),
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    trySave();
  });
  document.getElementById('duplicate-yes').addEventListener('click', save);
  document.getElementById('duplicate-no').addEventListener('click', () => showDuplicatePrompt(false));
}

export const isPlacing = () => placing;

// Called by app.js when the map is tapped in add mode.
export function placePin(tapped) {
  point = tapped;
  showDraftPin(point);
  form.hidden = false;
  deps.showStatus('');
  update();
}

// Also used by the panel's empty state.
export function startAdding() {
  placing = true;
  document.body.classList.add('is-adding');
  addButton.hidden = true;
  deps.showStatus('Tap the map where the stall is.');
}

// Cancel: discard everything without saving.
function stopAdding() {
  placing = false;
  point = null;
  form.reset();
  setCurrency('KHR');
  touched.clear();
  formMessage.textContent = '';
  showDuplicatePrompt(false);
  form.hidden = true;
  document.body.classList.remove('is-adding');
  addButton.hidden = false;
  clearDraftPin();
  deps.showStatus('');
  deps.onClosed?.();
}

// Riel by default; the toggle switches to dollars.
function setCurrency(next) {
  currency = next;
  currencyButtons.forEach((button) => {
    const selected = button.dataset.currency === next;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  priceInput.placeholder = next === 'KHR' ? '5000' : '1.50';
}

function touch(field) {
  touched.add(field);
  formMessage.textContent = '';
  update();
}

function readPrice() {
  const raw = priceInput.value.trim();
  if (raw === '') return { amount: null, valid: true };
  const amount = Number(raw);
  return { amount, valid: Number.isFinite(amount) && amount >= 0 && !priceInput.validity.badInput };
}

function readPhone() {
  const raw = phoneInput.value.trim();
  if (raw === '') return { value: null, valid: true };
  return { value: raw, valid: PHONE_PATTERN.test(raw) };
}

function readForm() {
  const name = nameInput.value.trim();
  const vehicles = vehicleInputs.filter((input) => input.checked).map((input) => input.value);
  const price = readPrice();
  const phone = readPhone();
  return { name, vehicles, price, phone };
}

// Save stays disabled until the pin, a name and a vehicle are present.
// A field is highlighted only after the driver has touched it.
function update() {
  const { name, vehicles, price, phone } = readForm();
  const missing = { name: !name, vehicles: vehicles.length === 0, price: !price.valid, phone: !phone.valid };
  for (const [key, isMissing] of Object.entries(missing)) {
    fields[key].classList.toggle('is-missing', isMissing && touched.has(key));
  }
  saveButton.disabled =
    saving || !point || missing.name || missing.vehicles || missing.price || missing.phone;
}

function trySave() {
  update();
  if (saveButton.disabled) return;
  const nearby = findNearby(deps.getSpots(), point, DUPLICATE_RADIUS_M);
  if (nearby.length > 0) return showDuplicatePrompt(true);
  save();
}

function showDuplicatePrompt(show) {
  duplicateConfirm.hidden = !show;
  formActions.hidden = show;
}

async function save() {
  const { name, vehicles, price, phone } = readForm();
  showDuplicatePrompt(false);
  saving = true;
  saveButton.textContent = 'Saving…';
  update();
  try {
    const saved = await createSpot({
      name,
      lat: point.lat,
      lng: point.lng,
      vehicles,
      price_amount: price.amount,
      price_currency: price.amount === null ? null : currency,
      phone: phone.value,
    });
    saving = false;
    saveButton.textContent = 'Save';
    stopAdding();
    deps.onSaved(saved);
    deps.showStatus('Spot added', 2500);
  } catch (error) {
    // Keep everything the driver typed so they can simply try again.
    console.error(error);
    saving = false;
    saveButton.textContent = 'Save';
    formMessage.textContent = "Couldn't save. Try again.";
    update();
  }
}
