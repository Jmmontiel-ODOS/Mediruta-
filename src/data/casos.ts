// Datos de prueba del MVP. La forma sigue el modelo (paciente ↔ cliente, caso,
// caso_medico ↔ caso_abogado) para que después se cambie por una API real.

export type Triaje = 'critico' | 'moderado' | 'estable';
export type Estado = 'pendiente' | 'asignado' | 'en_atencion' | 'resuelto';

export interface Documento {
  nombre: string;
  tipo: 'Laboratorio' | 'Imagen' | 'Fórmula' | 'Historia clínica' | 'Autorización';
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  haceDias: number;
}

export interface Paciente {
  id: string;
  nombre: string;
  edad: number;
  sexo: 'F' | 'M';
  telefono: string;
  eps: string;
  cedula: string;
  contacto: { nombre: string; parentesco: string; telefono: string };
  antecedentes: string[];
  alergias: string[];
  medicamentos: string[];
}

export interface Caso {
  id: string;
  paciente: Paciente;
  triaje: Triaje;
  motivo: string;
  signos: { fc: number; spo2: number; pa: string; temp: number };
  direccion: string;
  lat: number;
  lng: number;
  creadoHaceMin: number;
  estado: Estado;
  canal: 'App paciente' | 'Línea 24h' | 'Remisión IPS' | 'WhatsApp';
  descripcion: string;
  documentos: Documento[];
}

export const DOCTOR = { nombre: 'Dr. Diego Cardona', especialidad: 'Medicina general', lat: 3.4745, lng: -76.5245 };

const NOMBRES_F = ['María', 'Luz', 'Carmen', 'Ana', 'Rosa', 'Valentina', 'Gloria', 'Sofía', 'Martha', 'Isabel', 'Camila', 'Esperanza'];
const NOMBRES_M = ['José', 'Luis', 'Carlos', 'Jorge', 'Andrés', 'Julián', 'Hernán', 'Samuel', 'Óscar', 'Mateo', 'Fernando', 'Ramiro'];
const APELLIDOS = ['Gómez', 'Rodríguez', 'Martínez', 'López', 'Ramírez', 'Cárdenas', 'Mosquera', 'Valencia', 'Ospina', 'Rentería', 'Quintero', 'Arboleda'];
const EPS = ['Sura', 'Sanitas', 'Nueva EPS', 'Emssanar', 'Coomeva', 'Salud Total'];

const MOTIVOS: Record<Triaje, string[]> = {
  critico: ['Dolor torácico opresivo', 'Dificultad respiratoria severa', 'Glucemia > 400 mg/dL', 'Sospecha de ACV', 'Crisis hipertensiva', 'Fiebre alta con convulsión'],
  moderado: ['Fiebre de 3 días', 'Vómito y deshidratación leve', 'Dolor abdominal', 'Infección urinaria', 'Crisis asmática leve', 'Curación de herida infectada'],
  estable: ['Control de hipertensión', 'Renovación de fórmula', 'Control posoperatorio', 'Toma de muestras', 'Control de diabetes', 'Chequeo adulto mayor'],
};

// Generador con semilla: los mismos pacientes en cada carga.
function rng(seed: number) {
  // mulberry32: reparte mejor que un LCG simple, que repetía motivos seguidos.
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r = rng(29);
const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];

function signosPara(t: Triaje) {
  if (t === 'critico') return { fc: 115 + Math.round(r() * 30), spo2: 84 + Math.round(r() * 6), pa: `${170 + Math.round(r() * 30)}/${100 + Math.round(r() * 15)}`, temp: +(38.6 + r() * 1.2).toFixed(1) };
  if (t === 'moderado') return { fc: 95 + Math.round(r() * 15), spo2: 92 + Math.round(r() * 3), pa: `${140 + Math.round(r() * 15)}/${88 + Math.round(r() * 8)}`, temp: +(37.8 + r() * 0.8).toFixed(1) };
  return { fc: 68 + Math.round(r() * 14), spo2: 96 + Math.round(r() * 3), pa: `${115 + Math.round(r() * 15)}/${72 + Math.round(r() * 10)}`, temp: +(36.2 + r() * 0.6).toFixed(1) };
}

type CasoBase = Omit<Caso, 'canal' | 'descripcion' | 'documentos' | 'paciente'> & {
  paciente: Omit<Paciente, 'cedula' | 'contacto' | 'antecedentes' | 'alergias' | 'medicamentos'>;
};

