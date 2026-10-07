---
doc: spec
status: approved
---

# FlatFinder — Technical Spec

## How This Works, In Plain Language
FlatFinder has three pieces:

1. **The page in the phone's browser.** This is plain HTML, CSS and JavaScript: the map, the vehicle buttons, the bottom panel and the add form. It uses **Leaflet**, a JavaScript library that draws an **OpenStreetMap** map from **tiles** (small square map images it fetches as you pan and zoom) and puts **markers** (pins) on top at latitude/longitude points. Leaflet also tells our code where the map was tapped.
2. **The Express server on your laptop.** It sends the page to the browser and provides two small **API** routes (addresses the browser can ask for data): one gives the list of all repair spots, and one saves a new spot. It holds the Supabase key, so the key never reaches the browser.
3. **Supabase,** a hosted Postgres database. Its `spots` table is a shared spreadsheet of repair spots. That's why a spot added by one driver is still there after a refresh and is visible to every other driver.

**How "nearest" works:** when the page loads, it downloads every spot. Once it knows where the driver is, it uses the **haversine formula** (a short, standard function for the straight-line distance between two latitude/longitude points on the Earth) to measure the distance to each spot. It keeps only the spots that fix the selected vehicle and sorts them by distance. The first one becomes the nearest-shop card. The same function handles the "already a spot within 30 m" check. Distances are in a straight line, not along the road.

**Why this shape:** you already know Express and Supabase. Plain HTML/CSS/JS has no build step or framework to learn on top of maps, so every line stays readable. Doing the distance work in the browser is instant for dozens of spots and needs no special database features.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **The driver opens `http://localhost:3000`.** Express sends `public/index.html`, which loads Leaflet and our scripts. The map centers on Phnom Penh, shows "Allow location so we can find the nearest repair shop," and the add button appears.
2. **The page fetches spots.** The browser calls `GET /api/spots` → Express reads every row from Supabase → returns JSON → the browser keeps the list in memory.
3. **The page asks for location.** `navigator.geolocation.getCurrentPosition` triggers the browser's popup and the page shows "Finding you...".
   - **Allowed:** the map flies to the driver and a blue dot marks them.
   - **Denied, or no answer within 10 seconds:** the page shows "Tap the map to set where you are." The next map tap becomes the driver's location.
4. **The panel renders.** The browser filters spots by the selected vehicle (Moto at start), works out each spot's distance with haversine and sorts them. The nearest goes in the card and the rest go in the list. Map markers are redrawn to show only matching spots.
5. **Directions.** Tapping it opens `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG` in a new tab.
6. **Adding a spot.** "Add a repair spot" switches the page into add mode ("Tap the map where the stall is"). A tap places a pin (tapping again moves it) and opens the form. On Save, the browser runs the 30 m duplicate check and asks for confirmation if needed. It then sends `POST /api/spots` → Express validates the data → inserts into Supabase → returns the saved row.
7. **Showing the new spot.** The browser adds the returned row to its list and re-renders the markers and panel, and shows "Spot added." A refresh repeats step 2, and the spot comes back from Supabase.

## Stack
| Piece | Choice | Docs |
|---|---|---|
| Runtime | Node.js 20 or newer | https://nodejs.org/docs/latest-v20.x/api/ |
| Server | Express 4 | https://expressjs.com/en/4x/api.html |
| Database | Supabase (hosted Postgres, free tier) via `@supabase/supabase-js` v2 | https://supabase.com/docs/reference/javascript/introduction |
| Env vars | `dotenv` | https://github.com/motdotla/dotenv |
| Map | Leaflet 1.9.x from the unpkg CDN | https://leafletjs.com/reference.html |
| Map tiles | OpenStreetMap standard tiles | https://operations.osmfoundation.org/policies/tiles/ |
| Frontend | Plain HTML, CSS and JavaScript (ES modules), with no framework or build step | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules |
| Location | Browser Geolocation API | https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API |
| Tests | Node's built-in test runner (`node --test`) | https://nodejs.org/api/test.html |

- **Express and Supabase:** your choice, because you know both, and Supabase gives shared storage that survives refreshes.
- **Leaflet and OpenStreetMap:** your choice, because they're free and need no API key. The tradeoff you accepted: OpenStreetMap's public tile servers are fine for a demo but not for a real launch.
- **Plain HTML/CSS/JS:** my recommendation, which you accepted. It keeps setup and new concepts low in the area you know least. The tradeoff is writing the list updates and the panel toggle by hand.
- **Distance in the browser:** you accepted this. It's simple and instant at demo scale, but distances are straight-line.

