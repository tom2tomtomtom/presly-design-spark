import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['html2canvas']
  },
  build: {
    commonjsOptions: {
      include: [/html2canvas/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          html2canvas: ['html2canvas'],
        }
      }
    }
  }
}));
