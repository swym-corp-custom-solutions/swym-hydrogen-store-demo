import SWYM_CONFIG from '../swymconfig';

export function getSharedURL(hostname, lid) {
  return `${hostname}/${SWYM_CONFIG.swymSharedURL}?hkey=${lid}&lid=${lid}`;
}

export function validateEmail(email, errorMsg) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(String(email).toLowerCase())) {
    return errorMsg;
  }
}

export function getWishlistBadgeLetters(wishlistName, defaultText) {
  if (!wishlistName) {
    return defaultText;
  }
  const badgeTextArr = wishlistName.trim().split(' ');
  let letters = defaultText;
  if (badgeTextArr.length >= 1) {
    letters = badgeTextArr[1]
      ? badgeTextArr[0][0] + badgeTextArr[1][0]
      : badgeTextArr[0][0];
  }
  return letters;
}
