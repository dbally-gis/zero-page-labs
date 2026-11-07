# GRIDCORE LOWPOLY SPECTRAL // CLASSIFIED FACET PROJECTION
### Board-Approved Spectral Facet Mode — Globe & Atlas
*Extension of LOWPOLY Mono. Inherits all base constraints.*

---

## DESIGN PHILOSOPHY

LOWPOLY Spectral is the data-encoding extension of LOWPOLY Mono. It applies the same flat-shaded facet language but assigns each facet to a declared data channel — replacing the amber fill with a channel color that encodes a discrete, non-redundant data dimension.

The philosophical foundation is false-color remote sensing: Sentinel-2 band composites, classified land cover rasters, elevation band maps. In those outputs, color is measurement. Each pixel belongs to exactly one class. LOWPOLY Spectral applies this principle to a triangulated mesh — each facet belongs to exactly one declared channel, and that channel carries a real-world variable.

**The critical inversion from Spectral Wireframe:** In Spectral Wireframe, amber is the structural skeleton and color channels are overlays at ≤12% opacity. In LOWPOLY Spectral, color channels are the face fills at 100% opacity, and amber is the structural skeleton drawn over them as edge lines. The face is the data; the edge is the structure.

**The critical constraint:** Amber (#FFB300) is always present as the structural skeleton — drawn as edge lines over color-filled facets. Amber never disappears beneath data. If a channel cannot be defined in a legend with a real-world value attached, it is removed.

**Board provenance:** Tufte (every facet color is a data claim, not decoration), Shannon (maximum information per rendered element — face encodes class, edge encodes structure simultaneously), Rams (conditional necessity — channels added only when the data demands it). Spectral Wireframe precedent applied to the LOWPOLY rendering model.

---

## CORE SPECIFICATION

### Channel System
- **Maximum 8 channels defined** per visual system
- **Maximum 4 channels active** in any single image
- **Amber (#FFB300) is always the structural skeleton** — rendered as edge lines over all face fills, always dominant and legible
- Every non-amber channel is a face fill color — it must declare: variable encoded, value range or class, rendering element
- Each facet belongs to exactly one channel — no overlapping fills

### Channel Declaration Format
```
- [Color Name] ([Hex]) — [Variable] // [Value range, class, or threshold]
```

### Master Channel Palette
*Phosphor-honest colors only. No pastels, no RGB primaries for decoration.*

| Channel | Name | Hex | Canonical Face Use |
|---|---|---|---|
| 1 | Amber | #FFB300 | Structural skeleton (edges) + baseline/unclassified facets |
| 2 | P1 Green | #33FF57 | Elevation gain / positive value / vegetation |
| 3 | Cyan | #00FFFF | Flow / hydraulic / movement zone |
| 4 | Red-Orange | #FF4500 | Anomaly / threshold breach / loss / high severity |
| 5 | White | #FFFFFF | Critical zone / divide / boundary facet |
| 6 | Pale Blue | #AADDFF | Low confidence / atmospheric / water |
| 7 | Magenta | #FF00FF | Classification boundary zone |
| 8 | Yellow | #FFFF00 | Secondary anomaly / warning / mid-value |

### Rendering Rules
- Amber structural skeleton drawn as edge lines OVER all color-filled facets — always dominant
- Face fills: 100% opacity, flat, zero gradient within any face
- No shading variation between adjacent faces of the same channel
- Amber bloom at primary vertex nodes only — data channel faces are clean, no bloom on fills
- No two channels may apply to the same facet
- All channel fills must remain legible against #000000 at facet boundaries
- Hairline black gaps between adjacent facets of the same channel remain

---

## PROMPT TEMPLATE

```
GRIDCORE LOWPOLY SPECTRAL // CLASSIFIED FACET PROJECTION

SUBJECT:
[Define the physical or logical system]

CONTEXT TYPE:
[terrain | industrial | isolated object]

CHANNEL DECLARATION:
- Amber (#FFB300) — Structural skeleton (edge lines) + [baseline/unclassified facets if present]
- [Color] ([Hex]) — [Variable] // [Class or value range]
- [Color] ([Hex]) — [Variable] // [Class or value range]
- [Color] ([Hex]) — [Variable] // [Class or value range]
(Maximum 4 active channels. Unused slots removed.)

FACET GEOMETRY:
- Flat-shaded low-polygon mesh over full subject
- Each facet assigned to exactly one declared channel color
- [Define primary facet zones and their channel assignments]
- [Define secondary facet zones and their channel assignments]
- Hairline black gaps between adjacent facets throughout
- Amber edge lines drawn over all fills — structural emphasis at load-bearing geometry

ENVIRONMENT:
- Absolute black void (#000000)
- No horizon, no atmosphere

COLOR + RENDERING:
- Face fills: 100% opacity, flat, zero gradient within any face
- No shading or lighting variation between adjacent faces
- Amber (#FFB300) edge lines over fills — always dominant
- Phosphor bloom at amber vertex nodes only — no bloom on channel fills

PROJECTION:
- Orthographic / isometric only
- No perspective distortion

CONDITIONAL OVERLAYS:
- Contours: only if terrain context and real elevation intervals — thin amber lines over fills, no fill
- Remove if irrelevant

ANNOTATION:
- Monospace labels only
- Variables + coordinates only
- Every label must connect via leader line
- No narrative text
- Bloom on amber annotation only

FAIL CONDITIONS:
- No gradient within any facet
- No shading or lighting variation between faces
- No implied light source
- No color outside declared channels
- No more than 4 active channels
- Amber structural skeleton legible over all fills
- No bloom on channel fills
- No face color serving decorative purpose
- No perspective distortion
- No decorative UI/HUD elements
- No human figures
```

---

## CONTEXT TYPE REFERENCE

Inherited from LOWPOLY Mono, with channel relevance notes.

**terrain** — Primary LOWPOLY Spectral use case. TIN facets classified by elevation band, land cover class, slope category, or spectral index. Channels map directly to classification raster values. Contour overlays eligible.

**industrial** — Built infrastructure with discrete material or thermal zones. Vessel surface classifications, structural integrity zones, thermal band mapping. Useful when different components must be distinguished without wireframe alone.

**isolated object** — Single object with discrete surface classifications — geological zone mapping, material facies, structural component typing. No overlays.

**network** — Not recommended. See LOWPOLY Mono guidance.

---

## WORKED PROMPT EXAMPLES

### Example A — Terrain: Elevation-Banded DEM Surface
```
GRIDCORE LOWPOLY SPECTRAL // CLASSIFIED FACET PROJECTION

SUBJECT: Digital elevation model — arid basin and range, triangulated surface,
elevation banded into discrete hypsometric classes

CONTEXT TYPE: terrain

CHANNEL DECLARATION:
- Amber (#FFB300) — Structural edge skeleton + basin floor facets // < 200m elevation
- P1 Green (#33FF57) — Foothill and alluvial fan facets // 200–600m elevation
- Yellow (#FFFF00) — Mid-slope facets // 600–1000m elevation
- White (#FFFFFF) — Summit and ridge facets // > 1000m elevation

FACET GEOMETRY: Flat-shaded TIN mesh over full terrain extent. Dense
triangulation in basin channel zones and alluvial fans. Sparse triangulation
on planar basin floor and summit plateaus. Each facet assigned to its
elevation class channel. Amber edge lines at primary structural weight at
ridge crests and escarpment breaks. Hairline black gaps between all facets.

ENVIRONMENT: Absolute black void (#000000). No horizon.

COLOR + RENDERING: Face fills 100% flat per channel declaration. Zero gradient.
No shading variation. Amber edge lines drawn over all fills — ridgelines and
basin margins at secondary weight, primary basin boundary at full weight.
Phosphor bloom at amber ridge vertex nodes only.

PROJECTION: Orthographic isometric.

CONDITIONAL OVERLAYS: Contour lines at 200m intervals — thin amber lines
over fills, matching elevation band boundaries.

ANNOTATION: Monospace elevation labels at band boundaries. Basin centroid
coordinate. Leader lines only. No narrative text.

FAIL CONDITIONS: No gradient, no shading, no perspective, amber structural
edges legible over all fills, maximum 4 channels, no bloom on channel fills.
```

### Example B — Terrain: Land Cover Classification TIN
```
GRIDCORE LOWPOLY SPECTRAL // CLASSIFIED FACET PROJECTION

SUBJECT: Land cover classification — multi-class raster draped as flat-shaded
TIN mesh, savanna transition zone with three discrete cover classes

CONTEXT TYPE: terrain

CHANNEL DECLARATION:
- Amber (#FFB300) — Structural edge skeleton + bare soil / exposed surface // NDVI < 0.1
- P1 Green (#33FF57) — Woody vegetation / tree canopy // NDVI > 0.5
- Yellow (#FFFF00) — Grass and low shrub cover // NDVI 0.1–0.5
- Cyan (#00FFFF) — Surface water and wetland // water index positive

FACET GEOMETRY: Flat-shaded TIN mesh with triangulation density matched
to land cover boundary complexity. Dense facets at cover class transitions.
Sparse facets within homogeneous class zones. Each facet assigned to
its cover class channel. Amber structural edge lines at primary class
boundaries and terrain ridgelines. Hairline black gaps between facets.

ENVIRONMENT: Absolute black void (#000000). No horizon.

COLOR + RENDERING: Face fills 100% flat per channel. Zero gradient. No
shading. Amber edge lines over all fills — class boundaries and ridge
structure at secondary weight. Bloom at amber vertex nodes only.

PROJECTION: Orthographic top-down.

ANNOTATION: Monospace class labels at zone centroids (BARE, VEG, GRASS,
WATER). Area coordinate at each major zone. Leader lines only.

FAIL CONDITIONS: No gradient, no shading, no perspective, amber edges
legible, maximum 4 channels, no bloom on channel fills.
```

### Example C — Industrial: Thermal Zone Map, Processing Facility
```
GRIDCORE LOWPOLY SPECTRAL // CLASSIFIED FACET PROJECTION

SUBJECT: Chemical processing facility — vessel and pipe network surface
geometry, thermal operational zones classified by operating temperature range

CONTEXT TYPE: industrial

CHANNEL DECLARATION:
- Amber (#FFB300) — Structural edge skeleton + ambient-temperature vessels // < 50°C
- Yellow (#FFFF00) — Warm process streams // 50–150°C
- Red-Orange (#FF4500) — High-temperature reaction vessels // > 150°C
- Pale Blue (#AADDFF) — Cooling circuits and condensate returns // < ambient

FACET GEOMETRY: Low-polygon mesh over all facility vessels, heat
exchangers, and pipe manifold. Each vessel and pipe segment resolved as
faceted prism or cylinder with 8–12 faces. Each facet assigned to its
thermal class channel. Amber structural edge lines at primary vessel seams,
flange rings, and interconnect junctions at secondary weight. Hairline
black gaps between all facets.

ENVIRONMENT: Absolute black void (#000000). No horizon.

COLOR + RENDERING: Face fills 100% flat per thermal class. Zero gradient —
no color transition within a vessel face. Amber edge lines over all fills,
dominant at structural seam locations. Phosphor bloom at amber junction
vertex nodes only.

PROJECTION: Orthographic isometric.

ANNOTATION: Monospace temperature range labels per zone (< 50, 50–150,
> 150, COOL). Vessel IDs at primary structural nodes. Leader lines only.

FAIL CONDITIONS: No gradient, no shading, no implied heat-map color
blending within or between faces, amber structural edges legible, maximum
4 channels, no bloom on channel fills.
```

### Example D — Isolated Object: Geological Core Facies
```
GRIDCORE LOWPOLY SPECTRAL // CLASSIFIED FACET PROJECTION

SUBJECT: Sedimentary core sample — cylindrical drill core with four
discrete lithological facies resolved as classified low-polygon mesh

CONTEXT TYPE: isolated object

CHANNEL DECLARATION:
- Amber (#FFB300) — Structural edge skeleton + carbonate facies // limestone beds
- P1 Green (#33FF57) — Organic-rich shale facies // TOC > 2%
- Yellow (#FFFF00) — Sandstone / porous reservoir facies // porosity > 15%
- Red-Orange (#FF4500) — Intrusive / igneous intercalation // non-sedimentary

FACET GEOMETRY: Low-polygon cylinder resolved as faceted prism, 12 lateral
faces. Each lateral face band assigned to its lithological facies channel per
depth interval. Core cross-section visible as faceted top cap — amber
structural fill, no classification overlay. Primary amber edge lines at
facies boundary rings along core length. Hairline black gaps between facets.

ENVIRONMENT: Absolute black void (#000000). No ground plane, no atmosphere.

COLOR + RENDERING: Face fills 100% flat per facies class. Zero gradient within
any face. No shading. Amber edge lines over all fills at facies boundaries
and top cap rim. Bloom at primary vertex nodes only — facies boundary rings.

PROJECTION: Orthographic isometric, oblique to show lateral face distribution
and top cap simultaneously.

ANNOTATION: Monospace facies labels at each depth band (CARB, SHALE, SAND,
IGN). Depth coordinate at top and base of core. Leader lines only. No overlays.

FAIL CONDITIONS: No gradient, no shading, no perspective, amber structural
edges legible, maximum 4 channels, no bloom on channel fills.
```

---

## CHANNEL DISCIPLINE CHECKLIST

Before finalizing any LOWPOLY Spectral image, verify:

- [ ] Pascal Silence Test: *"Is this facet color measuring something — or am I afraid of amber alone?"*
- [ ] Every channel color has a declared variable
- [ ] Every declared variable has a value range, class, or threshold
- [ ] No more than 4 channels active
- [ ] Every facet assigned to exactly one declared channel
- [ ] Amber structural edge lines legible over all channel fills
- [ ] No bloom on channel fills — amber nodes only
- [ ] No gradient within any face
- [ ] No shading between adjacent faces of the same channel
- [ ] A legend could be written from the channel declaration alone

---

## WHAT IS NEVER SHOWN

Inherits all LOWPOLY Mono exclusions, plus:

- Color outside declared channel palette
- More than 4 active channels in a single image
- Bloom on any channel fill — amber vertex nodes only
- Gradient within any single facet
- Shading variation between adjacent faces
- Implied light source or directional illumination
- Undeclared colors used for visual interest
- Facet fills at less than 100% opacity
- Amber disappearing beneath channel fills
- Two channels occupying the same facet

---

*Globe & Atlas // Daniel Bally // globeandatlas.com*
*LOWPOLY Spectral Mode approved April 2026*
*Extends LOWPOLY Mono — inverts Spectral Wireframe opacity model*
*Amber is always the structural skeleton; color channels are always the face*
