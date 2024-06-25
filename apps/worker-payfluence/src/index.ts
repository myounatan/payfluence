import { Hono } from 'hono'

import airdropRoute from 'routes/airdrop';
import publicRoute from 'routes/public';
import tipEngineRoute from 'routes/tipengine';
import userRoute from 'routes/user';

import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
import { fetchPublicKey } from 'utils';

// .dev.vars for dev and cloudflare dashboard for prod
export type Bindings = {
  DATABASE_URL: string
  DYNAMIC_XYZ_API_KEY: string
  DYNAMIC_XYZ_ENVIRONMENT_ID: string
  DYNAMIC_XYZ_PUBLIC_KEY: string
  ADMIN_WALLET_PRIVATE_KEY: string
  ADMIN_WALLET_ADDRESS: string
  PAYFLUENCE_CONTRACT_ADDRESS: string
  EIP712_DOMAIN_NAME: string
  EIP712_DOMAIN_VERSION: string
  CHAIN_ID: string
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

app.route('/user', userRoute);
app.route('/auth/tipengine', tipEngineRoute);
app.route('/auth/airdrop', airdropRoute);

// PUBLIC ROUTES

app.route('/public', publicRoute);

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
