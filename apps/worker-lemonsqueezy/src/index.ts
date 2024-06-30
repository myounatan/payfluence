import { Hono, HonoRequest } from 'hono'

import { database, getSubscriptionTierFromProductId, setUserSubscription } from "@repo/database";
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

// checkout page

app.post('/checkout/create', async (c) => {
  try {
    const bodyData = await c.req.json();

    CreateCheckout.validateSync(bodyData);

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        "Accept": "application/vnd.api+json",
        "Authorization": `Bearer ${c.env.LEMONSQUEEZY_API_KEY_TEST}`
      },
      body: JSON.stringify({
        "data": {
          "type": "checkouts",
          "attributes": {
            "checkout_data": {
              "email": bodyData.email,
              "name": bodyData.name
            }
          },
          "relationships": {
            "store": {
              "data": {
                "type": "stores",
                "id": c.env.LEMONSQUEEZY_STORE_ID
              }
            },
            "variant": {
              "data": {
                "type": "variants",
                "id": bodyData.productId
              }
            }
          }
        }
      })
    });

    const responseData: any = await response.json();

    // console.log(responseData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Checkout created",
        data: {
          checkoutUrl: responseData.data.attributes.url
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

app.get('/portal/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/vnd.api+json",
        "Accept": "application/vnd.api+json",
        "Authorization": `Bearer ${c.env.LEMONSQUEEZY_API_KEY_TEST}`
      }
    });

    const responseData: any = await response.json();

    console.log(responseData.data.attributes.urls.customer_portal);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Customer portal fetched",
        data: {
          portalUrl: responseData.data.attributes.urls.customer_portal
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
});

// webhook handlers

const validateWebhook = (signature: string, secret: string) => {
  console.log(signature, secret)
  if (!signature || signature !== secret) {
    throw new Error("Signature verification failed");
  }
}

app.post('/webhook/subscription', async (c) => {
  try {
    // validateWebhook(c.req.header("X-Signature"), c.env.LEMONSQUEEZY_WEBHOOK_SECRET);

    const bodyData = await c.req.json();
    await WebhookSchema.validate(bodyData); 

    if (bodyData.meta.event_name === "subscription_created") {
      const databaseUrl = bodyData.meta.test_mode ? c.env.DATABASE_URL_STAGING : c.env.DATABASE_URL_PROD;
      const db = database(databaseUrl);

      const productId = bodyData.data.attributes.variant_id;
      const customerId = bodyData.data.attributes.customer_id;
      const subscriptionTier = await getSubscriptionTierFromProductId(db, productId);

      // set user subscription tier
      await setUserSubscription(
        db,
        bodyData.data.attributes.user_email,
        {
          isSubscribed: true,
          subscriptionTier,
          subscriptionProductId: productId,
          subscriptionExpiresAt: null,
          customerId: customerId.toString()
        }
      );
    } else if (bodyData.meta.event_name === "subscription_updated") {
      // TODO: cancel, upgrade, downgrade, etc.
      const isCancelled = bodyData.data.attributes.cancelled

      const databaseUrl = bodyData.meta.test_mode ? c.env.DATABASE_URL_STAGING : c.env.DATABASE_URL_PROD;
      const db = database(databaseUrl);

      const productId = bodyData.data.attributes.variant_id;
      const ends_at = bodyData.data.attributes.ends_at;
      const customerId = bodyData.data.attributes.customer_id;

      await setUserSubscription(
        db,
        bodyData.data.attributes.user_email,
        {
          isSubscribed: isCancelled ? false : true,
          // subscriptionTier: isCancelled ? 0 : await getSubscriptionTierFromProductId(db, productId),
          subscriptionProductId: productId,
          subscriptionExpiresAt: ends_at ? new Date(ends_at) : null,
          customerId: customerId.toString()
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription webhook processed, event type: " + bodyData.meta.event_name,
      }),
      { status: 200 }
    );
  } catch (e: any) {
    console.log(e.message)
    return new Response(e.message, { status: 500 });
  }
});

// app.post('/webhook/subscription_payment', async (c) => {
//   try {
    // validateWebhook(c.req.header("X-Signature"), c.env.LEMONSQUEEZY_WEBHOOK_SECRET);

//     const bodyData = await c.req.json();
//     await WebhookSchema.validate(bodyData); 



//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: "Subscription payment processed, event type: " + bodyData.meta.event_name,
//       }),
//       { status: 200 }
//     );
//   } catch (e: any) {
//     console.log(e.message)
//     return new Response(e.message, { status: 500 });
//   }
// });

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
