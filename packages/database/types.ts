import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { Users, TipEngines, Airdrops, ProviderType, AirdropParticipants, RestrictedTipStrings } from './schema';
import { z } from 'zod';
import { isAddress } from 'ethers';

export type User = InferSelectModel<typeof Users>;
export type NewUser = InferInsertModel<typeof Users>;

export interface UserSubscriptionParams extends Pick<NewUser, 'isSubscribed' | 'subscriptionTier' | 'subscriptionProductId' | 'subscriptionExpiresAt' | 'customerId'> {}

export type TipEngine = InferSelectModel<typeof TipEngines>;
export type NewTipEngine = InferInsertModel<typeof TipEngines>;

export type Airdrop = InferSelectModel<typeof Airdrops>;
export type NewAirdrop = InferInsertModel<typeof Airdrops>;

export type AirdropParticipant = InferSelectModel<typeof AirdropParticipants>;
export type NewAirdropParticipant = InferInsertModel<typeof AirdropParticipants>;

export type RestrictedTipString = InferSelectModel<typeof RestrictedTipStrings>;
export type NewRestrictedTipString = InferInsertModel<typeof RestrictedTipStrings>;

export const ProviderTypeSchema = z.enum(ProviderType.enumValues);

export const CHAIN_NAME_ID_MAP = {
  ['Base Mainnet']: 8453,
  ['Base Sepolia']: 84532,
};

export const CHAIN_ID_NAME_MAP: Record<number, string> = {
  8453: 'Base Mainnet',
  84532: 'Base Sepolia',
};

export const MORALIS_CHAIN_NAMES: Record<number, string> = {
  84532: 'base%20sepolia',
  8453: 'base',
};

export const CHAIN_NAMES = Object.keys(CHAIN_NAME_ID_MAP);
export const CHAIN_IDS = Object.values(CHAIN_NAME_ID_MAP);

export const TipEngineSchema = z.object({
  name: z.string().min(6, 'Name must be at least 6 characters long'),
  chainId: z.string().refine((chainId) => CHAIN_IDS.includes(parseInt(chainId))),
  // socialPlatform: ProviderTypeSchema,
  tokenContract: z.string().min(1, 'Must select a token to use').refine(isAddress, 'Token must be a valid Ethereum ERC20 token'),
  tipString: z.string().min(3, 'Tip string must be at least 3 characters long').startsWith('$', 'Tip string must start with $'),
  publicTimeline: z.boolean().default(false),
  slug: z.string().min(6, 'Slug must be at least 6 characters').refine((slug) => /^[a-z0-9-]+$/.test(slug), 'Slug must be lowercase and contain only letters, numbers, and hyphens'),
});

export const AirdropSchema = z.object({
  startDate: z.date(),
  claimStartDate: z.date(),
  claimEndDate: z.date(),
  pointsToTokenRatio: z.coerce.number().min(1).default(10),
  requireLegacyAccount: z.boolean().default(true),
  minTokens: z.coerce.number().min(0, 'Minimum tokens must be at least 0'),
  minCasts: z.coerce.number().min(0),
})/*.refine((data) => data.claimStartDate > data.startDate, {
  message: "Airdrop end date must be after start date",
  path: ['claimStartDate'],
}).refine((data) => data.claimEndDate > data.claimStartDate, {
  message: "Airdrop-Claim end date must be after Airdrop end date",
  path: ['claimEndDate'],
});*/
