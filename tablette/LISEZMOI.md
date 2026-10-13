# Kolio tablette — publication et installation

Ce dossier est **Kolio tablette** : une application web qui s'installe sur
l'écran d'accueil d'une tablette et fonctionne **hors ligne**. La même version
sert pour toutes les tablettes : iPad, tablettes Android (Samsung, Lenovo,
Xiaomi, Google…), et autres écrans tactiles récents. Au lancement, Kolio repère
l'appareil et s'y adapte.

Kolio tablette est pensé pour les déplacements et les réunions, en
**compagnon** du logiciel installé sur le PC.

## 1. Publier sur GitHub Pages

Déposez **tout le contenu de ce dossier**, y compris `sw.js`,
`manifest.webmanifest` et les dossiers `vendor/` et `icones/`, dans un dossier
du dépôt Kolio.

- **Vous utilisiez déjà la version iPad (dossier `ipad/`) :** remplacez le
  contenu du dossier `ipad/` par celui-ci. L'adresse reste
  `https://kolioio.github.io/kolio/ipad/`. Les iPad déjà installés proposent
  « Mettre à jour » et gardent leurs données. Les tablettes Android s'installent
  depuis cette même adresse.
- **Première publication :** créez un dossier `tablette/` à la racine du dépôt
  et déposez-y le contenu. L'adresse sera
  `https://kolioio.github.io/kolio/tablette/`.

Le fichier `.nojekyll` doit se trouver **à la racine du dépôt**, pas dans le
dossier. S'il n'y est pas déjà, créez-le à la racine : un fichier vide nommé
`.nojekyll`.

> Ne changez pas d'adresse une fois Kolio installé sur une tablette : une
> nouvelle adresse est une nouvelle application, qui démarre sans données. Si
> vous devez changer, exportez d'abord une sauvegarde complète.

## 2. Mettre à jour

Remplacez les fichiers du dossier par ceux de la nouvelle version. Au
lancement suivant, Kolio affiche « Une nouvelle version de Kolio est
disponible ». Touchez **Mettre à jour**. Les données ne sont pas touchées.

## 3. Installer sur la tablette

**iPad :**

1. Ouvrez l'adresse dans **Safari**.
2. Touchez **Partager** (le carré avec une flèche), puis **Sur l'écran
   d'accueil**, puis **Ajouter**.

**Tablette Android :**

1. Ouvrez l'adresse dans **Chrome**, ou dans **Samsung Internet** sur une
   tablette Samsung.
2. Sur l'accueil de Kolio, touchez **Installer Kolio**. Si ce bouton
   n'apparaît pas :
   - dans Chrome, ouvrez le menu **⋮**, puis **Installer l'application** (ou
     **Ajouter à l'écran d'accueil**) ;
   - dans Samsung Internet, ouvrez le menu **≡**, puis **Ajouter page à →
     Écran d'accueil**.

**Ensuite, sur toutes les tablettes :**

1. Lancez Kolio depuis son icône. Il s'ouvre en plein écran et fonctionne
   ensuite **sans réseau**.
2. Dans **Mon compte → Sécurité de l'accès**, définissez un **code d'accès**.
   Kolio se verrouille dès que vous quittez l'application.
3. Utilisez toujours l'icône. Dans le navigateur, le système peut effacer les
   données d'un site peu visité ; l'application installée n'est pas concernée.
4. Gardez aussi un code de verrouillage sur la tablette elle-même : c'est lui
   qui active le chiffrement de l'appareil.

## 4. Échanger avec le PC

Les données ne se synchronisent pas : il n'y a aucun serveur, et rien ne
quitte la tablette sans votre action.

**Du PC vers la tablette :**

1. Sur le PC, choisissez une méthode d'export :
   - **Fichier → Exporter les données** dans le logiciel : export complet,
     pièces jointes, archives et corbeille comprises ;
   - ou le bouton **Sauvegarder** d'un module.
2. Envoyez le fichier sur la tablette par un moyen professionnel :
   - AirDrop (iPad) ou Quick Share (Android) ;
   - un câble ou une clé ;
   - la messagerie professionnelle.
3. Sur la tablette, importez-le :
   - un export complet : **Sauvegardes → Restaurer** ;
   - une sauvegarde de module : le bouton **Restaurer** du module.

**De la tablette vers le PC**, par exemple après une réunion :

1. Sur la tablette, ouvrez **Sauvegardes**.
2. Touchez **Sauvegarder** sous « Ce module » (Organisation quotidienne pour
   les notes et les réunions).
3. Récupérez le fichier :
   - **iPad :** **Partager…**, puis AirDrop vers le PC ou **Enregistrer dans
     Fichiers** ;
   - **Android :** **Télécharger** (le fichier arrive dans *Téléchargements*),
     ou **Partager…** vers Drive, Gmail, Quick Share…
4. Dans le logiciel, ouvrez le même module, puis **Restaurer → Compléter**.
   Les éléments créés sur la tablette s'ajoutent sans écraser ceux du PC.

Les fichiers de sauvegarde ne sont pas chiffrés. Transmettez-les uniquement
par des canaux professionnels, et supprimez-les une fois importés.

## 5. Ce qui change par rapport au logiciel PC

| | iPad | Android |
|---|---|---|
| **Tous les modules, corbeille, archives des élèves** | Oui | Oui |
| **Hors ligne** (une fois installé) | Oui | Oui |
| **Code d'accès** | Oui. Kolio se verrouille aussi dès qu'on quitte l'application. | Oui, de même. |
| **Recherche, fiche élève 360°, accueil « Aujourd'hui »** | Oui, avec ⌘K sur un clavier | Oui, avec Ctrl+K sur un clavier |
| **Imports SIECLE, Excel et CSV** | Depuis l'app Fichiers | Depuis Fichiers, Drive ou Téléchargements |
| **Sauvegardes et exports** | Feuille de partage (Fichiers, AirDrop, Mail) | Téléchargement direct, ou partage (Drive, Gmail, Quick Share) |
| **Impression et PDF** | Un aperçu s'ouvre dans Kolio. **Imprimer / PDF** ouvre le menu d'impression, qui permet aussi d'enregistrer en PDF. | Le même aperçu. Dans le menu d'impression, choisissez **Enregistrer au format PDF**. |
| **Glisser-déposer** (constitution des classes, tâches annuelles…) | Appui long, puis glisser | Appui long, puis glisser |
| **Bouton « retour »** | — | Ferme la fenêtre ouverte au lieu de quitter Kolio |
| **Rappels** | Affichés dans Kolio quand il est ouvert | De même |
| **Chiffrement des données** | Celui de l'iPad, actif avec un code de verrouillage, plus le code d'accès Kolio | Celui d'Android, actif avec un code de verrouillage, plus le code d'accès Kolio |

Sur un **téléphone**, Kolio tablette fonctionne, mais l'écran est étroit :
utilisez-le de préférence en mode paysage.

## 6. Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html`, `kolio-app.js` | Kolio (code protégé) |
| `kolio-tablette-avant.js`, `kolio-tablette.js`, `kolio-tablette.css` | Adaptations aux tablettes : détection de l'appareil, fichiers, impression, installation, bouton retour… |
| `sw.js` | Fonctionnement hors ligne et mises à jour |
| `manifest.webmanifest`, `icones/` | Installation sur l'écran d'accueil |
| `vendor/` | Polices, JSZip, SheetJS et glisser-déposer tactile, avec leurs licences |
| `LICENCE.txt` | Contrat de licence de Kolio et licences des composants tiers |
