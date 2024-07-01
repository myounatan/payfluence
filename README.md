# Payfluence

Memecoin to Dreamcoin. Onchain Summer Buildathon 2024. Backdrop Build.

Built with Turborepo.

## What's inside?

This Turborepo includes the following packages and apps:

### Apps

- `dashboard`: a [Next.js](https://nextjs.org/) app for the dashboard
- `public-page`: a [Next.js](https://nextjs.org/) app for the airdrop claim page
- `worker-dynamicxyz`: a [Cloudflare Worker](https://cloudflare.com/) app that connects to [Dynamic.xyz](https://dynamic.xyz/)
- `worker-neynar`: a [Cloudflare Worker](https://cloudflare.com/) app that connects to Neynar webhooks to read new Farcaster casts
- `worker-payfluence`: a [Cloudflare Worker](https://cloudflare.com/) app that deploys a simple Payfluence API to query the database through an authenticated route
- `worker-daily-allowance`: a [Cloudflare Worker](https://cloudflare.com/) app that calculates daily allowance based on Farcaster reputation and post reaction stats
- `worker-lemonsqueezy`: a [Cloudflare Worker](https://cloudflare.com/) app that connects to Lemonsqueezy to support SaaS payments (not used in final)

### Packages
- `@repo/eslint-config`: ESLint configurations used throughout the monorepo
- `@repo/jest-presets`: Jest configurations
- `@repo/logger`: isomorphic logger (a small wrapper around console.log)
- `@repo/ui`: a [ShadCN](https://ui.shadcn.com/) component library to hold all the primitive components used throughout the app
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo
- `@repo/database`: a [Drizzle](https://orm.drizzle.team/) PostgreSQL database, hosted on [Supabase](https://supabase.com/)
- `@repo/contracts`: a [Hardhat](https://hardhat.org/) project to create and deploy Ethereum smart contracts

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Jest](https://jestjs.io) test runner for all things JavaScript
- [Prettier](https://prettier.io) for code formatting

### How to use

Use `pnpm` to install packages
```
pnpm i
```

To add ShadCN components, run
```
pnpm ui:add component-name
```

To build the project, run
```
pnpm run build
```

To spin up the entire dev environment, run
```
pnpm run dev
```

To spin up a single app (and its dependencies), run the above command with a filter
```
pnpm run dev --filter=dashboard
```
