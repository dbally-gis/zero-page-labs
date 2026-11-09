import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/experiments/rack-lab/",
  plugins: [react()],
  build: { outDir: "../../experiments/rack-lab", emptyOutDir: true },
});
