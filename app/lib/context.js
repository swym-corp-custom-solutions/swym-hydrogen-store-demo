import {cartGetIdDefault, cartSetIdDefault, createCartHandler, createCustomerAccountClient, createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import { createSwymApiClient } from './swym/api/createSwymApiClient.server';

/**
 * The context implementation is separate from server.ts
 * so that type can be extracted for AppLoadContext
 * @param {Request} request
 * @param {Env} env
 * @param {ExecutionContext} executionContext
 */
export async function createAppLoadContext(request, env, executionContext) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: {language: 'EN', country: 'US'},
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  const customerAccount = createCustomerAccountClient({
    waitUntil,
    request,
    session,
    customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
    shopId: env.SHOP_ID
  });

  const swym = createSwymApiClient({ cache, waitUntil, env, request, session });
  return {
    ...hydrogenContext,
    swym,
    customerAccount
    // declare additional Remix loader context
  };
}
