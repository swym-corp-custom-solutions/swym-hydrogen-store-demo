import { createWithCache, CacheNone } from '@shopify/hydrogen';
import { json } from "@remix-run/server-runtime";
import { v4 as uuidv4 } from "uuid";
import SWYM_CONFIG from '~/lib/swym/swymconfig';
import { REG_ID, SESSION_ID } from '~/lib/swym/swymConstants';


export function createSwymApiClient({
  env,
  request,
  session,
  cache,
  waitUntil,
}) {

  const withCache = createWithCache({
    cache,
    waitUntil,
    request
  });


  async function ensureRegId() {
    if (!session.get(REG_ID)) {
      await generateRegId();
    }
  }

  async function generateRegId(options = { cache: CacheNone() }) {
    const url = new URL(request.url);
    const useremail = url.searchParams.get("useremail");

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/storeadmin/v3/user/generate-regid`;
    const encodedCredentials = btoa(`${SWYM_CONFIG.PID}:${SWYM_CONFIG.REST_API_KEY}`);

    const searchParams = {
      useragenttype: "swymHeadlessApp",
      ...(useremail ? { useremail } : { uuid: uuidv4() }),
    };

    try {
      const chacheResponse = await withCache.fetch(
        swymApiEndpoint,
        {
          method: "POST",
          headers: { "Authorization": `Basic ${encodedCredentials}`, "Content-Type": "application/x-www-form-urlencoded", },
          body: new URLSearchParams(searchParams),
        }, {
        cacheKey: "swym-generate-regid",
        cacheStrategy: options.cache,
        displayName: "generateRegId"
      }
      );

      if (!chacheResponse.response.ok) {
        throw new Error("Failed to generate regid");
      }

      const data = chacheResponse.data;
      session.set(SESSION_ID, data.sessionid);
      session.set(REG_ID, data.regid);

      return data;
    } catch (error) {
      console.error("Error generating regid:", error.message);
      throw new Error("Server error while generating regid", error);
    }
  }

  async function createList(lname = SWYM_CONFIG.defaultWishlistName, options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/create?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      lname, regid, sessionid
    });

    const chacheResponse = await withCache.fetch(
      swymApiEndpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'user-agent': 'headlesswebApp', },
        body,
      },
      {
        cacheKey: "swym-createList",
        cacheStrategy: options.cache,
        displayName: "createList"
      }
    );

    if (!chacheResponse.response.ok) {
      throw new Error('Failed to create wishlist');
    }

    return chacheResponse.data;
  }


  async function updateList(productId, variantId, productUrl, lid, options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/update-ctx?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      regid,
      sessionid,
      lid,
      a: `[{ "epi":${variantId}, "empi": ${productId}, "du":"${productUrl}" , "cprops": {"ou":"${productUrl}"}, "note": null, "qty": 1 }]`,
    });

    const chacheResponse = await withCache.fetch(
      swymApiEndpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'user-agent': 'headlesswebApp', },
        body,
      },
      {
        cacheKey: "swym-update-list",
        cacheStrategy: options.cache,
        displayName: "updateList"
      }
    );

    if (!chacheResponse.response.ok) {
      throw new Error('Failed to update wishlist');
    }

    return chacheResponse.data;
  }


  async function addToWishlist(productId, variantId, productUrl, customLid, options = { cache: CacheNone() }) {
    await ensureRegId();

    if (customLid) {
      return updateList(productId, variantId, productUrl, customLid);
    }

    const wishlist = await fetchWishlist();
    let lid = (wishlist && wishlist.length) ? wishlist[0].lid : null;

    if (!lid) {
      const newList = await createList();
      lid = newList.lid;
    }

    return updateList(productId, variantId, productUrl, lid, options);
  }

  async function removeFromWishlist(productId, variantId, productUrl, lid, options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/update-ctx?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      regid,
      sessionid,
      lid,
      d: `[{ "epi":${variantId}, "empi": ${productId}, "du":"${productUrl}"}]`,
    });

    const chacheResponse = await withCache.fetch(
      swymApiEndpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'user-agent': 'headlesswebApp', },
        body,
      },
      {
        cacheKey: "swym-remove-wishlist",
        cacheStrategy: options.cache,
        displayName: "removeFromWishlist"
      }
    );

    if (!chacheResponse.response.ok) {
      throw new Error('Failed to remove item from wishlist');
    }

    return chacheResponse.data;
  }

  async function fetchWishlist(options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/fetch-lists?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      regid,
      sessionid,
    });

    try {
      const chacheResponse = await withCache.fetch(swymApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', },
        body,
      }, {
        cacheKey: "swym-fetch-list",
        cacheStrategy: options.cache,
        displayName: "fetchWishList"
      });

      if (!chacheResponse.response.ok) {
        throw new Error("Failed to load wishlist");
      }

      return chacheResponse.data;
    } catch (error) {
      return json({ error: error.message }, { status: 500 });
    }
  }

  async function fetchListWithContents(lid, options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/fetch-list-with-contents?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      regid,
      sessionid,
      lid
    });

    const chacheResponse = await withCache.fetch(
      swymApiEndpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
      {
        cacheKey: "swym-fetch-listwith-contents",
        cacheStrategy: options.cache,
        displayName: "fetchListWithContents"
      }
    );

    if (!chacheResponse.response.ok) {
      throw new Error('Failed to fetch list contents');
    }

    return chacheResponse.data;
  }


  async function guestValidateSync(useremail, options = { cache: CacheNone() }) {
    await ensureRegId();

    let regid = session.get(REG_ID);
    let useragenttype = 'swymHeadlessApp';

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/storeadmin/v3/user/guest-validate-sync`;
    const body = new URLSearchParams({
      regid,
      useremail,
      useragenttype
    });


    const apiKey = SWYM_CONFIG.REST_API_KEY;
    const pid = SWYM_CONFIG.PID;
    const encodedCredentials = btoa(`${pid}:${apiKey}`);

    try {
      const chacheResponse = await withCache.fetch(
        swymApiEndpoint,
        {
          method: "POST",
          headers: { "Authorization": `Basic ${encodedCredentials}`, "Content-Type": "application/x-www-form-urlencoded", },
          body,
        },
        {
          cacheKey: "swym-guest-validate-sync",
          cacheStrategy: options.cache,
          displayName: "guestValidateSync"
        }
      );

      if (!chacheResponse.response.ok) {
        throw new Error("Failed to sync");
      }

      const data = chacheResponse.data;
      session.set(REG_ID, data.regid);

      return data;
    } catch (error) {
      return json({ error: error.message }, { status: 500 });
    }
  }

  async function fetchPublicList(lid, options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/markPublic?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      lid, regid, sessionid
    });


    const chacheResponse = await withCache.fetch(
      swymApiEndpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
      {
        cacheKey: "swym-fetch-public-list",
        cacheStrategy: options.cache,
        displayName: "fetchPublicList"
      }
    );

    if (!chacheResponse.response.ok) {
      throw new Error("Failed to mark list as public");
    }

    return chacheResponse.data;
  }

  async function shareWishlistViaEmail(lid, senderName, emailValue, options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/emailList?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      regid,
      sessionid,
      lid,
      fromname: senderName,
      toemail: emailValue,
    });

    const chacheResponse = await withCache.fetch(
      swymApiEndpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
      {
        cacheKey: "swym-share-wishlist-via-email",
        cacheStrategy: options.cache,
        displayName: "shareWishlistViaEmail"
      }
    );

    if (!chacheResponse.response.ok) {
      throw new Error("Failed to share wishlist via email");
    }

    return chacheResponse.data;
  }

  async function copyWishlistLink(lid, medium, shareListSenderName, options = { cache: CacheNone() }) {
    await ensureRegId();

    let sessionid = session.get(SESSION_ID);
    let regid = session.get(REG_ID);

    const swymApiEndpoint = `${SWYM_CONFIG.SWYM_ENDPOINT}/api/v3/lists/reportShare?pid=${encodeURIComponent(SWYM_CONFIG.PID)}`;
    const body = new URLSearchParams({
      regid,
      sessionid,
      lid,
      fromname: shareListSenderName,
      medium,
    });

    const chacheResponse = await withCache.fetch(
      swymApiEndpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
      {
        cacheKey: "swym-copy-wishlist-link",
        cacheStrategy: options.cache,
        displayName: "copyWishlistLink"
      }
    );

    if (!chacheResponse.response.ok) {
      throw new Error("Failed to copy wishlist link");
    }

    return chacheResponse.data;
  }

  return { generateRegId, createList, updateList, addToWishlist, removeFromWishlist, fetchWishlist, fetchListWithContents, guestValidateSync, fetchPublicList, shareWishlistViaEmail, copyWishlistLink };
}
