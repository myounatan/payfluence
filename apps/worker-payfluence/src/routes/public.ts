import { Hono } from 'hono'
import { Bindings } from 'index';

import {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
} from "@metamask/eth-sig-util";
import { Airdrop, AirdropParticipant, database, fetchDailyAllowance, getAirdropById, getAirdropParticipantByIds, getTipEngineAndActiveAirdropFromSlug, getTipEngineByAirdropId, getTipEnginePublicDisplayParams, getTotalAmountTippedBetweenDatesForSender, setAirdropParticipantSignature, TipEngine, TipEnginePublicDisplayParams } from '@repo/database';
import { Payfluence } from '@repo/contracts/typechain-types';
import { CreateAirdropSignature } from 'types';

const publicRoute = new Hono<{ Bindings: Bindings }>()

// returns paginated list of users
// publicRoute.get('/airdrop/:id/leaderboard', async (c) => {
//   try {
//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: "User found",
//         data: {
          
//         }
//       }),
//       { status: 200 }
//     );
//   } catch (e: any) {
//     return new Response(e.message, { status: 500 });
//   }
// });

// returns daily allowance, allowance remaining for the day, current tip engine, and air drop id (if applicable)
publicRoute.get('/slug/:slug/profile/:fid', async (c) => {
  try {
    const { slug, fid } = c.req.param();

    const db = database(c.env.DATABASE_URL);
    const { tipEngine, airdrop } = await getTipEngineAndActiveAirdropFromSlug(db, slug);

    if (!tipEngine) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Tip engine not found",
        }),
        { status: 400 }
      );
    }

    const responseParams: {
      dailyAllowance: number,
      allowanceRemaining: number,
      amountLeft: number,
      tipEngine: TipEnginePublicDisplayParams,
    } = {
      dailyAllowance: 0,
      allowanceRemaining: 0,
      amountLeft: 0,
      tipEngine: await getTipEnginePublicDisplayParams(tipEngine, airdrop),
    }

    if (!airdrop) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Airdrop not found",
          data: responseParams
        }),
        { status: 200 }
      );
    }

    // get daily allowance for fid
    const dailyAllowance = await fetchDailyAllowance(c.env.DAILY_ALLOWANCE_WORKER, airdrop.id, fid);

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const totalPointsSentToday = await getTotalAmountTippedBetweenDatesForSender(
      db,
      fid,
      todayStart,
      todayEnd
    );

    const amountLeft = dailyAllowance - totalPointsSentToday;

    responseParams.dailyAllowance = dailyAllowance;
    responseParams.allowanceRemaining = amountLeft;
    responseParams.amountLeft = amountLeft

    return new Response(
      JSON.stringify({
        success: true,
        message: "User data found",
        data: responseParams
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// // returns paginated list of tips sent by a user
// publicRoute.get('/airdrop/:id/sent/:fid', async (c) => {
//   try {
//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: "User found",
//         data: {
          
//         }
//       }),
//       { status: 200 }
//     );
//   } catch (e: any) {
//     return new Response(e.message, { status: 500 });
//   }
// });

// // returns paginated list of tips received by a user
// publicRoute.get('/airdrop/:id/received/:fid', async (c) => {
//   try {
//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: "User found",
//         data: {
          
//         }
//       }),
//       { status: 200 }
//     );
//   } catch (e: any) {
//     return new Response(e.message, { status: 500 });
//   }
// });

const checkAirdropClaimDate = (airdrop: Airdrop): boolean => {
  const currentDate = new Date();
  if (currentDate < airdrop.claimStartDate || airdrop.claimEndDate && currentDate > airdrop.claimEndDate) {
    return false
  }
  return true
}

// create and return airdrop signature
publicRoute.post('/airdrop/:airdropId/signature/:receiverId', async (c) => {
  try {
    const { airdropId, receiverId } = c.req.param();

    const bodyData = await c.req.json();

    CreateAirdropSignature.validate(bodyData);

    // TODO: ADD FARCASTER LOGIN TOKEN AUTH JWT VERIFICATION

    const db = database(c.env.DATABASE_URL);
    const airdrop: Airdrop = await getAirdropById(db, airdropId);

    // check if airdrop claim date is past, and claim end is not passed
    if (!checkAirdropClaimDate(airdrop)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Airdrop claim not active",
        }),
        { status: 400 }
      );
    }

    const airdropParticipant: AirdropParticipant = await getAirdropParticipantByIds(db, airdropId, receiverId);

    let signature = airdropParticipant.signature;

    if (signature === undefined) {
      // create signature

      const tipEngine: TipEngine = await getTipEngineByAirdropId(db, airdropId);

      const chainId = Number(c.env.CHAIN_ID);

      const verifyingContract = c.env.PAYFLUENCE_CONTRACT_ADDRESS;
      const airdropMessage: Payfluence.AirdropMessageStruct = {
        airdropId: airdrop.tipEngineId, // actually tip engine in contract
        token: tipEngine.tokenContract,
        owner: tipEngine.ownerAddress,
        recipient: bodyData.walletAddress,
        amountClaimable: BigInt(airdropParticipant.claimableAmount),
      };

      const data: TypedMessage<any> = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          AirdropMessage: [
            { name: "airdropId", type: "string" },
            { name: "token", type: "address" },
            { name: "owner", type: "address" },
            { name: "recipient", type: "address" },
            { name: "amountClaimable", type: "uint256" },
          ],
        },
        domain: {
          name: c.env.EIP712_DOMAIN_NAME,
          version: c.env.EIP712_DOMAIN_VERSION,
          chainId,
          verifyingContract,
        },
        primaryType: "AirdropMessage",
        message: airdropMessage,
      };

      // 32 bytes private key from owner
      const privateKey = Buffer.from((c.env.ADMIN_WALLET_PRIVATE_KEY || "").substring(2,66), "hex");

      signature = signTypedData({
        privateKey,
        data,
        version: SignTypedDataVersion.V4,
      });

      await setAirdropParticipantSignature(db, airdropId, receiverId, signature);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Signature created",
        data: {
          signature,
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// get airdrop signature
publicRoute.get('/signature/:airdropId/:receiverId', async (c) => {
  try {
    const { airdropId, receiverId } = c.req.param();

    // TODO: ADD FARCASTER LOGIN TOKEN AUTH JWT VERIFICATION

    const db = database(c.env.DATABASE_URL);
    const airdrop: Airdrop = await getAirdropById(db, airdropId);
    
    if (!checkAirdropClaimDate(airdrop)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Airdrop claim not active",
        }),
        { status: 400 }
      );
    }

    const airdropParticipant: AirdropParticipant = await getAirdropParticipantByIds(db, airdropId, receiverId);

    if (airdropParticipant.signature === undefined) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Signature not found",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Signature found",
        data: {
          signature: airdropParticipant.signature,
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});


export default publicRoute;
