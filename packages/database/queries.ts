import { and, count, eq } from 'drizzle-orm';
import { AirdropParticipants, Airdrops, ProductIdSubscriptionTierMap, RestrictedTipStrings, SubscriptionTierFeatures, TipEngines, Users } from './schema';
import { Airdrop, AirdropParticipant, NewTipEngine, SubscriptionTierFeature, TipEngine, User, UserSubscriptionParams } from './types';
import { Database } from './database';

// User queries

export async function createUser(db: Database, email: string) {
  await db.insert(Users).values({
    email,
  });
}

export async function getUserByEmail(db: Database, email: string): Promise<User> {
  const users = await db.select().from(Users).where(eq(Users.email, email));

  if (users.length === 0) {
    throw new Error(`User with email ${email} not found`);
  }

  return users[0];
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

// Tip engine queries

export async function createTipEngine(db: Database, tipEngineParams: NewTipEngine): Promise<TipEngine> {
  const tipEngine = await db.insert(TipEngines).values(tipEngineParams);

  return tipEngine[0];
}

export async function isValidTipString(db: Database, tipString: string): Promise<boolean> {
  // check tip engines for matches
  const tipEngines = await db.select().from(TipEngines).where(eq(TipEngines.tipString, tipString));
  const noTipEngineMatches = tipEngines.length === 0;

  const restrictedTipStrings = await db.select().from(RestrictedTipStrings).where(eq(RestrictedTipStrings.tipString, tipString));
  const noRestrictedTipStringMatches = restrictedTipStrings.length === 0;

  return noTipEngineMatches && noRestrictedTipStringMatches;
}

export async function isValidSlug(db: Database, slug: string): Promise<boolean> {
  const result = await db.select().from(TipEngines).where(eq(TipEngines.slug, slug));

  return result.length === 0;
}

export async function getTipEngineBySlug(db: Database, slug: string): Promise<TipEngine> {
  const tipEngines = await db.select().from(TipEngines).where(eq(TipEngines.slug, slug));

  if (tipEngines.length === 0) {
    throw new Error(`Tip engine with slug ${slug} not found`);
  }

  return tipEngines[0];
}

export async function getCountActiveTipEngines(db: Database, userId: string): Promise<number> {
  const result: {
    count: number;
  }[] = await db.select({ count: count() }).from(TipEngines).where(and(eq(TipEngines.userId, userId), eq(TipEngines.webhookActive, true)));

  return result[0].count;
}

export function getUserSubscriptionTier(db: Database, user: UserSubscriptionParams): number {
  if (user.subscriptionTier === null && user.subscriptionExpiresAt === null) {
    return 0;
  }

  // if isSubscribed is false but the subscription hasn't expired, we still consider the user subscribed
  if (!user.isSubscribed) {
    if (user.subscriptionTier && user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()) {
      return user.subscriptionTier;
    }
    return 0;
  }

  // otherwise return the subscription tier
  return user.subscriptionTier || 0;
}

export async function getTipEngineAllowanceForUser(db: Database, user: User): Promise<number> {
  const activeTier = getUserSubscriptionTier(db, user);

  if (activeTier === 0) {
    return 0;
  }

  const tipEngineCount = await getCountActiveTipEngines(db, user.id);

  const result = await db.select({
    feature_json: SubscriptionTierFeatures.feature_json,
  }).from(SubscriptionTierFeatures).where(eq(SubscriptionTierFeatures.id, activeTier));

  const featureJSON = JSON.parse(result[0].feature_json as string);

  return Math.min(0, featureJSON.activeEngineAllowance - tipEngineCount);
}

export async function getTipEngineById(db: Database, tipEngineId: string): Promise<TipEngine> {
  const tipEngines = await db.select().from(TipEngines).where(eq(TipEngines.id, tipEngineId));

  if (tipEngines.length === 0) {
    throw new Error(`Tip engine with id ${tipEngineId} not found`);
  }

  return tipEngines[0];
}

export async function getTipEngineByAirdropId(db: Database, airdropId: string): Promise<TipEngine> {
  const airdrop: Airdrop = await getAirdropById(db, airdropId);
  const tipEngines = await db.select().from(TipEngines).where(eq(TipEngines.id, airdrop.tipEngineId));

  if (tipEngines.length === 0) {
    throw new Error(`Tip engine with airdrop id ${airdropId} not found`);
  }

  return tipEngines[0];
}

export async function getTipEnginesForUser(db: Database, userId: string): Promise<TipEngine[]> {
  return db.select().from(TipEngines).where(eq(TipEngines.userId, userId));
}

// Airdrop queries

export async function getAirdropById(db: Database, airdropId: string): Promise<Airdrop> {
  const airdrops = await db.select().from(Airdrops).where(eq(Airdrops.id, airdropId));

  if (airdrops.length === 0) {
    throw new Error(`Airdrop with id ${airdropId} not found`);
  }

  return airdrops[0];
}

export async function getAirdropParticipantByIds(db: Database, airdropId: string, receiverId: string): Promise<AirdropParticipant> {
  const airdropParticipants = await db.select().from(AirdropParticipants).where(and(eq(AirdropParticipants.id, airdropId), eq(AirdropParticipants.receiverId, receiverId)));

  if (airdropParticipants.length === 0) {
    throw new Error(`Airdrop participant with airdrop id ${airdropId} and receiver id ${receiverId} not found`);
  }

  return airdropParticipants[0];
}

export async function setAirdropParticipantSignature(db: Database, airdropId: string, receiverId: string, signature: string) {
  await db.update(AirdropParticipants).set({
    signature,
  }).where(and(eq(AirdropParticipants.id, airdropId), eq(AirdropParticipants.receiverId, receiverId)));
}

// Product queries

export async function getSubscriptionTierFromProductId(db: Database, productId: string): Promise<number> {
  const result = await db.select().from(ProductIdSubscriptionTierMap).where(eq(ProductIdSubscriptionTierMap.id, productId));
  
  if (result.length === 0) {
    return 0;
  }

  return result[0].subscriptionTier;
}
