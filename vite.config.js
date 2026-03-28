import { defineConfig } from 'vite';

export default defineConfig({
  base: '/gisportal/',
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          ol: ['ol', 'ol-layerswitcher'],
          turf: ['@turf/turf'],
          export: ['html2canvas', 'jspdf'],
          formats: ['shpjs', '@mapbox/shp-write', '@mapbox/togeojson', '@maphubs/tokml', 'jszip'],
          vendor: ['proj4', 'axios']
        }
      }
    }
  }
});
