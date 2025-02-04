import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/FS/", // ✅ Set base to match your GitHub Pages repo name
  plugins: [react()],
});
