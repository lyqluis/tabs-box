import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".css", ".tsx", ".ts", ".jsx", ".js"],
  },
  plugins: [react(), tailwindcss(), svgr()],
})
