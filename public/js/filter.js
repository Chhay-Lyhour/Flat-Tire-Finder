// The Moto / Tuk-tuk / Car buttons. One is always selected; Moto by default.

const buttons = [...document.querySelectorAll('.vehicle-option')];

export function initFilter({ initial, onChange }) {
  select(initial);
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      select(button.dataset.vehicle);
      onChange(button.dataset.vehicle);
    }),
  );
}

function select(vehicle) {
  buttons.forEach((button) => {
    const selected = button.dataset.vehicle === vehicle;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