**To verify early in the build (not checked during planning):** the current Leaflet 1.9.x version and CDN URL with its integrity hash, and the current names of Supabase's server-side key (newer projects show a "secret" key, and older ones a "service_role" key; either works server-side).

## Where It Runs and How Someone Tries It
- **Runtime:** a local Node process plus a browser. It needs Node 20+, internet access for the map tiles and Supabase, and a free Supabase project you create yourself.
- **Setup, done once:**
  1. Create a Supabase project and run `db/schema.sql` in the Supabase SQL editor.
  2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL` and `SUPABASE_SECRET_KEY` yourself, never in chat.
  3. Run `npm install`, then `npm run seed` to load the sample shops.
- **Start:** run `npm start`, then open `http://localhost:3000`.
- **Recording the demo:** use Chrome DevTools device mode at phone size (for example, 390×844). The Geolocation API needs a secure page, which `localhost` counts as, so a phone on your Wi-Fi visiting your laptop's IP won't get location. If you aren't recording in Phnom Penh, set DevTools → More tools → Sensors → Location to a Phnom Penh latitude/longitude (for example 11.5564, 104.9282).
- **Submission:** a short demo video and a public GitHub repository. Deployment isn't planned. If there's time at the end, `6-ship` can revisit it (Render or Railway can host an Express app, with the `.env` values set in their dashboard).

## Look and Feel
Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.
- **CSS variables in `public/styles.css`:**
  - `--accent: #F26A1B` (safety orange) for the nearest-shop card border and header, the Directions button and the Add button.
  - `--bg: #FFFFFF`, `--surface: #F4F5F7`, `--text: #111418`, `--muted: #4A5260` (still high contrast).
  - Pins: `--pin-sample: #6B7A90` (slate), `--pin-driver: #0E9F6E` (green), `--you: #1A73E8` (blue dot).
- **Font:** Nunito (a rounded sans-serif) from Google Fonts, falling back to `system-ui, sans-serif`. Shop name about 20px bold, distance about 28px bold on the nearest card, details 14–15px.
- **Tap targets:** at least 56px tall (raised from 48px after the early checkpoint), 12px rounded corners, with roomy spacing in the add form. The floating Add button is a large orange pill above the panel.
- **Vehicle icons:** emoji 🏍️ Moto, 🛺 Tuk-tuk, 🚗 Car next to text labels, so no image files are needed.
- **Legend:** a small box in the map corner showing "● Sample shop" and "● Added by a driver".
- **Copy:** short, plain English, using the exact strings from the PRD.
- **No** dark mode, animations (the panel switches height instantly), decorative images or extra screens.

## Components

### Express Server (`server.js`)
Serves `public/` as static files and mounts the spots routes. Reads `PORT` (default 3000) from `.env`.
PRD ref: `prd.md > The Core Journey`.

### Spots API (`routes/spots.js`)
- **`GET /api/spots`:** returns every spot, ordered by `created_at`.
- **`POST /api/spots`:** validates the body with `lib/validateSpot.js`, inserts it and returns the saved row with status 201. Invalid data returns 400 `{ "error": "message" }`, and a database failure returns 500 `{ "error": "Couldn't save" }`. The server doesn't block near-duplicates; the browser warns about them.

PRD ref: `prd.md > Adding a Repair Spot`, `prd.md > Nearest Shop and Shop List`.

### Spot Validation (`lib/validateSpot.js`)
A pure function that returns `{ ok, value }` or `{ ok: false, error }`. Rules, mirroring the database checks:
- The name is trimmed and 1–100 characters.
- `lat` and `lng` are numbers in range.
- `vehicles` is a non-empty subset of `moto`, `tuktuk` and `car`.
- `price_amount` is optional and must be ≥ 0. If present, `price_currency` must be `KHR` or `USD`.
- `is_sample` is always forced to `false` for POSTs.

### Supabase Client (`lib/supabase.js`)
Creates one server-side client from `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. If either is missing, it stops on startup with a clear message.

### App State and Startup (`public/js/app.js`)
Holds the page's in-memory state (see **Data Model**), wires the other modules together and re-renders the map markers and panel whenever the spots, the location or the vehicle filter changes. It also decides what a map tap means, in priority order: add mode places the stall pin, otherwise a tap sets the location if there isn't one yet, otherwise it does nothing.
PRD ref: `prd.md > The Core Journey`.

### Location (`public/js/location.js`)
Calls `getCurrentPosition` with a 10-second timeout and drives the "Finding you..." message. On error or timeout it switches to "Tap the map to set where you are."
PRD ref: `prd.md > Finding the Driver's Location`.

