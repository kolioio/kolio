/*
 * Kolio iPad — chargé AVANT le code de Kolio.
 *  - repère l'iPad et le mode « application » (écran d'accueil) ;
 *  - retient les fichiers produits par Kolio (sauvegardes, exports) pour
 *    pouvoir les proposer ensuite au partage d'iPadOS (Enregistrer dans
 *    Fichiers, AirDrop, Mail…), les téléchargements classiques étant peu
 *    fiables dans une application installée sur l'écran d'accueil ;
 *  - active le glisser-déposer au doigt.
 */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var iPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var tactile = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || navigator.maxTouchPoints > 0;
  var appli = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var h = document.documentElement;
  if (iPad) h.classList.add('k-ipad');
  if (tactile) h.classList.add('k-tactile');
  if (appli) h.classList.add('k-appli');
  window.KolioIPad = { iPad: iPad, tactile: tactile, appli: appli, fichiers: new Map(), dernierFichier: null, clicNatif: null };

  /* --- Fichiers produits par Kolio --- */
  var creer = URL.createObjectURL.bind(URL);
  URL.createObjectURL = function (obj) {
    var u = creer(obj);
    try { if (obj instanceof Blob) { window.KolioIPad.fichiers.set(u, obj); if (window.KolioIPad.fichiers.size > 20) window.KolioIPad.fichiers.delete(window.KolioIPad.fichiers.keys().next().value); } } catch (_) {}
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
  window.KolioIPad.clicNatif = clicNatif;
  HTMLAnchorElement.prototype.click = function () {
    var href = this.href || '';
    if (this.hasAttribute('download') && /^(blob|data):/.test(href)) {
      var blob = href.indexOf('blob:') === 0 ? window.KolioIPad.fichiers.get(href) : blobDepuisData(href);
      if (blob) {
        var nom = this.getAttribute('download') || 'kolio';
        window.KolioIPad.dernierFichier = { blob: blob, nom: nom, href: href };
        if (typeof window.kolioProposerFichier === 'function') { window.kolioProposerFichier(blob, nom); return; }
      }
    }
    return clicNatif.apply(this, arguments);
  };

  /* --- Glisser-déposer au doigt (appui long) --- */
  if (tactile && window.MobileDragDrop) {
    try {
      window.MobileDragDrop.polyfill({
        holdToDrag: 350,
        forceApply: iPad,
        dragImageTranslateOverride: window.MobileDragDrop.scrollBehaviourDragImageTranslateOverride
      });
      window.addEventListener('touchmove', function () {}, { passive: false });
    } catch (_) {}
  }
})();
