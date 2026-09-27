import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // Vendors change far less often than app code, so they get their own long-cached chunks.
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/, priority: 2 },
            { name: "vendor", test: /node_modules[\\/](?!antd|@ant-design|@rc-component|uplot)/, priority: 1 },
          ],
        },
      },
    },
  },
});
