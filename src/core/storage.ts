// Capa de persistencia IndexedDB (progreso) con un wrapper mínimo y tipado.
// El versionado y las migraciones formales se añaden en R5.

const DB_NAME = 'practicas-de-chino';
const DB_VERSION = 1;

export interface IndexDef {
  name: string;
  keyPath: string;
  unique?: boolean;
}

export interface StoreDef {
  name: string;
  keyPath: string;
  indexes?: IndexDef[];
}

export const STORES: readonly StoreDef[] = [
  { name: 'cards', keyPath: 'id', indexes: [{ name: 'due', keyPath: 'fsrs.due' }] },
  { name: 'reviews', keyPath: 'id', indexes: [{ name: 'fecha', keyPath: 'fecha' }] },
  { name: 'progress', keyPath: 'id' },
];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store.name)) {
          const os = db.createObjectStore(store.name, { keyPath: store.keyPath });
          for (const index of store.indexes ?? []) {
            os.createIndex(index.name, index.keyPath, { unique: index.unique ?? false });
          }
        }
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo abrir IndexedDB'));
    };
  });
}

export function getDb(): Promise<IDBDatabase> {
  dbPromise ??= openDb();
  return dbPromise;
}

/** Sólo para tests: descarta la conexión cacheada. */
export function resetDbCache(): void {
  dbPromise = null;
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('Error en la petición a IndexedDB'));
    };
  });
}

export async function put<T>(store: string, value: T): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(store, 'readwrite');
  await promisify(tx.objectStore(store).put(value));
}

export async function putAll<T>(store: string, values: readonly T[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(store, 'readwrite');
  const os = tx.objectStore(store);
  await Promise.all(values.map((value) => promisify(os.put(value))));
}

export async function get<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await getDb();
  const tx = db.transaction(store, 'readonly');
  return promisify(tx.objectStore(store).get(key) as IDBRequest<T | undefined>);
}

export async function getAll<T>(store: string): Promise<T[]> {
  const db = await getDb();
  const tx = db.transaction(store, 'readonly');
  return promisify(tx.objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function del(store: string, key: IDBValidKey): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(store, 'readwrite');
  await promisify(tx.objectStore(store).delete(key));
}

export async function clearStore(store: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(store, 'readwrite');
  await promisify(tx.objectStore(store).clear());
}
