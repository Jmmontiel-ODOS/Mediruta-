import { DOCTOR, type Caso, type Estado, type Triaje } from '../data/casos';

export const TRIAJES: Triaje[] = ['critico', 'moderado', 'estable'];
export const ETIQUETA_TRIAJE: Record<Triaje, string> = { critico: 'Crítico', moderado: 'Moderado', estable: 'Estable' };
export const COLOR_TRIAJE: Record<Triaje, string> = { critico: '#e5484d', moderado: '#f5a524', estable: '#30a46c' };
export const ETIQUETA_ESTADO: Record<Estado, string> = {
  pendiente: 'Sin asignar',
  asignado: 'En camino',
  en_atencion: 'En atención',
  resuelto: 'Resuelto',
};

export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function eta(c: Caso) {
  const d = km(DOCTOR, c) * 1.3; // calles, no línea recta
  return { d, min: Math.max(3, Math.round((d / 22) * 60 + 2)), texto: `${(d).toFixed(1).replace('.', ',')} km` };
}

export function hace(min: number) {
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${Math.round(min)} min`;
  if (min < 60 * 24) return `hace ${Math.floor(min / 60)} h`;
  return `hace ${Math.floor(min / 1440)} d`;
}

export const sinTildes = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export const escapar = (t: string) =>
  t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function avisar(msg: string) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(Number(toast.dataset.t));
  toast.dataset.t = String(window.setTimeout(() => toast.classList.remove('visible'), 2800));
}
