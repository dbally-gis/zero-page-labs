---
generated_by: "Claude Code CLI (Claude Fable 5.2)"
timestamp: "2026-11-12T04:50:00-06:00"
---

# Maritime 3D scene graphics

How the dimensional sea in `experiments/maritime/scene.mjs` draws ships and water after the 2026-11-11 upgrade.

## Hull forms
- `hull.mjs` is pure data with no renderer import, so Node tests cover it. `FORMS` holds one generic form per ship type; `screw-frigate` shares the sailing form.
- Bow is −z. `hullHalf(type,z,y)` gives the half-breadth anywhere on the hull. Use it to place anything that must sit on the hull surface (gun ports, damage marks).
- Deck height stays at `DECK = 8.05` for every type because `combat.mjs` fixes effect heights at y 7–9.7. To make the monitor and ironclad ride low, `low` shifts the whole model down in `draw()` instead of changing the deck height. `shot-effects.mjs` subtracts the same `low` from effect heights in the 3D scene, so `combat.mjs` and the SVG chart stay unchanged.
- Hull paint is a canvas texture mapped keel (v=0) to rail (v=1). Tones are neutral timber and iron. An early version used ochre bands with black ports, which read as the Nelson chequer on 1509 carracks; keep the tones period-neutral.
- Deck triangles must wind to face up. Deck materials are single-sided, so a wrong winding hides the deck from above. A Node test checks this.

## Shadows
- One sun shadow map follows the camera target. Its reach is sized from the camera frustum in `frameCamera()`, so the follow view gets sharp shadows and the tactical view still covers the whole fleet.
- The ocean is a `ShaderMaterial` and cannot receive shadows. A `ShadowMaterial` plane at y −0.5 takes them instead.
- Sails cast but do not receive, for the same banding reason as Bellona.

## Water
- Fine ripples, the sun gleam, glitter and whitecaps are scaled by `closeUp`, which fades out between a view height of 240 and 420 world units (`span` uniform). Without the fade they alias into specks and a visible grid in the tactical and atmosphere views.
- Waterline foam is a strip built from the hull outline at the waterline (`hullMesh(type).foam`) with per-vertex alpha.

## Cache busting
- `maritime.mjs` imports the scene with a `?v=` query. Change the query whenever `scene.mjs` changes, or returning visitors keep the old module.
