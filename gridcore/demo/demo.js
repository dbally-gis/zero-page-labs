
const AMBER = "#FFB300";
const BLACK = "#000000";
const GREEN = "#33FF57";
const CYAN = "#00FFFF";
const RED = "#FF4500";
const WHITE = "#FFFFFF";
const YELLOW = "#FFFF00";

const modes = [
  {
    id: "standard",
    label: "Standard",
    spec: "GRIDCORE_STANDARD",
    headline: "Structural vector projection",
    summary: "Amber wireframe on absolute black. The skeleton is the truth.",
    channels: [
      ["Amber", AMBER, "Base structure", "always"],
    ],
    rules: ["black void", "amber only", "wireframe skeleton", "no face fill"],
  },
  {
    id: "spectral",
    label: "Spectral",
    spec: "GRIDCORE_SPECTRAL",
    headline: "Declared channel overlay",
    summary: "Standard Gridcore with measured channels layered over the skeleton.",
    channels: [
      ["Amber", AMBER, "TIN terrain skeleton", "always"],
      ["Cyan", CYAN, "main flow", "stream order 3-4"],
      ["P1 Green", GREEN, "headwater flow", "stream order 1-2"],
      ["Red-Orange", RED, "anomaly node", "threshold breach"],
    ],
    rules: ["max 4 active channels", "amber remains dominant", "data overlays only", "no color without variable"],
  },
  {
    id: "lowpoly-filled",
    label: "LOWPOLY FILLED",
    spec: "GRIDCORE_LOWPOLY",
    headline: "Flat amber facet mass",
    summary: "Every face is flat amber at 100% opacity. Facet density carries form.",
    channels: [
      ["Amber", AMBER, "flat terrain facets", "100% opacity"],
    ],
    rules: ["mode declared FILLED", "flat amber faces", "hairline gaps", "no shading"],
  },
  {
    id: "lowpoly-void",
    label: "LOWPOLY VOID",
    spec: "GRIDCORE_LOWPOLY",
    headline: "Sparse facet skeleton",
    summary: "No face fill. The subject resolves into its fewest honest planes.",
    channels: [
      ["Amber", AMBER, "low-poly edges", "void interiors"],
    ],
    rules: ["mode declared VOID", "no face fill", "amber edges only", "coarse triangulation"],
  },
  {
    id: "lowpoly-spectral",
    label: "LOWPOLY Spectral",
    spec: "GRIDCORE_LOWPOLY_SPECTRAL",
    headline: "Classified facet projection",
    summary: "Each facet belongs to exactly one declared data class. Amber edges remain structural.",
    channels: [
      ["Amber", AMBER, "structural edge skeleton", "always"],
      ["P1 Green", GREEN, "vegetation facets", "NDVI > 0.5"],
      ["Yellow", YELLOW, "low shrub facets", "NDVI 0.1-0.5"],
      ["Cyan", CYAN, "surface water facets", "water index positive"],
    ],
    rules: ["one channel per facet", "100% flat fills", "amber edges over fills", "legend derivable"],
  },
];

let activeModeId = "standard";
let sweep = 0;
let animationFrame;

const app = document.querySelector("#app");

const points = [
  [70, 340], [150, 270], [235, 305], [330, 225], [455, 270], [565, 195],
  [680, 245], [790, 170], [895, 225], [1015, 190], [1120, 285], [1035, 395],
  [920, 365], [835, 485], [705, 430], [610, 535], [505, 445], [390, 520],
  [275, 420], [155, 475],
];

const triangles = [
  [0, 1, 19], [1, 18, 19], [1, 2, 18], [2, 3, 18], [3, 17, 18],
  [3, 4, 17], [4, 16, 17], [4, 5, 16], [5, 15, 16], [5, 6, 15],
  [6, 14, 15], [6, 7, 14], [7, 13, 14], [7, 8, 13], [8, 12, 13],
  [8, 9, 12], [9, 11, 12], [9, 10, 11], [2, 4, 18], [4, 14, 16],
  [4, 6, 14], [6, 8, 14], [8, 11, 13],
];

function mode() {
  return modes.find((item) => item.id === activeModeId) ?? modes[0];
}

