import SharedWishlistPage from '~/lib/swym/components/wishlist/SharedWishlistPage';
import { loadShareWishlistData } from '~/lib/swym/loaders/swymloaders';


export const loader = loadShareWishlistData;

export default SharedWishlistPage;