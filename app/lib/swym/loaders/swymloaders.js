import { CacheNone } from "@shopify/hydrogen";

export const fetchEmail =  async ({context}) => {
    
    let email;

    const isLoggedIn = await context.customerAccount.isLoggedIn();

    if (isLoggedIn) {
        const CUSTOMER_QUERY = `
        query getCustomer{
          customer{
            emailAddress{
              emailAddress
            }
          }
        }
      `;
  
      const {data, errors} = await context.customerAccount.query(
        CUSTOMER_QUERY,
      );
    
      if (data.customer) {
        email = data.customer && data.customer?.emailAddress?.emailAddress;
      }
    }

    return { email };
}

export const syncUser = async ({ context }) => {
    let data;
    const { email } = await fetchEmail({ context });
    if(email){
        data = await context.swym.guestValidateSync(email);
    }
    return { data, email };
}

export const loadwishlistData = async ({ context, request }) => {
    const isLoggedIn = await context.customerAccount.isLoggedIn();
    const { data, email } = await syncUser({ context });
    const wishlist = await context.swym.fetchWishlist();
    return { wishlist, email, isLoggedIn };
};

export const loadShareWishlistData = async ({ context, request }) => {
    const url = new URL(request.url);
    const hkey = url.searchParams.get("hkey");
    const lid = url.searchParams.get("lid");
    await syncUser({ context });
    const listContent = await context.swym.fetchListWithContents(lid);
    return { listContent };
};