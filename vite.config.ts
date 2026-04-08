import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ContractManagement/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      // These modules only exist inside the Power Apps runtime.
      // dataverseClient.ts is lazy-imported and never called outside Power Apps,
      // so it's safe to externalize them for the static build.
      external: [
        '@microsoft/power-apps/data',
        /\.power\/schemas/,
      ],
    },
  },
});
