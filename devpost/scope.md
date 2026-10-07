---
doc: scope
status: approved
---

# FlatFinder

A phone-friendly web app that helps drivers in Cambodia with a flat tire find the nearest repair stall, and lets them add stalls that aren't on Google Maps.

## The Unique Kernel
Many roadside puncture stalls in Cambodia aren't on Google Maps. In FlatFinder, drivers log those stalls themselves: they tap the map and add a name, the vehicle types the stall fixes and a rough price, so the next stranded driver can find it.

## Who It's For
Moto riders and tuk-tuk drivers first, because they get punctures most often and are most likely to be stuck on the roadside. Today they push a flat moto down the road with no idea where the nearest repair stall is.

## The Core Loop
1. A driver gets a flat and opens FlatFinder.
2. The app finds their location and shows the nearest repair shop, then the others sorted by distance. Each entry shows distance, the vehicles the shop fixes and a rough price.
3. The driver taps Directions, which opens Google Maps, and goes there.
4. When a driver finds a stall that isn't listed, they add it so other drivers can find it.

Every added stall makes the map more useful for the next driver.

## Inspiration & Identity
- A big map that fills the screen.
- A clear "nearest shop" card at the top.
- One obvious button to add a place.
- Built for a phone, used on the roadside under stress, so it should be fast and readable at a glance.

## Why This Matters to the Learner
"I've seen people pushing a flat moto down the road with no idea where the nearest repair stall is."

## What "Working" Looks Like
The demo runs in a phone-sized browser:
1. Allow location, and the map jumps to the driver's position in Phnom Penh.
2. A "Nearest repair shop" card shows name, distance, vehicles fixed (moto, tuk-tuk, car) and rough price, with the other shops sorted by distance below it.
3. Tapping Directions on a shop opens Google Maps.
4. **The "oh, that's cool" beat:** tap "Add a repair spot", tap a point on the map, type a name, pick vehicle types, enter a price and save. The new shop appears right away on the map and in the list.
5. Refresh the page, and the stall is still there, so another driver would see it too.

A few clearly labeled sample shops keep the map from looking empty.

## The POC Boundary
In:
- Locating the driver.
- A map with shops, plus a nearest-shop card and a list sorted by distance.
- Each shop's vehicle types and rough price.
- A Directions button that opens Google Maps.
- Adding a stall by tapping the map and entering name, vehicle types and price, with no sign-in.
- Shared storage, so added stalls persist across refreshes and are visible to everyone.
- Clearly labeled sample shops.

The proof needs to show two things: drivers can find the nearest shop, and drivers can add a stall that Google Maps doesn't have.

## Later
- User accounts and logins, because they take time and don't prove the main idea.
- Ratings and reviews.
- Photos of shops.
- "Still open?" confirmations.
- A Khmer language toggle.
- Editing or deleting a spot after it's added.

## Explicitly Cut
- **Live turn-by-turn navigation and traffic:** Google Maps already does this, so Directions just hands off to it.
