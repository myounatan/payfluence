import { and, count, desc, eq, gte, lte, sql, sum } from 'drizzle-orm';
import { AirdropParticipants, Airdrops, ProductIdSubscriptionTierMap, RestrictedTipStrings, SubscriptionTierFeatures, TipEngines, TipPosts, Users } from './schema';
import { Airdrop, AirdropParticipant, NewAirdrop, NewTipEngine, NewTipPost, OmittedAirdrop, OmittedTipPost, TipEngine, TipEngineDisplayParams, TipEnginePublicDisplayParams, TipPost, User, UserSubscriptionParams } from './types';
import { Database } from './database';
import { ERC20__factory } from '@repo/contracts';
import 'json-bigint-patch';

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

// Tip engine queries

export async function createTipEngine(db: Database, tipEngineParams: NewTipEngine): Promise<string> {
  const tipEngineId = await db.insert(TipEngines).values(tipEngineParams).returning({ id: TipEngines.id });

  return tipEngineId[0].id;
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

export async function getTipEngineAllowanceForUser(db: Database, user: User): Promise<number> {
  const activeTier = getUserSubscriptionTier(db, user);

  if (activeTier === 0) {
    return 5; // 0; // during hackathon, we are allowing 1 tip engine for free
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

export async function getTipEngineByTipString(db: Database, tipString: string): Promise<TipEngine> {
  const tipEngines = await db.select().from(TipEngines).where(eq(TipEngines.tipString, tipString));

  if (tipEngines.length === 0) {
    throw new Error(`Tip engine with tip string ${tipString} not found`);
  }

  return tipEngines[0];
}

export async function setTipEngineWebhook(db: Database, tipEngineId: string, webhookId: string, webhookActive: boolean, webhookSecret?: string) {
  await db.update(TipEngines).set({
    webhookId,
    webhookActive,
    webhookSecret: webhookSecret || null,
  }).where(eq(TipEngines.id, tipEngineId));
}

export async function getTipEnginePublicDisplayParams(tipEngine: TipEngine, airdrop: Airdrop | null): Promise<TipEnginePublicDisplayParams> {
  // transform into type
  return {
    id: tipEngine.id,
    chainId: tipEngine.chainId,
    name: tipEngine.name,
    tipString: tipEngine.tipString,
    slug: tipEngine.slug,
    tokenName: tipEngine.tokenName,
    tokenSymbol: tipEngine.tokenSymbol,
    tokenContract: tipEngine.tokenContract,
    tokenDecimals: tipEngine.tokenDecimals,
    airdrop: airdrop ? {
      id: airdrop.id,
      startDate: airdrop.startDate,
      claimStartDate: airdrop.claimStartDate,
      claimEndDate: airdrop.claimEndDate,
      requireLegacyAccount: airdrop.requireLegacyAccount,
      requirePowerBadge: airdrop.requirePowerBadge,
      minTokens: airdrop.minTokens,
      minCasts: airdrop.minCasts,
    } : null,
  } satisfies TipEnginePublicDisplayParams;
}

export async function getTipEngineDisplayParams(db: Database, userId: string): Promise<any> {
  const tipEngineDisplayParams: TipEngineDisplayParams[] = [];

  // create a type result for this query
  type TipEngineResult = {
    id: string;
    name: string;
    user_id: string;
    chain_id: number;
    webhook_active: boolean;
    slug: string;
    owner_address: string;
    token_contract: string;
    token_decimals: number;
    token_symbol: string;
    token_name: string;
    tip_string: string;
    public_timeline: boolean;
    created_at: Date;
    total_participants: number | null;
    total_points_given: number | null;
    total_tokens_claimed: number | null;
    total_claimable_tokens: number | null;
  }

  const tipEngines: TipEngineResult[] = await db.execute(sql`
    with
      user_engines as (
        select
          id,
          name,
          user_id,
          chain_id,
          webhook_active,
          slug,
          owner_address,
          token_contract,
          token_decimals,
          token_symbol,
          token_name,
          tip_string,
          public_timeline,
          created_at
        from
          tip_engine
        where
          text(user_id) = text(${userId})
      ),
      user_engine_participants as (
        select
          tip_engine_id,
          count(*) as total_participants,
          sum(points) as total_points_given,
          sum(
            case
              when claimed = true then claimable_amount
              else 0
            end
          ) as total_tokens_claimed,
          sum(
            case
              when claimed = false then claimable_amount
              else 0
            end
          ) as total_claimable_tokens
        from
          airdrop_participant
        where
          text(tip_engine_user_id) = text(${userId})
        group by
          tip_engine_id
      )
    select
      *
    from
      user_engines as e
    left join
      user_engine_participants as p
    on
      e.id::text = p.tip_engine_id::text;
  `)

  // transform results into display params array
  for (const tipEngine of tipEngines) {
    // map to omitted airdrop type
    const airdrops: Airdrop[] = await getAirdropsForTipEngine(db, tipEngine.id);

    // get status from airdrop dates
    // if published tip engine, then process dates for status (status being the active airdrop)
    // otherwise, status is draft
    let status = 'Draft';
  
    if (tipEngine.webhook_active) {
      for (let i=0; i<airdrops.length; i++) {
        const airdrop = airdrops[i];
        if (airdrop.startDate < new Date() && airdrop.claimStartDate > new Date()) {
          status = `Airdrop ${i + 1}`;
          break
        }
      }

      if (status === 'draft') {
        status = 'Inactive';
      }
    }
  
    const omittedAirdrops: OmittedAirdrop[] = airdrops.map((airdrop) => {
      return {
        id: airdrop.id,
        startDate: airdrop.startDate,
        claimStartDate: airdrop.claimStartDate,
        claimEndDate: airdrop.claimEndDate,
        pointsToTokenRatio: airdrop.pointsToTokenRatio,
        requireLegacyAccount: airdrop.requireLegacyAccount,
        requirePowerBadge: airdrop.requirePowerBadge,
        minTokens: airdrop.minTokens,
        minCasts: airdrop.minCasts,
      }
    });

    const tipPosts: TipPost[] = await getLast10TipPostsForTipEngine(db, tipEngine.id);

    const omittedTipPosts: OmittedTipPost[] = tipPosts.map((tipPost) => {
      return {
        providerType: tipPost.providerType,
        airdropId: tipPost.airdropId,
        amountTipped: tipPost.amountTipped,
        approved: tipPost.approved,
        createdAt: tipPost.createdAt,
        
        receiverId: tipPost.receiverId,
        receiverUsername: tipPost.receiverUsername,
        receiverAvatarUrl: tipPost.receiverAvatarUrl,
        receiverDisplayName: tipPost.receiverDisplayName,

        senderId: tipPost.senderId,
        senderAvatarUrl: tipPost.senderAvatarUrl,
        senderDisplayName: tipPost.senderDisplayName,
        senderUsername: tipPost.senderUsername,

        rejectedReason: tipPost.rejectedReason,
      }
    });

    tipEngineDisplayParams.push({
      userId: tipEngine.user_id,
      id: tipEngine.id,
      name: tipEngine.name,
      chainId: tipEngine.chain_id,
      webhookActive: tipEngine.webhook_active,
      slug: tipEngine.slug,
      ownerAddress: tipEngine.owner_address,
      tokenContract: tipEngine.token_contract,
      tipString: tipEngine.tip_string,
      publicTimeline: tipEngine.public_timeline,
      createdAt: tipEngine.created_at,
      status,
      totalPointsGiven: tipEngine.total_points_given || 0 as number,
      totalTokensClaimed: tipEngine.total_tokens_claimed || 0,
      totalClaimableTokens: tipEngine.total_claimable_tokens || 0,
      totalParticipants: tipEngine.total_participants || 0,
      tokenBalance: BigInt(0),
      tokenDecimals: tipEngine.token_decimals,
      tokenSymbol: tipEngine.token_symbol,
      tokenName: tipEngine.token_name,
      airdrops: omittedAirdrops,
      tipPosts: omittedTipPosts,
    });
  }

  return tipEngineDisplayParams;
}

export async function getTipEngineAndActiveAirdropFromSlug(db: Database, slug: string): Promise<{ tipEngine: TipEngine, airdrop: Airdrop | null }> {
  const tipEngine = await getTipEngineBySlug(db, slug);
  const activeAirdrops = await getTipEngineActiveAirdrops(db, tipEngine.id);

  return { tipEngine, airdrop: activeAirdrops.length === 0 ? null : activeAirdrops[0] };
}

// Airdrop queries

export async function createAirdrop(db: Database, airdropParams: NewAirdrop): Promise<void> {
  await db.insert(Airdrops).values(airdropParams);
}

export async function getTipEngineActiveAirdrops(db: Database, tipEngineId: string): Promise<Airdrop[]> {
  // we need to check all airdrops associated with a tip engine and check to see if the start date and claim start date have passed
  const airdrops = await db.select().from(Airdrops).where(eq(Airdrops.tipEngineId, tipEngineId));

  // check to see if current time is after start date and before claim start date
  return airdrops.filter((airdrop) => {
    return airdrop.startDate < new Date();// && airdrop.claimStartDate > new Date();
  });
}

export async function getAirdropById(db: Database, airdropId: string): Promise<Airdrop> {
  const airdrops = await db.select().from(Airdrops).where(eq(Airdrops.id, airdropId));

  if (airdrops.length === 0) {
    throw new Error(`Airdrop with id ${airdropId} not found`);
  }

  return airdrops[0];
}

export async function getAirdropsForTipEngine(db: Database, tipEngineId: string) {
  return db.select().from(Airdrops).where(eq(Airdrops.tipEngineId, tipEngineId));
}

// Airdrop participant queries

export async function getAirdropParticipantByIds(db: Database, airdropId: string, receiverId: string): Promise<AirdropParticipant> {
  const airdropParticipants = await db.select().from(AirdropParticipants).where(and(eq(AirdropParticipants.airdropId, airdropId), eq(AirdropParticipants.receiverId, receiverId)));

  if (airdropParticipants.length === 0) {
    throw new Error(`Airdrop participant with airdrop id ${airdropId} and receiver id ${receiverId} not found`);
  }

  return airdropParticipants[0];
}

export async function createAirdropParticipant(
  db: Database,
  tipEngineId: string,
  airdropId: string,
  tipEngineOwnerId: string,
  receiverId: string,
  walletAddress: string,
  startingPoints?: number
): Promise<void> {
  await db.insert(AirdropParticipants).values({
    tipEngineId: tipEngineId,
    tipEngineUserId: tipEngineOwnerId,
    airdropId,
    receiverId,
    walletAddress,
    claimableAmount: BigInt(0),
    points: startingPoints || 0,
  });
}

export async function setAirdropParticipantSignature(db: Database, airdropId: string, receiverId: string, signature: string, claimableAmount: bigint) {
  await db.update(AirdropParticipants).set({
    signature,
    claimableAmount,
  }).where(and(eq(AirdropParticipants.id, airdropId), eq(AirdropParticipants.receiverId, receiverId)));
}

export async function incrementAirdropParticipantPoints(db: Database, airdropId: string, receiverId: string, points: number) {
  await db.update(AirdropParticipants).set({
    points: sql`${AirdropParticipants.points} + ${points}`
  }).where(and(eq(AirdropParticipants.airdropId, airdropId), eq(AirdropParticipants.receiverId, receiverId)));
}

// Product queries

export async function getSubscriptionTierFromProductId(db: Database, productId: string): Promise<number> {
  const result = await db.select().from(ProductIdSubscriptionTierMap).where(eq(ProductIdSubscriptionTierMap.id, productId));
  
  if (result.length === 0) {
    return 0;
  }

  return result[0].subscriptionTier;
}

// webhook log queries

// tip post queries

export async function getLast10TipPostsForTipEngine(db: Database, tipEngineId: string): Promise<TipPost[]> {
  return db.select().from(TipPosts).where(eq(TipPosts.tipEngineId, tipEngineId)).orderBy(desc(TipPosts.createdAt)).limit(10);
}

export async function createTipPost(db: Database, tipPostParams: NewTipPost): Promise<void> {
  await db.insert(TipPosts).values(tipPostParams);
}

export async function getTotalAmountTippedBetweenDatesForSender(db: Database, senderId: string, startDate: Date, endDate: Date): Promise<number> {
  // return all tip posts where the created date is greater than or equal to the start date and less than or equal to the end date
  const result = await db.select({
    totalAmountTipped: sum(TipPosts.amountTipped),
  }).from(TipPosts).where(and(eq(TipPosts.senderId, senderId), gte(TipPosts.createdAt, startDate), lte(TipPosts.createdAt, endDate), eq(TipPosts.approved, true)));

  return Number(result[0].totalAmountTipped);
}

export async function getTotalAmountTippedBetweenDatesForReceiver(db: Database, receiverId: string, startDate: Date, endDate: Date): Promise<number> {
  // return all tip posts where the created date is greater than or equal to the start date and less than or equal to the end date
  const result = await db.select({
    totalAmountTipped: sum(TipPosts.amountTipped),
  }).from(TipPosts).where(and(eq(TipPosts.receiverId, receiverId), gte(TipPosts.createdAt, startDate), lte(TipPosts.createdAt, endDate), eq(TipPosts.approved, true)));

  return Number(result[0].totalAmountTipped);
}

export async function getTotalAmountTippedForAirdropReceiver(db: Database, airdropId: string, receiverId: string): Promise<number> {
  // return all tip posts where the receiver id is the same as the receiver id passed in and the airdrop id is the same as the airdrop id passed in
  const result = await db.select({
    totalAmountTipped: sum(TipPosts.amountTipped),
  }).from(TipPosts).where(and(eq(TipPosts.receiverId, receiverId), eq(TipPosts.airdropId, airdropId), eq(TipPosts.approved, true)));

  return Number(result[0].totalAmountTipped);
}

// export async function getApprovedTipPostsForReceiverAirdropId(db: Database, receiverId: string, airdropId: string): Promise<number> {
//   // return all tip posts where the receiver id is the same as the receiver id passed in and the airdrop id is the same as the airdrop id passed in
//   const result = await db.select({
//     totalAmountTipped: sum(TipPosts.amountTipped),
//   }).from(TipPosts).where(and(eq(TipPosts.receiverId, receiverId), eq(TipPosts.airdropId, airdropId), eq(TipPosts.approved, true)));

//   return Number(result[0].totalAmountTipped);
// }

export async function getBalanceOf(rpcUrl: string, walletAddress: string, tokenContract: string) {
  const balanceOfSelector = "0x70a08231";
  const payload = {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "data": balanceOfSelector + "000000000000000000000000" + walletAddress,
        "to": tokenContract
      },
      "latest"
    ]
  }
  
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return await response.json();
}

export async function getTokenMetadata(rpcUrl: string, tokenContract: string): Promise<{ decimals: number, symbol: string, name: string }> {
  const functions = ['decimals', 'symbol', 'name'];

  const metadata = {
    decimals: 0,
    symbol: '',
    name: '',
  }

  for (const func of functions) {
    const payload = {
      "id": 1,
      "jsonrpc": "2.0",
      "method": "eth_call",
      "params": [
        {
          "data": ERC20__factory.createInterface().getFunction(func as 'decimals' | 'symbol' | 'name').selector,
          "to": tokenContract,
        },
        "latest"
      ]
    }
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json();
    const data = result.result;

    if (func === 'decimals') {
      metadata.decimals = parseInt(data);
    } else {
      const cleanHex = data.startsWith('0x') ? data.slice(2) : data;
      const buffer = Buffer.from(cleanHex, 'hex');
      let text = buffer.toString('utf8');
      text = text.replace(/[^\x20-\x7E]+/g, '');
      text = text.trim();
      
      if (func === 'symbol') {
        metadata.symbol = text;
      } else if (func === 'name') {
        metadata.name = text;
      }
      
    }
  }

  return metadata;
}