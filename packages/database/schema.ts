import { relations, sql } from 'drizzle-orm';

import { integer, pgTable, serial, text, timestamp, boolean, bigint, pgEnum } from 'drizzle-orm/pg-core';


export const FeatureFlags = pgTable('feature_flags', {
  id: serial('id').primaryKey(),
  
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
});

export const ProductIdSubscriptionTierMap = pgTable('product_id_subscription_tier_map', {
  id: text('id').primaryKey(), // product id
  subscriptionTier: integer('subscription_tier').notNull(),
});

export const Users = pgTable('users', {
  id: serial('id').primaryKey(),

  email: text('email').notNull().unique(),

  isSubscribed: boolean('is_subscribed').default(false),
  subscriptionTier: integer('subscription_tier').default(0),
  subscriptionProductId: text('subscription_product_id'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),

  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const ProviderType = pgEnum(
  'provider_type',
  ['Farcaster', 'Twitter']
);

// export const AuthProviders = pgTable('authentication_provider', {
//   id: serial('id').primaryKey(),
  
//   userId: integer('user_id').notNull(),

//   providerUserId: text('provider_user_id').notNull(),
//   providerType: ProviderType('provider_type').notNull(),
//   providerKey: text('provider_key').notNull(),

//   providerUsername: text('provider_username'),

//   walletAddress: varchar('wallet_address', { length: 256 }).notNull().unique(),

//   lastName: text('last_name'),
//   lastAvatar: text('last_avatar'),

//   createdAt: timestamp('created_at').default(sql`now()`),
//   updatedAt: timestamp('updated_at').default(sql`now()`),
// }, (t) => ({
//   authProviderUserIdTypeUniqueIndex: uniqueIndex().on(t.providerUserId, t.providerType),
// }));

export const usersRelations = relations(Users, ({ many }) => ({
  TipEngines: many(TipEngines),
  // AuthProviders: many(AuthProviders),
}));

export const TipEngines = pgTable('tip_engine', {
  id: serial('id').primaryKey(),

  // user owns a tip engine
  userId: text('user_id').notNull(),

  webhookId: text('webhook_id').notNull(),
  webhookActive: boolean('webhook_active').default(false),

  tokenContract: text('token_contract').notNull(), // address of the token contract we are funding this tip engine with
  tipString: text('tip_string').notNull().unique(), // ex. "$DEGEN", must be unique to differentiate tip engines
  
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const Airdrops = pgTable('airdrop', {
  id: serial('id').primaryKey(),

  // tip engine owns an airdrop
  tipEngineId: text('tip_engine_id').notNull(),

  tokenAmount: bigint('token_amount', { mode: 'bigint' }).notNull(),

  claimDate: timestamp('claim_date').notNull(),

  pointsToTokenRatio: integer('points_to_token_ratio').notNull(),

  // user must hold a minimum amount of tokens for a minimum duration to be eligible
  minTokens: integer('min_tokens').notNull(),
  minTokensDuration: integer('min_tokens_duration').notNull(),

  minCasts: integer('min_casts').notNull(),

  requireAccountCreatedBeforeTipEngine: boolean('require_account_created_before_tip_engine').default(false),

  // a POST request to a custom API must return a response, if 200, then the user is eligible
  customAPIRequirement: text('custom_api_requirement'),

  // in the future, we can add more conditions

  // minFollowers: integer('min_followers').notNull(),
  // minFollowings: integer('min_followings').notNull(),
  // isActiveUser: boolean('is_active_user').default(false),
  // matchRegex: text('match_regex'),
  
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const airdropRelations = relations(Airdrops, ({ one }) => ({
  TipEngine: one(TipEngines),
}));

export const WebhookLogs = pgTable('webhook_log', {
  id: text('id').primaryKey(), // webhook id

  webhookEvent: text('webhook_event').notNull(),
  webhookPayload: text('webhook_payload').notNull(),

  processed: boolean('processed').default(false),

  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const TipPosts = pgTable('tip_post', {
  id: text('id').primaryKey(), // post id
  providerType: ProviderType('provider_type').notNull(),

  tipEngineId: text('tip_engine_id').notNull(),

  pointsTipped: integer('amount_tipped').notNull(),
  receiverId: text('receiver_id').notNull(),
  senderId: text('sender_id').notNull(),

  approved: boolean('approved').default(false),

  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const AirdropParticipants = pgTable('airdrop_participant', {
  id: serial('id').primaryKey(),

  airdropId: text('airdrop_id').notNull(),
  receiverId: text('receiver_id').notNull(), // farcaster id, twitter user id, etc

  points: integer('points').notNull(),

  // signature holds airdrop/tip engine owner confirmation signature, receiver address, airdrop id, and claimable amount
  // which is signed by payfluence backend admin wallet
  signature: text('signature').notNull().unique(),
  claimableAmount: bigint('claimable_amount', { mode: 'bigint' }).notNull(),

  claimed: boolean('claimed').default(false),
  claimedAt: timestamp('claimed_at'),

  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});
