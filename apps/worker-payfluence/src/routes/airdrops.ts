import { Hono } from 'hono'
import { Bindings } from 'index';

const airdropsRoute = new Hono<{ Bindings: Bindings }>()

// create airdrop signatures
airdropsRoute.post('/:id/createsignatures', async (c) => {
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

// create airdrop
airdropsRoute.post('/create/:id', async (c) => {
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
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

export default airdropsRoute;
