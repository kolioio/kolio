/*
 * Kolio iPad — service worker.
 * Met l'application en cache pour qu'elle s'ouvre sans réseau (en réunion,
 * en déplacement). Il ne voit passer que les fichiers de l'application : les
 * données de Kolio restent dans le stockage de l'iPad et ne transitent jamais
 * par lui.
 *
 * Chaque publication change le nom du cache : la nouvelle version s'installe
 * en arrière-plan et Kolio propose « Mettre à jour » ; l'ancienne reste utilisée
 * tant que l'utilisateur n'a pas accepté.
 */
'use strict';
const CACHE = 'kolio-ipad-1.5.1-dda0405ecb';
const FICHIERS = [
  "./",
  "./LICENCE.txt",
  "./icones/apple-touch-icon.png",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
  "./icones/icone-masquable-512.png",
  "./index.html",
  "./kolio-app.js",
  "./kolio-ipad-avant.js",
  "./kolio-ipad.css",
  "./kolio-ipad.js",
  "./manifest.webmanifest",
  "./vendor/LICENCE-SheetJS.txt",
  "./vendor/LICENCE-mobile-drag-drop.txt",
  "./vendor/fonts.css",
  "./vendor/fonts/inter-latin-300-normal.woff2",
  "./vendor/fonts/inter-latin-400-italic.woff2",
  "./vendor/fonts/inter-latin-400-normal.woff2",
  "./vendor/fonts/inter-latin-500-normal.woff2",
  "./vendor/fonts/inter-latin-600-normal.woff2",
  "./vendor/fonts/inter-latin-ext-300-normal.woff2",
  "./vendor/fonts/inter-latin-ext-400-normal.woff2",
  "./vendor/fonts/inter-latin-ext-500-normal.woff2",
  "./vendor/fonts/inter-latin-ext-600-normal.woff2",
  "./vendor/fonts/sora-latin-300-normal.woff2",
  "./vendor/fonts/sora-latin-400-normal.woff2",
  "./vendor/fonts/sora-latin-500-normal.woff2",
  "./vendor/fonts/sora-latin-600-normal.woff2",
  "./vendor/fonts/sora-latin-700-normal.woff2",
  "./vendor/fonts/sora-latin-800-normal.woff2",
  "./vendor/fonts/sora-latin-ext-300-normal.woff2",
  "./vendor/fonts/sora-latin-ext-400-normal.woff2",
  "./vendor/fonts/sora-latin-ext-500-normal.woff2",
  "./vendor/fonts/sora-latin-ext-600-normal.woff2",
  "./vendor/fonts/sora-latin-ext-700-normal.woff2",
  "./vendor/fonts/sora-latin-ext-800-normal.woff2",
  "./vendor/jszip.min.js",
  "./vendor/mobile-drag-drop-scroll.min.js",
  "./vendor/mobile-drag-drop.min.js",
  "./vendor/xlsx.full.min.js"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k.startsWith('kolio-ipad-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => { if (e.data === 'activer') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // rien d'extérieur n'est servi ni mis en cache
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./', { ignoreSearch: true }).then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r || fetch(req)));
});
