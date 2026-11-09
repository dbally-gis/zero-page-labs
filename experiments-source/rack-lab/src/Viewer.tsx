import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { derive, type RackParams } from "./geometry/params";

export interface MeshData {
  positions: Float32Array;
  indices: Uint32Array;
}

export type ViewName = "iso" | "underside" | "side" | "top";

const VIEW_OFFSETS: Record<ViewName, [number, number, number]> = {
  iso: [190, -230, 160],
  underside: [150, -170, -290],
  side: [420, 0, 30],
  top: [0, -70, 430],
};

interface Props {
  mesh: MeshData | null;
  params: RackParams;
  showCards: boolean;
  stack: number;
  view?: { name: ViewName; n: number };
}

function numberTexture(n: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f1f5f9";
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = "#111827";
  g.font = "bold 84px ui-sans-serif, system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 128, 52);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function Viewer({ mesh, params, showCards, stack, view }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const scene = useRef<THREE.Scene>(new THREE.Scene());
  const content = useRef<THREE.Group>(new THREE.Group());
  const ctx = useRef<{ camera: THREE.PerspectiveCamera; controls: OrbitControls; fitted: boolean } | null>(null);

  useEffect(() => {
    const el = host.current!;
    const s = scene.current;
    s.background = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--viewport").trim() || "#10151c");
    const camera = new THREE.PerspectiveCamera(35, 1, 1, 3000);
    camera.up.set(0, 0, 1);
    camera.position.set(230, -260, 190);
    // A missing WebGL context should leave the controls and STL export usable.
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { antialias: true, preserveDrawingBuffer: true });
    if (!context) {
      setPreviewUnavailable(true);
      return;
    }
    const renderer = new THREE.WebGLRenderer({ canvas, context });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    s.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(150, -200, 300);
    s.add(sun);
    const below = new THREE.DirectionalLight(0xffffff, 1.4);
    below.position.set(-120, 160, -320); // lights the hollow underside
    s.add(below);
    const fill = new THREE.DirectionalLight(0x9ec5ff, 0.7);
    fill.position.set(-200, 150, 80);
    s.add(fill);
    const grid = new THREE.GridHelper(600, 60, 0x3b4a5c, 0x232d3a);
    grid.rotation.x = Math.PI / 2;
    s.add(grid);
    s.add(content.current);
    ctx.current = { camera, controls, fitted: false };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let raf = 0;
    const tick = () => {
      controls.update();
      renderer.render(s, camera);
      el.dataset.cameraZ = camera.position.z.toFixed(1); // read by browser tests
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const g = content.current;
    g.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mat = o.material as THREE.MeshStandardMaterial;
        mat.map?.dispose();
        mat.dispose();
      }
    });
    g.clear();
    if (!mesh) return;
    const d = derive(params);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(mesh.positions, 3));
    geo.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    const flat = geo.toNonIndexed();
    flat.computeVertexNormals();
    geo.dispose();
    const tones = [0xc2410c, 0xd9622b, 0xea7f45, 0xf59e6b];
    for (let k = 0; k < stack; k++) {
      const mat = new THREE.MeshStandardMaterial({ color: tones[k % tones.length], roughness: 0.55, metalness: 0.05 });
      const m = new THREE.Mesh(flat, mat);
      m.position.z = k * d.stackRise;
      g.add(m);
      if (showCards && k === stack - 1) {
        const body = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
        d.slotYs.forEach((y, si) => {
          const card = new THREE.Group();
          const cw = params.cardWidth, ch = params.cardHeight;
          const z0 = -d.slotDepths[si] + 0.05;
          const plate = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.35, ch), body);
          plate.position.set(0, 0, z0 + ch / 2);
          // deterministic pseudo-random card numbers 1..60, one per slot
          const num = ((si * 17 + 5) % 60) + 1;
          const face = new THREE.Mesh(new THREE.PlaneGeometry(20, 7.5), new THREE.MeshStandardMaterial({ map: numberTexture(num), roughness: 0.8 }));
          face.rotation.x = Math.PI / 2; // faces the player (-y), upright
          face.position.set(0, -0.2, z0 + ch - 4.3); // sits inside the top strip that stays visible
          card.add(plate, face);
          card.rotation.x = -(params.lean * Math.PI) / 180;
          card.position.set(d.cardX, y, params.frontHeight + d.s * y + k * d.stackRise);
          g.add(card);
        });
      }
    }
    const c = ctx.current;
    if (c && !c.fitted) {
      c.controls.target.set(params.width / 2, params.depth / 2, params.height / 2);
      c.fitted = true;
    }
  }, [mesh, params, showCards, stack]);

  useEffect(() => {
    const c = ctx.current;
    if (!c || !view || view.n === 0) return;
    const t = new THREE.Vector3(params.width / 2, params.depth / 2, params.height / 2);
    const [dx, dy, dz] = VIEW_OFFSETS[view.name];
    c.controls.target.copy(t);
    c.camera.position.set(t.x + dx, t.y + dy, t.z + dz);
    c.camera.lookAt(t);
    c.controls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return <div className="viewer" ref={host}>
    {previewUnavailable && <p className="overlay" role="status">The 3D preview needs WebGL. You can still configure the rack and download its STL.</p>}
  </div>;
}
