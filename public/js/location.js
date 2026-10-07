// Finds the driver: browser location first, tapping the map as the fallback.

const TIMEOUT_MS = 10000;

// callbacks: { onFound(point), onFallback(), showStatus(key) } — keys are from i18n.js.
// onFound can still fire after onFallback if the driver allows location late;
// app.js ignores it once a location has been tapped.
export async function locateDriver({ onFound, onFallback, showStatus }) {
  if (!('geolocation' in navigator)) return fallBack();

  let settled = false;
  const fallBackOnce = () => {
    if (settled) return;
    settled = true;
    fallBack();
  };

  // Before the driver answers the browser's popup, explain why we're asking.
  showStatus('findingYou');
  try {
    const permission = await navigator.permissions?.query({ name: 'geolocation' });
    if (permission?.state === 'prompt') {
      showStatus('allowLocation');
      permission.onchange = () => {
        if (permission.state === 'granted' && !settled) showStatus('findingYou');
      };
    }
  } catch {
    // Some browsers can't query this permission; the popup still works.
  }

  const timer = setTimeout(fallBackOnce, TIMEOUT_MS);
  navigator.geolocation.getCurrentPosition(
    (position) => {
      clearTimeout(timer);
      settled = true;
      showStatus('');
      onFound({ lat: position.coords.latitude, lng: position.coords.longitude });
    },
    () => {
      clearTimeout(timer);
      fallBackOnce();
    },
    { enableHighAccuracy: true, timeout: TIMEOUT_MS, maximumAge: 60000 },
  );

  function fallBack() {
    showStatus('tapToSetLocation');
    onFallback();
  }
}
