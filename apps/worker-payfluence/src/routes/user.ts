import { User } from '@repo/database';
import { Hono } from 'hono'
import { Bindings } from 'index';

const userRoute = new Hono<{ Bindings: Bindings }>()

userRoute.get('/local', async (c) => {
  try {
    const user: User = c.get('user' as never)

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
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

export default userRoute;
