import { Hono, HonoRequest } from 'hono'

import { AirdropParticipant, createAirdropParticipant, database, getAirdropParticipantByIds, getBalanceOf, getDailyBudgetForSenderId, getTipEngineActiveAirdrops, getTipEngineByTipString, getTotalAmountTippedBetweenDatesForSender, incrementAirdropParticipantPoints } from "@repo/database";
import { CastWebhookSchema } from 'types';
import { InferType } from 'yup';
import { fetchDailyAllowance, getUserCreatedDate } from 'api';

// const { createHmac } = require("node:crypto")

// .dev.vars for dev and cloudflare dashboard for prod
type Bindings = {
  DATABASE_URL: string
  NEYNAR_API_KEY: string
  TEST_WEBHOOK_SECRET: string
  ALCHEMY_BASE_SEPOLIA: string
  ALCHEMY_BASE_MAINNET: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.fire()

/*

STEPS

STEP 0) verify webhook signature

STEP 1) check sender has verified addresses on farcaster
STEP 2) get tip string and amount from cast text
STEP 3) make sure the cast is in response to a parent cast
STEP 4) check if the tip string is associated with an active airdrop
STEP 5) make sure sender is within their daily budget
STEP 6) check airdrop security requirements
  a) check if sender has a legacy account
  b) check if sender has a power badge
  c) check if sender has the minimum balance required
STEP 7) create or update airdrop participant points

*/
app.post('/cast/created', async (c) => {
  try {
    // STEP 0
    const signature = c.req.header("X-Neynar-Signature");
    if (!signature) {
      return new Response("Signature is required", { status: 400 });
    }

    // const bodyText = await c.req.text();

    // const hmac = createHmac("sha512", c.env.TEST_WEBHOOK_SECRET);
    // hmac.update(bodyText);

    // const generatedSignature = hmac.digest("hex");

    // const isValid = generatedSignature === signature;
    // if (!isValid) {
    //   return new Response("Invalid signature", { status: 401 });
    // }

    const bodyData: InferType<typeof CastWebhookSchema> = await c.req.json();

    await CastWebhookSchema.validate(bodyData); 

    const senderFid = bodyData.data.author.fid.toString();

    // STEP 1
    const verifiedEthAddresses = bodyData.data?.author?.verified_addresses?.eth_addresses;
    if (!verifiedEthAddresses || verifiedEthAddresses.length === 0) {
      return new Response("User has no verified ETH addresses", { status: 200 });
    }

    console.log(bodyData);

    // STEP 2
    // Use template literals to dynamically insert the value into the regex pattern
    const regexPattern = "\\b(\\d+)\\s\\$(\\w+)\\b"
    const regex = new RegExp(regexPattern);

    const matchedString = bodyData.data.text.match(regex).toString();
    const splitMatched = matchedString.split(",")[0].split(" ");
    const tipAmount = Number(splitMatched[0]);
    const tipString = splitMatched[1];

    console.log('found tip string', matchedString);
    console.log('tip amount', tipAmount);
    console.log('tip string', tipString);

    // STEP 3
    const parentFid = bodyData.data?.parent_author?.fid?.toString()
    if (!parentFid) {
      return new Response("Parent fid is required", { status: 200 });
    }

    console.log('parent fid', parentFid);

    // STEP 4
    const db = database(c.env.DATABASE_URL);
    const tipEngine = await getTipEngineByTipString(db, tipString);
    const activeAirdrops = await getTipEngineActiveAirdrops(db, tipEngine.id);

    if (activeAirdrops.length === 0) {
      console.log('No active airdrops found')
      return new Response("No active airdrops found", { status: 200 });
    }

    const airdrop = activeAirdrops[0];

    // STEP 5
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const totalPointsSentToday = await getTotalAmountTippedBetweenDatesForSender(
      db,
      senderFid,
      todayStart,
      todayEnd
    );

    const dailyBudget = await fetchDailyAllowance(c.env.NEYNAR_API_KEY, senderFid);

    if (totalPointsSentToday + tipAmount > dailyBudget) {
      console.log("Sender will exceed their daily budget")
      return new Response("Sender will exceed their daily budget", { status: 200 });
    }

    // STEP 6a
    if (airdrop.requireLegacyAccount) {
      const createdAtDate = await getUserCreatedDate(c.env.NEYNAR_API_KEY, senderFid);

      if (createdAtDate > airdrop.startDate) {
        console.log("Sender does not have a legacy account")
        return new Response("Sender does not have a legacy account", { status: 200 });
      }
    }

    // STEP 6b
    if (airdrop.requirePowerBadge) {
      if (!bodyData.data.author.power_badge) {
        console.log("Sender does not have a power badge")
        return new Response("Sender does not have a power badge", { status: 200 });
      }
    }

    // STEP 6c
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


    // STEP 7
    let airdropParticipant: AirdropParticipant;
    try {
      airdropParticipant = await getAirdropParticipantByIds(db, activeAirdrops[0].id, parentFid);
      await incrementAirdropParticipantPoints(db, activeAirdrops[0].id, parentFid, tipAmount);
    } catch (e) {
      airdropParticipant = await createAirdropParticipant(db, activeAirdrops[0].id, parentFid, tipAmount);
    }

    return new Response("Cast processed successfully", { status: 200 });
  } catch (e: any) {
    console.log(e)
    return new Response(e.message, { status: 500 });
  }
});

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
