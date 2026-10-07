# FlatFinder

Got a flat tire in Cambodia? FlatFinder finds where you are and shows the nearest tire repair shop that can fix your vehicle, with its distance, a rough price and one-tap directions.

Many roadside puncture stalls aren't on Google Maps, so drivers can add a stall themselves: tap the map, type a name, choose the vehicle types, enter a rough price (riel or dollars) and save. Every other driver can then find it.

Built for moto riders and tuk-tuk drivers first. This is a proof of concept made for Devpost's Build With AI: Basics hackathon.

## Features

- **Nearest shop first:** a large card shows the closest shop for your vehicle, with the rest listed by distance below it.
- **Vehicle filter:** Moto, Tuk-tuk or Car. The map pins, the card and the list all follow it.
- **Directions:** opens Google Maps with directions to the shop.
- **Add a repair spot:** no sign-in needed. Name and vehicle types are required, and the price and phone number are optional. A spot within about 30 m of an existing one asks "Add anyway?" first.
- **Call the repairer:** if a spot has a phone number, a "Call" button sits next to "Directions" so a driver who can't get their vehicle there can ask the repairer to come find them instead.
- **Works without location access:** if you deny location, tap the map to set where you are.
- **Clearly labeled data:** the shops named "Sample:" are illustrative demo data, not real businesses. Spots that drivers add are green and labeled "Added by a driver."

## How it works

```
Phone browser (Leaflet map + panel)  ──GET/POST /api/spots──▶  Express  ──▶  Supabase (spots table)
```

- The page is plain HTML, CSS and JavaScript. It uses [Leaflet](https://leafletjs.com/) with [OpenStreetMap](https://www.openstreetmap.org/) tiles, so no map API key is needed.
- The Express server serves the page and two routes: `GET /api/spots` lists every spot, and `POST /api/spots` validates and saves one.
- Supabase (hosted Postgres) stores the spots. Row Level Security is on with no policies, so only the server, using its secret key, can read or write the table.
- The browser measures straight-line distances with the haversine formula, then filters by vehicle and sorts.

## Run it locally

You need [Node.js](https://nodejs.org/) 20 or newer and a free [Supabase](https://supabase.com/) project.

1. **Create the table:** in your Supabase project, open **SQL Editor**, paste [`db/schema.sql`](db/schema.sql) and run it. (Already have the table from before the phone field was added? Re-running it is safe — it only adds the new column.)
2. **Configure:** copy `.env.example` to `.env` and fill in the values from the Supabase dashboard (Project Settings → API Keys):
   ```
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_SECRET_KEY=<your server-side secret key>
   PORT=3000
   ```
   Never commit `.env`. It's already in `.gitignore`.
3. **Install and load the sample shops:**
   ```
   npm install
   npm run seed
   ```
   `npm run seed` can be re-run safely. It replaces only the sample shops and never touches driver-added spots.
4. **Start:**
   ```
   npm start
   ```
   Then open http://localhost:3000.

### Trying it like a phone

- In Chrome, open DevTools and switch on the device toolbar to pick a phone size.
- Browsers only share location on `localhost` or HTTPS. If you aren't in Phnom Penh, go to DevTools → More tools → **Sensors** and set the location to `11.5564, 104.9282` (Independence Monument).
- To try the no-location path, set Sensors → Location to **Location unavailable**, reload and tap the map.

### Tests

```
npm test
```

These unit tests cover distances, sorting and filtering, the 30 m duplicate check, price and distance formatting, and server-side validation.

## Project layout

```
server.js              Express: serves public/, mounts /api/spots
routes/spots.js        GET and POST /api/spots
lib/supabase.js        Server-side Supabase client from .env
lib/validateSpot.js    Checks a new spot before saving
db/schema.sql          spots table + Row Level Security
scripts/seed.js        Loads the labeled sample shops
public/index.html      The single screen
public/styles.css      Look and feel
public/js/app.js       Page state, startup, what a map tap means
public/js/api.js       Calls to /api/spots
public/js/location.js  Browser location + tap-to-set fallback
public/js/map.js       Leaflet map, pins, legend, your position
public/js/geo.js       Distance, sorting, duplicate check, formatting
public/js/filter.js    Moto / Tuk-tuk / Car buttons
public/js/panel.js     Nearest card, list, expand handle, highlight
public/js/addSpot.js   Add a repair spot: pin, form, save
test/                  Unit tests (node --test)
```

## Not in this proof of concept

User accounts, editing or deleting spots, ratings and reviews, photos, "still open?" checks, a Khmer language toggle and turn-by-turn navigation (Directions hands off to Google Maps). Distances are straight-line, not along the road.

## Credits

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Maps by [Leaflet](https://leafletjs.com/).