const BASE: CasoBase[] = Array.from({ length: 64 }, (_, i) => {
  const triaje: Triaje = r() < 0.18 ? 'critico' : r() < 0.5 ? 'moderado' : 'estable';
  const sexo = r() < 0.55 ? 'F' : 'M';
  const nombre = `${sexo === 'F' ? pick(NOMBRES_F) : pick(NOMBRES_M)} ${pick(APELLIDOS)}`;
  const calle = 38 + Math.floor(r() * 24);
  return {
    id: `C-${1040 + i}`,
    paciente: {
      id: `P-${2200 + i}`,
      nombre,
      edad: triaje === 'estable' ? 25 + Math.floor(r() * 60) : 18 + Math.floor(r() * 72),
      sexo,
      telefono: `31${Math.floor(r() * 10)} ${String(Math.floor(r() * 1000)).padStart(3, '0')} ${String(Math.floor(r() * 10000)).padStart(4, '0')}`,
      eps: pick(EPS),
    },
    triaje,
    motivo: pick(MOTIVOS[triaje]),
    signos: signosPara(triaje),
    direccion: `Calle ${calle} Norte # ${2 + Math.floor(r() * 8)}N-${10 + Math.floor(r() * 80)}`,
    lat: 3.4655 + r() * 0.02,
    lng: -76.535 + r() * 0.024,
    creadoHaceMin: triaje === 'critico' ? 2 + Math.floor(r() * 15) : 5 + Math.floor(r() * 180),
    estado: 'pendiente',
  };
});

// Segunda semilla para los detalles clínicos: así no cambian los pacientes del mapa.
const r2 = rng(777);
const pick2 = <T,>(arr: T[]) => arr[Math.floor(r2() * arr.length)];
const algunos = <T,>(arr: T[], max: number) => arr.filter(() => r2() < max / arr.length).slice(0, max);

const ANTECEDENTES = ['Hipertensión arterial', 'Diabetes tipo 2', 'EPOC', 'Asma', 'Insuficiencia cardiaca', 'Hipotiroidismo', 'Enfermedad renal crónica', 'Obesidad'];
const ALERGIAS = ['Penicilina', 'AINES', 'Sulfas', 'Mariscos'];
const MEDICAMENTOS = ['Losartán 50 mg', 'Metformina 850 mg', 'Enalapril 10 mg', 'Salbutamol inhalado', 'Levotiroxina 50 mcg', 'Atorvastatina 20 mg', 'Furosemida 40 mg', 'Insulina glargina'];
const PARENTESCO = ['Hija', 'Hijo', 'Esposa', 'Esposo', 'Madre', 'Hermana'];
const CANALES: Caso['canal'][] = ['App paciente', 'Línea 24h', 'Remisión IPS', 'WhatsApp'];

const DESCRIPCION: Record<Triaje, string> = {
  critico: 'Familiar reporta deterioro súbito en la última hora. Requiere valoración inmediata; considerar traslado si no hay respuesta al manejo inicial.',
  moderado: 'Síntomas de evolución de días, sin signos de alarma al momento del reporte. Paciente consciente y orientado.',
  estable: 'Visita programada de seguimiento. Paciente sin síntomas nuevos, solicita control y ajuste de tratamiento.',
};

const DOCS: [Documento['nombre'], Documento['tipo']][] = [
  ['Hemograma completo', 'Laboratorio'],
  ['Glucosa y HbA1c', 'Laboratorio'],
  ['Radiografía de tórax', 'Imagen'],
  ['Electrocardiograma', 'Imagen'],
  ['Fórmula médica vigente', 'Fórmula'],
  ['Epicrisis última hospitalización', 'Historia clínica'],
  ['Autorización EPS visita domiciliaria', 'Autorización'],
];

export const CASOS: Caso[] = BASE.map((b) => ({
  ...b,
  paciente: {
    ...b.paciente,
    cedula: String(10_000_000 + Math.floor(r2() * 89_999_999)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    contacto: {
      nombre: `${pick2([...NOMBRES_F, ...NOMBRES_M])} ${b.paciente.nombre.split(' ')[1]}`,
      parentesco: pick2(PARENTESCO),
      telefono: `31${Math.floor(r2() * 10)} ${String(Math.floor(r2() * 1000)).padStart(3, '0')} ${String(Math.floor(r2() * 10000)).padStart(4, '0')}`,
    },
    antecedentes: algunos(ANTECEDENTES, b.paciente.edad > 50 ? 3 : 1),
    alergias: algunos(ALERGIAS, 1),
    medicamentos: algunos(MEDICAMENTOS, b.paciente.edad > 50 ? 3 : 1),
  },
  canal: pick2(CANALES),
  descripcion: DESCRIPCION[b.triaje],
  documentos: algunos(DOCS, 3).map(([nombre, tipo]) => ({
    nombre,
    tipo,
    estado: r2() < 0.6 ? 'Aprobado' : r2() < 0.8 ? 'Pendiente' : 'Rechazado',
    haceDias: 1 + Math.floor(r2() * 40),
  })),
}));

// Punto de partida de la demo: el médico ya tiene un paciente en atención y dos resueltos hoy.
const primero = (t: Triaje, n = 0) => CASOS.filter((c) => c.triaje === t)[n];
primero('moderado').estado = 'en_atencion';
primero('estable').estado = 'resuelto';
primero('estable', 1).estado = 'resuelto';
