# GRIDCORE // STRUCTURAL VECTOR PROJECTION
### Board-Approved Visual Framework — Globe & Atlas
*Locked. Do not modify without Board review.*

---

## DESIGN PHILOSOPHY

Structural Gridcore is the visual language of Globe & Atlas. It reveals the spatial truth of physical and logical systems using the most skeletal digital visualization possible. The aesthetic derives from 1970s vector CRT instruments — Evans & Sutherland flight simulators, oscilloscopes, early geospatial workstations — and connects directly to the practitioner's native visual vocabulary: LiDAR point clouds, TIN surfaces, wireframe topology.

**The primary directive:** Strip away texture, lighting, shadow, and fill until only structural geometry remains. The analyst is above the data, reading it — not inside it.

**Board provenance:** Approved against Michelangelo (structure), Rams (interface), Feynman (logic), Shannon (signal), Tufte (data-ink), and Stewart Brand (endurance). Every constraint exists for a reason.

---

## CORE SPECIFICATION

### Medium
- **Foreground:** Amber phosphor (#FFB300)
- **Background:** Absolute black void (#000000)
- Single channel. No exceptions.

### Projection
- Orthographic or isometric only
- No vanishing points
- No perspective horizon
- No implied motion

### Line Quality
- Constant-width vector strokes throughout
- Subtle phosphor bloom at intersections and vertices only
- No anti-aliasing variation
- No thickness gradients

### Line Hierarchy

| Level | Element | Weight |
|---|---|---|
| Primary | Load-bearing structure, major edges, dominant geometry | Full |
| Secondary | Supporting structure, minor edges, internal geometry | Reduced |
| Context | Contours, grid reference, terrain surface | Thin |
| Annotation | Leader lines, callouts | Minimal |

---

## PROMPT TEMPLATE

```
GRIDCORE // STRUCTURAL VECTOR PROJECTION

SUBJECT:
[Define the physical or logical system]

CONTEXT TYPE:
[terrain | industrial | network | isolated object]

CORE GEOMETRY:
- Render as pure hollow wireframe skeleton — edges only, void between
- [Define primary structure elements]
- [Define secondary structure elements]
- Orthographic / isometric projection only

ENVIRONMENT:
- Absolute black void (#000000)
- No horizon, no atmosphere

COLOR + RENDERING:
- Monochrome amber (#FFB300) only
- Subtle phosphor bloom at intersections and vertices only
- Clean, constant-width vector lines throughout

LINE HIERARCHY:
- Primary structure: dominant weight
- Secondary structure: reduced weight
- Context (contours/grid): thin
- Callouts: minimal but legible

CONDITIONAL OVERLAYS:
- Contours: only if terrain context exists and carry real elevation intervals
- H3 grid: only if spatial subdivision is meaningful to subject
- Remove both if irrelevant

FLOW REPRESENTATION:
- Major flows match primary structure weight
- Minor flows match secondary structure weight
- Uniform arrowhead style throughout
- No text attached to arrows

ANNOTATION:
- Monospace labels only
- Variables + coordinates only
- Every label must connect via leader line
- No narrative text

FAIL CONDITIONS:
- No perspective distortion
- No gradients (bloom at intersections excepted)
- No decorative UI/HUD elements
- No non-amber colors
- No fake status text
- No face fill of any kind
- No human figures
- No motion blur or trajectory arcs
- No shadows or implied light source
```

---

## CONTEXT TYPE REFERENCE

**terrain** — Subject has elevation, surface, or topographic character. TIN meshes, contour networks, watersheds, land cover boundaries. Contour and H3 overlays eligible.

**industrial** — Subject is built infrastructure read for structural integrity. Refineries, pipelines, machine assemblies, facilities. Neither contour nor H3 typically relevant.

**network** — Subject is relational. Nodes and edges matter more than physical form. Street networks, ETL pipelines, utility graphs, stream hierarchies. H3 potentially relevant.

**isolated object** — Subject stands alone without environmental context. Single component examined in void. No overlays.

---

## WORKED PROMPT EXAMPLES

### Example A — TIN Terrain: Arid Mesa
```
GRIDCORE // STRUCTURAL VECTOR PROJECTION

SUBJECT: Terrain surface — Triangulated Irregular Network, arid mesa
landscape with drainage channels and ridge breaks

CONTEXT TYPE: terrain

CORE GEOMETRY: Pure hollow wireframe TIN — triangle edges only, absolute
void between edges. Breaklines and ridgelines as primary structure weight.
Standard triangle edges as secondary structure weight. Drainage channels
visible as geometric depressions in the network.

ENVIRONMENT: Absolute black void (#000000). No horizon, no atmosphere,
no ground plane implied beyond the TIN itself.

COLOR + RENDERING: Monochrome amber (#FFB300). Subtle phosphor bloom at
triangle vertices and edge intersections only. Clean constant-width vector
lines throughout.

PROJECTION: Orthographic isometric. No perspective distortion.
No vanishing point.

ANNOTATION: Sparse coordinate labels at mesh boundary only, monospace,
leader lines. No narrative text.

FAIL CONDITIONS: No face fill, no gradients, no perspective,
no non-amber colors, no decorative elements.
```

### Example B — Isolated Object: Anatomical Wireframe
```
GRIDCORE // STRUCTURAL VECTOR PROJECTION

SUBJECT: Domestic cat — skeletal and muscular attachment geometry,
joint topology, full body

CONTEXT TYPE: isolated object

CORE GEOMETRY: Pure hollow wireframe skeleton. Bone geometry as primary
structure. Muscle attachment edges and joint connectors as secondary
structure. Internal organ cavity implied by structural enclosure only —
no fill, no surface.

ENVIRONMENT: Absolute black void (#000000). No ground plane,
no atmosphere, no shadow.

COLOR + RENDERING: Monochrome amber (#FFB300). Phosphor bloom at joint
nodes and structural intersections only. Constant-width vector lines.

PROJECTION: Orthographic isometric. No perspective distortion.

ANNOTATION: Monospace joint labels at primary nodes. Leader lines only.
No narrative text.

FAIL CONDITIONS: No face fill, no gradients, no perspective,
no texture, no non-amber colors, no decorative elements.
```

### Example C — Network: Urban Street Topology
```
GRIDCORE // STRUCTURAL VECTOR PROJECTION

SUBJECT: Urban street centerline network, intersection topology,
block boundary geometry

CONTEXT TYPE: network

CORE GEOMETRY: Hollow wireframe network. Street centerlines as primary
structure. Block boundary edges as secondary structure. Intersection
nodes as amber geometric points. Block interiors void.

ENVIRONMENT: Absolute black void (#000000). No horizon, no atmosphere.

COLOR + RENDERING: Monochrome amber (#FFB300). Bloom at intersection
nodes only. Clean constant-width vector lines.

PROJECTION: Orthographic top-down.

ANNOTATION: Monospace coordinate labels at network boundary.
Intersection IDs at major nodes. Leader lines only.

FAIL CONDITIONS: No perspective, no gradients, no face fill,
no non-amber colors, no decorative elements.
```

---

## WHAT IS NEVER SHOWN

- Human figures
- Motion blur or trajectory arcs
- Perspective convergence or horizon lines
- Gradients of any kind (bloom excepted)
- Face fills or surface textures
- Shadows or implied light sources
- HUD elements, status strings, or metadata readouts
- Non-amber colors
- Decorative or narrative elements of any kind
- Synthwave aesthetic elements

---

*Globe & Atlas // Daniel Bally // globeandatlas.com*
*Framework locked April 2026*
