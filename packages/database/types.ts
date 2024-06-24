import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { Users, TipEngines, Airdrops, ProviderType } from './schema';
import { z } from 'zod';
import { isAddress } from 'ethers';

export type User = InferSelectModel<typeof Users>;
export type NewUser = InferInsertModel<typeof Users>;

export interface UserSubscriptionParams extends Pick<NewUser, 'isSubscribed' | 'subscriptionTier' | 'subscriptionProductId' | 'subscriptionExpiresAt'> {}

export type TipEngine = InferSelectModel<typeof TipEngines>;
export type NewTipEngine = InferInsertModel<typeof TipEngines>;

export type Airdrop = InferSelectModel<typeof Airdrops>;
export type NewAirdrop = InferInsertModel<typeof Airdrops>;

export const ProviderTypeSchema = z.enum(ProviderType.enumValues);

export const CHAIN_NAME_ID_MAP = {
  ['Base Mainnet']: 8453,
  ['Base Sepolia']: 84532,
};

export const CHAIN_ID_NAME_MAP = {
  8453: 'Base Mainnet',
  84532: 'Base Sepolia',
};

export const CHAIN_NAMES = Object.keys(CHAIN_NAME_ID_MAP);
export const CHAIN_IDS = Object.values(CHAIN_NAME_ID_MAP);

export const TipEngineSchema = z.object({
  name: z.string(),
  chainId: z.string().refine((chainId) => CHAIN_IDS.includes(parseInt(chainId))),
  // socialPlatform: ProviderTypeSchema,
  tokenContract: z.string().refine(isAddress),
  tipString: z.string(),
  publicTimeline: z.boolean().default(false),
})

export const AirdropSchema = z.object({
  startDate: z.date(),
  claimStartDate: z.date(),
  claimEndDate: z.date(),
  pointsToTokenRatio: z.number().min(1).default(10),
  requireLegacyAccount: z.boolean().default(false),
  minTokens: z.number().min(0),
  minCasts: z.number().min(0),
})