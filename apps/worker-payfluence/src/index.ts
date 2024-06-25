import { Hono, HonoRequest } from 'hono'

import usersRoute from 'routes/users';
import tipEnginesRoute from 'routes/tipengines';
import publicRoute from 'routes/public';

import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
import airdropsRoute from 'routes/airdrops';
import { fetchPublicKey } from 'utils';

// .dev.vars for dev and cloudflare dashboard for prod
export type Bindings = {
  DATABASE_URL_PROD: string
  DATABASE_URL_STAGING: string
  DYNAMIC_XYZ_API_KEY: string
  DYNAMIC_XYZ_ENVIRONMENT_ID: string
  DYNAMIC_XYZ_PUBLIC_KEY: string
}

type Variables = JwtVariables

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()
app.fire()

app.use('/auth/*', async (c, next) => {
  const publicKey = await fetchPublicKey(c.env.DYNAMIC_XYZ_API_KEY, c.env.DYNAMIC_XYZ_ENVIRONMENT_ID);
  console.log(publicKey)
  console.log(c.req.header('Authorization'))
  const jwtMiddleware = jwt({
    secret: publicKey,
    alg: 'RS256'
  })
  return jwtMiddleware(c, next)
})

app.get('/auth/test', async (c) => {
  return new Response("Authenticated", { status: 200 })
});


// DASHBOARD ROUTES

app.route('/users', usersRoute);
app.route('/auth/tipengines', tipEnginesRoute);
app.route('/auth/airdrops', airdropsRoute);

// PUBLIC ROUTES

app.route('/public', publicRoute);

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
