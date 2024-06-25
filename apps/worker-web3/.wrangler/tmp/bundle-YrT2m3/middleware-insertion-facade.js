				import worker, * as OTHER_EXPORTS from "/Users/matthew/Projects/payfluence/apps/worker-web3/src/index.ts";
				import * as __MIDDLEWARE_0__ from "/Users/matthew/Projects/payfluence/node_modules/.pnpm/wrangler@3.60.3_@cloudflare+workers-types@4.20240605.0_bufferutil@4.0.8_utf-8-validate@6.0.4/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts";
import * as __MIDDLEWARE_1__ from "/Users/matthew/Projects/payfluence/node_modules/.pnpm/wrangler@3.60.3_@cloudflare+workers-types@4.20240605.0_bufferutil@4.0.8_utf-8-validate@6.0.4/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts";

				export * from "/Users/matthew/Projects/payfluence/apps/worker-web3/src/index.ts";

				export const __INTERNAL_WRANGLER_MIDDLEWARE__ = [
					...(OTHER_EXPORTS.__INJECT_FOR_TESTING_WRANGLER_MIDDLEWARE__ ?? []),
					__MIDDLEWARE_0__.default,__MIDDLEWARE_1__.default
				]
				export default worker;