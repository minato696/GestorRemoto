import { openDB } from 'idb';

// Nombre de la base de datos y versión
const DB_NAME = 'radio-frecuencias-db';
const DB_VERSION = 1;

// Función para inicializar la base de datos
export async function initializeDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Crear el store para las estaciones
      if (!db.objectStoreNames.contains('stations')) {
        const stationsStore = db.createObjectStore('stations', {
          keyPath: 'id',
          autoIncrement: true
        });
        stationsStore.createIndex('departamento', 'departamento', { unique: false });
        stationsStore.createIndex('localidad', 'localidad', { unique: false });
      }

      // Crear el store para las revisiones
      if (!db.objectStoreNames.contains('revisiones')) {
        const revisionesStore = db.createObjectStore('revisiones', {
          keyPath: 'id',
          autoIncrement: true
        });
        revisionesStore.createIndex('stationId', 'stationId', { unique: false });
        revisionesStore.createIndex('fecha', 'fecha', { unique: false });
        // Índice compuesto para búsqueda por estación y fecha
        revisionesStore.createIndex('stationId_fecha', ['stationId', 'fecha'], { unique: true });
      }
    }
  });

  return db;
}

// Función para obtener todas las estaciones
export async function getAllStations() {
  const db = await openDB(DB_NAME, DB_VERSION);
  return db.getAll('stations');
}

// Función para añadir una estación
export async function addStation(station) {
  const db = await openDB(DB_NAME, DB_VERSION);
  const id = await db.add('stations', station);
  return { ...station, id };
}

// Función para actualizar una estación
export async function updateStation(station) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.put('stations', station);
  return station;
}

// Función para eliminar una estación
export async function deleteStation(id) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.delete('stations', id);

  // También eliminar todas las revisiones asociadas
  const revisiones = await db.getAllFromIndex('revisiones', 'stationId', id);
  const tx = db.transaction('revisiones', 'readwrite');
  for (const revision of revisiones) {
    await tx.store.delete(revision.id);
  }
  await tx.done;
}

// Función para obtener todas las revisiones
export async function getRevisiones() {
  const db = await openDB(DB_NAME, DB_VERSION);
  return db.getAll('revisiones');
}

// Función para obtener revisiones por estación
export async function getRevisionesByStation(stationId) {
  const db = await openDB(DB_NAME, DB_VERSION);
  return db.getAllFromIndex('revisiones', 'stationId', stationId);
}

// Función para obtener revisiones por fecha
export async function getRevisionesByDate(fecha) {
  const db = await openDB(DB_NAME, DB_VERSION);
  return db.getAllFromIndex('revisiones', 'fecha', fecha);
}

// Función para añadir o actualizar una revisión
export async function addRevision(revision) {
  const db = await openDB(DB_NAME, DB_VERSION);

  // Verificar si ya existe una revisión para esta estación y fecha
  const tx = db.transaction('revisiones', 'readwrite');
  const index = tx.store.index('stationId_fecha');
  const existingRevision = await index.get([revision.stationId, revision.fecha]);

  if (existingRevision) {
    // Actualizar existente
    revision.id = existingRevision.id;
    await tx.store.put(revision);
  } else {
    // Crear nueva
    const id = await tx.store.add(revision);
    revision.id = id;
  }

  await tx.done;
  return revision;
}

// Función para eliminar una revisión
export async function deleteRevision(id) {
  const db = await openDB(DB_NAME, DB_VERSION);
  await db.delete('revisiones', id);
}