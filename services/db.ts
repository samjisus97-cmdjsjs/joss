
import { Movie, ViewingProgress } from '../types';

const DB_NAME = 'CineAIDatabase';
const MOVIE_STORE = 'movies';
const PROGRESS_STORE = 'playback_progress';
const DB_VERSION = 2;

export const dbService = {
  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(MOVIE_STORE)) {
          const store = db.createObjectStore(MOVIE_STORE, { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('year', 'year', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
          db.createObjectStore(PROGRESS_STORE, { keyPath: 'movieId' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getTotalCount(): Promise<number> {
    const db = await this.initDB();
    const transaction = db.transaction(MOVIE_STORE, 'readonly');
    const store = transaction.objectStore(MOVIE_STORE);
    return new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async addMovies(movies: Movie[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MOVIE_STORE, 'readwrite');
      const store = transaction.objectStore(MOVIE_STORE);
      movies.forEach(movie => store.put(movie));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async getAllMovies(): Promise<Movie[]> {
    const db = await this.initDB();
    const transaction = db.transaction(MOVIE_STORE, 'readonly');
    const store = transaction.objectStore(MOVIE_STORE);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async clearAllMovies(): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(MOVIE_STORE, 'readwrite');
    const store = transaction.objectStore(MOVIE_STORE);
    store.clear();
  },

  async getMoviesPaged(offset: number, limit: number): Promise<Movie[]> {
    const db = await this.initDB();
    const transaction = db.transaction(MOVIE_STORE, 'readonly');
    const store = transaction.objectStore(MOVIE_STORE);
    const movies: Movie[] = [];
    let cursorRequest = store.openCursor(null, 'prev');
    let advanced = false;

    return new Promise((resolve) => {
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) return resolve(movies);
        if (offset > 0 && !advanced) {
          cursor.advance(offset);
          advanced = true;
          return;
        }
        movies.push(cursor.value);
        if (movies.length < limit) cursor.continue();
        else resolve(movies);
      };
    });
  },

  async saveProgress(progress: ViewingProgress): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(PROGRESS_STORE, 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);
    store.put(progress);
  },

  async getAllProgress(): Promise<ViewingProgress[]> {
    const db = await this.initDB();
    const transaction = db.transaction(PROGRESS_STORE, 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result as ViewingProgress[];
        resolve(results.sort((a, b) => b.lastPlayed - a.lastPlayed));
      };
    });
  }
};
