import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: 'mock-clerk',
      enforce: 'pre',
      resolveId(id) {
        if (id === '@clerk/clerk-react') {
          return path.resolve(__dirname, './src/test-utils/MockClerkProvider.tsx');
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@clerk/clerk-react": path.resolve(__dirname, "./src/test-utils/MockClerkProvider.tsx"),
    },
  },
  build: {
    target: 'es2015',
    sourcemap: true,
  },
  define: {
    'process.env.VITE_TEST_MODE': JSON.stringify('true'),
  }
});
