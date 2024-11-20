import {redirect} from '@shopify/remix-oxygen';
import { REG_ID } from '~/lib/swym/swymConstants';

/**
 * @param {AppLoadContext} context
 */
export async function doLogout(context) {
  context.session.unset(REG_ID);
  return context.customerAccount.logout();
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params}) {
  const locale = params.locale;
  return redirect(locale ? `/${locale}` : '/');
}

/**
 * @param {ActionFunctionArgs}
 */
export const action = async ({context}) => {
  return doLogout(context);
};

/** @typedef {import('@shopify/remix-oxygen').ActionFunction} ActionFunction */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