function render() {
  const current = mode();

  app.innerHTML = `
    <main class="shell">
      <header class="masthead">
        <div>
          <p class="eyebrow">GLOBE & ATLAS / GRIDCORE DEMO</p>
          <h1>Structural systems made inspectable.</h1>
        </div>
        <div class="status-panel">
          <span>MODE</span>
          <strong>${current.label}</strong>
          <small>${current.spec}</small>
        </div>
      </header>

      <section class="control-rack" aria-label="Gridcore mode controls">
        <div class="mode-group" role="group" aria-label="Projection modes">
          ${modes.map((item) => `
            <button class="mode-button ${item.id === activeModeId ? "is-active" : ""}" aria-pressed="${item.id === activeModeId}" data-mode="${item.id}" type="button">
              <span>${item.spec}</span>
              ${item.label}
            </button>
          `).join("")}
        </div>
      </section>

      <section class="instrument-grid">
        <article class="artifact-frame" aria-label="Gridcore artifact canvas">
          <canvas id="gridcore-canvas" width="1200" height="680"></canvas>
          <div class="artifact-label top-left">ORTHO ISO / VOID LOCK</div>
          <div class="artifact-label bottom-right">NO HORIZON / NO SHADOW</div>
        </article>

        <aside class="readout-panel">
          <section>
            <p class="label">Mode claim</p>
            <h2 data-mode-summary>${current.headline}</h2>
            <p>${current.summary}</p>
          </section>

          <section class="channel-table">
            <p class="label">Channel declaration</p>
            ${current.channels.map(([name, color, variable, range]) => `
              <div class="channel-row">
                <i style="background: ${color}"></i>
                <strong class="channel-name">${name}</strong>
                <span>${variable}</span>
                <code>${range}</code>
              </div>
            `).join("")}
          </section>

          <section>
            <p class="label">Canonical verifier</p>
            <ul class="rule-list">
              ${current.rules.map((rule) => `<li>${rule}</li>`).join("")}
              <li>orthographic projection</li>
              <li>no decorative HUD</li>
            </ul>
          </section>
        </aside>
      </section>

      <section class="lower-ledger">
        <article class="fail-ledger">
          <p class="label">Workshop lenses</p>
          <dl>
            <div><dt>Feynman</dt><dd>Screen state explains the system without narrative filler.</dd></div>
            <div><dt>Shannon</dt><dd>Every color and line carries declared signal.</dd></div>
            <div><dt>Tufte</dt><dd>Marks earn their place by encoding structure or measurement.</dd></div>
            <div><dt>Popper</dt><dd>Fail conditions are visible before success is claimed.</dd></div>
          </dl>
        </article>
        <article>
          <p class="label">Fail condition ledger</p>
          <div class="fail-grid">
            ${["no perspective", "no gradients", "no fake status text", "no human figures", "no shadows", "no undeclared color", "no synthwave", "no motion blur"].map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
      </section>
    </main>
  `;

  bindModeButtons();
  drawCanvas();
}

function bindModeButtons() {
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeModeId = button.dataset.mode;
      sweep = 0;
      render();
    });
  });
}

function drawCanvas() {
  const canvas = document.querySelector("#gridcore-canvas");
  const ctx = canvas.getContext("2d");
  const current = mode();
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, width, height);

  drawReferenceGrid(ctx, width, height);

  if (current.id === "standard") {
    drawWireframe(ctx, false);
    drawNetworkSpine(ctx, false);
  }

  if (current.id === "spectral") {
    drawWireframe(ctx, false);
    drawSpectralFlows(ctx);
    drawNetworkSpine(ctx, true);
  }

  if (current.id === "lowpoly-filled") {
    drawLowpolyFaces(ctx, "amber");
    drawLowpolyEdges(ctx, AMBER, 0.55);
  }

  if (current.id === "lowpoly-void") {
    drawLowpolyEdges(ctx, AMBER, 1);
  }

  if (current.id === "lowpoly-spectral") {
    drawLowpolyFaces(ctx, "spectral");
    drawLowpolyEdges(ctx, AMBER, 0.85);
  }

  drawAnnotations(ctx, current);
  drawSweep(ctx, width, height);
}

function drawReferenceGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 179, 0, 0.13)";
  ctx.lineWidth = 1;
  for (let x = 40; x < width; x += 80) {
    line(ctx, x, 34, x, height - 34);
  }
  for (let y = 40; y < height; y += 80) {
    line(ctx, 34, y, width - 34, y);
  }
  ctx.strokeStyle = "rgba(255, 179, 0, 0.45)";
  ctx.strokeRect(34, 34, width - 68, height - 68);
  ctx.restore();
}

