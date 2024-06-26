import { Hono, HonoRequest } from 'hono'

import { database } from "@repo/database";
import { CreateCheckout, WebhookSchema } from 'types';

// .dev.vars for dev and cloudflare dashboard for prod
type Bindings = {
  DATABASE_URL_PROD: string
  DATABASE_URL_STAGING: string
  LEMONSQUEEZY_API_KEY_TEST: string
  LEMONSQUEEZY_STORE_ID: string
  LEMONSQUEEZY_WEBHOOK_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.fire()

app.post('/cast/created', async (c) => {
  try {
    const bodyData = await c.req.json();

    // console.log(responseData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Checkout created",
        data: {
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
