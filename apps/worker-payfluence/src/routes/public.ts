import { Hono } from 'hono'
import { Bindings } from 'index';

const publicRoute = new Hono<{ Bindings: Bindings }>()

// returns paginated list of users
publicRoute.get('/public/airdrop/:id/leaderboard', async (c) => {
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
publicRoute.get('/public/airdrop/:id/profile/:fid', async (c) => {
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
publicRoute.get('/public/airdrop/:id/allowance/:fid', async (c) => {
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
publicRoute.get('/public/airdrop/:id/sent/:fid', async (c) => {
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
publicRoute.get('/public/airdrop/:id/received/:fid', async (c) => {
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

export default publicRoute;
