# GRIDCORE LOWPOLY // STRUCTURAL FACET PROJECTION
### Board-Approved Facet Mode — Globe & Atlas
*Locked. Do not modify without Board review.*

---

## DESIGN PHILOSOPHY

LOWPOLY Gridcore operates in two rendering modes — FILLED and VOID — that share one geometry system but produce opposite readings of it.

In **FILLED mode**, the polygon face becomes the primary carrier of form. Flat amber facets on absolute black. The analyst reads structure from the aggregation of filled surfaces — the same visual logic as a TIN terrain rendered in a GIS viewport, where facet density signals slope complexity and planarity. Edges are secondary: amber lines drawn over fills at structural joints.

In **VOID mode**, the face is empty. The low-polygon mesh is rendered as edges only — amber lines on black — but the mesh itself is deliberately coarse. Where Standard Gridcore draws every structurally meaningful edge at maximum fidelity, LOWPOLY VOID commits to a sparse, angular triangulation. The large empty polygon faces read as negative space, and the low-poly topology is legible through them. It is not a simplification of Standard — it is a different geometric claim: the subject resolved into its fewest honest planes.

The aesthetic derives from two GIS realities: flat-shaded TIN surfaces (FILLED) and low-resolution DEM wireframes where the polygon count is the analytic statement (VOID). Both modes share the same triangulation logic — facet density encodes complexity in both cases.

**Board provenance:** Michelangelo (form read from surface geometry, not line — FILLED), Tufte (data-ink ratio applied to polygon count — VOID), Rams (no element without function — mode chosen to serve the subject, not aesthetic preference). Approved as a two-mode system: FILLED and VOID are not interchangeable — choose the one that makes the right structural claim.

---

## CORE SPECIFICATION

### Mode Selection

