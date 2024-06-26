import { User } from '@repo/database';
import { Hono } from 'hono'
import { Bindings, getUser } from 'index';

const userRoute = new Hono<{ Bindings: Bindings }>()

userRoute.get('/local', async (c) => {
  try {
    const user: User = await getUser(c)

    return new Response(
      JSON.stringify({
        success: true,
        message: "User found",
        data: {
          user: {
            email: user.email,
            isSubscribed: user.isSubscribed,
            subscriptionTier: user.subscriptionTier,
            subscriptionProductId: user.subscriptionProductId,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            customerId: user.customerId,
          }
        }
      }),
      { status: 200 }
    );
  } catch (e: any) {
    console.log("/local")
    console.log(e)
    return new Response(e.message, { status: 500 });
  }
});

export default userRoute;
