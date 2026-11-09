import Module from "manifold-3d";
import wasmUrl from "manifold-3d/manifold.wasm?url";
import type { ManifoldToplevel } from "manifold-3d";
import { enableScopes } from "./geometry/memory";

let pending: Promise<ManifoldToplevel> | null = null;

export function loadEngine(): Promise<ManifoldToplevel> {
  pending ??= Module({ locateFile: () => wasmUrl }).then((api) => {
    api.setup();
    return enableScopes(api); // free geometry after every build (see memory.ts)
  });
  return pending;
}

/**
 * A brand-new engine instance with empty memory. The geometry engine's WASM heap only grows over a long session
 * (about 1,800 rebuilds in testing before it fails), so the app swaps in a fresh one every few hundred builds and
 * after any engine crash. Designs are plain parameters, so nothing is lost.
 */
export function freshEngine(): Promise<ManifoldToplevel> {
  pending = null;
  return loadEngine();
}

/** True for the errors a crashed WASM engine throws. */
export const isEngineCrash = (e: unknown) => /Aborted|out of bounds|unreachable|memory access|RuntimeError/i.test(String(e));
