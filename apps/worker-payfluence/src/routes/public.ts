import { Hono } from 'hono'
import { Bindings } from 'index';

import {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
} from "@metamask/eth-sig-util";
import { Airdrop, AirdropParticipant, database, getAirdropById, getAirdropParticipantByIds, getTipEngineByAirdropId, setAirdropParticipantSignature, TipEngine } from '@repo/database';
import { Payfluence } from '@repo/contracts/typechain-types';
import { CreateAirdropSignature } from 'types';

const publicRoute = new Hono<{ Bindings: Bindings }>()

// returns paginated list of users
publicRoute.get('/airdrop/:id/leaderboard', async (c) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        message: "User found",
        data: {
          
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// returns daily allowance, recent tips sent, recent tips received, etc
publicRoute.get('/airdrop/:id/profile/:fid', async (c) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        message: "User found",
        data: {
          
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// returns tip allowance for a user
publicRoute.get('/airdrop/:id/allowance/:fid', async (c) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        message: "User found",
        data: {
          
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// returns paginated list of tips sent by a user
publicRoute.get('/airdrop/:id/sent/:fid', async (c) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        message: "User found",
        data: {
          
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// returns paginated list of tips received by a user
publicRoute.get('/airdrop/:id/received/:fid', async (c) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        message: "User found",
        data: {
          
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

const checkAirdropClaimDate = (airdrop: Airdrop): boolean => {
  const currentDate = new Date();
  if (currentDate < airdrop.claimStartDate || currentDate > airdrop.claimEndDate) {
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
        airdropId: airdropId,
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
