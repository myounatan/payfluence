import { Hono } from 'hono'
import { Bindings } from 'index';

import {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
} from "@metamask/eth-sig-util";
import { Airdrop, AirdropParticipant, database, getAirdropById, getAirdropParticipantByIds } from '@repo/database';
import { Payfluence } from '@repo/contracts/typechain-types';

const airdropRoute = new Hono<{ Bindings: Bindings }>()

// get airdrop signature
airdropRoute.get('/signature/:airdropId/:receiverId', async (c) => {
  try {
    const { airdropId, receiverId } = c.req.param();

    const db = database(c.env.DATABASE_URL);
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
        message: "User found",
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

// create airdrop
airdropRoute.post('/create/:id', async (c) => {
  try {
    // tip engine id
    const { id } = c.req.param();

    const bodyData = await c.req.json();

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

export default airdropRoute;
