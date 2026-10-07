---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

Git rule (learner's choice): the agent never runs `git commit` or `git push`. After each slice passes verification, the agent gives the exact `git add` and `git commit` lines and waits for the learner to run them before continuing. Commits have no co-author or Claude trailer.

## Slices

- [x] **1. The map shows the labeled sample shops from Supabase**
  Becomes usable: Running `npm start` and opening `http://localhost:3000` shows a full-screen map of Phnom Penh with slate sample-shop pins loaded from your Supabase database, plus the legend and the floating "Add a repair spot" button (not wired up yet).
  Why now: This proves the riskiest connections first: Express ↔ Supabase (with your new project, RLS and secret key) and Leaflet ↔ OpenStreetMap tiles. It also includes all the project setup, so every later slice has somewhere to land.
  PRD ref: `prd.md > Sample Shops`, `prd.md > Screens and Layout`, `prd.md > The Core Journey` (step 1)
  Spec ref: `spec.md > Express Server (server.js)`, `spec.md > Spots API (routes/spots.js)` (GET only), `spec.md > Supabase Client (lib/supabase.js)`, `spec.md > Seed Script (scripts/seed.js)`, `spec.md > Database: spots table (db/schema.sql)`, `spec.md > Sample shops (scripts/seed.js)`, `spec.md > Map (public/js/map.js)`, `spec.md > API Client (public/js/api.js)`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Create `package.json` ("type": "module"; start, seed and test scripts), `.env.example`, `db/schema.sql`, `lib/supabase.js` (stops with a clear message if env vars are missing), `routes/spots.js` with GET, `server.js`, `scripts/seed.js`, and `public/index.html`, `styles.css`, `js/app.js`, `js/api.js` and `js/map.js`. Verify the current Leaflet CDN URL and integrity hash. The learner creates the Supabase project, runs the schema SQL and fills in `.env` themselves. Then run the seed script.
  Verify (mechanical): `npm start` starts with no errors. `curl localhost:3000/api/spots` returns 7 rows, all with `is_sample: true` and names starting with "Sample:". `curl localhost:3000/` returns the page, and `npm run seed` run twice still leaves 7 sample rows. Starting without `.env` prints the missing-variable message.
  Learner check: Open `http://localhost:3000` in Chrome DevTools phone view. You should see a map of Phnom Penh with 7 slate pins, a legend in the corner and an orange "Add a repair spot" button. Open the `spots` table in the Supabase dashboard and confirm it holds the same 7 sample shops.
  Commit: `Show sample repair shops from Supabase on a Leaflet map`

- [x] **2. Drivers can add a repair spot that persists for everyone**
  Becomes usable: Tap "Add a repair spot", tap the map to place (or move) a pin, fill in the name, vehicle types and optional price (riel or dollars), and save. A green "Added by a driver" pin appears and survives a refresh. Cancel discards everything, a nearby duplicate triggers a warning, and a failed save keeps the form filled in.
  Why now: This is the unique kernel, adding stalls that Google Maps doesn't have, so it comes before anything else is built around it. It also exercises the write path and validation on both browser and server.
  PRD ref: `prd.md > Adding a Repair Spot`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Add a Repair Spot (public/js/addSpot.js)`, `spec.md > Spots API (routes/spots.js)` (POST), `spec.md > Spot Validation (lib/validateSpot.js)`, `spec.md > Distance and Formatting (public/js/geo.js)` (`haversineMeters`, `findNearby`, `formatPrice`), `spec.md > App State and Startup (public/js/app.js)` (map-tap rules), `spec.md > Important Failure Modes`
  Build: Add POST `/api/spots` with `lib/validateSpot.js`; `public/js/geo.js` with `haversineMeters`, `findNearby` and `formatPrice`; and `public/js/addSpot.js` with add mode, the temporary pin, the form, Save disabled until valid, missing-field messages, Cancel, the 30 m "Add anyway?" prompt, "Spot added" and "Couldn't save. Try again." Add driver-added pins in green, and tests in `test/validateSpot.test.js` and `test/geo.test.js`.
  Verify (mechanical): `npm test` passes, including a ~1 km haversine check within a few meters, the 30 m duplicate check, price formatting and validation of bad bodies. A `curl` POST of a valid spot returns 201, and `GET` then includes it with `is_sample: false`. Invalid POSTs (no name, empty vehicles, a price without a currency) return 400. Delete the curl test rows afterward.
  Learner check: Add a spot by tapping the map, try saving with no name or no vehicle (Save should stay disabled with a message), then save a real one. A green pin and "Spot added" should appear. Refresh, and it's still there. Place another spot right next to it to see the "already here" prompt, and try Cancel once.
  Commit: `Let drivers add repair spots with validation and duplicate warning`

- [x] **3. Drivers see the nearest shop and can get directions**
  Becomes usable: Location is requested on open ("Finding you..."), the map moves to the driver, or if location is denied, a tap sets where they are. The bottom panel shows a big nearest-shop card and the other shops sorted by distance, each with distance, vehicle emoji, price or "Price not listed", a tag and a Directions button that opens Google Maps. Tapping the handle expands or collapses the panel, and tapping a pin highlights that shop. Newly added spots appear in the list right away.
  Why now: This completes the other half of the proof (finding the nearest shop) on top of real data, including the driver-added spots from slice 2.
  PRD ref: `prd.md > Finding the Driver's Location`, `prd.md > Nearest Shop and Shop List`, `prd.md > Directions`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Location (public/js/location.js)`, `spec.md > Bottom Panel (public/js/panel.js)`, `spec.md > Distance and Formatting (public/js/geo.js)` (`nearestFirst`, `formatDistance`), `spec.md > App State and Startup (public/js/app.js)`, `spec.md > The Core Journey Through the System`, `spec.md > Look and Feel`
  Build: Add `public/js/location.js` (10-second timeout, tap-to-set fallback, blue dot), `public/js/panel.js` (nearest card, list, tags, Directions links, tap-to-expand handle, `highlight(id)`), and `nearestFirst` and `formatDistance` in `geo.js` with tests. Wire the re-render in `app.js`. From the early checkpoint: make the buttons bigger and give the add form more room on a phone.
  Verify (mechanical): `npm test` passes, including sorting the sample shops from a known point to put the expected shop first and formatting "350 m" and "1.2 km". A static check that each Directions link matches `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG` for its shop. The server starts with no errors and the page loads with no console errors.
  Learner check: In DevTools Sensors, set the location to 11.5564, 104.9282 and reload. The map should jump there, and the card should show the closest shop with its distance. Tap Directions to open Google Maps. Expand and collapse the panel, and tap a pin to see it highlighted. Then set Sensors to "Location unavailable", reload, and tap the map to set your position.
  Commit: `Show nearest shops sorted by distance with directions`

- [ ] **4. Drivers filter by vehicle, and the app is demo-ready**
  Becomes usable: The Moto, Tuk-tuk and Car buttons (Moto by default) filter the card, the list and the pins together. "No [vehicle] repair spots near you yet. Add one!" appears when nothing matches. A failed load at startup shows a message with Retry, and the README explains setup and running the app.
  Why now: The filter reshapes the data that slice 3 already shows, so it builds on finished pieces. Polishing and documenting last keeps the project working throughout.
  PRD ref: `prd.md > Vehicle Filter`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Vehicle Filter (public/js/filter.js)`, `spec.md > Map (public/js/map.js)` (pins follow the filter), `spec.md > Bottom Panel (public/js/panel.js)` (empty state), `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`
  Build: Add `public/js/filter.js`, pass the filter through the markers, card and list, and add the empty state with its add button. Add the startup load-failure message with Retry, a final Look and Feel pass (contrast, tap sizes, copy) and the README setup and run steps.
  Verify (mechanical): `npm test` passes, including filtering out car-only shops for Moto and an empty result for a vehicle with no shops. The server starts with no errors, and the page loads with no console errors. With the server stopped mid-session, a reload shows the load-failure message (checked via fetch error handling). Following the README from scratch works.
  Learner check: Switch between Moto, Tuk-tuk and Car, and watch the card, list and pins change together. Pick Car near a moto-only area, or add a filter with no matches, to see the "No car repair spots near you yet. Add one!" message. Then run through the full demo from the scope as if recording.
  Commit: `Add vehicle filter, empty state and demo-ready polish`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2: the map, sample shops and adding a spot, while there's still time to adjust the rest of the build. Learner ran all six add-flow checks successfully (validation, cancel, save with a green pin that survives refresh, duplicate warning, failed save). Feedback: the look matches, but the buttons should be bigger and the form feels cramped on a phone. This was folded into slice 3.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- `lib/supabase.js` now uses only the origin of `SUPABASE_URL` — the build found the dashboard's REST URL (ending in `/rest/v1/`) is an easy value to paste, and supabase-js rejects it with "Invalid path specified in request URL".
- Slice 3 also enlarges buttons and loosens the add form's spacing — the early checkpoint showed 48px targets and tight spacing felt small and cramped on a real phone-sized screen.
