import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://jb50k7yjlc.execute-api.us-east-2.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/in36/produce"),
      },
    },
  },
});
