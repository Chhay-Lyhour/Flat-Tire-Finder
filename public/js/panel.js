// The bottom panel: the nearest-shop card, the other shops by distance, and the expand handle.
import { formatDistance, formatPrice, directionsUrl } from './geo.js';

const VEHICLE_LABELS = { moto: '🏍️ Moto', tuktuk: '🛺 Tuk-tuk', car: '🚗 Car' };

const panel = document.getElementById('panel');
const handle = document.getElementById('panel-handle');
const handleLabel = document.getElementById('panel-handle-label');
const nearestEl = document.getElementById('nearest');
const listEl = document.getElementById('shop-list');

let onAddClick;

export function initPanel({ onAdd }) {
  onAddClick = onAdd;
  handle.addEventListener('click', () => setExpanded(!panel.classList.contains('expanded')));

  // Keep the floating Add button just above the panel, whatever its height.
  new ResizeObserver(() => {
    const height = panel.hidden ? 0 : panel.offsetHeight;
    document.documentElement.style.setProperty('--panel-height', `${height}px`);
  }).observe(panel);
}

function setExpanded(expanded) {
  panel.classList.toggle('expanded', expanded);
  handle.setAttribute('aria-expanded', String(expanded));
  handleLabel.textContent = expanded ? 'Show the map' : 'Show all shops';
}

// `sorted` comes from nearestFirst(): matching spots with a distance, nearest first.
export function renderPanel(sorted, emptyMessage) {
  panel.hidden = false;
  nearestEl.replaceChildren();
  listEl.replaceChildren();

  if (sorted.length === 0) {
    nearestEl.append(emptyState(emptyMessage));
    handle.hidden = true;
    setExpanded(false);
    return;
  }

  const [nearest, ...others] = sorted;
  nearestEl.append(shopEntry(nearest, true));
  for (const spot of others) {
    const item = document.createElement('li');
    item.append(shopEntry(spot, false));
    listEl.append(item);
  }
  handle.hidden = others.length === 0;
  if (others.length === 0) setExpanded(false);
}

// Tapping a pin: open the panel if needed and outline that shop.
export function highlight(id) {
  panel.querySelectorAll('.shop.is-highlighted').forEach((el) => el.classList.remove('is-highlighted'));
  const entry = panel.querySelector(`.shop[data-id="${CSS.escape(id)}"]`);
  if (!entry) return;
  if (!nearestEl.contains(entry)) setExpanded(true);
  entry.classList.add('is-highlighted');
  entry.scrollIntoView({ block: 'nearest' });
}

// Built with textContent, never innerHTML: names come from drivers.
function shopEntry(spot, isNearest) {
  const card = el('article', isNearest ? 'shop nearest-card' : 'shop');
  card.dataset.id = spot.id;

  if (isNearest) card.append(el('p', 'nearest-label', 'Nearest repair shop'));

  const top = el('div', 'shop-top');
  top.append(el('h3', 'shop-name', spot.name), el('span', 'shop-distance', formatDistance(spot.distance)));
  card.append(top);

  const details = el('p', 'shop-details');
  details.append(
    el('span', 'shop-vehicles', spot.vehicles.map((v) => VEHICLE_LABELS[v]).join('  ')),
    el('span', 'shop-price', formatPrice(spot.price_amount, spot.price_currency)),
  );
  card.append(details);

  const bottom = el('div', 'shop-bottom');
  bottom.append(el('span', spot.is_sample ? 'tag sample' : 'tag driver', spot.is_sample ? 'Sample shop' : 'Added by a driver'));

  const links = el('div', 'shop-links');
  if (spot.phone) {
    const call = el('a', 'call', 'Call');
    call.href = `tel:${spot.phone}`;
    links.append(call);
  }
  const directions = el('a', 'directions', 'Directions');
  directions.href = directionsUrl(spot);
  directions.target = '_blank';
  directions.rel = 'noopener';
  links.append(directions);
  bottom.append(links);
  card.append(bottom);

  return card;
}

function emptyState(message) {
  const box = el('div', 'empty');
  box.append(el('p', 'empty-text', message));
  const add = el('button', 'button primary', '+ Add a repair spot');
  add.type = 'button';
  add.addEventListener('click', () => onAddClick());
  box.append(add);
  return box;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
