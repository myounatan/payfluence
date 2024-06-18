import { eq } from 'drizzle-orm';
import { ProductIdSubscriptionTierMap, Users } from './schema';
import { User, UserSubscriptionParams } from './types';
import { Database } from './database';

// User queries

export async function createUser(db: Database, email: string) {
  await db.insert(Users).values({
    email,
  });
}

export async function getUserByEmail(db: Database, email: string): Promise<User[]> {
  return db.select().from(Users).where(eq(Users.email, email));
}

export async function setUserSubscription(
  db: Database,
  email: string,
  subscriptionParams: UserSubscriptionParams
) {
  await db.update(Users).set({
    ...subscriptionParams,
   }).where(eq(Users.email, email));
}

// Product queries

export async function getSubscriptionTierFromProductId(db: Database, productId: string): Promise<number> {
  const result = await db.select().from(ProductIdSubscriptionTierMap).where(eq(ProductIdSubscriptionTierMap.id, productId));
  
  if (result.length === 0) {
    return 0;
  }

  return result[0].subscriptionTier;
}
