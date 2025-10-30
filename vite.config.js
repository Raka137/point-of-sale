import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // Tambahkan base dengan nama repositori Anda
  base: "/point-of-sale/",
  plugins: [react()],
});
