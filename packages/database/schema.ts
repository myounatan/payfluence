import { relations, sql } from 'drizzle-orm';

import { integer, pgTable, text, timestamp, boolean, bigint, pgEnum, uuid, json } from 'drizzle-orm/pg-core';

export const FeatureFlags = pgTable('feature_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
});

export const ProductIdSubscriptionTierMap = pgTable('product_id_subscription_tier_map', {
  id: text('id').primaryKey(), // product id
  subscriptionTier: integer('subscription_tier').notNull(),
});

export const SubscriptionTierFeatures = pgTable('subscription_tier_features', {
  id: integer('id').primaryKey(), // subscription tier integer
  feature_json: json('feature_json').notNull(), // anything ?
  // current format: { "numTipEngines": 3, "royalty": 2.5 }
});

export const RestrictedTipStrings = pgTable('restricted_tip_strings', {
  tipString: text('tip_string').primaryKey(),
  restricted: boolean('restricted').default(true),
});

export const Users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  email: text('email').notNull().unique(),

  isSubscribed: boolean('is_subscribed').default(false),
  subscriptionTier: integer('subscription_tier').default(0),
  subscriptionProductId: text('subscription_product_id'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  customerId: text('customer_id'),

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
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),

  // user owns a tip engine
  userId: uuid('user_id').notNull(),

  chainId: integer('chain_id').notNull(),

  webhookId: text('webhook_id').notNull(),
  webhookActive: boolean('webhook_active').notNull().default(false),
  webhookSecret: text('webhook_secret'),

  slug: text('slug').notNull().unique(),

  ownerAddress: text('owner_address').notNull(), // address of EOA that owns the tokens

  tokenContract: text('token_contract').notNull(), // address of the token contract we are funding this tip engine with
  tokenDecimals: integer('token_decimals').notNull(),
  tokenName: text('token_name').notNull(),
  tokenSymbol: text('token_symbol').notNull(),

  tipString: text('tip_string').notNull().unique(), // ex. "$DEGEN", must be unique to differentiate tip engines

  publicTimeline: boolean('public_timeline').default(false),
  
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const Airdrops = pgTable('airdrop', {
  id: uuid('id').defaultRandom().primaryKey(),

  // tip engine owns an airdrop
  tipEngineId: uuid('tip_engine_id').notNull(),

  tokenAmount: bigint('token_amount', { mode: 'bigint' }).notNull(), // not really in use?

  startDate: timestamp('start_date').notNull(),
  claimStartDate: timestamp('claim_start_date').notNull(), // also end date
  claimEndDate: timestamp('claim_end_date'), // can be null, aka always claimable

  pointsToTokenRatio: integer('points_to_token_ratio').default(1),

  // user must hold a minimum amount of tokens for a minimum duration to be eligible
  minTokens: integer('min_tokens').default(0),
  minTokensDuration: integer('min_tokens_duration').default(0),

  minCasts: integer('min_casts').default(0),

  requireLegacyAccount: boolean('require_legacy_account').default(false),
  requirePowerBadge: boolean('require_power_badge').default(false),

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
  id: uuid('id').defaultRandom().primaryKey(),

  webhookId: text('webhook_id').notNull(),
  webhookType: text('webhook_type').notNull(),
  webhookPayload: text('webhook_payload').notNull(),

  processed: boolean('processed').default(false),

  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const TipPosts = pgTable('tip_post', {
  id: text('id').primaryKey(), // post id
  providerType: ProviderType('provider_type').notNull(),

  tipEngineId: uuid('tip_engine_id').notNull(),
  airdropId: uuid('airdrop_id').notNull(),

  amountTipped: integer('amount_tipped').notNull(),
  receiverId: text('receiver_id').notNull(),
  senderId: text('sender_id').notNull(),

  receiverAvatarUrl: text('receiver_avatar_url'),
  senderAvatarUrl: text('sender_avatar_url'),

  receiverUsername: text('receiver_username'),
  senderUsername: text('sender_username'),

  receiverDisplayName: text('receiver_display_name'),
  senderDisplayName: text('sender_display_name'),

  approved: boolean('approved').default(false),
  rejectedReason: text('rejected_reason'),

  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const AirdropParticipants = pgTable('airdrop_participant', {
  id: uuid('id').defaultRandom().primaryKey(),

  tipEngineUserId: uuid('tip_engine_user_id').notNull(),
  tipEngineId: uuid('tip_engine_id').notNull(),
  airdropId: uuid('airdrop_id').notNull(),
  receiverId: text('receiver_id').notNull(), // farcaster id, twitter user id, etc

  walletAddress: text('wallet_address').notNull(),

  points: integer('points').notNull().default(0),

  // signature holds airdrop/tip engine owner confirmation signature, receiver address, airdrop id, and claimable amount
  // which is signed by payfluence backend admin wallet
  signature: text('signature').unique(),
  claimableAmount: bigint('claimable_amount', { mode: 'bigint' }).notNull(),

  claimed: boolean('claimed').default(false),
  claimedAt: timestamp('claimed_at'),
  claimedTransactionHash: text('claimed_transaction_hash'),

  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});
