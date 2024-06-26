import { User } from '@repo/database';
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
tipEngineRoute.get('/:id', async (c) => {
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

// set tip engine publish status (aka if neynar webhook is published or not)
tipEngineRoute.post('/:id/setpublish', async (c) => {
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

export default tipEngineRoute;
