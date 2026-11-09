// The geometry engine lives in WASM memory that JS garbage collection barely sees, so thousands of rebuilds
// during a design session can exhaust it ("Aborted()", measured). With scopes enabled, every object the engine
// creates is registered and freed when the outermost `scoped` call returns: return plain data (numbers, arrays,
// buffers), never a Manifold.
//
// (manifold-3d ships a helper for this, lib/garbage-collector.js, but it wraps methods in arrow functions that drop
// `this`, so every call throws; this is the same idea with `this` preserved.)
import type { ManifoldToplevel } from "manifold-3d";

const STATIC = ["cube", "cylinder", "sphere", "tetrahedron", "extrude", "revolve", "compose", "union", "difference", "intersection", "hull", "ofMesh"];
const MEMBER = [
  "add", "subtract", "intersect", "decompose", "transform", "translate", "rotate", "scale", "mirror", "refine", "simplify",
  "setProperties", "setTolerance", "asOriginal", "trimByPlane", "split", "splitByPlane", "hull",
];

interface Deletable { delete(): void }
const registry: Deletable[] = [];
const wrapped = new WeakSet<object>(); // each engine instance has its own classes to wrap
let depth = 0;

const remember = (r: unknown) => {
  if (Array.isArray(r)) for (const x of r) remember(x);
  else if (r && typeof (r as Deletable).delete === "function") registry.push(r as Deletable);
};

function wrap(target: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const orig = target[name];
    if (typeof orig !== "function") continue;
    target[name] = function (this: unknown, ...args: unknown[]) {
      const result = (orig as (...a: unknown[]) => unknown).apply(this, args);
      remember(result);
      return result;
    };
  }
}

export function enableScopes(api: ManifoldToplevel): ManifoldToplevel {
  if (!wrapped.has(api)) {
    const M = api.Manifold as unknown as Record<string, unknown> & { prototype: Record<string, unknown> };
    wrap(M, STATIC);
    wrap(M.prototype, MEMBER);
    wrapped.add(api);
  }
  return api;
}

function cleanup() {
  for (const obj of registry) {
    try { obj.delete(); } catch { /* already freed */ }
  }
  registry.length = 0;
}

/** Run `fn`, then free everything it created. Nested calls share the outer scope. A no-op until `enableScopes`. */
export function scoped<T>(fn: () => T): T {
  depth++;
  try {
    return fn();
  } finally {
    depth--;
    if (depth === 0) cleanup();
  }
}
