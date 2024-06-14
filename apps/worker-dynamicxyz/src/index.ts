import { Hono } from 'hono'

import { getUserByEmail, createUser, database } from "@repo/database";
import { Webhooks } from "@octokit/webhooks"
import { WebhookPayload } from 'types';

// .dev.vars for dev and cloudflare dashboard for prod
type Bindings = {
  DATABASE_URL: string
  DYNAMICXYZ_WEBHOOK_SECRET_USER_CREATED: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.fire()

app.post('/user/create', async (c) => {

  try {
    // validate webhook signature
    const signature = c.req.header("x-dynamic-signature-256");
    const bodyData = await c.req.json();

    const webhooks = new Webhooks({
      secret: c.env.DYNAMICXYZ_WEBHOOK_SECRET_USER_CREATED,
    });

    if (!(await webhooks.verify(JSON.stringify(bodyData), signature))) {
      return new Response("Signature verification failed", { status: 401 });
    }

    // validate body schema
    await WebhookPayload.validate(bodyData); 

    // check if ping event
    if (bodyData.eventName === "ping") {
      return new Response("Pong", { status: 200 });
    }

    if (bodyData.eventName !== "user.created") {
      return new Response("Invalid event", { status: 400 });
    }

    const email = bodyData.data.email;
    if (email === undefined) {
      return new Response("Email is required", { status: 400 });
    }

    const db = database(c.env.DATABASE_URL);
  
    const user = await getUserByEmail(db, email);
    if (user.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User already exists",
        }),
        { status: 402 }
      );
    }
  
    await createUser(db, email);
  
    return new Response(
      JSON.stringify({
        success: true,
        message: "User created",
      }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
