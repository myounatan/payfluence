import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { getAverageUserReactionScore, getUserAccountAgeInDays } from 'api';

// .dev.vars for dev and cloudflare dashboard for prod
type Bindings = {
  ALLOWANCE_KV: KVNamespace
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

// calculates and caches budget each query, cache should last until 11:59 pm utc
// query for daily budget should only be senderId
app.get('/allowance/:fid', async (c) => {
  try {
    const { fid } = c.req.param();

    // check KV for daily allowance that is not expired yet
    let allowance = Number(await c.env.ALLOWANCE_KV.get(fid));

    if (allowance === null) {
      const endOfDay = new Date();
      endOfDay.setUTCHours(23, 59, 59, 999);
  
      // get unix time of endOfDay
      const unixEndOfDay = Math.floor(endOfDay.getTime() / 1000);

      const userAccountAgeInDays = await getUserAccountAgeInDays(c.env.NEYNAR_API_KEY, fid);
      const userReactionScore = await getAverageUserReactionScore(c.env.NEYNAR_API_KEY, fid);

      const boost = Math.log10(userAccountAgeInDays + 10);
      const reactionScore = Math.ceil(Math.log10(userReactionScore + 1));
      let allowance = Math.ceil((boost + reactionScore) * 500);

      await c.env.ALLOWANCE_KV.put(fid, allowance.toString(), { expiration: unixEndOfDay });
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
