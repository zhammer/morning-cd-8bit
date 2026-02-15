import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ jsxRuntime: "classic" })],
  server: {
    port: parseInt(process.env.PORT || "3000"),
    proxy: process.env.PORT
      ? undefined
      : {
          "/api": {
            target: "http://localhost:3001",
            changeOrigin: true,
          },
        },
  },
  build: {
    outDir: "build",
  },
});
