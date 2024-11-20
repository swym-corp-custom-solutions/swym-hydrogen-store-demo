import { json } from "@remix-run/react";
import { CacheNone } from "@shopify/hydrogen";

export const loader = async ({ context }) => {
  const wishlist = await context.swym.fetchWishlist();
  return {wishlist};
};


export const action = async ({ request, context }) => {
  const formData = await request.formData();
  const actionType = formData.get('_action');
  const productId = formData.get('productId');
  const variantId = formData.get('variantId');
  const productUrl = formData.get('productUrl');
  const listId = formData.get('listId');

  let data;
  try {
    data = await context.swym.addToWishlist(productId, variantId, productUrl, listId);
    if(data && data.a && data.a[0]){
      return json({ data: data.a[0] });
    }else{
      json({ error: 'error while add to wishlist' }, { status: 500 });
    }
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};

