import { Database, User, database, isValidSlug, isValidTipString } from '@repo/database';
import { Hono } from 'hono'
import { Bindings } from 'index';

const getTipEngineAllowance = async (user: User) => {
  switch (user.subscriptionTier) {
    case 1:
      return 1;
    case 2:
      return 5;
    default:
      return 0;
  }
}

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
  } catch (e) {
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
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

// create tip engine
tipEngineRoute.post('/create', async (c) => {
  try {
    // url query "publish" boolean
    const { publish } = c.req.query();

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
  } catch (e) {
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
  } catch (e) {
    console.log(e)
    return new Response(e.message, { status: 500 });
  }
});

export default tipEngineRoute;
