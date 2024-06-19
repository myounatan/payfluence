import { Hono } from 'hono'
import { Bindings } from 'index';

const tipEnginesRoute = new Hono<{ Bindings: Bindings }>()

// return full tip engine info + airdrop info
tipEnginesRoute.get('/:id', async (c) => {
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
tipEnginesRoute.post('/:id/setpublish', async (c) => {
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

// create airdrop signatures
tipEnginesRoute.post('/:id/createsignatures', async (c) => {
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
tipEnginesRoute.post('/create', async (c) => {
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

export default tipEnginesRoute;
