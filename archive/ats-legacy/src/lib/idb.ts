/**
 * IndexedDB utilities for large data storage
 * Used for job descriptions, resume versions, etc.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface JobATSDB extends DBSchema {
  'job-cache': {
    key: string;
    value: {
      id: string;
      url: string;
      title: string;
      company: string;
      description: string;
      requirements: string[];
      responsibilities: string[];
      benefits: string[];
      location: string;
      salary?: string;
      postedDate?: string;
      extractedAt: number;
    };
    indexes: { 'by-url': string };
  };
  'resume-versions': {
    key: string;
    value: {
      id: string;
      name: string;
      content: string;
      createdAt: number;
      updatedAt: number;
    };
  };
  'cover-letters': {
    key: string;
    value: {
      id: string;
      jobId: string;
      content: string;
      createdAt: number;
    };
  };
}

const DB_NAME = 'job-ats-extension';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<JobATSDB> | null = null;

/**
 * Get or initialize database
 */
export async function getDB(): Promise<IDBPDatabase<JobATSDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<JobATSDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Job cache store
      if (!db.objectStoreNames.contains('job-cache')) {
        const jobStore = db.createObjectStore('job-cache', { keyPath: 'id' });
        jobStore.createIndex('by-url', 'url');
      }

      // Resume versions store
      if (!db.objectStoreNames.contains('resume-versions')) {
        db.createObjectStore('resume-versions', { keyPath: 'id' });
      }

      // Cover letters store
      if (!db.objectStoreNames.contains('cover-letters')) {
        db.createObjectStore('cover-letters', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

/**
 * Job cache operations
 */
export const jobCache = {
  async get(id: string) {
    const db = await getDB();
    return db.get('job-cache', id);
  },

  async getByUrl(url: string) {
    const db = await getDB();
    return db.getFromIndex('job-cache', 'by-url', url);
  },

  async save(job: JobATSDB['job-cache']['value']) {
    const db = await getDB();
    return db.put('job-cache', job);
  },

  async getAll() {
    const db = await getDB();
    return db.getAll('job-cache');
  },

  async delete(id: string) {
    const db = await getDB();
    return db.delete('job-cache', id);
  },
};

/**
 * Resume versions operations
 */
export const resumeVersions = {
  async get(id: string) {
    const db = await getDB();
    return db.get('resume-versions', id);
  },

  async save(resume: JobATSDB['resume-versions']['value']) {
    const db = await getDB();
    return db.put('resume-versions', resume);
  },

  async getAll() {
    const db = await getDB();
    return db.getAll('resume-versions');
  },

  async delete(id: string) {
    const db = await getDB();
    return db.delete('resume-versions', id);
  },
};

/**
 * Cover letters operations
 */
export const coverLetters = {
  async get(id: string) {
    const db = await getDB();
    return db.get('cover-letters', id);
  },

  async getByJobId(jobId: string) {
    const db = await getDB();
    const all = await db.getAll('cover-letters');
    return all.filter(cl => cl.jobId === jobId);
  },

  async save(coverLetter: JobATSDB['cover-letters']['value']) {
    const db = await getDB();
    return db.put('cover-letters', coverLetter);
  },

  async delete(id: string) {
    const db = await getDB();
    return db.delete('cover-letters', id);
  },
};
