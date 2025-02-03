import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/FS/",  // Ensure this matches your repo name EXACTLY (case-sensitive)!
});
