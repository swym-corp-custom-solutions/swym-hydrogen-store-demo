import { useContext, useEffect, useState } from 'react';
import './ShareListPopup.css';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { getSharedURL, getWishlistBadgeLetters, validateEmail } from '~/lib/swym/Utils/utilsFunction';
import SWYM_CONFIG from '../../swymconfig';
import { useSwym } from '../../context/SwymContext';

export default function ShareListPopup({ selectedList, onPopupToggle }) {
    const markPublicListFetcher = useFetcher();
    const shareViaEmailFetcher = useFetcher();
    const [senderName, setSenderName] = useState('');
    const [emailValue, setEmailValue] = useState('');
    const [publicLid, setPublicLid] = useState(selectedList?.lid);
    const [emailError, setEmailError] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true);

    const { setWishlistNotification, setShowWishlistNotification } = useSwym();

    let hostName = window.location.host;
    let medium = SWYM_CONFIG.swymSharedMediumCopyLink;
    let sharedurl = getSharedURL(hostName, publicLid);
    useEffect(() => {
        const markListPublic = async () => {
            if (selectedList?.lid) {
              markPublicListFetcher.load(`/wishlist/api/share/marklistpublic?lid=${selectedList.lid}`);
            }
        };
        markListPublic();
    }, [selectedList.lid]);

    useEffect(() => {
        if(selectedList){
            if(markPublicListFetcher.data){
                let { publicListData } = markPublicListFetcher.data;
            }
        }
      }, [markPublicListFetcher.data]);


    const callCopyLink = (e) => {
        //do we need to call context.swym.copyWishlistLink to report copy share link, what is the use
        e.preventDefault();
        let sharedurl = getSharedURL(hostName, selectedList?.lid);
        navigator.clipboard
            .writeText(sharedurl)
            .then(() => {
                console.log({ type: 'success', title: 'Success!', info: 'Link Copied' });
            })
            .catch(() => {
                console.log({ type: 'error', title: 'Error!', info: 'Link could not be copied' });
            });

            setWishlistNotification({ type: 'success', title:'Success', info: `URL to the ${selectedList.lname} copied to clipboard` });
            setShowWishlistNotification(true);
            onPopupToggle(false);
    };

    const onChangeEmail = (e) => {
        setEmailValue(e.target.value);
        const isInvalid = validateEmail(
            e.target.value,
            'Please enter a valid email address',
        );
        setEmailError(isInvalid);
        if (isInvalid) {
            setButtonDisabled(true);
        } else {
            setButtonDisabled(false);
        }
    };

    useEffect(() => {
        if (shareViaEmailFetcher.data) {
            onPopupToggle(false);
            setWishlistNotification({ type: 'success', title:'Success', info: `Email Sent Successfully` });
            setShowWishlistNotification(true);
        }
    }, [shareViaEmailFetcher.data]);

    const handleShareViaEmail = async () => {
        if (!emailValue) {
            setEmailError('Please Enter Email');
            return;
        }

        shareViaEmailFetcher.submit(
            {
                publicLid,
                senderName,
                emailValue
            },
            { method: 'post', action: '/wishlist/api/share/emaillist' }
        );
    };

    return (
        <div>
            <div id="swym-hl-share-list-popup" className="modal" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPopupToggle(false) }}>
                <div className="swym-hl-share-modal-content" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <span className="swym-hl-share-modal-close-btn" onClick={() => onPopupToggle(false)}>&times;</span>
                    <div className="swym-hl-share-heading">
                        Share Wishlist
                    </div>
                    <div className="swym-hl-share-body">
                        <div className="swym-hl-share-content">
                            <label className="swym-input-label">
                                Sender Name
                            </label>
                            <div className="swym-input-label">
                                <input
                                    type="text"
                                    placeholder={"Your Full Name (optional)"}
                                    id="swym-name"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    className="swym-share-wishlist-email swym-input swym-no-zoom-fix swym-input-1"
                                />
                            </div>

                            <label className="swym-input-label">
                                Recipients Email
                            </label>
                            <div className="swym-input-label">
                                <input
                                    type="text"
                                    placeholder={"shopper@example.com"}
                                    id="swym-email"
                                    value={emailValue}
                                    onChange={(e) => onChangeEmail(e)}
                                    className="swym-share-wishlist-name swym-input swym-no-zoom-fix swym-input-1"
                                />
                                {emailError && (
                                    <span className="error-msg" role="alert">
                                        {emailError}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className='swym-hl-share-modal-action'>
                            <button className='swym-hl-bg-color swym-hl-share-modal-action-btn swym-hl-text-color' disabled={buttonDisabled} onClick={(e) => handleShareViaEmail()}>  Share List </button>
                            <button className='swym-hl-bg-outline swym-hl-share-modal-action-btn' onClick={(e) => callCopyLink(e)} >
                                <span style={{ fontSize: '16px' }} > Or share via:</span>
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
