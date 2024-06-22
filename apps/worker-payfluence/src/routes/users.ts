import { Hono } from 'hono'
import { Bindings } from 'index';

const usersRoute = new Hono<{ Bindings: Bindings }>()

usersRoute.get('/:id', async (c) => {
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

export default usersRoute;
