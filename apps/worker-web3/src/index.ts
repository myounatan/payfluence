import { Hono } from 'hono'

// .dev.vars for dev and cloudflare dashboard for prod
type Bindings = {
  MORALIS_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.fire()

// get erc20 tokens deployed by an address
app.get('/erc20/:address/:chain', async (c) => {
  try {
    const address = c.req.param('address');
    const chain = c.req.param('chain') || 'base';

    const response = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${chain}`, {
      headers: {
        "accept": "application/json",
        "X-API-Key": c.env.MORALIS_API_KEY
      },
    });

    const responseData: any = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Checkout created",
        data: responseData,
      }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
