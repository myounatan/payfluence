import { eq } from 'drizzle-orm';
import { Users } from './schema';
import { User } from './types';
import { Database } from './database';

// function createdAt() {
//   return {
//     created_at: new Date(),
//     updated_at: new Date(),
//   };
// }

// function updatedAt() {
//   return {
//     updated_at: new Date(),
//   };
// }

export async function createUser(db: Database, email: string) {
  await db.insert(Users).values({
    email,
  });
}

export async function getUserByEmail(db: Database, email: string): Promise<User[]> {
  return db.select().from(Users).where(eq(Users.email, email));
}
