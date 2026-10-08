import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  base: "/thailand-postcode-js/",
  plugins: [react()],
  resolve: {
    alias: {
      "thailand-postcode/react": path.join(root, "src/react/index.ts"),
      "thailand-postcode": path.join(root, "src/index.ts"),
    },
  },
  build: {
    outDir: path.join(root, "dist-demo"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
