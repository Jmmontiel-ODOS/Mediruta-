// Estado de la demo guardado en el navegador. Es lo que después hará la API:
// caso.estado, caso_medico, nota_interna, mensaje y documento del modelo.
import { CASOS, DOCTOR, type Caso, type Estado, type Triaje } from '../data/casos';
import { ETIQUETA_TRIAJE } from './formato';

export interface Nota { texto: string; autor: string; en: number }
export interface Mensaje { de: 'medico' | 'familiar'; texto: string; en: number }
export interface Evento { texto: string; en: number }
export interface DocSubido { nombre: string; en: number }

interface Cambios {
  estado?: Estado;
  triaje?: Triaje;
  notas?: Nota[];
  mensajes?: Mensaje[];
  eventos?: Evento[];
  documentos?: DocSubido[];
}

const CLAVE = 'mediruta-casos';
const CARGA = Date.now();

function leer(): Record<string, Cambios> {
  try { return JSON.parse(localStorage.getItem(CLAVE) || '{}'); } catch { return {}; }
}
function guardar(d: Record<string, Cambios>) {
  try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch {}
}

/** Minutos desde que se creó el caso (los datos base son relativos a la carga). */
export const creadoEn = (c: Caso) => CARGA - c.creadoHaceMin * 60_000;

export function todos(): Caso[] {
  const d = leer();
  return CASOS.map((c) => ({ ...c, estado: d[c.id]?.estado ?? c.estado, triaje: d[c.id]?.triaje ?? c.triaje }));
}

export function uno(id: string) {
  return todos().find((c) => c.id === id);
}

export function cambios(id: string): Cambios {
  return leer()[id] ?? {};
}

function actualizar(id: string, fn: (c: Cambios) => void) {
  const d = leer();
  d[id] ??= {};
  fn(d[id]);
  guardar(d);
}

const TEXTO_ESTADO: Record<Estado, string> = {
  pendiente: 'Caso liberado, vuelve a estar sin asignar',
  asignado: `${DOCTOR.nombre} tomó el caso y va en camino`,
  en_atencion: `${DOCTOR.nombre} llegó y empezó la atención`,
  resuelto: 'Caso cerrado como resuelto',
};

export function cambiarEstado(id: string, estado: Estado) {
  actualizar(id, (c) => {
    c.estado = estado;
    (c.eventos ??= []).push({ texto: TEXTO_ESTADO[estado], en: Date.now() });
  });
}

export function reclasificar(id: string, triaje: Triaje) {
  actualizar(id, (c) => {
    c.triaje = triaje;
    (c.eventos ??= []).push({ texto: `Triaje reclasificado a ${ETIQUETA_TRIAJE[triaje]}`, en: Date.now() });
  });
}

export function agregarNota(id: string, texto: string) {
  actualizar(id, (c) => (c.notas ??= []).push({ texto, autor: DOCTOR.nombre, en: Date.now() }));
}

export function agregarMensaje(id: string, m: Mensaje) {
  actualizar(id, (c) => (c.mensajes ??= []).push(m));
}

export function subirDocumento(id: string, nombre: string) {
  actualizar(id, (c) => {
    (c.documentos ??= []).push({ nombre, en: Date.now() });
    (c.eventos ??= []).push({ texto: `Se adjuntó ${nombre}`, en: Date.now() });
  });
}

export function reiniciar() {
  try { localStorage.removeItem(CLAVE); } catch {}
}

/** Casos que son del médico en sesión. */
export const esMio = (c: Caso) => c.estado !== 'pendiente';
