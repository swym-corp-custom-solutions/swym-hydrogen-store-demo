import React, { useState, useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import AddToWishlistPopup from './AddToWishlistPopup';
import './WishlistButton.css';
import WishlistNotification from './WishlistNotification';
import { useSwym } from '../../context/SwymContext';


function WishlistIcon({ style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      width="20px"
      fill="currentColor"
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      version="1.1"
      viewBox="0 0 64 64"
      xmlSpace="preserve"
      style={style}
    >
      <path fill="none" d="M-64 -256H1216V544H-64z"></path>
      <path
        fillRule="nonzero"
        d="M43.046 9.05c5.137.117 9.856 3.451 11.782 8.485 2.392 6.249.678 13.452-2.495 19.624-3.792 7.375-10.79 12.703-17.966 17.288 0 0-2.796 1.351-5.516-.403-9.246-6.021-17.877-13.963-20.318-24.82C6.676 20.966 9.694 10.628 19.115 9.19c4.72-.721 11.109 2.766 12.808 5.869 1.657-3.095 6.565-5.884 10.694-6.008.215-.002.214-.003.429-.001z"
      ></path>
    </svg>
  );
}

// WishlistButton Component
const WishlistButton = ({ product, buttonType, addToMultiList }) => {
  const [wishlisted, setwishlisted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToWishlistPopupOpen, openAddToWishlistPopup, wishlist } = useSwym();

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



  useEffect(()=>{
    document.body.style.overflowY =  addToWishlistPopupOpen? 'hidden':'auto';
  },[addToWishlistPopupOpen]);

  useEffect(() => {
    if(wishlist && wishlist.length > 0){
      checkButtonWishlistState();
    }
  }, [wishlist]);

  // useEffect(() => {
  //   if(wishlist && wishlist.length > 0){
  //     checkButtonWishlistState();
  //   }
  // }, [])

  const checkButtonWishlistState = async () => {

    let wishlisted = false;
    let productId = getProductId();
    let variantId = getProductVariantId();

    wishlist && wishlist.length && wishlist?.forEach(list=>{
        list.listcontents.forEach(item=>{
            if(item.empi == productId && item.epi == variantId){
                wishlisted = true;
            }
        })
    });
    setwishlisted(wishlisted);
  }

  // Open Modal
  const openModal = (e) => {
      e.preventDefault();
      e.stopPropagation();
    //setIsModalOpen(true);
    openAddToWishlistPopup(product);
  };

  // Close Modal
  const closeModal = () => {
    //setIsModalOpen(false);
  };

  return (
    <>
       <div onClick={openModal} className={ ` ${buttonType != 'icon'?'swym-hl-bg-color':'swym-hl-wl-icon'}  swym-hl-wl-btn  ${wishlisted?'swym-hl-product-wishlisted':'swym-hl-text-color'} swym-hl-btn-center-align`}>
        { ( buttonType == 'icon' || buttonType == 'icontext' ) && <WishlistIcon style={{ marginRight: '5px'}} /> }
        { ( buttonType != 'icon' ) && <span className='swym-hl-text-color'>{wishlisted?'Added':'Add'} to Wishlist</span> }
      </div>
    </>
  );
};

export default WishlistButton;
