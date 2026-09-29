// MapLibre 6 dibuja el mapa en un worker que vive en dos archivos (worker + shared).
// Vite no los copia al build, así que los ponemos en public/maplibre antes de dev y build.
import { cpSync, mkdirSync } from 'node:fs';

const origen = 'node_modules/maplibre-gl/dist';
const destino = 'public/maplibre';
mkdirSync(destino, { recursive: true });
for (const archivo of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  cpSync(`${origen}/${archivo}`, `${destino}/${archivo}`);
}
console.log('MapLibre worker copiado a', destino);
