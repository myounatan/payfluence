import { Hono, HonoRequest } from 'hono'

import users from 'routes/users';
import tipEngines from 'routes/tipengines';
import publicRoute from 'routes/public';

// .dev.vars for dev and cloudflare dashboard for prod
export type Bindings = {
  DATABASE_URL_PROD: string
  DATABASE_URL_STAGING: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.fire()

// DASHBOARD ROUTES
// TODO: need some sort of auth ? dynamic.xyz ?

app.route('/users', users);
app.route('/tipengines', tipEngines);

// PUBLIC ROUTES

app.route('/public', publicRoute);

app.all('*', () => new Response("Route not found", { status: 404 }))

export default app
