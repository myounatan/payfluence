import { Hono } from 'hono'
import { Bindings } from 'index';

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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

// create airdrop signatures
// TODO: send some wallet signed message and farcaster auth token
publicRoute.post('/airdrop/:id/requestsignature/:fid', async (c) => {
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
export default publicRoute;
