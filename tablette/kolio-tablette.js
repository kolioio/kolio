/*
 * Kolio tablette — chargé APRÈS le code de Kolio.
 * Adapte ce qui ne fonctionne pas tel quel dans une application web sur tablette
 * (iPad, Android, autres) :
 *   1. fichiers produits (sauvegardes, exports) → partage du système ou téléchargement ;
 *   2. aperçu avant impression / PDF → affiché dans Kolio, impression par le système ;
 *   3. sauvegardes du logiciel PC (export complet, pièces jointes) → importables ;
 *   4. verrouillage dès que la tablette passe à autre chose, si un code est défini ;
 *   5. installation sur l'écran d'accueil, stockage persistant, mises à jour hors ligne ;
 *   6. bouton « retour » d'Android : ferme la fenêtre ouverte au lieu de quitter Kolio ;
 *   7. libellés adaptés à l'appareil (⌘ sur iPad, textes propres au PC).
 */
(function () {
  'use strict';
  var K = window.KolioTablette || window.KolioIPad || { plateforme: 'autre', iPad: false, tactile: false, appli: false, appareil: 'cette tablette', appareilCourt: 'la tablette' };
  var VERSION = '1.6.1';
  var IOS = K.plateforme === 'ios', ANDROID = K.plateforme === 'android';

  /* ======================= 1. Fichiers → partage / téléchargement ======================= */
  function feuille(id, html) {
    var m = document.getElementById(id);
    if (!m) { m = document.createElement('div'); m.className = 'modal-overlay'; m.id = id; document.body.appendChild(m); }
    m.innerHTML = html;
    m.classList.add('open');
    return m;
  }
  var octets = function (n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' Ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo'; };
  function telecharger(blob, nom) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nom; a.setAttribute('data-k-direct', '1');
    document.body.appendChild(a);
    (K.clicNatif || HTMLAnchorElement.prototype.click).call(a);
    setTimeout(function () { try { a.remove(); URL.revokeObjectURL(a.href); } catch (_) {} }, 4000);
  }
  window.kolioProposerFichier = function (blob, nom) {
    var fichier;
    try { fichier = new File([blob], nom, { type: blob.type || 'application/octet-stream' }); } catch (_) { fichier = blob; }
    var partage = !!(navigator.canShare && navigator.share && (function () { try { return navigator.canShare({ files: [fichier] }); } catch (_) { return false; } })());
    // Sur iPad, le téléchargement depuis une application installée est peu pratique : le partage est proposé en premier.
    // Sur Android et ailleurs, le téléchargement range directement le fichier dans « Téléchargements ».
    var partageDabord = IOS && partage;
    var aide = IOS
      ? (partage ? '« Partager… » ouvre le menu d’iPadOS : choisissez <strong>Enregistrer dans Fichiers</strong>, AirDrop vers votre PC, ou Mail.'
                 : 'Le fichier va être téléchargé : retrouvez-le dans l’app Fichiers, dossier Téléchargements.')
      : ANDROID
        ? '« Télécharger » range le fichier dans le dossier <strong>Téléchargements</strong> (app Fichiers).'
          + (partage ? ' « Partager… » l’envoie directement vers Drive, Gmail, Quick Share…' : '')
        : 'Le fichier va être téléchargé dans le dossier de téléchargements de l’appareil.' + (partage ? ' Vous pouvez aussi le partager.' : '');
    var m = feuille('modal-kFichier',
      '<div class="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="kf-titre">'
      + '<h3 id="kf-titre">Fichier prêt</h3>'
      + '<p class="acc-texte"><strong>' + escHtml(nom) + '</strong> · ' + octets(blob.size || 0) + '</p>'
      + '<p class="acc-texte acc-texte-discret">' + aide + '</p>'
      + (/\.json$/i.test(nom) ? '<p class="acc-texte acc-texte-discret">⚠ Ce fichier n’est pas chiffré : ne le transmettez que par un canal professionnel.</p>' : '')
      + '<div class="modal-actions"><button class="btn" type="button" id="kf-annuler">Fermer</button>'
      + (partage && !partageDabord ? '<button class="btn" type="button" id="kf-partager">Partager…</button>' : '')
      + (partageDabord ? '<button class="btn btn-primary" type="button" id="kf-partager">Partager…</button>'
                       : '<button class="btn btn-primary" type="button" id="kf-telecharger">Télécharger</button>')
      + '</div></div>');
    var fermer = function () { m.classList.remove('open'); };
    m.querySelector('#kf-annuler').onclick = fermer;
    var p = m.querySelector('#kf-partager');
    if (p) p.onclick = function () {
      navigator.share({ files: [fichier], title: nom }).then(fermer).catch(function (e) { if (e && e.name !== 'AbortError') kToast('Partage impossible : ' + e.message); });
    };
    var t = m.querySelector('#kf-telecharger');
    if (t) t.onclick = function () { telecharger(blob, nom); fermer(); kToast('Fichier téléchargé : ' + nom, { type: 'ok' }); };
  };

  /* ================= 2. Aperçu avant impression dans Kolio ================= */
  // L'aperçu s'affiche dans un cadre ; l'impression, elle, passe par la page
  // principale : le document y est placé dans une zone isolée (shadow DOM),
  // seule visible à l'impression. C'est ce que tous les navigateurs de tablette
  // impriment de façon fiable (Safari, Chrome, Samsung Internet, Firefox).
  function imprimerDocument(cadre) {
    var doc = cadre && cadre.contentDocument;
    if (imprimerDocument.nettoyer) imprimerDocument.nettoyer();
    var hote = document.createElement('div');
    if (!doc || !hote.attachShadow) { try { cadre.contentWindow.focus(); cadre.contentWindow.print(); } catch (e) { kMessage('Impression impossible : ' + e.message); } return; }
    var styles = '', page = '';
    doc.querySelectorAll('style').forEach(function (s) { styles += s.textContent + '\n'; });
    // Les règles @page ne s'appliquent que depuis la page principale
    styles = styles.replace(/@page\s*[^{]*\{[^}]*\}/g, function (r) { page += r + '\n'; return ''; });
    // body / html du document → racine de la zone isolée
    styles = styles.replace(/(^|[},;\s(>~+])(html|body)(?=[\s{,.:#>~+\[)]|$)/g, function (t, a) { return a + '.k-imp-racine'; });
    hote.id = 'k-impression';
    var ombre = hote.attachShadow({ mode: 'open' });
    var racine = doc.body.cloneNode(true);
    racine.querySelectorAll('script,#_kolio_bar,#_kolio_guides').forEach(function (n) { n.remove(); });
    ombre.innerHTML = '<style>:host{display:block}.k-imp-racine{display:block;margin:0;background:#fff;color:#000}' + styles + '</style>';
    var conteneur = document.createElement('div');
    conteneur.className = 'k-imp-racine';
    while (racine.firstChild) conteneur.appendChild(racine.firstChild);
    ombre.appendChild(conteneur);
    var css = document.createElement('style');
    css.id = 'k-impression-css';
    css.textContent = page + '@media print{html,body{background:#fff!important;height:auto!important;overflow:visible!important}'
      + 'body>*:not(#k-impression){display:none!important}#k-impression{display:block!important}}'
      + '@media screen{#k-impression{position:fixed;left:-99999px;top:0;width:210mm}}';
    document.head.appendChild(css);
    document.body.appendChild(hote);
    var nettoye = false;
    var nettoyer = function () { if (nettoye) return; nettoye = true; try { hote.remove(); css.remove(); } catch (_) {} };
    // Sur Android, l'impression se prépare après le retour de print() : on ne
    // retire le document qu'une fois l'impression terminée (ou l'aperçu fermé).
    window.addEventListener('afterprint', function () { setTimeout(nettoyer, 500); }, { once: true });
    imprimerDocument.nettoyer = nettoyer;
    setTimeout(function () { try { window.print(); } catch (e) { kMessage('Impression impossible : ' + e.message); } setTimeout(nettoyer, 180000); }, 60);
  }
  window.kolioImprimerDocument = imprimerDocument;
  if (typeof window.printHTML === 'function' && typeof window.buildApercuHTML === 'function') {
    window.printHTML = printHTML = function (fullHTML) {
      var m = feuille('modal-kApercu',
        '<div class="k-apercu" role="dialog" aria-modal="true" aria-label="Aperçu avant impression">'
        + '<div class="k-apercu-barre"><strong>Aperçu</strong><span class="k-apercu-aide">'
        + (IOS ? 'Le bouton ouvre le menu d’impression d’iPadOS : imprimez, ou choisissez <em>Enregistrer dans Fichiers</em> pour obtenir un PDF.'
               : 'Le bouton ouvre le menu d’impression : choisissez une imprimante, ou <em>Enregistrer au format PDF</em>.')
        + '</span><button class="btn btn-primary" type="button" id="kap-imprimer">Imprimer / PDF</button><button class="btn" type="button" id="kap-fermer">Fermer</button></div>'
        + '<iframe id="kap-cadre" title="Document à imprimer"></iframe></div>');
      m.classList.add('k-apercu-fond');
      var cadre = m.querySelector('#kap-cadre');
      cadre.srcdoc = buildApercuHTML(fullHTML);
      m.querySelector('#kap-fermer').onclick = function () { m.classList.remove('open'); cadre.srcdoc = ''; if (imprimerDocument.nettoyer) imprimerDocument.nettoyer(); };
      m.querySelector('#kap-imprimer').onclick = function () { imprimerDocument(cadre); };
    };
  }

  /* ========== 3. Sauvegardes du PC importables sur la tablette (et inversement) ========== */
  // Pièces jointes : le PC les range à part ({référence: base64}) ; ici elles sont
  // remises dans les données, sous forme intégrée, comme le fait la version navigateur.
  function integrerPieces(valeur, pieces) {
    if (!pieces) return 0;
    var n = 0;
    (function visiter(v) {
      if (Array.isArray(v)) { v.forEach(visiter); return; }
      if (!v || typeof v !== 'object') return;
      if (v.pjRef && !v.data && pieces[v.pjRef]) {
        v.data = 'data:' + (v.type || 'application/octet-stream') + ';base64,' + pieces[v.pjRef];
        delete v.pjRef; n++;
      }
      for (var k in v) if (k !== 'data') visiter(v[k]);
    })(valeur);
    return n;
  }
  window.kolioAdapterSauvegarde = function (p) {
    if (p && p.kolioExport && p.data && typeof p.data === 'object') {
      // Export complet du logiciel (Fichier → Exporter les données)
      var magasin = p.data, email = null, users = {};
      try { email = (JSON.parse(magasin.kolio_current_user || 'null') || {}).email || null; } catch (_) {}
      try { users = JSON.parse(magasin.kolio_users || '{}') || {}; } catch (_) {}
      var allDbs = {};
      Object.keys(magasin).forEach(function (k) {
        if (k.indexOf('kolio_db_') !== 0) return;
        try { allDbs[k.slice(6)] = JSON.parse(magasin[k]); } catch (_) {}
      });
      if (!email) { var k0 = Object.keys(allDbs).find(function (k) { return !/_\d{4}-\d{4}$/.test(k) && k.indexOf('__') < 0; }); if (k0) email = k0.slice(3); }
      p = { version: 3, email: email, exportedAt: p.exportedAt, db: allDbs['db_' + email], allDbs: allDbs, user: users[email], piecesJointes: p.piecesJointes };
    }
    if (p && p.piecesJointes) {
      var n = integrerPieces(p.allDbs || {}, p.piecesJointes) + integrerPieces(p.db || {}, p.piecesJointes);
      delete p.piecesJointes;
      if (n) setTimeout(function () { kToast(n + ' pièce(s) jointe(s) importée(s).'); }, 1500);
    }
    return p;
  };

  /* ================= 4. Verrouillage quand la tablette passe à autre chose ================= */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && typeof verrouConfigure === 'function' && verrouConfigure()) {
      try { verrouiller('arriere-plan'); } catch (_) {}
    }
  });

  /* ================= 5. Installation, stockage, hors ligne, mises à jour ================= */
  function aideInstallation() {
    if (K.appli || K.installe) return '';
    if (K.installation) return '<div class="k-bandeau"><span><strong>Installez Kolio sur ' + K.appareil + '</strong> : il s’ouvrira en plein écran, hors ligne, et ses données seront conservées durablement.</span>'
      + '<button class="btn btn-sm btn-primary" type="button" onclick="kolioInstaller()">Installer Kolio</button></div>';
    var etapes;
    if (IOS) etapes = K.navigateur === 'safari' ? 'touchez <em>Partager</em> (le carré avec une flèche) puis <em>Sur l’écran d’accueil</em>'
      : 'ouvrez cette adresse dans <em>Safari</em>, touchez <em>Partager</em> puis <em>Sur l’écran d’accueil</em>';
    else if (K.navigateur === 'samsung') etapes = 'ouvrez le menu <em>≡</em> puis <em>Ajouter page à</em> → <em>Écran d’accueil</em>';
    else if (K.navigateur === 'firefox') etapes = 'ouvrez le menu <em>⋮</em> puis <em>Installer</em> (ou <em>Ajouter à l’écran d’accueil</em>)';
    else if (ANDROID) etapes = 'ouvrez le menu <em>⋮</em> de Chrome puis <em>Installer l’application</em> (ou <em>Ajouter à l’écran d’accueil</em>)';
    else etapes = 'utilisez l’icône d’installation de la barre d’adresse, ou le menu du navigateur (<em>Installer Kolio</em>)';
    return '<div class="k-bandeau"><span><strong>Installez Kolio sur l’écran d’accueil</strong> : ' + etapes + '. Kolio s’ouvrira alors en plein écran, hors ligne, et ses données seront conservées durablement.</span></div>';
  }
  window.kolioInstaller = function () {
    var e = K.installation; if (!e) return;
    e.prompt();
    (e.userChoice || Promise.resolve({})).then(function (r) {
      K.installation = null;
      if (r && r.outcome === 'accepted') kToast('Kolio est installé : lancez-le désormais depuis son icône.', { type: 'ok' });
      rafraichirAccueil();
    }).catch(function () {});
  };
  document.addEventListener('kolio-installable', function () { rafraichirAccueil(); });
  document.addEventListener('kolio-installe', function () { kToast('Kolio est installé sur ' + K.appareil + '.', { type: 'ok' }); rafraichirAccueil(); });
  function rafraichirAccueil() {
    try { var p = document.getElementById('tab-aujourdhui'); if (p && p.classList.contains('active') && typeof renderAujourdhui === 'function') renderAujourdhui(); } catch (_) {}
  }

  // Bandeaux de l'accueil : code d'accès, installation, petit écran
  if (typeof window.renderAujourdhui === 'function') {
    var accueil = window.renderAujourdhui;
    window.renderAujourdhui = renderAujourdhui = function () {
      accueil.apply(this, arguments);
      var box = document.getElementById('aujourdhui-contenu');
      if (!box) return;
      var bandeaux = '';
      if (typeof verrouConfigure === 'function' && !verrouConfigure())
        bandeaux += '<div class="k-bandeau k-bandeau-alerte"><span><strong>Protégez Kolio par un code.</strong> Sur une tablette emportée en réunion, les données (pHARe surtout) doivent être protégées : définissez un code d’accès. Kolio se verrouillera dès que vous quitterez l’application.</span>'
          + '<button class="btn btn-sm btn-primary" type="button" onclick="switchTab(\'account\');setTimeout(function(){var e=document.getElementById(\'acc-verrou\');if(e)e.scrollIntoView({block:\'start\'});},80)">Définir un code</button></div>';
      if (K.tactile || K.ios || K.android) bandeaux += aideInstallation();
      if (K.petit) bandeaux += '<div class="k-bandeau"><span>Kolio tablette est conçu pour un écran de tablette. Sur un téléphone, tournez l’appareil en mode paysage pour plus de confort.</span></div>';
      if (bandeaux) box.insertAdjacentHTML('afterbegin', bandeaux);
    };
  }

  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) {}
  function majTexteStockage() {
    var el = document.getElementById('storage-usage');
    if (!el || !navigator.storage || !navigator.storage.estimate) return;
    navigator.storage.estimate().then(function (e) {
      el.textContent = octets(e.usage || 0) + (e.quota ? ' sur ' + octets(e.quota) + ' disponibles' : '');
    }).catch(function () {});
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').then(function (reg) {
      function proposer(w) {
        kToast('Une nouvelle version de Kolio est disponible.', { duree: 30000, action: { label: 'Mettre à jour', fn: function () { w.postMessage('activer'); } } });
      }
      if (reg.waiting && navigator.serviceWorker.controller) proposer(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (w) w.addEventListener('statechange', function () { if (w.state === 'installed' && navigator.serviceWorker.controller) proposer(w); });
      });
      setInterval(function () { reg.update().catch(function () {}); }, 6 * 3600 * 1000);
    }).catch(function () {});
    var recharge = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (!recharge) { recharge = true; location.reload(); } });
  }

  /* ================= 6. Bouton « retour » d'Android ================= */
  // Une fenêtre ouverte (fiche, formulaire, aperçu…) ajoute une étape à
  // l'historique : « retour » la ferme au lieu de quitter Kolio.
  if (ANDROID || (!IOS && K.tactile)) {
    var etapes = 0, ignorer = 0;
    var ouvertes = function () { return Array.prototype.slice.call(document.querySelectorAll('.modal-overlay.open')); };
    var fermer = function (m) {
      var id = (m.id || '').replace(/^modal-/, '');
      if (id && typeof closeModal === 'function') { try { closeModal(id); } catch (_) {} }
      m.classList.remove('open');
    };
    var suivre = function () {
      var n = ouvertes().length;
      while (etapes < n) { history.pushState({ kolioFenetre: etapes + 1 }, ''); etapes++; }
      while (etapes > n) { etapes--; ignorer++; history.back(); }
    };
    window.addEventListener('popstate', function () {
      if (ignorer) { ignorer--; return; }
      var o = ouvertes();
      if (o.length) { etapes--; fermer(o[o.length - 1]); }
    });
    var prevu = false;
    try { new MutationObserver(function () { if (prevu) return; prevu = true; setTimeout(function () { prevu = false; suivre(); }, 0); })
      .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true }); } catch (_) {}
  }

  /* ================= 7. Libellés adaptés ================= */
  function adapterTextes(racine) {
    if (IOS) (racine || document).querySelectorAll('kbd').forEach(function (k) { if (k.textContent === 'Ctrl') k.textContent = '⌘'; });
    var s = document.querySelector('#tab-account .account-section [id="storage-usage"]');
    if (s && !s.dataset.kTablette) {
      s.dataset.kTablette = '1';
      var bloc = s.closest('.account-section');
      var txt = bloc && bloc.querySelector('div[style*="line-height:1.6"]');
      if (txt) txt.innerHTML = 'Vos données sont enregistrées <strong>sur ' + K.appareil + '</strong>, dans l’application Kolio (rien n’est envoyé sur Internet).<br>'
        + 'Elles ne se synchronisent pas avec le PC : pour les y retrouver, exportez une sauvegarde (ou la sauvegarde d’un module) et importez-la dans le logiciel en mode « compléter ».';
      majTexteStockage();
    }
  }
  var prevuT = false;
  try { new MutationObserver(function () { if (prevuT) return; prevuT = true; requestAnimationFrame(function () { prevuT = false; adapterTextes(); }); }).observe(document.body, { childList: true, subtree: true }); } catch (_) {}
  adapterTextes();
  K.version = VERSION;
})();
