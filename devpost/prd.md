---
doc: prd
status: approved
---

# FlatFinder — Product Requirements

A phone-first web app that helps moto riders and tuk-tuk drivers in Cambodia with a flat tire find the nearest repair stall, and lets drivers add stalls that aren't on Google Maps.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. A driver opens FlatFinder and sees a full-screen map of Phnom Penh, a message saying "Allow location so we can find the nearest repair shop" and the "Add a repair spot" button. The browser asks for location.
2. While the app is finding them, a small "Finding you..." message shows.
3. **If they allow location,** the map moves to their position. **If they deny it,** the map stays on Phnom Penh and says "Tap the map to set where you are," and the point they tap becomes their location.
4. The bottom panel shows a large nearest-shop card for the selected vehicle (Moto by default), with the other matching shops below it sorted by distance.
5. The driver taps Directions on a shop, and Google Maps opens with directions to it.
6. When a driver knows a stall that isn't listed, they tap "Add a repair spot", tap the map where it is, fill in the short form and save.
7. The new spot appears right away on the map and in the list, labeled "Added by a driver." After a page refresh it's still there, so other drivers can find it.

Success means both halves of the proof work: drivers can find the nearest shop, and drivers can add a stall that Google Maps doesn't have.

## Screens and Layout
FlatFinder is a single screen, laid out for a phone:
- **Map:** fills the whole screen. It shows the driver's location and the shop pins, with different pin colors for sample shops and driver-added shops, and a small legend explaining them.
- **Vehicle filter:** a row of three buttons at the very top (Moto, Tuk-tuk, Car), each with a simple icon. Moto is selected at start.
- **Status message:** a short line near the top, used for "Allow location…", "Finding you..." and "Tap the map to set where you are."
- **Bottom panel:** slides up from the bottom. The nearest-shop card sits at its top, and the other shops are listed below it. It starts collapsed, showing the nearest-shop card. Tapping the handle at its top expands it to show more of the list, and tapping it again collapses it to show more of the map.
- **"Add a repair spot" button:** floats in a corner of the map and is always visible.
- **Add form:** a small form that slides up over the panel during the add flow.

## Look and Feel
- **Feel:** urgent but calm, like a clear roadside sign rather than a fancy app. Closer to ride-hailing apps like Grab or PassApp than to a tourist map: a big map, one bottom panel and no clutter.
- **Colors:** a bold safety-orange accent for the main actions (the nearest-shop card, Directions and Add a repair spot) on a white or very light gray background, with near-black text. Contrast should be strong enough to read in bright sun.
- **Type:** one clean, rounded sans-serif font. Shop names and distances (for example "350 m") are big, and details are small.
- **Controls:** large buttons with rounded corners and thumb-sized tap areas for one-handed use under stress.
- **Icons:** a simple icon each for moto, tuk-tuk and car. Sample and driver-added pins use different colors, explained by the legend.
- **Copy:** short, plain English with no jargon.
- **Avoid:** dark mode, animations and decorative graphics.

## Features and Behavior

### Finding the Driver's Location
Source: `scope.md > The POC Boundary`.
- On open, the app asks the browser for location and shows "Finding you..." while it waits.
- If location is allowed, the map centers on the driver.
- If location is denied, the app keeps working: the map stays on Phnom Penh and shows "Tap the map to set where you are," and a tap sets the driver's location.

Acceptance criteria:
- [ ] On first open, the map shows Phnom Penh, the location message and the "Add a repair spot" button.
- [ ] After location is allowed, the map moves to the driver's position and the nearest-shop card appears.
- [ ] After location is denied, tapping the map sets a location and the nearest-shop card and list appear, measured from that point.

### Nearest Shop and Shop List
Source: `scope.md > The Core Loop`.
- The nearest-shop card shows the closest shop that fixes the selected vehicle. It's large and easy to read, with orange accents.
- The list below shows the other matching shops, sorted by distance from nearest to farthest.
- Each shop shows its name, its distance (for example "350 m"), icons for the vehicles it fixes, its rough price or "Price not listed", and a Directions button. Driver-added shops also show "Added by a driver".

Acceptance criteria:
- [ ] The nearest-shop card shows the closest matching shop, and the list order matches distance from the driver.
- [ ] Each entry shows name, distance, vehicle icons, and price or "Price not listed".
- [ ] Driver-added shops are labeled "Added by a driver", and their pins are a different color from sample shop pins.
- [ ] Tapping a shop's pin highlights that shop in the bottom panel.

### Vehicle Filter
- The Moto, Tuk-tuk and Car buttons filter the nearest-shop card, the list and the map pins, so the map and the list always match.
- Moto is selected when the app opens.
- There's no distance limit: every matching shop is listed, sorted by distance.

Acceptance criteria:
- [ ] With Moto selected, only shops that fix motos appear in the card, the list and on the map.
- [ ] Switching to Tuk-tuk or Car updates the card and the list immediately.
- [ ] If no shop fixes the selected vehicle, the panel says "No [vehicle] repair spots near you yet. Add one!" with the add button.

### Directions
- Tapping Directions on a shop opens Google Maps with directions to that shop's location.

