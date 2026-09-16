(function () {
  'use strict';
  var endpoint = 'https://prakkie-api-prod.azurewebsites.net/v1/website/stats';
  var page = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') === '/download' ? 'download' : 'home';
  function track(event, store) {
    var body = JSON.stringify({ event: event, page: page, store: store || 'none' });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, body)) return;
      if (typeof fetch === 'function') fetch(endpoint, {
        method: 'POST', body: body, keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer',
      }).catch(function () {});
    } catch (_) { /* Measurement must never prevent opening a store. */ }
  }
  window.PrakkieStats = { track: track };
  track('view');
  function clicked(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    try {
      var url = new URL(link.href);
      if (url.hostname === 'apps.apple.com' && /\/id6804312072\/?$/.test(url.pathname)) track('click', 'apple');
      if (url.hostname === 'play.google.com' && url.pathname === '/store/apps/details' && url.searchParams.get('id') === 'nl.mijnprakkie.app') track('click', 'google');
    } catch (_) {}
  }
  document.addEventListener('click', clicked);
  document.addEventListener('auxclick', clicked);
}());
