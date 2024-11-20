import { json } from "@remix-run/server-runtime";
import { CacheNone } from "@shopify/hydrogen";

export const loader = async ({ params, context }) => {
  const { lid } = params;
  if (!lid) {
    throw new Response("List ID is required", { status: 400 });
  }

  try {
    
    const listContents = [];

    const listData = await context.swym.fetchListWithContents(lid, { cache: CacheNone() });

    
    for (const item of listData.items) {
      let { empi, epi } = item;
      const response = await context.storefront.query(PRODUCT_QUERY, {
        variables: {productId: `gid://shopify/Product/${empi}`, variantId: `gid://shopify/ProductVariant/${epi}`},
      });
  
      
      const productData = response.product;
      if (productData) {
        const selectedVariant = productData.variants.edges.find(variant => variant.node.id === `gid://shopify/ProductVariant/${epi}`);
        const variantData = selectedVariant?.node;
        const iu = variantData.image?.url;
        listContents.push({
          ...item,
          productData,
          selectedVariant,
          iu,
          dt: productData.title,
          bt: productData.vendor,
          variantId: variantData?.id,
          variantTitle: variantData?.title,
          pr: variantData?.price?.amount,
          currency: variantData?.price?.currencyCode,
        });
      }
    }

    return json({ listContents });
  } catch (error) {
    console.error("Error fetching list contents:", error);
    throw new Response("Failed to fetch list contents", { status: 500 });
  }
};

const PRODUCT_QUERY = `
  query getProductDetails($productId: ID!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    product(id: $productId) {
      id
      title
      vendor
      description
      handle
      images(first: 5) {
        edges {
          node {
            src
            altText
          }
        }
      }
      variants(first: 100){
        edges {
          node {
            id
            title
            availableForSale
            compareAtPrice {
              amount
              currencyCode
            }
            id
            image {
              __typename
              id
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
            }
            selectedOptions {
              name
              value
            }
            sku
            title
            unitPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
