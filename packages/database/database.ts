import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = ReturnType<typeof drizzle>;

export const database = (connString: string): Database => {
  const client = postgres(connString);
  const db = drizzle(client, { schema });

  return db;
}
