import { CreateTipEngine, CreateTipEngineSchema, Database, TipEngine, TipEngineSchema, User, createTipEngine, database, getTipEngineAllowanceForUser, isValidSlug, isValidTipString } from '@repo/database';
import { Hono } from 'hono'
import { Bindings, getUser } from 'index';
import { walletAuth } from 'middleware';

const tipEngineRoute = new Hono<{ Bindings: Bindings }>()

// return full tip engine info + airdrop info
tipEngineRoute.get('/lookup/:id', async (c) => {
  try {
    const { id } = c.req.param();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Tip engine found",
        data: {
          
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// set tip engine publish status (aka if neynar webhook is published or not)
tipEngineRoute.post('/lookup/:id/setpublish', async (c) => {
  try {
    const { id } = c.req.param();

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

// create tip engine
tipEngineRoute.post('/create', walletAuth, async (c) => {
  try {
    // url query "publish" boolean
    const { publish } = c.req.query();

    const bodyData: CreateTipEngine = await c.req.json();

    // verify body data with zod schema
    // errors if invalid
    await CreateTipEngineSchema.parseAsync(bodyData);

    // check creatorAddress matches authenticated wallet
    const authenticatedAddress: string | null | undefined = c.get('walletAddress' as never);
    if (authenticatedAddress === null || authenticatedAddress === undefined) {
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

    if (bodyData.tipEngine.ownerAddress.toLowerCase() !== authenticatedAddress) {
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

    const user: User = await getUser(c);

    // check tip engine allowance
    const tipEngineAllowance = await getTipEngineAllowanceForUser(db, user);

    // error if user has no tip engine allowance
    if (tipEngineAllowance <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User has no tip engine allowance",
          data: {
            availableSlug,
            availableTipString
          }
        }),
        { status: 400 }
      );
    }

    const tipEngine: TipEngine = await createTipEngine(db, {
      ...bodyData.tipEngine,
      chainId: Number(bodyData.tipEngine.chainId),
      userId: user.id,
      webhookId: "",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Tip engine created successfully",
        data: {
          tipEngineId: tipEngine.id
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