### Map (`public/js/map.js`)
Sets up Leaflet centered on Phnom Penh (11.5564, 104.9282, zoom 14) with OpenStreetMap tiles and attribution, and shows the legend.
- Draws the driver's blue dot.
- Draws matching spots as `L.circleMarker` pins, slate for samples and green for driver-added spots. Pins follow the vehicle filter.
- Tapping a pin asks the panel to highlight that shop.
- Reports map taps to `app.js`.

PRD ref: `prd.md > Screens and Layout`, `prd.md > Vehicle Filter`.

### Distance and Formatting (`public/js/geo.js`)
Pure functions, unit-tested:
- `haversineMeters(a, b)`.
- `formatDistance(m)`: "350 m" under 1 km, "1.2 km" above.
- `nearestFirst(spots, here, vehicle)`: filters by vehicle and sorts by distance, with no distance limit.
- `findNearby(spots, point, 30)`: the duplicate check.
- `formatPrice(amount, currency)`: "~5,000៛", "~$1.50" or "Price not listed".

PRD ref: `prd.md > Nearest Shop and Shop List`, `prd.md > Adding a Repair Spot`.

### Vehicle Filter (`public/js/filter.js`)
Three toggle buttons (Moto, Tuk-tuk, Car), with only one active at a time and Moto active by default. Changing the selection triggers a re-render.
PRD ref: `prd.md > Vehicle Filter`.

### Bottom Panel (`public/js/panel.js`)
- Renders the nearest-shop card and the list below it.
- Each entry shows the name, distance, vehicle emoji, price, a "Sample shop" or "Added by a driver" tag, and a Directions link.
- When nothing matches, it shows "No [vehicle] repair spots near you yet. Add one!" with an add button.
- The panel has two heights: **collapsed** (the default, showing the handle and the nearest-shop card) and **expanded** (about 70% of the screen, with the list scrollable inside). Tapping the handle, a button at least 56px tall, toggles an `expanded` class on the panel. `highlight(id)` expands the panel first if needed.
- `highlight(id)` scrolls a shop into view and outlines it in orange.

PRD ref: `prd.md > Nearest Shop and Shop List`, `prd.md > Directions`, `prd.md > Screens and Layout`.

### Add a Repair Spot (`public/js/addSpot.js`)
- Enters add mode and shows "Tap the map where the stall is." Taps place or move a temporary pin.
- The form contains the name, three vehicle checkboxes, a price number field and a riel/dollar toggle (default riel). Save is disabled until the pin, name and at least one vehicle are present. A missing field is highlighted with "Add a name" or "Add at least one vehicle type."
- **Cancel** removes the temporary pin and clears the form.
- **Save** runs `findNearby(…, 30)`. A match shows "A repair spot is already here. Add anyway?" with Add anyway and Cancel buttons. Then it POSTs. On success it closes the form and shows "Spot added." On failure the form stays open with its values and shows "Couldn't save. Try again."

PRD ref: `prd.md > Adding a Repair Spot`.

### API Client (`public/js/api.js`)
`getSpots()` and `createSpot(spot)` wrap `fetch`. Both throw an error when the response isn't OK, so callers can show the right message.

### Seed Script (`scripts/seed.js`)
Deletes existing rows where `is_sample = true` and inserts the sample shops below, so it's safe to re-run. Driver-added spots are never touched.
PRD ref: `prd.md > Sample Shops`.

## Data Model

### Database: `spots` table (`db/schema.sql`)
Run this in the Supabase SQL editor:

```sql
create table if not exists public.spots (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(btrim(name)) between 1 and 100),
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  vehicles       text[] not null
                   check (cardinality(vehicles) >= 1
                          and vehicles <@ array['moto','tuktuk','car']::text[]),
  price_amount   numeric check (price_amount is null or price_amount >= 0),
  price_currency text check (price_currency in ('KHR','USD')),
  is_sample      boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint price_has_currency
    check ((price_amount is null) = (price_currency is null))
);

-- Lock the table to the public Supabase keys. Only our Express server,
-- using the server-side secret key, can read or write it.
alter table public.spots enable row level security;
```

