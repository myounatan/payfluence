import { CreateTipEngine, CreateTipEngineSchema, Database, TipEngine, TipEngineDisplayParams, TipEngineSchema, User, createAirdrop, createNeynarWebhook, createTipEngine, database, deleteNeynarWebhook, getTipEngineAllowanceForUser, getTipEngineById, getTipEngineDisplayParams, getTokenMetadata, isValidSlug, isValidTipString, setTipEngineWebhook } from '@repo/database';
import { Hono } from 'hono'
import { Bindings, getUser } from 'index';
import { walletAuth } from 'middleware';

const tipEngineRoute = new Hono<{ Bindings: Bindings }>()

// return full tip engine info + airdrop info using TipEngineDisplayParams
tipEngineRoute.get('/all', async (c) => {
  try {

    const user: User = await getUser(c)

    const db = database(c.env.DATABASE_URL)
    const tipEngines: TipEngineDisplayParams = await getTipEngineDisplayParams(db, user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Tip engines found",
        data: {
          tipEngines,
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    console.log(e)
    return new Response(e.message, { status: 500 });
  }
});

// set tip engine publish status (aka if neynar webhook is published or not)
tipEngineRoute.post('/setpublish/:id/:published', async (c) => {
  try {
    const { id, published } = c.req.param();

    const requestedState = published === "true";

    const db = database(c.env.DATABASE_URL)

    const tipEngine: TipEngine = await getTipEngineById(db, id);

    if (tipEngine.webhookActive === requestedState) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Tip engine already in requested state",
          data: {
            published
          }
        }),
        { status: 400 }
      );
    }

    const user: User = await getUser(c);

    if (tipEngine.webhookActive === false && requestedState === true) {
      // check tip engine allowance
      const tipEngineAllowance = await getTipEngineAllowanceForUser(db, user);
  
      // error if user has no tip engine allowance
      if (tipEngineAllowance <= 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User has no tip engine allowance to publish",
            data: {
              tipEngineAllowance
            }
          }),
          { status: 400 }
        );
      }

      const webhookCreatedData: any = await createNeynarWebhook(c.env.NEYNAR_API_KEY, c.env.PAYFLUENCE_NEYNAR_WEBHOOK_URL, tipEngine.id, tipEngine.tipString);

      await setTipEngineWebhook(db, tipEngine.id, webhookCreatedData.webhook.webhook_id, true, webhookCreatedData.webhook.secrets.value);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Tip engine published successfully",
          data: {
            tipEngineId: tipEngine.id,
            published: true
          }
        }),
        { status: 200 }
      );
    }

    if (tipEngine.webhookActive === true && requestedState === false) {
      // delete webhook
      const success = await deleteNeynarWebhook(c.env.NEYNAR_API_KEY, tipEngine.webhookId);
      if (!success) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Failed to delete neynar webhook",
            data: {
              tipEngineId: tipEngine.id,
              published: true
            }
          }),
          { status: 405 }
        );
      }

      await setTipEngineWebhook(db, tipEngine.id, "", false, "");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Tip engine unpublished successfully",
          data: {
            tipEngineId: tipEngine.id,
            published: false
          }
        }),
        { status: 200 }
      );
    }

  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// create tip engine
