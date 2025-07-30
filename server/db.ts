import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';

// Use SQLite for local development
const dbPath = path.resolve(process.cwd(), 'local.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });