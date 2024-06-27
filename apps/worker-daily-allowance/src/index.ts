import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { database, getAirdropById, getBalanceOf, getTipEngineByAirdropId, getUserAccountAge, getUserPopularCasts } from '@repo/database';

// .dev.vars for dev and cloudflare dashboard for prod
type Bindings = {
  ALLOWANCE_KV: KVNamespace
  DATABASE_URL: string
  NEYNAR_API_KEY: string
  ALCHEMY_BASE_SEPOLIA: string
  ALCHEMY_BASE_MAINNET: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.fire()

app.use(cors({
  origin: '*',
  allowHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Wallet-Address', 'X-Wallet-Signature'],
  allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// calculates and caches allowance each query, cache lasts until 11:59 pm utc
app.get('/allowance/:airdropId/:fid', async (c) => {
  try {
    const { airdropId, fid } = c.req.param();

    const cacheKey = `${airdropId}:${fid}`;

    // check KV for daily allowance that is not expired yet
    let allowance = Number(await c.env.ALLOWANCE_KV.get(cacheKey));

    if (allowance === null) {
      const endOfDay = new Date();
      endOfDay.setUTCHours(23, 59, 59, 999);
    
      // get unix time of endOfDay
      const unixEndOfDay = Math.floor(endOfDay.getTime() / 1000);
      
      async function zeroAllowance(message) {
        await c.env.ALLOWANCE_KV.put(cacheKey, "0", { expiration: unixEndOfDay });
        return new Response(
          JSON.stringify({
            success: true,
            message,
            data: {
              allowance: 0
            }
          }),
          { status: 200 }
        );
      }

      const db = database(c.env.DATABASE_URL);
      const airdrop = await getAirdropById(db, airdropId);
      const tipEngine = await getTipEngineByAirdropId(db, airdropId);

      const { signUpDate, ageInDays } = await getUserAccountAge(c.env.NEYNAR_API_KEY, fid);

      if (airdrop.requireLegacyAccount && signUpDate > airdrop.startDate) {
        return await zeroAllowance("No allowance, user has not signed up to farcaster before airdrop start date");
      }

      const { reactionScore: userReactionScore, numCasts, hasPowerBadge, verifiedEthAddresses } = await getUserPopularCasts(c.env.NEYNAR_API_KEY, fid);

      if (airdrop.minCasts > numCasts) {
        return await zeroAllowance("No allowance, user has not met the minimum cast requirement");
      }

      if (airdrop.requirePowerBadge && !hasPowerBadge) {
        return await zeroAllowance("No allowance, user does not have a power badge");
      }

      if (userReactionScore === 0) {
        return await zeroAllowance("No allowance, user has no reaction score");
      }

      if (!verifiedEthAddresses || verifiedEthAddresses.length === 0) {
        return await zeroAllowance("No allowance, user has no verified ethereum addresses");
      }

      if (airdrop.minTokens > 0) {
        const minimumBalanceRequired = airdrop.minTokens;
        if (minimumBalanceRequired > 0) {
          for (const ethAddress of verifiedEthAddresses) {
            const walletAddress = ethAddress;
            const tokenContract = tipEngine.tokenContract;
            const chainRPC =  tipEngine.chainId === 8453 ?
                              c.env.ALCHEMY_BASE_MAINNET :
                              c.env.ALCHEMY_BASE_SEPOLIA;
    
            const data = await getBalanceOf(chainRPC, walletAddress, tokenContract);
            
            console.log(data);
    
            // if (data < minimumBalanceRequired) {
            //   console.log("Sender does not have the minimum balance required")
            //   return new Response("Sender does not have the minimum balance required", { status: 200 });
            // }
          }
        }
      }

      const boost = Math.log10(ageInDays + 10);
      const reactionScore = Math.ceil(Math.log10(userReactionScore + 1));
      let allowance = Math.ceil((boost + reactionScore) * 500);

      await c.env.ALLOWANCE_KV.put(cacheKey, allowance.toString(), { expiration: unixEndOfDay });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily allowance found",
        data: {
          allowance
        }
      }),
      { status: 200 }
    );

  } catch (e: any) {
    console.log(e)
    return new Response(e.message, { status: 500 });
  }
});

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
