import { Hono } from 'hono'
import { cors } from 'hono/cors'

import airdropRoute from 'routes/airdrop';
import publicRoute from 'routes/public';
import tipEngineRoute from 'routes/tipengine';
import userRoute from 'routes/user';

// import { jwt } from 'hono/jwt'
// import type { JwtVariables } from 'hono/jwt'
import * as jose from 'jose'
import { User, database, getUserByEmail } from '@repo/database';

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

// type Variables = JwtVariables

const app = new Hono<{ Bindings: Bindings }>()
app.fire()

app.use('*', cors({
  origin: 'http://localhost:3002',
  allowHeaders: ['Origin', 'Content-Type', 'Authorization'],
  allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use('/auth/*', async (c, next) => {
  const bearerToken = c.req.header('Authorization')
  if (!bearerToken) {
    return new Response("Unauthorized, missing bearer token", { status: 401 })
  }

  const alg = 'RS256'
  const spki = c.env.DYNAMIC_XYZ_PUBLIC_KEY
  const publicKey = await jose.importSPKI(spki, alg)
  const jwt = bearerToken.split(' ')[1]
    
  const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {})
  
  // console.log(protectedHeader)
  console.log(payload)

  // add email to context

  const email: string = payload.verified_credentials[0].email
  c.set('email' as never, email)

  // add user to context
  const db = database(c.env.DATABASE_URL);
  const user: User = await getUserByEmail(db, email)
  c.set('user' as never, user)

  await next()
})

app.get('/auth/test', async (c) => {
  const user: User = c.get('user' as never)
  return new Response(`Authenticated User Id ${user.id}`, { status: 200 })
});


// DASHBOARD ROUTES

app.route('/auth/user', userRoute);
app.route('/auth/tipengine', tipEngineRoute);
app.route('/auth/airdrop', airdropRoute);

// PUBLIC ROUTES

app.route('/public', publicRoute);

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