Row Level Security (RLS) is Supabase's per-table access switch. Turning it on with no rules means the public keys can't touch the table, while the server-side secret key bypasses RLS. That's why every request goes through Express.

### Sample shops (`scripts/seed.js`)
Every name starts with "Sample:" and `is_sample` is `true`. The coordinates are approximate and illustrative, not real businesses.

| name | lat | lng | vehicles | price |
|---|---|---|---|---|
| Sample: Stall near Independence Monument | 11.5564 | 104.9310 | moto, tuktuk | 5000 KHR |
| Sample: Repair shop by Central Market | 11.5700 | 104.9200 | moto | 4000 KHR |
| Sample: Roadside stall at Russian Market | 11.5405 | 104.9195 | moto, tuktuk | none |
| Sample: Tire shop on Monivong Blvd | 11.5620 | 104.9165 | moto, tuktuk, car | 2.50 USD |
| Sample: Stall near Chbar Ampov bridge | 11.5450 | 104.9380 | moto | 5000 KHR |
| Sample: Car tire center near Olympic Stadium | 11.5580 | 104.9120 | car | 5.00 USD |
| Sample: Stall near Wat Phnom | 11.5765 | 104.9235 | moto, tuktuk | 6000 KHR |

### What lives where
| Data | Where it lives | How it's updated | When the driver leaves and comes back |
|---|---|---|---|
| Repair spots | Supabase `spots` table, plus an in-memory copy in the browser | Seed script; `POST /api/spots` | Reloaded from Supabase, so they persist for everyone |
| Driver's location | Browser memory only | Geolocation or a tap on the map | Forgotten, so the app asks again |
| Selected vehicle | Browser memory only | Filter buttons | Resets to Moto |
| Add-form contents | Browser memory only | Typing | Lost on refresh; kept on a failed save |
| Panel expanded or collapsed, highlighted shop | Browser memory only | Tapping the handle, tapping a pin | Reset to collapsed |

## File Structure
```
FlatFinder/
├── server.js              # Express: serves public/, mounts /api/spots
├── routes/
│   └── spots.js           # GET and POST /api/spots
├── lib/
│   ├── supabase.js        # Server-side Supabase client from .env
│   └── validateSpot.js    # Checks a new spot before inserting
├── db/
│   └── schema.sql         # spots table + RLS; paste into the Supabase SQL editor
├── scripts/
│   └── seed.js            # Re-runnable loader for the labeled sample shops
├── public/                # Everything the browser loads
│   ├── index.html         # Single screen: map, filter, status, panel, add form
│   ├── styles.css         # Look and Feel variables + phone-first layout
│   └── js/
│       ├── app.js         # In-memory state, startup, re-render, map-tap rules
│       ├── api.js         # fetch wrappers for /api/spots
│       ├── location.js    # Geolocation + tap-to-set fallback
│       ├── map.js         # Leaflet map, pins, legend, driver dot
│       ├── geo.js         # Haversine, sorting, duplicate check, formatting
│       ├── filter.js      # Moto / Tuk-tuk / Car buttons
│       ├── panel.js       # Nearest card, list, tap-to-expand, highlight
│       └── addSpot.js     # Add mode, form, validation, save/cancel
├── test/
│   ├── geo.test.js        # Distances, sorting, filter, 30 m check, price text
│   └── validateSpot.test.js
├── .env.example           # SUPABASE_URL=, SUPABASE_SECRET_KEY=, PORT=3000 (no real values)
├── .gitignore             # Already ignores .env and devpost/learner-profile.md
├── package.json           # "type": "module"; scripts: start, seed, test
├── README.md              # What it is, setup, how to run
└── devpost/               # Planning docs
```

## External Services and Dependencies

### Supabase
- **Access:** only Express talks to Supabase, using `@supabase/supabase-js` with the server-side secret key from `.env`.
- **Read:** `supabase.from('spots').select('id,name,lat,lng,vehicles,price_amount,price_currency,is_sample').order('created_at')` returns an array of rows.
- **Write:** `supabase.from('spots').insert(row).select().single()` returns the saved row.
- **Seed:** `.delete().eq('is_sample', true)`, then `.insert([...])`.
- **Cost:** the free tier is plenty for this POC. Free projects pause after a period of inactivity, so open the Supabase dashboard before recording if it has been idle.
- Docs: https://supabase.com/docs/reference/javascript/select

