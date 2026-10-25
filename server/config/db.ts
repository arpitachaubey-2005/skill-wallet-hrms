import fs from 'fs';
import path from 'path';
import {
  IUser,
  IEmployee,
  ILeaveRequest,
  IAttendance,
  IAnnouncement,
  ITrainingProgram,
} from '../models/types.js';
import { generateInitialSeed } from '../seed/seedData.js';

interface DatabaseSchema {
  users: IUser[];
  employees: IEmployee[];
  leaveRequests: ILeaveRequest[];
  attendances: IAttendance[];
  announcements: IAnnouncement[];
  trainingPrograms: ITrainingProgram[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    employees: [],
    leaveRequests: [],
    attendances: [],
    announcements: [],
    trainingPrograms: [],
  };

  private initialized = false;

  public async init() {
    if (this.initialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure all collections exist
        if (!this.data.users || this.data.users.length === 0) {
          await this.seed();
        }
      } catch (err) {
        console.warn('Error reading database.json, re-seeding:', err);
        await this.seed();
      }
    } else {
      await this.seed();
    }

    this.initialized = true;
  }

  public async seed() {
    const seedData = await generateInitialSeed();
    this.data = seedData;
    this.save();
    console.log('Database initialized and seeded successfully with demo data!');
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  // Generic collection helper generator
  private createCollectionHelper<T extends { _id: string }>(
    getArray: () => T[],
    setArray: (items: T[]) => void
  ) {
    return {
      find: (filter: Partial<T> | ((item: T) => boolean) = {}) => {
        let items = getArray();
        if (typeof filter === 'function') {
          items = items.filter(filter);
        } else if (Object.keys(filter).length > 0) {
          items = items.filter((item) =>
            Object.entries(filter).every(([key, val]) => (item as any)[key] === val)
          );
        }
        return [...items];
      },

      findOne: (filter: Partial<T> | ((item: T) => boolean)) => {
        const items = getArray();
        if (typeof filter === 'function') {
          return items.find(filter) || null;
        }
        return (
          items.find((item) =>
            Object.entries(filter).every(([key, val]) => (item as any)[key] === val)
          ) || null
        );
      },

      findById: (id: string) => {
        return getArray().find((item) => item._id === id) || null;
      },

      create: (doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }) => {
        const now = new Date().toISOString();
        const id = doc._id || 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const newDoc = {
          ...doc,
          _id: id,
          createdAt: now,
          updatedAt: now,
        } as unknown as T;

        const current = getArray();
        current.push(newDoc);
        setArray(current);
        this.save();
        return newDoc;
      },

      findByIdAndUpdate: (id: string, update: Partial<T>) => {
        const current = getArray();
        const index = current.findIndex((item) => item._id === id);
        if (index === -1) return null;

        const updatedDoc = {
          ...current[index],
          ...update,
          updatedAt: new Date().toISOString(),
        };

        current[index] = updatedDoc;
        setArray(current);
        this.save();
        return updatedDoc;
      },

      updateOne: (filter: Partial<T> | ((item: T) => boolean), update: Partial<T>) => {
        const current = getArray();
        let targetIndex = -1;
        if (typeof filter === 'function') {
          targetIndex = current.findIndex(filter);
        } else {
          targetIndex = current.findIndex((item) =>
            Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
          );
        }

        if (targetIndex === -1) return null;
        const updatedDoc = {
          ...current[targetIndex],
          ...update,
          updatedAt: new Date().toISOString(),
        };
        current[targetIndex] = updatedDoc;
        setArray(current);
        this.save();
        return updatedDoc;
      },

      findByIdAndDelete: (id: string) => {
        const current = getArray();
        const index = current.findIndex((item) => item._id === id);
        if (index === -1) return null;
        const removed = current.splice(index, 1)[0];
        setArray(current);
        this.save();
        return removed;
      },

      countDocuments: (filter: Partial<T> | ((item: T) => boolean) = {}) => {
        let items = getArray();
        if (typeof filter === 'function') {
          return items.filter(filter).length;
        }
        if (Object.keys(filter).length === 0) return items.length;
        return items.filter((item) =>
          Object.entries(filter).every(([key, val]) => (item as any)[key] === val)
        ).length;
      },
    };
  }

  public get users() {
    return this.createCollectionHelper(
      () => this.data.users,
      (items) => {
        this.data.users = items;
      }
    );
  }

  public get employees() {
    return this.createCollectionHelper(
      () => this.data.employees,
      (items) => {
        this.data.employees = items;
      }
    );
  }

  public get leaveRequests() {
    return this.createCollectionHelper(
      () => this.data.leaveRequests,
      (items) => {
        this.data.leaveRequests = items;
      }
    );
  }

  public get attendances() {
    return this.createCollectionHelper(
      () => this.data.attendances,
      (items) => {
        this.data.attendances = items;
      }
    );
  }

  public get announcements() {
    return this.createCollectionHelper(
      () => this.data.announcements,
      (items) => {
        this.data.announcements = items;
      }
    );
  }

  public get trainingPrograms() {
    return this.createCollectionHelper(
      () => this.data.trainingPrograms,
      (items) => {
        this.data.trainingPrograms = items;
      }
    );
  }
}

export const db = new DatabaseStore();
