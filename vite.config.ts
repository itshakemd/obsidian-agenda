import { defineConfig } from "vite";
import { copyFileSync, existsSync, readdirSync, renameSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

function copyManifest() {
  return {
    name: "copy-manifest",
    closeBundle() {
      copyFileSync(resolve("manifest.json"), resolve("dist/manifest.json"));
      copyFileSync(resolve("src/assets/logo.png"), resolve("dist/icon.png"));
      try {
        const dist = resolve("dist");
        for (const f of readdirSync(dist)) {
          if (f.endsWith(".css") && f !== "styles.css") {
            const src = resolve(dist, f);
            const dst = resolve(dist, "styles.css");
            if (existsSync(dst)) unlinkSync(dst);
            renameSync(src, dst);
            break;
          }
        }
      } catch {
        return;
      }
    },
  };
}

export default defineConfig({
  plugins: [copyManifest()],

  build: {
    lib: {
      entry: "main.tsx",
      formats: ["cjs"],
      fileName: () => "main.js",
    },

    rollupOptions: {
      external: [
        "obsidian",
        "electron",
      ],
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? "";
          if (name.endsWith(".css")) return "styles.css";
          return name || "asset-[hash][extname]";
        },
      },
    },

    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
});
