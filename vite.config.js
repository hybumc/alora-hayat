import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  clearScreen: false,
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "0.2.0"),
  },
  server: {
    host: "127.0.0.1",
    port: 1420,
    strictPort: true,
  },
});