function drawWireframe(ctx, includeNodes) {
  ctx.save();
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 1.45;
  ctx.shadowColor = AMBER;
  ctx.shadowBlur = 5;
  triangles.forEach((tri, index) => {
    const [a, b, c] = tri.map((i) => points[i]);
    ctx.globalAlpha = index % 3 === 0 ? 0.95 : 0.56;
    polygon(ctx, [a, b, c], false);
  });
  if (includeNodes) {
    points.forEach(([x, y], index) => {
      if (index % 2 === 0) node(ctx, x, y, 3.2, AMBER);
    });
  }
  ctx.restore();
}

function drawLowpolyEdges(ctx, color, alpha) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = AMBER;
  ctx.shadowBlur = 6;
  ctx.globalAlpha = alpha;
  triangles.forEach((tri, index) => {
    const [a, b, c] = tri.map((i) => points[i]);
    ctx.lineWidth = index % 4 === 0 ? 2.8 : 1.35;
    polygon(ctx, [a, b, c], false);
  });
  points.forEach(([x, y], index) => {
    if (index % 3 === 0) node(ctx, x, y, 3.6, AMBER);
  });
  ctx.restore();
}

function drawLowpolyFaces(ctx, faceMode) {
  const spectral = [AMBER, GREEN, YELLOW, CYAN, RED, AMBER, GREEN, YELLOW];
  ctx.save();
  triangles.forEach((tri, index) => {
    const pts = tri.map((i) => points[i]);
    ctx.fillStyle = faceMode === "spectral" ? spectral[index % spectral.length] : AMBER;
    ctx.globalAlpha = 1;
    polygon(ctx, pts, true);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 1.2;
    polygon(ctx, pts, false);
  });
  ctx.restore();
}

function drawSpectralFlows(ctx) {
  ctx.save();
  drawFlow(ctx, [[138, 414], [254, 368], [389, 353], [528, 323], [650, 300], [807, 278], [980, 246]], CYAN, 3);
  drawFlow(ctx, [[215, 300], [330, 335], [470, 340], [620, 318]], GREEN, 2);
  drawFlow(ctx, [[790, 170], [860, 215], [932, 250]], RED, 2.4);
  node(ctx, 932, 250, 7, RED);
  ctx.restore();
}

function drawNetworkSpine(ctx, spectral) {
  ctx.save();
  ctx.strokeStyle = spectral ? "rgba(255, 179, 0, 0.8)" : AMBER;
  ctx.lineWidth = 3;
  ctx.shadowColor = AMBER;
  ctx.shadowBlur = 5;
  drawFlow(ctx, [[120, 540], [305, 460], [455, 505], [620, 420], [800, 445], [1010, 360]], ctx.strokeStyle, 3);
  ctx.restore();
}

function drawAnnotations(ctx, current) {
  ctx.save();
  ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = AMBER;
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 1;
  label(ctx, "X:034 Y:612", 105, 92, 184, 145);
  label(ctx, current.spec, 825, 92, 760, 146);
  label(ctx, "VAR:STRUCTURE", 932, 566, 825, 485);
  if (current.id.includes("spectral")) {
    label(ctx, "CH:DECLARED", 180, 600, 288, 512);
  }
  ctx.restore();
}

function drawSweep(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 1;
  const x = 34 + ((width - 68) * sweep);
  line(ctx, x, 34, x, height - 34);
  ctx.restore();
}

function drawFlow(ctx, pts, color, width) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.stroke();
  const end = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  arrow(ctx, end[0], end[1], angle, color);
  ctx.restore();
}

function arrow(ctx, x, y, angle, color) {
  const size = 11;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - Math.cos(angle - 0.45) * size, y - Math.sin(angle - 0.45) * size);
  ctx.lineTo(x - Math.cos(angle + 0.45) * size, y - Math.sin(angle + 0.45) * size);
  ctx.closePath();
  ctx.fill();
}

function label(ctx, text, x, y, targetX, targetY) {
  ctx.fillText(text, x, y);
  line(ctx, x + 8, y + 8, targetX, targetY);
  node(ctx, targetX, targetY, 2.8, AMBER);
}

function polygon(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  if (fill) ctx.fill();
  else ctx.stroke();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function node(ctx, x, y, radius, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animate() {
  sweep += 0.0032;
  if (sweep > 1) sweep = 0;
  drawCanvas();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animationFrame = requestAnimationFrame(animate);
}

render();
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animationFrame = requestAnimationFrame(animate);

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
});
