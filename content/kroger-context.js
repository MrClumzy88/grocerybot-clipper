// Runs at document_start on Kroger-family sites, before the page's own code.
//
// Kroger's coupon API refuses requests that don't say which store and pickup
// location you use ("LAF objects required"). The site keeps that in memory and
// attaches it to every /atlas/ request as headers, so this records the latest
// values the site itself sent for the adapter (content/kroger.js) to reuse.

(() => {
  // Not x-kroger-channel: the site sets it several times per request, so the
  // recorded value comes out as "WEB, WEB, WEB", which the API rejects. The
  // adapter sets it itself.
  const WANTED = ["x-laf-object", "x-modality", "x-modality-type", "x-facility-id", "x-geo-location-v1"];
  const ctx = (window.__gbcKrogerCtx = {});
  const remember = (url, name, value) => {
    if (/\/atlas\//.test(String(url)) && WANTED.includes(String(name).toLowerCase())) ctx[name.toLowerCase()] = value;
  };

  const open = XMLHttpRequest.prototype.open;
  const setHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__gbcUrl = url;
    return open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    remember(this.__gbcUrl, name, value);
    return setHeader.apply(this, arguments);
  };

  const fetch_ = window.fetch;
  window.fetch = function (input, init) {
    try {
      const url = typeof input === "string" ? input : input?.url;
      const headers = new Headers(init?.headers || (typeof input === "object" ? input.headers : undefined));
      headers.forEach((value, name) => remember(url, name, value));
    } catch {}
    return fetch_.apply(this, arguments);
  };
})();
