import { Context, Hono } from 'hono'
import { cors } from 'hono/cors'

import airdropRoute from 'routes/airdrop';
import publicRoute from 'routes/public';
import tipEngineRoute from 'routes/tipengine';
import userRoute from 'routes/user';

// import { jwt } from 'hono/jwt'
// import type { JwtVariables } from 'hono/jwt'
import * as jose from 'jose'
import { User, database, getUserByEmail } from '@repo/database';
import web3Route from 'routes/web3';
import { dynamicAuth } from 'middleware';


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
  MORALIS_API_KEY: string
  DAILY_ALLOWANCE_ENDPOINT: string
  NEYNAR_API_KEY: string
  PAYFLUENCE_NEYNAR_WEBHOOK_URL: string
}

// type Variables = JwtVariables


const app = new Hono<{ Bindings: Bindings }>()
app.fire()

app.use(cors({
  origin: '*',
  allowHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Wallet-Address', 'X-Wallet-Signature'],
  allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// add dynamic.xyz jwt verification to any route with /auth prefix
app.use('/auth/*', dynamicAuth)

export const getUser = async (c: Context) => {
  const email: string = c.get('email' as never)
  const db = database(c.env.DATABASE_URL);
  const user: User = await getUserByEmail(db, email)
  return user
}

app.get('/auth/test', async (c) => {
  const user: User = await getUser(c)
  return new Response(`Authenticated User Id ${user.id}`, { status: 200 })
});


// DASHBOARD ROUTES

app.route('/auth/user', userRoute);
app.route('/auth/tipengine', tipEngineRoute);
app.route('/auth/airdrop', airdropRoute);
app.route('/auth/web3', web3Route);

// PUBLIC ROUTES

app.route('/public', publicRoute);

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