Acceptance criteria:
- [ ] Tapping Directions opens Google Maps pointed at the right shop.

### Adding a Repair Spot
Source: `scope.md > The Unique Kernel`.
1. The driver taps "Add a repair spot", and the app says "Tap the map where the stall is."
2. Tapping the map drops a pin. Tapping again moves it.
3. A small form slides up:
   - **Name** (required): can be simple, like "Roadside stall near Chbar Ampov bridge".
   - **Vehicle types** (required, at least one): Moto, Tuk-tuk, Car.
   - **Rough puncture price** (optional): one number, in riel by default, with a toggle to switch to dollars.
4. If the name or vehicle type is missing, Save stays disabled and the missing field is highlighted with a short message, like "Add at least one vehicle type."
5. Cancel discards everything without saving.
6. If the pin is within about 30 meters of an existing spot, the app asks "A repair spot is already here. Add anyway?"
7. After Save, the form closes, the new pin appears on the map, the list updates, and a short "Spot added" message shows. The spot is labeled "Added by a driver."

Acceptance criteria:
- [ ] Save is disabled until a pin is placed, a name is entered and at least one vehicle type is chosen. The missing field is highlighted with a message.
- [ ] Cancel closes the form, and nothing new appears on the map or in the list.
- [ ] A saved spot appears right away on the map and in the list (if it matches the selected vehicle), labeled "Added by a driver," and "Spot added" shows.
- [ ] After a page refresh, the saved spot is still there.
- [ ] A spot with no price shows "Price not listed." A spot with a price shows it in the currency chosen.
- [ ] Placing a pin within about 30 m of an existing spot shows "A repair spot is already here. Add anyway?" Choosing yes saves it.
- [ ] If saving fails (for example, with no internet), the form stays open with everything still filled in and shows "Couldn't save. Try again."

### Sample Shops
- A few sample shops in Phnom Penh are loaded, so the map isn't empty, and they're clearly labeled as samples.

Acceptance criteria:
- [ ] Sample shops are visibly labeled as samples, and their pin color differs from driver-added spots.

## States and Boundaries
- **First open:** a map of Phnom Penh, the location message and the browser's location prompt.
- **Finding location:** the "Finding you..." message.
- **Location denied:** "Tap the map to set where you are." A tap sets the location.
- **No matching shops:** "No [vehicle] repair spots near you yet. Add one!" with the add button.
- **Adding:** "Tap the map where the stall is," followed by the form, with Save disabled until the required fields are filled.
- **Near-duplicate:** the "A repair spot is already here. Add anyway?" prompt.
- **Saved:** "Spot added," with the new pin and the updated list.
- **Save failed:** the form stays open with everything filled in and shows "Couldn't save. Try again."
- **Persistence:** driver-added spots survive a refresh and are visible to everyone who opens the app. The selected vehicle and the driver's location aren't remembered.
- **Permissions:** anyone can add a spot without signing in. No one can edit or delete a spot.

## Product Decisions
- **No sign-in:** accounts would take time and don't prove the main idea.
- **Moto is the default filter:** moto riders are the main user.
- **The filter applies to the card and the list:** a moto rider only sees shops that can fix motos.
- **Denied location falls back to tapping the map:** the app should never break.
- **Price is optional, in riel by default with a toggle to dollars:** people in Cambodia use both currencies.
- **Near-duplicate warning at about 30 m:** prevents doubled pins without blocking a genuinely new stall.
- **"Added by a driver" label and a different pin color:** keeps sample shops and real driver contributions distinct.
- **Directions hands off to Google Maps:** no need to build navigation.
- **Map pins follow the vehicle filter:** the map and the list always match.
- **No distance limit:** all matching shops are shown, sorted by distance, because the demo area is small.
- **A failed save keeps the form open:** it shows "Couldn't save. Try again," and nothing the driver entered is lost.
- **Tapping a pin highlights that shop in the bottom panel.**
- **The bottom panel expands and collapses when the handle is tapped, instead of being dragged:** changed during `4-spec` because of the deadline.

## What We're Building
Everything in **Features and Behavior** above: finding location (with the tap fallback), the nearest-shop card and sorted list, the vehicle filter, Directions to Google Maps, adding a repair spot with validation, cancel and the duplicate warning, shared persistence and labeled sample shops, all styled per **Look and Feel**.

## Deferred From the POC
- **User accounts and logins:** they take time and don't prove the main idea.
- **Editing or deleting a spot:** this would need ownership or moderation, which requires accounts.
- **"Still open?" confirmations:** these need repeat visits and trust signals beyond the proof.

## Possible Later Enhancements
- Ratings and reviews of stalls.
- Photos of shops.
- A Khmer language toggle.
- Dark mode and light animations.

## Non-Goals
- **Turn-by-turn navigation or traffic:** Google Maps already handles this.
- **Moderating or verifying driver-added spots:** the POC trusts contributors. Spam control comes later.
- **Covering every Cambodian city with sample data:** the demo is set in Phnom Penh.

## Open Questions
None. All four were resolved at review and are recorded under **Product Decisions**.
