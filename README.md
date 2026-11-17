# Room-light-heat-map

An interactive, single-file web tool that visualises how well a room is lit, then recommends priced fixes to add or remove light, with the exact spot for each one.

Describe your room (or upload a photo), mark your furniture, and the tool shows a heat map of bright and dim areas measured against what each spot actually needs. A desk needs far more light than a bed, so the map judges each area on its own terms.

---

## Features

- **Lighting heat map.** Colour-coded view of too-dark, right-level and too-bright areas, with live percentages.
- **Draw your room.** Set room dimensions, then place ceiling lights, lamps, spotlights, windows and doors. Drag to move, double-click to remove.
- **Photo mode.** Upload a photo to estimate brightness from pixels and overlay the same heat map.
- **Furniture-aware.** Place a bed, sofa, reading chair, desk, table, side table or TV. Each has its own target light level, and recommended lights are kept off furniture.
- **Two goals.** Choose *More light* or *Less light*, and set how you use the open floor (relaxed, everyday, reading, detail work).
- **Priced recommendations.** Around 15 options when adding light and about 10 when reducing it, each with an estimated cost, typical price range and a before/after score.
- **Exact placement.** "Show on map" previews numbered pins for each new light. Spotlights show both a mount point and an aim point. Each card also describes the spot in words (for example, *next to the reading chair*).
- **Functional checks.** Each idea lists the zones it brings to the right level and warns if it may over-light another (for example, the bed).
- **Filters and sorting.** Filter by budget (free to $100) and sort by best result, lowest price or best value.
- **Undo and reset.** Preview any option, then apply it or cancel.

---

## Getting started

The project is one self-contained HTML file with no build step and no dependencies.

1. Download `light-heatmap-v3.html`.
2. Open it in any modern browser.

To host it, upload the file to any static host (GitHub Pages, Netlify, an S3 bucket and so on).

---

## How to use

1. **Set up your room.** Enter the width and length in feet. Add lights, windows and doors, then your furniture. Alternatively, upload a photo and mark furniture where it appears in the picture.
2. **Choose a goal.** Pick *More light* or *Less light* and the level you want for open floor space.
3. **Review ideas.** Read the summary of your dimmest and brightest areas, filter by budget, and select **Show on map** to preview an option. Select **Apply** to keep it.

### Reading the map

| Colour | Meaning |
| --- | --- |
| Blue / navy | Too dark for that spot |
| Green | Right level for that spot |
| Yellow / red | Too bright for that spot |

A spot is "right" when its brightness is between **70% and 160%** of its target.

### Light targets

| Area | Target (lux) |
| --- | --- |
| Open floor: Relaxed | 80 |
| Open floor: Everyday living (default) | 150 |
| Open floor: Reading and hobbies | 300 |
| Open floor: Kitchen, office, detail work | 500 |
| Desk | 450 |
| Reading chair | 300 |
| Table | 200 |
| Sofa / side table | 150 |
| Bed / TV | 60 |

---

## Recommendations and pricing

Prices are rough US retail estimates in USD and vary by brand and store.

**Adding light**

| Option | Estimated cost |
| --- | --- |
| Brighter LED bulbs | $7 per bulb |
| Smart bulbs | $14 per bulb |
| Floor lamp | $45 |
| Torchiere uplight | $35 |
| Plug-in wall sconce | $38 |
| Table lamp | $25 ($60 with a side table) |
| Clip-on spotlight | $20 |
| Track lighting (2 heads) | $65 |
| LED strip | $25 |
| Two recessed lights | $90 (electrician extra) |
| Lighter wall paint | $80 |
| Mirror opposite a window | $45 |
| Combinations (bulbs + lamp, uplight + table lamp, lamp + spotlight) | $35 to $65+ |

**Reducing light**

| Option | Estimated cost |
| --- | --- |
| Turn off or remove one light | Free |
| Soften the harshest bulb | $7 |
| Lower-brightness bulbs | $6 per bulb |
| Dimmer switch + dimmable bulbs | $25 + $6 per bulb |
| Smart dimmable bulbs | $13 per bulb |
| Lamp shades or diffusers | $12 each |
| Sheer curtains | $30 per window |
| Window film | $20 per window |
| Blackout blinds | $40 per window |

---

## How it works

- The room is divided into a grid of 0.5 ft cells.
- Each light adds illuminance to every cell using an inverse-square falloff with an angle (cosine) term and a fixed factor for light reflected off walls and ceiling. Spotlights use a focused beam centred on their aim point.
- Each cell is compared with its own target, set by the furniture it falls on or by the chosen open-floor level.
- For each recommendation the tool simulates the change, then scores it by the share of cells at the right level. Cells on task furniture count double.
- New lights are placed by testing candidate positions and keeping the best-scoring one, within these rules:
  - Lights stay off furniture footprints.
  - Doors keep a 3.6 ft clear zone, and floor-standing lights stay about 2 ft from windows.
  - Floor lamps go in corners or beside seating, sconces on walls, and table lamps on existing surfaces.
  - Spotlights mount at a wall and aim at task areas, never at the bed or TV.
- In photo mode, brightness is estimated from pixel luminance.

---

## Customising

All values live in the script at the bottom of the file:

| What to change | Where |
| --- | --- |
| Prices and option wording | The `options()` function and the `ADD` table |
| Furniture sizes and light targets | The `FT` table |
| Light types, heights and default lumens | The `T` table |
| Comfortable range (70% to 160%) | The `stats()` and `bestLight()` functions |
| Door and window clearances | The `clear()` function |

---

## Limitations

- This is a simplified planning model, **not a light-meter reading**. Real results depend on shades, wall colour, bulb beam angle and furniture shadows.
- Photo mode overlays a flat map on a perspective photo, so positions are approximate. Mark furniture where it appears in the photo, or use drawn mode for precise placement.
- Prices are estimates only. Electrical work may require a licensed professional.
- Rooms are rectangular and measured in feet.

---

## Tech

- Plain HTML, CSS and JavaScript (no frameworks, no external requests)
- HTML5 Canvas for rendering
- Supports light and dark mode, and works on desktop and mobile

---

## Roadmap ideas

- Metric units and local currency
- Non-rectangular rooms and multiple rooms
- Colour temperature (warm and cool) suggestions
- Export a shopping list or share a room layout
- Furniture shadowing and beam-angle modelling

---


