import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import './SharedWishlistPage.css';
import WishlistItem from './WishlistItem';

export function EmptyWishlist(){
  return (
    <div style={{display: 'block', textAlign: 'center'}}>
      <br />
      <h5>Shared list dosen't have any item to show here :(</h5>
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
  const { listContent } = useLoaderData();
  const [selectedList, setselectedList] = useState();
  const [selectedListData, setselectedListData] = useState();
  const [senderEmail, setSenderEmail] = useState('admin@swymcorp.com');
  const { listContents, listContentFetcher } = useWishlistData(selectedList);

  useEffect(() => {
    if (listContent && listContent.list) {
      setselectedList(listContent.list);
    }
  }, [listContent]);


  useEffect(() => {
    if(selectedList){
      if(listContentFetcher.data && listContentFetcher.data.listContents){
        setselectedListData(listContentFetcher.data.listContents);
        if(selectedList.userinfo?.em){
          setSenderEmail(selectedList.userinfo?.em);
        }
      }
    }
  }, [selectedList, listContentFetcher.data]);


  return (
    <div className='swym-hl-wl-container'>
      { selectedList && <div>
        <div className="swym-hl-wl-content-header">
          <h3 className="swym-hl-wl-selected-lname">
            { selectedList.lname}
          </h3>
        </div>
        <br />
        {selectedListData && selectedListData.length > 0 && (
          <p className='swym-hl-wishlist-shared-info'> {senderEmail} wanted you to take a look at his collection  { selectedList.lname}</p>
        )}
        <div className='swym-hl-wishlist-page-list-container'>
          {selectedListData && selectedListData.length > 0 &&
            selectedListData.map((item) => (
              <WishlistItem key={item.epi} productId={item.empi} variantId={item.epi} title={item.dt} product={item} readOnly={true} />
            ))
          }
        </div>
      </div>}
      {!selectedList || ( selectedList.listcontents &&  selectedList.listcontents.length == 0 ) && (
        <EmptyWishlist />
      )}
    </div>
  );
}
