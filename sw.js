const CACHE_VERSION = "v26";
const CACHE_NAME = `mobywatel-access-${CACHE_VERSION}`;
const CACHE_VERSION_QUERY_KEY = "__swv";

const STATIC_ASSETS = [
  "/index.html",
  "/login.html",
  "/documents.html",
  "/dowod.html",
  "/diia.html",
  "/qr.html",
  "/prawojazdy.html",
  "/legszk.html",
  "/legstu.html",
  "/services.html",
  "/profiledata.html",
  "/more.html",
  "/favicon.ico",
  "/icon.png",
  "/manifest.json",
];

const CSS_ASSETS = [
  "/css/main.css",
  "/css/common.css",
  "/css/guard.css",
  "/css/theme.css",
  "/css/overlay-camera.css",
  "/css/pages/login.css",
  "/css/pages/documents.css",
  "/css/pages/dowod.css",
  "/css/pages/diia.css",
  "/css/pages/qr.css",
  "/css/pages/prawojazdy.css",
  "/css/pages/legszk.css",
  "/css/pages/legstu.css",
  "/css/pages/services.css",
  "/css/pages/profiledata.css",
  "/css/pages/more.css",
];

const JS_ASSETS = [
  "/js/guard.js",
  "/js/theme-init.js",
  "/js/theme.js",
  "/js/header.js",
  "/js/navigation.js",
  "/js/qrcode.min.js",
  "/js/pages/login.js",
  "/js/pages/documents.js",
  "/js/pages/dowod.js",
  "/js/pages/diia.js",
  "/js/pages/qr.js",
  "/js/pages/prawojazdy.js",
  "/js/pages/legszk.js",
  "/js/pages/legstu.js",
  "/js/pages/services.js",
  "/js/pages/profiledata.js",
  "/js/pages/more.js",
];

const FONT_ASSETS = [
  "/assets/fonts/roboto_400_latin.woff2",
  "/assets/fonts/roboto_500_latin.woff2",
  "/assets/fonts/roboto_700_latin.woff2",
  "/assets/fonts/roboto_400_latinext.woff2",
  "/assets/fonts/roboto_500_latinext.woff2",
  "/assets/fonts/roboto_700_latinext.woff2",
];

const IMAGE_ASSETS = [
  "/assets/orzel/godlo%20back.png",
  "/assets/orzel/godlo%20top.png",
  "/assets/orzel/qr_grain.png",
  "/assets/dowod/mid_background_main.webp",
];

const ICON_ASSETS = [
  "/assets/icons/aa001_home.svg",
  "/assets/icons/aa002_delete.svg",
  "/assets/icons/aa003_id.svg",
  "/assets/icons/aa004_ukraine.svg",
  "/assets/icons/aa005_qr.svg",
  "/assets/icons/aa006_school.svg",
  "/assets/icons/aa007_student.svg",
  "/assets/icons/aa008_change_password.svg",
  "/assets/icons/aa009_fingerprint.svg",
  "/assets/icons/aa010_license.svg",
  "/assets/icons/ab001_person.svg",
  "/assets/icons/ab002_settings.svg",
  "/assets/icons/ab003_info.svg",
  "/assets/icons/ab004_arrow_left.svg",
  "/assets/icons/ab005_search.svg",
  "/assets/icons/ab006_add.svg",
  "/assets/icons/ab007_chevron_up.svg",
  "/assets/icons/ab008_chevron_down.svg",
  "/assets/icons/ab009_x_mark.svg",
  "/assets/icons/ab010_camera.svg",
  "/assets/icons/ab011_more_vertical.svg",
  "/assets/icons/b001_poland_flag.svg",
  "/assets/icons/b002_ukraine_flag.svg",
  "/assets/icons/b003_mf.svg",
  "/assets/icons/b004_mw.svg",
  "/assets/icons/b005_scan.svg",
  "/assets/icons/b006_eye.svg",
  "/assets/icons/b007_flash.svg",
  "/assets/icons/b008_rotate_camera.svg",
  "/assets/icons/b009_check_mark_v3.svg",
];

const PUBLIC_ASSETS = [
  ...STATIC_ASSETS,
  ...CSS_ASSETS,
  ...JS_ASSETS,
  ...FONT_ASSETS,
  ...IMAGE_ASSETS,
  ...ICON_ASSETS,
];

function toVersionedAssetUrl(assetPath) {
  const separator = assetPath.includes("?") ? "&" : "?";
  return `${assetPath}${separator}${CACHE_VERSION_QUERY_KEY}=${encodeURIComponent(
    CACHE_VERSION,
  )}`;
}

const PRECACHE_REQUESTS = PUBLIC_ASSETS.map(
  (assetPath) =>
    new Request(toVersionedAssetUrl(assetPath), { cache: "reload" }),
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_REQUESTS);
        await self.skipWaiting();
      } catch (err) {
        await self.skipWaiting();
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        );
        await self.clients.claim();
      } catch (err) {
        await self.clients.claim();
      }
    })(),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request, { ignoreSearch: true });
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const response = await fetch(request);
    if (response && response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/css/") ||
    url.pathname.startsWith("/js/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff2|woff|ttf|ico)$/i)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.endsWith(".html") || url.pathname === "/") {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cached) => {
        return (
          cached ||
          new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          })
        );
      });
    }),
  );
});
