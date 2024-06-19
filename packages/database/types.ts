import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { Users, TipEngines, Airdrops } from './schema';

export type User = InferSelectModel<typeof Users>;
export type NewUser = InferInsertModel<typeof Users>;

export interface UserSubscriptionParams extends Pick<NewUser, 'isSubscribed' | 'subscriptionTier' | 'subscriptionProductId' | 'subscriptionExpiresAt'> {}

export type TipEngine = InferSelectModel<typeof TipEngines>;
export type NewTipEngine = InferInsertModel<typeof TipEngines>;

export type Airdrop = InferSelectModel<typeof Airdrops>;
export type NewAirdrop = InferInsertModel<typeof Airdrops>;
