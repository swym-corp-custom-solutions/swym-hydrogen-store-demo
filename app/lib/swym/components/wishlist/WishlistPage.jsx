import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import './WishlistPage.css';
import WishlistItem from './WishlistItem';
import ShareListPopup from './ShareListPopup';
import WishlistNotification from './WishlistNotification';
import { useSwym } from '../../context/SwymContext';

export function EmptyWishlist(){
  return (
    <div style={{display: 'block', textAlign: 'center'}}>
      <br />
      <h3 className="swym-hl-empty-wl-title">Love It? Add To My Wishlist</h3>
      <br />
      <p>
        My Wishlist allows you to keep track of all of your favorites and shopping activity whether you're on your computer, phone, or tablet.
      </p>
      <p className='mt-4'>
        You won't have to waste time searching all over again for that item you loved on your phone the other day - it's all here in one place!
      </p>
      <br />
      <div className='swym-hl-continue-shop-btn swym-hl-bg-color swym-hl-text-color' onClick={()=>{
        window.location.href = '/collections/all'
      }}>Continue Shopping</div>
    </div>
  )
}

export function useWishlistData(selectedList) {
  const listContentFetcher = useFetcher();
  const [listContents, setListContents] = useState([]);

  useEffect(() => {
    const fetchListContents = async () => {
      if (selectedList?.lid) {
        const data = await listContentFetcher.load(`/wishlist/api/list/${selectedList.lid}`);
        if(data){
          setListContents(data.listContents);
        }
      }
    };
    fetchListContents();
  }, [selectedList]);

  return { listContents, listContentFetcher };
}

export default function WishlistPage() {
  const removeItemFetcher = useFetcher();
  const { wishlist, isLoggedIn } = useLoaderData();

  const [selectedList, setselectedList] = useState();
  const [selectedListData, setselectedListData] = useState();

  const [selectedListIndex, setselectedListIndex] = useState(0);
  const [wishlistCreatedLists, setWishlistCreatedLists] = useState([]);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { listContents, listContentFetcher } = useWishlistData(selectedList);
  const { setWishlistNotification, setShowWishlistNotification } = useSwym();

  const handleListValueChange = (e, index) => {
    setselectedListIndex(index);
    e.preventDefault();
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (wishlist && wishlist.length > 0) {
      setselectedList(wishlist[selectedListIndex]);
    }
  }, [wishlist, selectedListIndex]);


  useEffect(() => {
    if(selectedList){
      if(listContentFetcher.data && listContentFetcher.data.listContents){
        setselectedListData(listContentFetcher.data.listContents);
      }
    }
  }, [selectedList, listContentFetcher.data]);

  const toggleMenu = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    if(removeItemFetcher.data){
      setShowWishlistNotification(true);
    }
  }, [removeItemFetcher.data]);

  const removeItemFromWishlist = async (item) => {
    removeItemFetcher.submit(
      {
        productId:item.empi,
        variantId: item.epi,
        productUrl: item.du,
        listId: item.lid,
      },
      { method: 'post', action: '/wishlist/api/remove' }
    );
    setWishlistNotification({ type: 'success', title:'Success', info: `Item removed from wishlist`, image: item.iu });
  };

  return (
    <div className='swym-hl-wl-container'>
      <div className='swym-hl-wl-title'>My Wishlist</div>
      {wishlist.length == 0 && (
          <EmptyWishlist />
      )}
      <div>
      {wishlist && wishlist.length > 1 && (
        <div>
            <div>
              <div className="swym-hl-wl-dropdown-container">
                <div>
                  <button  onClick={toggleMenu} className="swym-hl-wl-list-dropdown-btn">
                    {wishlist &&
                      wishlist.length > 0 &&
                      selectedList && selectedList.lname}
                    {!wishlist ||
                      (wishlist.length == 0 &&
                        'No list found')}
                    <svg
                      className="swym-hl-dropdown-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {isDropdownOpen && (
                  <div className="swym-hl-wl-dropdown-list">
                      {wishlist &&
                        wishlist.length > 0 &&
                        wishlist.map(({lname}, index) => (
                          <a
                            onClick={(e) =>
                              handleListValueChange(e, index)
                            }
                            key={`menu_${index}`}
                            value={selectedListIndex}
                            href="#"
                            className={`swym-hl-wl-dropdown-list-item ${(selectedListIndex == index)?'swym-hl-dropdown-list-item-active':''}`}
                          >
                            {lname}
                          </a>
                        ))}
                  </div>
                )}
              </div>
              <br />
              <br />
            </div>
        </div>
      )}
      </div>
      { selectedList && <div>
        <div className="swym-hl-wl-content-header">
          <h2 className="swym-hl-wl-selected-lname">
            { selectedList.lname}{' '}
            {` (${selectedList.listcontents?.length})`}
          </h2>
          { isLoggedIn && selectedList.listcontents?.length > 0 && (
              <>
                <div
                  className="swym-hl-wishlist-page-share-btn"
                  onClick={(event) => {
                    setOpenShareModal(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlSpace="preserve"
                    width={15}
                    height={15}
                    fill="#035587"
                    viewBox="0 0 458.624 458.624"
                  >
                    <path d="M339.588 314.529a71.683 71.683 0 0 0-38.621 11.239l-112.682-78.67a72.036 72.036 0 0 0 2.798-19.871c0-6.896-.989-13.557-2.798-19.871l109.64-76.547c11.764 8.356 26.133 13.286 41.662 13.286 39.79 0 72.047-32.257 72.047-72.047S379.378 0 339.588 0c-39.79 0-72.047 32.257-72.047 72.047 0 5.255.578 10.373 1.646 15.308l-112.424 78.491c-10.974-6.759-23.892-10.666-37.727-10.666-39.79 0-72.047 32.257-72.047 72.047s32.256 72.047 72.047 72.047c13.834 0 26.753-3.907 37.727-10.666l113.292 79.097a72.108 72.108 0 0 0-2.514 18.872c0 39.79 32.257 72.047 72.047 72.047s72.047-32.257 72.047-72.047-32.257-72.048-72.047-72.048z" />
                  </svg>
                </div>
                {openShareModal && (
                  <ShareListPopup selectedList={selectedList} onPopupToggle={setOpenShareModal} />
                )}
              </>
            )}
        </div>
        <br />
        <div className='swym-hl-wishlist-page-list-container'>
          {selectedListData && selectedListData.length > 0 &&
            selectedListData.map((item) => (
              <WishlistItem
               key={item.epi} productId={item.empi} variantId={item.epi} title={item.dt} product={item} readOnly={false} onRemoveItem={()=>removeItemFromWishlist(item, true)} />
            ))}
        </div>
      </div>}
    </div>
  );
}
