/*
 * Kolio tablette — chargé AVANT le code de Kolio.
 * Une seule version pour toutes les tablettes : iPad (Safari), Android (Chrome,
 * Samsung Internet, Firefox…), et toute tablette ou écran tactile récent.
 *  - repère l'appareil, le navigateur et le mode « application » (écran d'accueil) ;
 *  - retient les fichiers produits par Kolio (sauvegardes, exports) pour les
 *    proposer ensuite au partage du système ou au téléchargement ;
 *  - retient la proposition d'installation de Chrome / Edge / Samsung Internet ;
 *  - active le glisser-déposer au doigt.
 */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var mm = function (q) { try { return window.matchMedia && matchMedia(q).matches; } catch (_) { return false; } };
  var iPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var ios = iPad || /iPhone|iPod/.test(ua);
  var android = /Android/i.test(ua);
  var tactile = mm('(pointer:coarse)') || navigator.maxTouchPoints > 0;
  var appli = mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') || mm('(display-mode: minimal-ui)') || navigator.standalone === true;
  var navigateur = /SamsungBrowser/i.test(ua) ? 'samsung' : /Firefox|FxiOS/i.test(ua) ? 'firefox' : /EdgA?\//i.test(ua) ? 'edge'
    : /CriOS|Chrome/i.test(ua) ? 'chrome' : /Safari/i.test(ua) ? 'safari' : 'autre';
  var plateforme = ios ? 'ios' : android ? 'android' : 'autre';
  // Petit écran (téléphone) : Kolio reste utilisable, mais il est pensé pour une tablette
  var petit = Math.min(screen.width || 9999, screen.height || 9999) < 600;
  var h = document.documentElement;
  h.classList.add('k-' + plateforme);
  if (iPad) h.classList.add('k-ipad');
  if (tactile) h.classList.add('k-tactile');
  if (appli) h.classList.add('k-appli');
  if (petit) h.classList.add('k-petit-ecran');

  var K = window.KolioTablette = {
    plateforme: plateforme, iPad: iPad, ios: ios, android: android, navigateur: navigateur, tactile: tactile, appli: appli, petit: petit,
    // Libellés adaptés à l'appareil
    appareil: iPad ? 'cet iPad' : 'cette tablette',
    appareilCourt: iPad ? 'l’iPad' : 'la tablette',
    fichiers: new Map(), dernierFichier: null, clicNatif: null, installation: null
  };
  window.KolioIPad = K; // compatibilité 1.5.x

  /* --- Proposition d'installation (Chrome, Edge, Samsung Internet) --- */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    K.installation = e;
    try { document.dispatchEvent(new Event('kolio-installable')); } catch (_) {}
  });
  window.addEventListener('appinstalled', function () {
    K.installation = null; K.installe = true;
    try { document.dispatchEvent(new Event('kolio-installe')); } catch (_) {}
  });

  /* --- Fichiers produits par Kolio --- */
  var creer = URL.createObjectURL.bind(URL);
  URL.createObjectURL = function (obj) {
    var u = creer(obj);
    try { if (obj instanceof Blob) { K.fichiers.set(u, obj); if (K.fichiers.size > 20) K.fichiers.delete(K.fichiers.keys().next().value); } } catch (_) {}
    return u;
  };
  function blobDepuisData(href) {
    var m = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(href);
    if (!m) return null;
    var txt = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    var o = new Uint8Array(txt.length);
    for (var i = 0; i < txt.length; i++) o[i] = txt.charCodeAt(i) & 255;
    return new Blob([o], { type: m[1] || 'application/octet-stream' });
  }
  var clicNatif = HTMLAnchorElement.prototype.click;
  K.clicNatif = clicNatif;
  HTMLAnchorElement.prototype.click = function () {
    var href = this.href || '';
    if (this.hasAttribute('download') && /^(blob|data):/.test(href) && !this.hasAttribute('data-k-direct')) {
      var blob = href.indexOf('blob:') === 0 ? K.fichiers.get(href) : blobDepuisData(href);
      if (blob) {
        var nom = this.getAttribute('download') || 'kolio';
        K.dernierFichier = { blob: blob, nom: nom, href: href };
        if (typeof window.kolioProposerFichier === 'function') { window.kolioProposerFichier(blob, nom); return; }
      }
    }
    return clicNatif.apply(this, arguments);
  };

  /* --- Glisser-déposer au doigt (appui long) ---
     Safari comme Chrome pour Android ne déclenchent pas le glisser-déposer HTML
     de façon fiable au doigt : la bibliothèque prend le relais dès que l'écran
     tactile est le pointeur principal. */
  if (tactile && window.MobileDragDrop) {
    try {
      window.MobileDragDrop.polyfill({
        holdToDrag: 350,
        forceApply: mm('(pointer:coarse)') || iPad,
        dragImageTranslateOverride: window.MobileDragDrop.scrollBehaviourDragImageTranslateOverride
      });
      window.addEventListener('touchmove', function () {}, { passive: false });
    } catch (_) {}
  }
})();
