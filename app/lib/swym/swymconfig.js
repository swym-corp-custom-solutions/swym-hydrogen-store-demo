const SWYM_CONFIG = {
    REST_API_KEY: import.meta.env.VITE_SWYM_REST_API_KEY,
    SWYM_ENDPOINT: import.meta.env.VITE_SWYM_ENDPOINT,
    PID:  import.meta.env.VITE_SWYM_PID,
    defaultWishlistName: 'My Wishlist',
    alertTimeOut: 5000,
    swymSharedURL: 'shared-wishlist',
    swymSharedMediumCopyLink: 'copylink',
  };

  export default SWYM_CONFIG;
  