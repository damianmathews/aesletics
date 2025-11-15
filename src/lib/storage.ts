// Storage utilities for localStorage and IndexedDB

const STORAGE_KEYS = {
  APP_STATE: 'aesletics.state',
  USER_PROFILE: 'aesletics.profile',
  USER_QUESTS: 'aesletics.quests',
  COMPLETIONS: 'aesletics.completions',
  SETTINGS: 'aesletics.settings',
} as const;

const DB_NAME = 'AesleticsDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

// Local Storage helpers
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      // Only clear Aesletics keys
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// IndexedDB for photos
class PhotoStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async savePhoto(id: string, blob: Blob): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, blob, createdAt: new Date().toISOString() });

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhoto(id: string): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          const url = URL.createObjectURL(request.result.blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPhotoIds(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const photoStorage = new PhotoStorage();

// Export/Import helpers
export const exportData = (): string => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    state: storage.get(STORAGE_KEYS.APP_STATE),
    profile: storage.get(STORAGE_KEYS.USER_PROFILE),
    quests: storage.get(STORAGE_KEYS.USER_QUESTS),
    completions: storage.get(STORAGE_KEYS.COMPLETIONS),
    settings: storage.get(STORAGE_KEYS.SETTINGS),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);

    if (data.state) storage.set(STORAGE_KEYS.APP_STATE, data.state);
    if (data.profile) storage.set(STORAGE_KEYS.USER_PROFILE, data.profile);
    if (data.quests) storage.set(STORAGE_KEYS.USER_QUESTS, data.quests);
    if (data.completions) storage.set(STORAGE_KEYS.COMPLETIONS, data.completions);
    if (data.settings) storage.set(STORAGE_KEYS.SETTINGS, data.settings);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export { STORAGE_KEYS };
