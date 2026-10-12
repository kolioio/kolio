/*
 * Kolio iPad — chargé APRÈS le code de Kolio.
 * Adapte ce qui ne fonctionne pas tel quel dans une application web sur iPad :
 *   1. fichiers produits (sauvegardes, exports) → feuille de partage d'iPadOS ;
 *   2. aperçu avant impression / PDF → affiché dans Kolio (pas de fenêtre surgissante) ;
 *   3. sauvegardes du logiciel PC (export complet, pièces jointes) → importables ;
 *   4. verrouillage dès que l'iPad passe à autre chose, si un code est défini ;
 *   5. stockage persistant, installation sur l'écran d'accueil, mises à jour hors ligne ;
 *   6. libellés adaptés (⌘ au lieu de Ctrl, textes propres au PC).
 */
(function () {
  'use strict';
  var K = window.KolioIPad || { iPad: false, tactile: false, appli: false };
  var VERSION = '1.5.1';

  /* ======================= 1. Fichiers → partage ======================= */
  function feuille(id, html) {
    var m = document.getElementById(id);
    if (!m) { m = document.createElement('div'); m.className = 'modal-overlay'; m.id = id; document.body.appendChild(m); }
    m.innerHTML = html;
    m.classList.add('open');
    return m;
  }
  var octets = function (n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' Ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo'; };
  window.kolioProposerFichier = function (blob, nom) {
    var fichier;
    try { fichier = new File([blob], nom, { type: blob.type || 'application/octet-stream' }); } catch (_) { fichier = blob; }
    var partage = !!(navigator.canShare && navigator.share && (function () { try { return navigator.canShare({ files: [fichier] }); } catch (_) { return false; } })());
    var m = feuille('modal-kFichier',
      '<div class="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="kf-titre">'
      + '<h3 id="kf-titre">Fichier prêt</h3>'
      + '<p class="acc-texte"><strong>' + escHtml(nom) + '</strong> · ' + octets(blob.size || 0) + '</p>'
      + '<p class="acc-texte acc-texte-discret">' + (partage
        ? '« Partager… » ouvre le menu d’iPadOS : choisissez <strong>Enregistrer dans Fichiers</strong>, AirDrop vers votre PC, ou Mail.'
        : 'Le fichier va être téléchargé : retrouvez-le dans l’app Fichiers, dossier Téléchargements.') + '</p>'
      + (/\.json$/i.test(nom) ? '<p class="acc-texte acc-texte-discret">⚠ Ce fichier n’est pas chiffré : ne le transmettez que par un canal professionnel.</p>' : '')
      + '<div class="modal-actions"><button class="btn" type="button" id="kf-annuler">Fermer</button>'
      + (partage ? '<button class="btn btn-primary" type="button" id="kf-partager">Partager…</button>' : '<button class="btn btn-primary" type="button" id="kf-telecharger">Télécharger</button>')
      + '</div></div>');
    var fermer = function () { m.classList.remove('open'); };
    m.querySelector('#kf-annuler').onclick = fermer;
    var p = m.querySelector('#kf-partager');
    if (p) p.onclick = function () {
      navigator.share({ files: [fichier], title: nom }).then(fermer).catch(function (e) { if (e && e.name !== 'AbortError') kToast('Partage impossible : ' + e.message); });
    };
    var t = m.querySelector('#kf-telecharger');
    if (t) t.onclick = function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = nom;
      (K.clicNatif || HTMLAnchorElement.prototype.click).call(a);
      fermer();
    };
  };

  /* ================= 2. Aperçu avant impression dans Kolio ================= */
  if (typeof window.printHTML === 'function' && typeof window.buildApercuHTML === 'function') {
    window.printHTML = printHTML = function (fullHTML) {
      var m = feuille('modal-kApercu',
        '<div class="k-apercu" role="dialog" aria-modal="true" aria-label="Aperçu avant impression">'
        + '<div class="k-apercu-barre"><strong>Aperçu</strong><span class="k-apercu-aide">Imprimer, ou choisir <em>Enregistrer dans Fichiers</em> / <em>Partager</em> depuis le menu d’impression pour obtenir un PDF.</span>'
        + '<button class="btn btn-primary" type="button" id="kap-imprimer">Imprimer / PDF</button><button class="btn" type="button" id="kap-fermer">Fermer</button></div>'
        + '<iframe id="kap-cadre" title="Document à imprimer"></iframe></div>');
      m.classList.add('k-apercu-fond');
      var cadre = m.querySelector('#kap-cadre');
      cadre.srcdoc = buildApercuHTML(fullHTML);
      m.querySelector('#kap-fermer').onclick = function () { m.classList.remove('open'); cadre.srcdoc = ''; };
      m.querySelector('#kap-imprimer').onclick = function () { try { cadre.contentWindow.focus(); cadre.contentWindow.print(); } catch (e) { kMessage('Impression impossible : ' + e.message); } };
    };
  }

  /* ========== 3. Sauvegardes du PC importables sur l'iPad (et inversement) ========== */
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
      if (!email) { var k0 = Object.keys(allDbs).find(function (k) { return !/_\d{4}-\d{4}$/.test(k); }); if (k0) email = k0.slice(3); }
      p = { version: 3, email: email, exportedAt: p.exportedAt, db: allDbs['db_' + email], allDbs: allDbs, user: users[email], piecesJointes: p.piecesJointes };
    }
    if (p && p.piecesJointes) {
      var n = integrerPieces(p.allDbs || {}, p.piecesJointes) + integrerPieces(p.db || {}, p.piecesJointes);
      delete p.piecesJointes;
      if (n) setTimeout(function () { kToast(n + ' pièce(s) jointe(s) importée(s).'); }, 1500);
    }
    return p;
  };

  /* ================= 4. Verrouillage quand l'iPad passe à autre chose ================= */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && typeof verrouConfigure === 'function' && verrouConfigure()) {
      try { verrouiller('arriere-plan'); } catch (_) {}
    }
  });
  // Bandeau sur l'accueil tant qu'aucun code n'est défini
  if (typeof window.renderAujourdhui === 'function') {
    var accueil = window.renderAujourdhui;
    window.renderAujourdhui = renderAujourdhui = function () {
      accueil.apply(this, arguments);
      var box = document.getElementById('aujourdhui-contenu');
      if (!box) return;
      var bandeaux = '';
      if (typeof verrouConfigure === 'function' && !verrouConfigure())
        bandeaux += '<div class="k-bandeau k-bandeau-alerte"><span><strong>Protégez Kolio par un code.</strong> Sur un iPad emporté en réunion, les données (pHARe surtout) doivent être protégées : définissez un code d’accès. Kolio se verrouillera dès que vous quitterez l’application.</span>'
          + '<button class="btn btn-sm btn-primary" type="button" onclick="switchTab(\'account\');setTimeout(function(){var e=document.getElementById(\'acc-verrou\');if(e)e.scrollIntoView({block:\'start\'});},80)">Définir un code</button></div>';
      if (K.iPad && !K.appli)
        bandeaux += '<div class="k-bandeau"><span><strong>Installez Kolio sur l’écran d’accueil</strong> : touchez <em>Partager</em> (le carré avec une flèche, en haut) puis <em>Sur l’écran d’accueil</em>. Kolio s’ouvrira alors en plein écran, hors ligne, et ses données seront conservées durablement.</span></div>';
      if (bandeaux) box.insertAdjacentHTML('afterbegin', bandeaux);
    };
  }

  /* ================= 5. Stockage, hors ligne, mises à jour ================= */
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

  /* ================= 6. Libellés adaptés ================= */
  function adapterTextes(racine) {
    (racine || document).querySelectorAll('kbd').forEach(function (k) { if (K.iPad && k.textContent === 'Ctrl') k.textContent = '⌘'; });
    var s = document.querySelector('#tab-account .account-section [id="storage-usage"]');
    if (s && !s.dataset.kIpad) {
      s.dataset.kIpad = '1';
      var bloc = s.closest('.account-section');
      var txt = bloc && bloc.querySelector('div[style*="line-height:1.6"]');
      if (txt) txt.innerHTML = 'Vos données sont enregistrées <strong>sur cet iPad</strong>, dans l’application Kolio (rien n’est envoyé sur Internet).<br>'
        + 'Elles ne se synchronisent pas avec le PC : pour les y retrouver, exportez une sauvegarde (ou la sauvegarde d’un module) et importez-la dans le logiciel en mode « compléter ».';
      majTexteStockage();
    }
  }
  var prevu = false;
  try { new MutationObserver(function () { if (prevu) return; prevu = true; requestAnimationFrame(function () { prevu = false; adapterTextes(); }); }).observe(document.body, { childList: true, subtree: true }); } catch (_) {}
  adapterTextes();
  window.KolioIPad.version = VERSION;
})();