### Our API contract
- `GET /api/spots` → `200 [{ id, name, lat, lng, vehicles: ["moto"], price_amount: 5000|null, price_currency: "KHR"|"USD"|null, is_sample }]`
- `POST /api/spots` with body `{ name, lat, lng, vehicles, price_amount?, price_currency? }` → `201 { ...saved row }`, `400 { error }` or `500 { error }`

### OpenStreetMap tiles
- **URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, with the attribution "© OpenStreetMap contributors" (required).
- **Cost:** free and no key, but only for light use under the tile usage policy, which a demo meets.
- Docs: https://operations.osmfoundation.org/policies/tiles/

### Google Maps directions link
- **URL:** `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`
- **Cost:** free and no key. On a phone it opens the Google Maps app if it's installed.
- Docs: https://developers.google.com/maps/documentation/urls/get-started

### Google Fonts (Nunito)
- Loaded with a `<link>` tag. If it fails, the page falls back to the system font.

## Important Failure Modes
- **Location denied, unavailable or slow (over 10 seconds)** → "Tap the map to set where you are." A tap sets the location. (`prd.md > Finding the Driver's Location`)
- **Saving fails (no internet, Supabase paused, a 500)** → the form stays open with its values and shows "Couldn't save. Try again." (`prd.md > Adding a Repair Spot`)
- **Loading spots fails on startup** → the status line shows "Couldn't load repair spots. Check your connection." with a Retry button. This is an implementation fallback; the PRD doesn't name the wording.
- **Missing `.env` values** → the server refuses to start and prints which variable is missing, instead of failing confusingly later.

## What Was Simplified and Why
- **Straight-line (haversine) distance** instead of driving distance. It's instant and free with no routing service. The fuller version would call a routing API, which adds a key, cost and latency.
- **Every spot is downloaded and sorted in the browser** instead of a geographic database query. It's fine for dozens or hundreds of spots. The fuller version would use PostGIS in Supabase with a "nearest N" query.
- **Express holds the database key and the table is locked with RLS** instead of public access rules for browsers. It's simpler and safer without accounts. The fuller version would add Supabase Auth and per-user policies.
- **The duplicate check runs only in the browser.** That's good enough for honest drivers. The fuller version would also check on the server.
- **A tap-to-expand bottom panel** instead of drag-to-snap. This was your call during spec review, because of the deadline. Dragging would need pointer-event handling and snap logic.
- **Emoji vehicle icons and circle pins** instead of custom icon images. There are no assets to make, and they're still clear at a glance.
- **Runs locally and is screen-recorded** instead of deployed. Deployment is optional for submission.
- **Sample shops are labeled "Sample:" with illustrative coordinates.** The kernel, adding real spots that persist, is fully real.

## Decisions and Open Issues

### Learner decisions
- **Node/Express and Supabase** for the backend: familiar, and gives shared persistence.
- **Leaflet with OpenStreetMap:** free, no key.
- **Plain HTML/CSS/JS frontend:** accepted from my recommendation, to keep the frontend simple and readable.
- **Distance calculated and sorted in the browser:** accepted, with straight-line distances.
- **Run locally and screen-record**, deploying only if there's time.
- **A new free hosted Supabase project, created by the learner,** with keys only in `.env`, never in chat.
- **Exact SQL and a seed script requested,** both included above.
- **A tap-to-expand bottom panel instead of drag-to-snap,** chosen at review because of the deadline. The PRD was updated to match.

### Implementation details I derived (not learner choices)
- Every database request goes through Express, and RLS is on with no policies.
- A 10-second location timeout.
- Pin colors, emoji icons, the Nunito font and the panel's two heights.
- The wording of the startup load-failure message.
- `node --test` unit tests for `geo.js` and `validateSpot.js`.

### The useful unknown
- **The question:** "I'm least sure how the app works out which shops are nearest and sorts them by distance, and how the map and the database connect."
- **What clarified it:** the browser → Express → Supabase diagram, and the haversine explanation. Both are in **How This Works, In Plain Language** and **The Core Journey Through the System**.
- **How it will be checked during the build:** `test/geo.test.js` asserts known distances (for example, two points about 1 km apart come out at about 1 km, within a few meters) and that sorting and filtering put the right shop first. Seeing the sorted list match the pins on the map in the browser confirms it end to end.

### Open issues
- Verify the Leaflet CDN version and integrity hash, and the Supabase secret-key name, early in the build (flagged in **Stack**).
- No product questions are open. `prd.md > Open Questions` was resolved at review.
