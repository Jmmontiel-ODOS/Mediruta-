// Sesión de mentira para el MVP: el usuario vive en el cliente.
// Cuando haya backend, esto se cambia por la tabla usuario (rol MEDICO) y password_hash.

// sessionStorage: la sesión dura lo que dure la pestaña; al abrir la app de nuevo pide login.
const CLAVE = 'mediruta-sesion';

export const USUARIO_DEMO = { usuario: 'diego cardona', contrasena: 'sami12345', nombre: 'Dr. Diego Cardona', especialidad: 'Medicina general' };

const normalizar = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

export function validar(usuario: string, contrasena: string) {
  return normalizar(usuario) === USUARIO_DEMO.usuario && contrasena === USUARIO_DEMO.contrasena;
}

export function iniciar() {
  try { sessionStorage.setItem(CLAVE, '1'); } catch {}
}

export function cerrar() {
  try { sessionStorage.removeItem(CLAVE); } catch {}
}

export function activa() {
  try { return sessionStorage.getItem(CLAVE) === '1'; } catch { return false; }
}