| Mode | Face | Edges |
|---|---|---|
| **FILLED** | Flat amber (#FFB300), 100% opacity | Amber lines at secondary weight over fills; hairline black gaps between facets |
| **VOID** | Absolute black void — no fill | Amber lines only; same low-poly triangulation, no face fill permitted |

Declare mode explicitly in every prompt. Do not combine — a single image is either FILLED or VOID throughout.

### Medium (Both Modes)
- **Foreground:** Amber (#FFB300)
- **Background:** Absolute black void (#000000)
- Single channel. No exceptions.

### Projection (Both Modes)
- Orthographic or isometric only
- No vanishing points
- No perspective horizon
- No implied motion

### Face Rendering — FILLED Mode
- Every facet: flat amber (#FFB300), 100% opacity
- Zero gradient, zero shading within any face
- No ambient occlusion
- No implied light source
- No variation in amber value between faces
- Phosphor bloom at vertex nodes only (not on face interiors)
- Hairline black gaps between adjacent facets throughout

### Face Rendering — VOID Mode
- Every facet interior: absolute black void — no fill of any kind
- Edges drawn as amber lines at declared weight
- Phosphor bloom at vertex nodes and edge intersections
- No face fill permitted — void is not at reduced opacity; it is empty

### Edge Treatment (Both Modes)

| Level | Role | Rendering |
|---|---|---|
| Primary structural | Load-bearing edges, dominant geometry boundaries | Full-weight amber line |
| Secondary structural | Supporting edges, internal facet boundaries | Reduced-weight amber line |
| Context | Grid reference, terrain datum | Thin amber line only |
| Annotation | Leader lines, callouts | Minimal amber, monospace labels |

*In FILLED mode, edges are drawn over fills. In VOID mode, edges are the entire image.*

### Form Reading (Both Modes)
Form is expressed through geometry — facet size, shape, density, and distribution — not through shading or color variation. Dense triangulation signals complexity; sparse facets signal planarity. This is true in both modes: the mesh carries the meaning, not the fill choice.

---

## PROMPT TEMPLATE

```
GRIDCORE LOWPOLY // STRUCTURAL FACET PROJECTION

SUBJECT:
[Define the physical or logical system]

CONTEXT TYPE:
[terrain | industrial | isolated object]

MODE:
[FILLED — flat amber facets on void | VOID — no fill, amber edges on void]

FACET GEOMETRY:
- [FILLED: Render as flat-shaded amber TIN / low-polygon mesh, all faces flat amber (#FFB300)]
- [VOID: Render as sparse low-polygon wireframe — edges only, face interiors void]
- [Define primary facet structure — where mesh is dense vs. sparse]
- [Define secondary facet areas]
- [FILLED: Hairline black gaps between facets throughout]
- [VOID: No face fill of any kind — void between all edges]

ENVIRONMENT:
- Absolute black void (#000000)
- No horizon, no atmosphere

COLOR + RENDERING:
- Monochrome amber (#FFB300) only
- [FILLED: Flat facet fills, zero gradient, no shading; structural edge lines over fills]
- [VOID: Edge lines only; bloom at intersections and vertex nodes]
- Phosphor bloom at vertex nodes only [FILLED: not on face interiors]

PROJECTION:
- Orthographic / isometric only
- No perspective distortion

CONDITIONAL OVERLAYS:
- Contours: only if terrain context exists and carry real elevation intervals — thin amber lines, no fill
- Remove if irrelevant

ANNOTATION:
- Monospace labels only
- Variables + coordinates only
- Every label must connect via leader line
- No narrative text

FAIL CONDITIONS:
- No gradient within any facet [FILLED] / no fill of any kind [VOID]
- No shading or lighting variation between faces
- No implied light source
- No face colors other than amber (#FFB300)
- No perspective distortion
- No decorative UI/HUD elements
- No non-amber colors
- No human figures
- No motion blur or trajectory arcs
- No shadows
- No synthwave aesthetic elements
```

---

## CONTEXT TYPE REFERENCE

**terrain** — Subject has elevation, surface, or topographic character. TIN facets encode slope complexity through triangulation density. FILLED mode reads terrain as massed form; VOID mode reads terrain as a sparse structural skeleton. Contour overlays eligible as thin amber lines only, no fill. Primary use case for LOWPOLY.

**industrial** — Subject is built infrastructure. FILLED mode reads as volumetric mass — vessels and structures have presence. VOID mode reads as a skeletal enclosure — structure without mass. Neither contour nor H3 typically relevant.

**isolated object** — Subject stands alone without environmental context. Geological forms, structural components, conceptual geometry. FILLED for form-dominant subjects; VOID for structure-dominant subjects. No overlays.

**network** — Not recommended for LOWPOLY. Edge-dominant subjects (graphs, flow diagrams, street networks) are better served by Standard or Spectral. Use LOWPOLY VOID only if the network has meaningful geometric volume (e.g., a 3D zone topology).

---

## WORKED PROMPT EXAMPLES

### Example A — Terrain FILLED: Arid Plateau TIN Surface
```
GRIDCORE LOWPOLY // STRUCTURAL FACET PROJECTION

SUBJECT: Terrain surface — triangulated irregular network, arid plateau with
incised canyon system and mesa edges

CONTEXT TYPE: terrain

MODE: FILLED — flat amber facets on void

FACET GEOMETRY: Flat amber TIN mesh over full terrain extent. Dense
triangulation in canyon walls and drainage incisions — facets small and
varied. Sparse triangulation across planar mesa surfaces — large, regular
facets. Plateau rim edges as primary structural edge lines drawn in amber
at secondary weight over fills. Canyon floor as secondary facet zone.
Hairline black gaps between all adjacent facets throughout.

ENVIRONMENT: Absolute black void (#000000). No horizon, no atmosphere, no
implied ground plane.

COLOR + RENDERING: All facets flat amber (#FFB300). Zero gradient, no shading.
Phosphor bloom at primary vertex nodes at canyon rim and mesa corner only.

PROJECTION: Orthographic isometric. No perspective distortion.

CONDITIONAL OVERLAYS: Contour lines at 100m elevation intervals — thin amber
lines only, no fill, rendered over facet surface.

ANNOTATION: Monospace elevation coordinates at plateau surface and canyon
floor. Leader lines only. No narrative text.

FAIL CONDITIONS: No gradient, no shading, no perspective, no non-amber colors,
no decorative elements, no human figures.
```

### Example B — Terrain VOID: Arid Plateau TIN Surface
```
GRIDCORE LOWPOLY // STRUCTURAL FACET PROJECTION

SUBJECT: Terrain surface — triangulated irregular network, arid plateau with
incised canyon system and mesa edges

CONTEXT TYPE: terrain

MODE: VOID — no fill, amber edges on absolute black

FACET GEOMETRY: Sparse low-polygon wireframe over full terrain extent. Dense
triangulation in canyon walls and drainage incisions — many small triangle
edges, void interiors. Sparse triangulation across planar mesa surfaces —
large, regular triangle edges with wide void faces. No face fill of any kind.
Plateau rim as primary structural edges at full weight. Canyon floor
triangulation at secondary weight.

ENVIRONMENT: Absolute black void (#000000). No horizon, no atmosphere.

COLOR + RENDERING: Amber (#FFB300) edge lines only. Face interiors void —
no fill, no opacity, no tint. Phosphor bloom at canyon rim vertex nodes and
mesh boundary intersections.

PROJECTION: Orthographic isometric. No perspective distortion.

CONDITIONAL OVERLAYS: Contour lines at 100m intervals — thin amber lines
at context weight, rendered as additional edge layer over void faces.

ANNOTATION: Monospace elevation coordinates at plateau and canyon floor.
Leader lines only. No narrative text.

FAIL CONDITIONS: No face fill of any kind, no gradient, no shading, no
perspective, no non-amber colors, no decorative elements.
```

### Example C — Industrial FILLED: Refinery Vessel Cluster
```
GRIDCORE LOWPOLY // STRUCTURAL FACET PROJECTION

SUBJECT: Petroleum refinery — vertical pressure vessels, horizontal
heat exchangers, connecting pipe manifold, structural support frame

CONTEXT TYPE: industrial

MODE: FILLED — flat amber facets on void

FACET GEOMETRY: Low-polygon mesh over each vessel and structural element.
Vertical vessel cylinders resolved as faceted prisms — 8–12 faces per
cylinder, all flat amber. Pipe manifold as faceted tube segments. Support
frame as angular faceted extrusions. Primary structural edges (vessel seams,
flange rings, frame joints) drawn as amber lines at secondary weight over fills.
Internal geometry not visible — exterior surface only. Hairline black gaps
between all facets.

ENVIRONMENT: Absolute black void (#000000). No horizon, no atmosphere.

COLOR + RENDERING: All facets flat amber (#FFB300). Zero gradient, no shading
variation between adjacent vessel faces. Phosphor bloom at primary vertex nodes
(top caps, flange intersections) only.

PROJECTION: Orthographic isometric.

ANNOTATION: Monospace vessel IDs at primary structural nodes. Coordinate
labels at facility boundary reference points. Leader lines only.

FAIL CONDITIONS: No gradient, no shading, no implied light source, no
perspective, no non-amber colors, no decorative elements.
```

### Example D — Isolated Object VOID: Geological Formation
```
GRIDCORE LOWPOLY // STRUCTURAL FACET PROJECTION

SUBJECT: Basalt columnar formation — hexagonal prism columns,
jointing pattern, fractured crown geometry

CONTEXT TYPE: isolated object

MODE: VOID — no fill, amber edges on absolute black

FACET GEOMETRY: Sparse low-polygon wireframe over column cluster. Each
column resolved as hexagonal prism skeleton — 6 rectangular lateral face
outlines, 1 top cap outline. Crown fractures as irregular angular edge
networks. No face fill of any kind — void between all edges. Primary
structural edges: column vertical seams and top cap perimeters at full
weight. Secondary structural edges: lateral face horizontal joints at
reduced weight. Joint gaps between columns visible as void through the
wireframe.

ENVIRONMENT: Absolute black void (#000000). No ground plane, no atmosphere,
no shadow.

COLOR + RENDERING: Amber (#FFB300) edge lines only. Face interiors void.
Phosphor bloom at column top vertex nodes and crown fracture apex nodes.

PROJECTION: Orthographic isometric, oblique view to show column height
and crown fracture geometry.

ANNOTATION: Monospace joint-spacing coordinate at column base. Column
height dimension at primary column. Leader lines only. No overlays.

FAIL CONDITIONS: No face fill of any kind, no gradient, no shading, no light
source, no non-amber colors, no perspective, no decorative elements.
```

---

## MODE SELECTION GUIDE

| Question | Answer → Mode |
|---|---|
| Does the subject have volume that needs to read as solid mass? | FILLED |
| Does the subject need to feel skeletal, open, structural? | VOID |
| Is the triangulation density the primary message (terrain complexity)? | Either — FILLED emphasizes surface, VOID emphasizes structure |
| Are you layering Spectral data channels on top next? | FILLED (see LOWPOLY Spectral) |
| Is the subject an isolated structural object in void? | VOID preferred |

When in doubt: VOID is the more conservative choice. It stays closer to the Standard Gridcore philosophy and never risks fill overwhelming structure.

---

## WHAT IS NEVER SHOWN (Both Modes)

- Gradient or shading within any single facet
- Variation in amber intensity between adjacent faces
- Implied light source or directional illumination
- Ambient occlusion or shadow
- Human figures
- Perspective convergence or horizon lines
- Non-amber colors
- Motion blur or trajectory arcs
- HUD elements, status strings, or metadata readouts
- Decorative or narrative elements of any kind
- Synthwave aesthetic elements
- Network graphs or flow diagrams (use Standard or Spectral)

### VOID Mode Additionally Prohibits
- Face fill of any kind — void is not tinted, not at reduced opacity, not implied
- Any amber fill that could be mistaken for a face fill

### FILLED Mode Additionally Prohibits
- Color variation between adjacent filled faces
- Opacity variation between adjacent filled faces
- Ambient occlusion darkening at facet edges

---

*Globe & Atlas // Daniel Bally // globeandatlas.com*
*LOWPOLY Mode approved April 2026*
*VOID rendering mode added April 2026*
*Extends GRIDCORE visual family — FILLED inverts Standard edge rule; VOID applies Standard edge rule to low-polygon mesh*
