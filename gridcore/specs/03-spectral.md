# SPECTRAL GRIDCORE // VECTOR PROJECTION
### Board-Approved Spectral Mode — Globe & Atlas
*Extension of Standard Gridcore. Inherits all base constraints.*

---

## DESIGN PHILOSOPHY

Spectral Gridcore is the data-encoding extension of Standard Gridcore. It applies the same structural wireframe language but introduces up to 7 additional color channels — each one carrying a discrete, non-redundant data dimension.

The philosophical foundation is Edward Tufte: every mark must earn its place, and every color must encode real information. This connects directly to false-color remote sensing — Sentinel-2 band composites, LiDAR intensity returns, spectral indices — where color is measurement, not decoration.

**The critical constraint:** If a color cannot be defined in a legend with a real-world value attached, it is removed.

**Board provenance:** Tufte (data-ink ratio), Shannon (signal encoding), Rams (conditional necessity). Amber base channel approved by full Board under Standard Gridcore. Additional channels conditionally approved subject to declaration discipline.

---

## CORE SPECIFICATION

### Channel System
- **Maximum 8 channels defined** per visual system
- **Maximum 4 channels active** in any single image
- **Amber (#FFB300) is always Channel 1** — the structural skeleton, always present, always dominant
- Every additional channel must declare: variable encoded, value range or threshold, rendering element

### Channel Declaration Format
```
- [Color Name] ([Hex]) — [Variable] // [Value range or threshold]
```

### Master Channel Palette
*Phosphor-honest colors only. No pastels, no RGB primaries for decoration.*

| Channel | Name | Hex | Canonical Use |
|---|---|---|---|
| 1 | Amber | #FFB300 | Base structure — always |
| 2 | P1 Green | #33FF57 | Elevation / positive value / gain |
| 3 | Cyan | #00FFFF | Flow / hydraulic / movement |
| 4 | Red-Orange | #FF4500 | Anomaly / threshold breach / loss |
| 5 | White | #FFFFFF | Critical annotation / divide |
| 6 | Pale Blue | #AADDFF | Low confidence / atmospheric |
| 7 | Magenta | #FF00FF | Classification boundary |
| 8 | Yellow | #FFFF00 | Secondary anomaly / warning |

### Rendering Rules
- Amber structural skeleton rendered first, always dominant
- Data channels rendered as overlays — never replacing structure
- Face fills: maximum 12% opacity per channel
- Bloom on amber only — data channels are clean lines, no bloom
- No two channels may occupy the same rendering element in the same image
- All channels must remain legible against #000000

---

## PROMPT TEMPLATE

```
SPECTRAL GRIDCORE // VECTOR PROJECTION

SUBJECT:
[Define the physical or logical system]

CONTEXT TYPE:
[terrain | industrial | network | isolated object]

CHANNEL DECLARATION:
- Amber (#FFB300) — [Base structure element]
- [Color] ([Hex]) — [Variable] // [Value range]
- [Color] ([Hex]) — [Variable] // [Value range]
- [Color] ([Hex]) — [Variable] // [Value range]
(Maximum 4 active channels. Unused slots removed.)

CORE GEOMETRY:
- Hollow wireframe skeleton — edges only
- [Define primary structure elements]
- [Define secondary structure elements]
- Orthographic / isometric projection only

ENVIRONMENT:
- Absolute black void (#000000)
- No horizon, no atmosphere

LINE HIERARCHY:
- Primary structure: dominant weight
- Secondary structure: reduced weight
- Context (contours/grid): thin
- Data channel overlays: never heavier than primary structure

CONDITIONAL OVERLAYS:
- Contours: only if terrain context and real elevation intervals
- H3 grid: only if spatial subdivision is meaningful
- Face fills: maximum 12% opacity, data channels only
- Remove all if irrelevant

FLOW REPRESENTATION:
- Major flows match primary structure weight
- Minor flows match secondary structure weight
- Uniform arrowhead style throughout
- Color follows channel declaration
- No text attached to arrows

ANNOTATION:
- Monospace labels only
- Variables + coordinates only
- Every label must connect via leader line
- No narrative text
- Bloom on amber only — data channel lines are clean

FAIL CONDITIONS:
- No perspective distortion
- No gradients within any channel
- No bloom on data channels
- No color outside declared channels
- No decorative UI/HUD elements
- No fake status text
- Amber structure must remain readable beneath all overlays
- Maximum 4 active channels per image
- No face fill exceeding 12% opacity
```

---

## CONTEXT TYPE REFERENCE

Inherited from Standard Gridcore.

**terrain** — Elevation, surface, topographic character. Contour and H3 overlays eligible.

**industrial** — Built infrastructure, structural integrity primary. Neither contour nor H3 typically relevant.

**network** — Relational. Nodes and edges primary. H3 potentially relevant.

**isolated object** — Single component in void. No overlays.

---

## WORKED PROMPT EXAMPLES

### Example A — GIS: Watershed Network Analysis
```
SPECTRAL GRIDCORE // VECTOR PROJECTION

SUBJECT: Watershed drainage network, hierarchical stream order,
arid terrain catchment

CONTEXT TYPE: terrain

CHANNEL DECLARATION:
- Amber (#FFB300) — TIN terrain skeleton, catchment boundary edges
- P1 Green (#33FF57) — First and second order streams // headwater channels
- Cyan (#00FFFF) — Third and fourth order streams // main channel network
- White (#FFFFFF) — Watershed divide // critical ridge breakline

CORE GEOMETRY: Hollow wireframe TIN. Triangle edge density varies with
terrain complexity — tight in channel zones, sparse on planar surfaces.
No face fill on terrain. Stream channels overlay amber TIN as color-declared
vector lines.

ENVIRONMENT: Absolute black void (#000000). No horizon.

PROJECTION: Orthographic isometric.

FLOW REPRESENTATION: Green and cyan directional vectors following stream
order hierarchy. Cyan dominant over green at channel confluences. Arrow
weight matches channel weight declaration.

ANNOTATION: Monospace stream order labels (1, 2, 3) at channel origins.
Catchment area coordinate at centroid. Leader lines only.

FAIL CONDITIONS: No perspective, no gradients, no bloom on data channels,
amber TIN readable beneath stream overlays, maximum 4 active channels.
```

### Example B — FME: Spatial ETL Pipeline
```
SPECTRAL GRIDCORE // VECTOR PROJECTION

SUBJECT: FME workspace — multi-source spatial ETL process with geometry
transformation stages, validation routing, and output streams

CONTEXT TYPE: network

CHANNEL DECLARATION:
- Amber (#FFB300) — Transformer nodes, connection edges, workspace skeleton
- Cyan (#00FFFF) — Feature flow paths // active data moving through pipeline
- Red-Orange (#FF4500) — Rejection ports // failed feature routing
- P1 Green (#33FF57) — Validated output streams // passed features

CORE GEOMETRY: Hollow wireframe node graph. Transformers as geometric
primitives — rectangles for processors, circles for readers and writers.
Connection edges as secondary structure amber. Internal transformer logic
revealed as skeletal sub-geometry at reduced weight.

ENVIRONMENT: Absolute black void (#000000). No horizon.

PROJECTION: Orthographic isometric.

FLOW REPRESENTATION: Cyan arrows along main feature flow paths. Green
arrows on output routing. Red-orange arrows on rejection paths. Arrow
weight matches flow volume — major flows dominant, branch flows reduced.
Uniform arrowhead style throughout.

ANNOTATION: Monospace transformer names at nodes. Feature count
coordinates on dominant cyan flow paths. Leader lines only.

FAIL CONDITIONS: No perspective, no gradients, no bloom on data channels,
amber skeleton dominant throughout, maximum 4 active channels.
```

### Example C — GIS: Land Cover Change Detection
```
SPECTRAL GRIDCORE // VECTOR PROJECTION

SUBJECT: Multi-temporal land cover comparison — polygon boundary shift,
classification change zones, two-epoch analysis

CONTEXT TYPE: terrain

CHANNEL DECLARATION:
- Amber (#FFB300) — Stable boundary skeleton // unchanged polygon edges
- Red-Orange (#FF4500) — Loss zones // vegetation removed or impervious gain
- P1 Green (#33FF57) — Gain zones // revegetation or canopy expansion
- White (#FFFFFF) — Change boundary perimeter // transition edge

CORE GEOMETRY: Hollow wireframe polygon network. TIN terrain as thin
amber context layer beneath. Change zone faces at 10% opacity per declared
channel. Stable polygon interiors void.

ENVIRONMENT: Absolute black void (#000000). No horizon.

PROJECTION: Orthographic top-down.

CONDITIONAL OVERLAYS: H3 grid at resolution 8 if spatial aggregation
unit is relevant to subject. Remove if not.

ANNOTATION: Monospace area coordinates at change zone centroids.
Epoch labels (T1, T2) at boundary reference points. Leader lines only.

FAIL CONDITIONS: No perspective, no gradients, no bloom on data channels,
amber boundary readable beneath change overlays, maximum 4 active channels,
face fill not exceeding 12% opacity.
```

### Example D — Network: Street Pedestrian Flow
```
SPECTRAL GRIDCORE // VECTOR PROJECTION

SUBJECT: Urban street network — intersection topology,
pedestrian flow density by corridor

CONTEXT TYPE: network

CHANNEL DECLARATION:
- Amber (#FFB300) — Street centerline skeleton, block boundary edges
- Cyan (#00FFFF) — High pedestrian flow corridors // arterial level
- P1 Green (#33FF57) — Low flow network // residential and local streets
- Red-Orange (#FF4500) — Conflict nodes // high-volume intersections

CORE GEOMETRY: Hollow wireframe network. Intersections as amber nodes.
Block interiors void. No building footprints — street geometry only.
Red-orange nodes rendered as geometric markers at conflict intersections.

ENVIRONMENT: Absolute black void (#000000). No horizon.

PROJECTION: Orthographic top-down.

FLOW REPRESENTATION: Cyan and green directional vectors along corridors.
Cyan dominant on arterials, green reduced on local streets.
Uniform arrowhead style.

ANNOTATION: Monospace intersection IDs at red-orange conflict nodes.
Coordinate labels at network boundary. Leader lines only.

FAIL CONDITIONS: No perspective, no gradients, no bloom on data channels,
maximum 4 active channels.
```

---

## CHANNEL DISCIPLINE CHECKLIST

Before finalizing any Spectral Gridcore image, verify:

- [ ] Pascal Silence Test: *"Is this channel measuring something — or am I afraid of amber alone?"*
- [ ] Every color has a declared variable
- [ ] Every declared variable has a value range or threshold
- [ ] No more than 4 channels active
- [ ] Amber structure visible beneath all overlays
- [ ] No channel bloom except amber
- [ ] No face fill exceeds 12% opacity
- [ ] A legend could be written from the channel declaration alone

---

## TEMPORAL CONFIGURATION

*Pre-configured Spectral mode for multi-epoch structural comparison.*

**Pascal Silence Test (required before use):** A temporal overlay is justified only when co-registered layers reveal spatial change that side-by-side Standard images cannot. If the change is legible from two separate images — use two Standard images.

### Epoch System
- **Amber (#FFB300) always encodes the most recent epoch** — dominant, full weight
- Prior epochs rendered as ghost layers — same geometry, reduced opacity, declared color
- **Maximum 3 epochs** per image
- Every epoch must declare: date or period, opacity

### Epoch Palette

| Epoch | Name | Hex | Opacity |
|---|---|---|---|
| Current | Amber | #FFB300 | 100% |
| Prior | Pale Blue | #AADDFF | 35–45% |
| Earliest | White | #FFFFFF | 15–25% |

### Change Channels *(optional — declare only if change is the subject)*
- **Red-Orange (#FF4500)** — Loss geometry // structure absent in current epoch
- **P1 Green (#33FF57)** — Gain geometry // structure absent in prior epoch
- **Magenta (#FF00FF)** — Change boundary // perimeter of structural difference
- Maximum 2 change channels active alongside epoch layers
- Ghost epoch count + change channel count must not exceed 4 total active channels

### Rendering Rules
- Ghost epochs rendered beneath amber — never obscuring current structure
- Bloom on amber epoch only — ghost layers are clean lines, no bloom
- No face fill on ghost layers
- No gradient transitions between epoch layers

### Temporal Prompt Template

```
SPECTRAL GRIDCORE // VECTOR PROJECTION // TEMPORAL

SUBJECT:
[Define the physical or logical system and the nature of its change]

CONTEXT TYPE:
[terrain | industrial | network | isolated object]

EPOCH DECLARATION:
- Amber (#FFB300) — Current epoch // [Date or period] // 100%
- Pale Blue (#AADDFF) — Prior epoch // [Date or period] // 40%
- White (#FFFFFF) — Earliest epoch // [Date or period] // 20%
(Remove unused epoch slots. Minimum 2 epochs required.)

CHANGE CHANNELS (optional — declare only if change is the subject):
- [Color] ([Hex]) — [Loss or Gain] // [What changed]
(Maximum 2 change channels. Remove if not needed.)

CORE GEOMETRY:
- Hollow wireframe skeleton — edges only
- [Define primary structure elements]
- Ghost epoch geometry matches current epoch topology — same elements, reduced presence
- Orthographic / isometric projection only

ENVIRONMENT:
- Absolute black void (#000000)
- No horizon, no atmosphere

LINE HIERARCHY:
- Primary structure (current): dominant weight
- Secondary structure (current): reduced weight
- Ghost layers: proportionally reduced
- Change channels: never heavier than primary structure

ANNOTATION:
- Monospace epoch labels at structural reference points
- Date or period label per epoch — no narrative text
- Every label must connect via leader line
- Bloom on amber annotation only

FAIL CONDITIONS:
- No perspective distortion
- No gradients within any epoch layer
- No bloom on ghost layers
- No color outside declared epochs and change channels
- No decorative UI/HUD elements
- Amber current epoch dominant and readable
- Maximum 3 epochs per image
- Ghost opacity not exceeding 45%
- No face fill on ghost layers
- Total active layers (ghost epochs + change channels) not exceeding 4
```

### Example — Terrain: Coastal Erosion

```
SPECTRAL GRIDCORE // VECTOR PROJECTION // TEMPORAL

SUBJECT: Coastal bluff geometry — shoreline recession across three survey
epochs, erosion face and cliff-top edge migration

CONTEXT TYPE: terrain

EPOCH DECLARATION:
- Amber (#FFB300) — Current epoch // 2024 survey // 100%
- Pale Blue (#AADDFF) — Prior epoch // 2014 survey // 40%
- White (#FFFFFF) — Earliest epoch // 2004 survey // 20%

CHANGE CHANNELS:
- Red-Orange (#FF4500) — Loss geometry // eroded bluff face, recession zone

CORE GEOMETRY: Hollow wireframe cliff profile. Bluff edge and erosion face
as primary structure per epoch. Ghost epochs render same cliff geometry at
declared opacity — recession visible as spatial offset between amber and
ghost edges. Red-orange loss geometry as sparse wireframe infill between
earliest and current edge positions — no solid fill.

ENVIRONMENT: Absolute black void (#000000). No horizon.

PROJECTION: Orthographic isometric, oblique view to show cliff face.

ANNOTATION: Monospace year labels (2004, 2014, 2024) at bluff edge
reference points. Recession distance coordinate between earliest and
current edge. Leader lines only.

FAIL CONDITIONS: No perspective, no gradients, no bloom on ghost layers,
amber current epoch dominant, ghost opacity within declared range, maximum
3 epochs, no face fill.
```

### Temporal Discipline Checklist

Before finalizing any temporal image, verify the Spectral checklist above, plus:

- [ ] Pascal Silence Test passed: co-registration reveals change that side-by-side images cannot
- [ ] Every epoch has a declared date or period
- [ ] Amber encodes the most recent epoch
- [ ] No more than 3 epochs active
- [ ] Ghost layers render beneath amber in all areas
- [ ] Ghost opacity within declared range (Prior: 35–45%, Earliest: 15–25%)
- [ ] No bloom on ghost layers
- [ ] Ghost epoch count + change channel count does not exceed 4 total

---

## WHAT IS NEVER SHOWN

Inherits all Standard Gridcore exclusions, plus:

- Color outside declared channel palette
- More than 4 active channels in a single image
- Bloom on any channel except amber
- Face fill exceeding 12% opacity
- Undeclared colors used for visual interest
- Gradient transitions between channel colors

Temporal configuration additionally prohibits:

- More than 3 epochs in a single image
- Ghost layer opacity exceeding 45%
- Bloom on any ghost layer
- Face fill on ghost epoch layers
- Undeclared temporal colors used for visual richness
- Ghost epoch count + change channel count exceeding 4 total

---

*Globe & Atlas // Daniel Bally // globeandatlas.com*
*Spectral Mode approved April 2026*
*Temporal Configuration absorbed April 2026*
*Extends Standard Gridcore — inherits all base constraints*
