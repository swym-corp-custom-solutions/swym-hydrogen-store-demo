import React, { createContext, useState, useContext } from 'react';
import AddToWishlistPopup from '../components/wishlist/AddToWishlistPopup';
import WishlistNotification from '../components/wishlist/WishlistNotification';

// Create context
const SwymContext = createContext();

// Provide context
export function SwymProvider({ children, wishlist }) {
  console.log('data inside provider ', wishlist);
  const [addToWishlistPopupOpen, setAddToWishlistPopupOpen] = useState(false);
  const [product, setProduct] = useState(null);

  const [showWishlistNotification, setShowWishlistNotification] = useState(false);
  const [wishlistNotification, setWishlistNotification] = useState({ type: 'success', title:'', info: '', image: '' });

  const openAddToWishlistPopup = (product) => {
    setProduct(product);
    setAddToWishlistPopupOpen(true);
  };

  const closeAddToWishlistPopup = () => {
    setAddToWishlistPopupOpen(false);
    setProduct(null);
  };

  const getProductId = () => {
    if (product?.id) {
      return +product?.id.split('Product/')[1];
    }
  };

  const getProductVariantId = () => {
    let variantId;
    if(product && product.selectedVariant){
      variantId = product.selectedVariant.id;
      return +variantId.split('ProductVariant/')[1];
    }
    if (product?.variants?.nodes[0]?.id) {
      let variantId = product.variants.nodes[0].id;
      return +variantId.split('ProductVariant/')[1];
    }
  };

  const getProductUrl = () => {
    if (product?.handle) {
      return origin + '/products/'+ product.handle;
    }
  }
  
  const getProductImage = () => {
    if(product && product.featuredImage){
      return product.featuredImage?.url;
    }else if(product && product.selectedVariant && product.selectedVariant.image){
      return product.selectedVariant.image.url;
    }else if(product && product.images && product.images.nodes[0]){
      return product.images.nodes[0].url;
    }
  }

  return (
    <SwymContext.Provider value={{ addToWishlistPopupOpen, product, wishlist, openAddToWishlistPopup, closeAddToWishlistPopup, setWishlistNotification, setShowWishlistNotification }}>
      {children}
      { addToWishlistPopupOpen && 
        <AddToWishlistPopup title={product?.title} productId={getProductId()} variantId={getProductVariantId()} productUrl={getProductUrl()} image={getProductImage()} onPopupToggle={setAddToWishlistPopupOpen} 
          onAddedToWishlist={(data)=>{
              setWishlistNotification({ type: 'success', title:'Success', info: `Item Added to ${data.lname?data.lname:'Wishlist'}`, image: getProductImage() });
              setShowWishlistNotification(true);
          }}  
          onErrorAddingToWishlist={(data, errorMsg)=>{
            setWishlistNotification({ type: 'error', title:'Error', info: `Error Adding Item to ${data.lname?data.lname:'Wishlist'} - ${errorMsg}`, image: getProductImage() });
            setShowWishlistNotification(true);
          }}
        />
      }
      <WishlistNotification
        open={showWishlistNotification}
        toggleAlertState={setShowWishlistNotification}
        title={wishlistNotification.title}
        image={wishlistNotification.image}
        info={wishlistNotification.info}
        type={wishlistNotification.type}
      />
    </SwymContext.Provider>
  );
}

// Use context hook
export function useSwym() {
  return useContext(SwymContext);
}
