import { openDB } from 'idb';

export const dbPromise = openDB('story-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('stories')) {
      db.createObjectStore('stories', { keyPath: 'id' });
    }
  },
});

export async function saveStories(stories) {
  const db = await dbPromise;
  const tx = db.transaction('stories', 'readwrite');
  for (const story of stories) {
    await tx.store.put(story);
  }
  await tx.done;
}

export async function getAllStories() {
  const db = await dbPromise;
  return db.getAll('stories');
}

export async function clearStories() {
  const db = await dbPromise;
  const tx = db.transaction('stories', 'readwrite');
  await tx.store.clear();
  await tx.done;
}