tipEngineRoute.post('/create', walletAuth, async (c) => {
  try {
    // url query "publish" boolean
    const { publish } = c.req.query();

    console.log("ATTEMPTING TO PUBLISH: " + publish)

    let bodyData: CreateTipEngine = await c.req.json();

    // verify body data with zod schema
    // errors if invalid
    bodyData = await CreateTipEngineSchema.parseAsync(bodyData);

    console.log(bodyData.airdrops)
    console.log(bodyData.airdrops[0].startDate)

    const chainId = Number(bodyData.tipEngine.chainId);

    // check creatorAddress matches authenticated wallet
    const authenticatedAddress: string | null | undefined = c.get('walletAddress' as never);
    if (authenticatedAddress === null || authenticatedAddress === undefined) {
      console.log("No authenticated wallet address found")
      return new Response(
        JSON.stringify({
          success: false,
          message: "No authenticated wallet address found",
          data: {
          }
        }),
        { status: 400 }
      );
    }

    if (bodyData.tipEngine.ownerAddress.toLowerCase() !== (authenticatedAddress as string).toLowerCase()) {
      console.log("Owner address does not match authenticated wallet address")
      return new Response(
        JSON.stringify({
          success: false,
          message: "Owner address does not match authenticated wallet address",
          data: {
            authenticatedAddress
          }
        }),
        { status: 400 }
      );
    }

    const db: Database = database(c.env.DATABASE_URL);

    const availableSlug = await isValidSlug(db, bodyData.tipEngine.slug);
    const availableTipString = await isValidTipString(db, bodyData.tipEngine.tipString);

    // error if slug or tipstring is not available
    if (!availableSlug) {
      console.log("Slug is not available")
      return new Response(
        JSON.stringify({
          success: false,
          message: "Slug is not available",
          data: {
            availableSlug,
            availableTipString
          }
        }),
        { status: 400 }
      );
    }

    if (!availableTipString) {
      console.log("Tip string is not available")
      return new Response(
        JSON.stringify({
          success: false,
          message: "Tip string is not available",
          data: {
            availableSlug,
            availableTipString
          }
        }),
        { status: 400 }
      );
    }

    // get token metadata

    let decimals: number; let symbol: string; let name: string;
    try {
      const getRPCUrl = (): string => {
        if (chainId === 84532) {
          return c.env.ALCHEMY_BASE_SEPOLIA;
        }
      
        return c.env.ALCHEMY_BASE_MAINNET;
      }

      console.log(getRPCUrl())
      const metadata = await getTokenMetadata(getRPCUrl(), bodyData.tipEngine.tokenContract);
      decimals = metadata.decimals;
      symbol = metadata.symbol;
      name = metadata.name;

      console.log("metadata", metadata)
    } catch (e: any) {
      console.log(e)
      return new Response(
        JSON.stringify({
          success: false,
          message: "Could not get token metadata",
          data: {
            availableSlug,
            availableTipString
          }
        }),
        { status: 409 }
      );
    }

    const user: User = await getUser(c);

    // TODO: return full tip engine info
    const tipEngineId = await createTipEngine(db, {
      ...bodyData.tipEngine,
      chainId: Number(bodyData.tipEngine.chainId),
      tokenDecimals: decimals,
      tokenSymbol: symbol,
      tokenName: name,
      userId: user.id,
      webhookId: "",
    });

    for (let i = 0; i < bodyData.airdrops.length; i++) {
      await createAirdrop(db, {
        ...bodyData.airdrops[i],
        tipEngineId: tipEngineId,
        tokenAmount: BigInt(0),
      })
    }

    let published = false;
    if (publish) {
      // check tip engine allowance
      const tipEngineAllowance = await getTipEngineAllowanceForUser(db, user);
  
      // error if user has no tip engine allowance
      if (tipEngineAllowance > 0) {
        // publish webhook
        const webhookCreatedData: any = await createNeynarWebhook(c.env.NEYNAR_API_KEY, c.env.PAYFLUENCE_NEYNAR_WEBHOOK_URL, tipEngineId, bodyData.tipEngine.tipString);

        await setTipEngineWebhook(db, tipEngineId, webhookCreatedData.webhook.webhook_id, true, webhookCreatedData.webhook.secrets.value);

        published = true;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Tip engine created successfully",
        data: {
          tipEngineId: tipEngineId,
          published
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    console.log(e)
    return new Response(e.message, { status: 500 });
  }
});

tipEngineRoute.get('/available', async (c) => {
  try {
    const { slug, tipstring } = c.req.query();

    const db: Database = database(c.env.DATABASE_URL);
    const availableSlug = await isValidSlug(db, slug);
    const availableTipString = await isValidTipString(db, tipstring);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Result executed successfully",
        data: {
          availableSlug,
          availableTipString
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    console.log(e)
    return new Response(e.message, { status: 500 });
  }
});

export default tipEngineRoute;
