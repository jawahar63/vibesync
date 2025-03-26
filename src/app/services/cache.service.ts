import { Injectable } from '@angular/core';
import { openDB } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private dbPromise = openDB('musicDB', 1, {
    upgrade(db) {
      db.createObjectStore('songs');
    },
  });

  async cacheSong(id: string, data: Blob) {
    const db = await this.dbPromise;
    await db.put('songs', data, id);
  }

  async getCachedSong(id: string): Promise<Blob | undefined> {
    const db = await this.dbPromise;
    return db.get('songs', id);
  }
}
