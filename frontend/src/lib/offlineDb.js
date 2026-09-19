import { openDB } from 'idb';

const DB_NAME = 'nattilalert-offline';
const DB_VERSION = 1;

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // cached data so the app can still show things with no internet
      if (!db.objectStoreNames.contains('shelters')) {
        db.createObjectStore('shelters', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('hazards')) {
        db.createObjectStore('hazards', { keyPath: '_id' });
      }
      // the outbox: actions waiting to be sent once we're back online
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'localId' });
      }
    }
  });
}

// Save/replace cached records (call this whenever you fetch fresh data)
export async function cacheRecords(storeName, records) {
  const db = await getDb();
  const tx = db.transaction(storeName, 'readwrite');
  for (const r of records) tx.store.put(r);
  await tx.done;
}

export async function getCachedRecords(storeName) {
  const db = await getDb();
  return db.getAll(storeName);
}

// Queue an action (create hazard / update shelter) to send later
export async function queueAction(action) {
  const db = await getDb();
  const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.put('outbox', { ...action, localId, queuedAt: Date.now() });
  return localId;
}

export async function getQueuedActions() {
  const db = await getDb();
  return db.getAll('outbox');
}

export async function removeQueuedAction(localId) {
  const db = await getDb();
  await db.delete('outbox', localId);
}