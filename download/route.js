(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var isApple = /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var link = document.getElementById(isApple ? 'apple-download' : 'android-download');
  // Fixed destinations only. Unknown devices retain both download buttons.
  // No pixel, cookies, identifiers or arbitrary query-string redirects.
  if ((isApple || isAndroid) && link) {
    if (window.PrakkieStats) window.PrakkieStats.track('redirect', isApple ? 'apple' : 'google');
    window.location.replace(link.href);
  }
}());
