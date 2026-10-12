# Kolio pour iPad — publication et installation

Ce dossier est **Kolio pour iPad** : une application web qui s'installe sur
l'écran d'accueil et fonctionne **hors ligne**. Elle est pensée pour les
déplacements et les réunions, en **compagnon** du logiciel installé sur le PC.

## 1. Publier sur GitHub Pages (une seule fois)

1. Sur GitHub, créez un **dépôt dédié**, par exemple `kolio-ipad`. Il peut être
   public : il ne contient que le programme, **aucune donnée**.
2. Déposez à la racine du dépôt **tout le contenu de ce dossier**, y compris
   `sw.js`, `manifest.webmanifest` et les dossiers `vendor/` et `icones/`.
3. Allez dans **Settings → Pages**. Choisissez *Deploy from a branch*, la
   branche `main` et le dossier `/ (root)`, puis enregistrez.
4. Après une à deux minutes, l'adresse s'affiche, par exemple
   `https://kolioio.github.io/kolio-ipad/`.

> **Important — une adresse dédiée.** Sur GitHub Pages, tous les dépôts d'un
> même compte partagent la même « origine » (`kolioio.github.io`). Un iPad qui
> ouvre plusieurs pages Kolio de ce compte (version navigateur, page mobile…)
> leur fait **partager les mêmes données**. C'est sans danger, mais pour séparer
> nettement les choses, publiez Kolio iPad sur un compte ou une organisation
> GitHub à part.

## 2. Mettre à jour

Remplacez les fichiers du dépôt par ceux de la nouvelle version. Au lancement
suivant, Kolio affiche « Une nouvelle version de Kolio est disponible ».
Touchez **Mettre à jour**. Les données ne sont pas touchées.

## 3. Installer sur l'iPad

1. Ouvrez l'adresse dans **Safari**, et non dans Chrome.
2. Touchez **Partager** (le carré avec une flèche), puis **Sur l'écran
   d'accueil**, puis **Ajouter**.
3. Lancez Kolio depuis l'icône. Il s'ouvre en plein écran et fonctionne
   ensuite **sans réseau**.
4. Dans **Mon compte → Sécurité de l'accès**, définissez un **code d'accès**.
   Kolio se verrouille dès que vous quittez l'application.

Utilisez toujours l'icône de l'écran d'accueil. Dans Safari, iPadOS peut
effacer les données d'un site peu visité. L'application installée n'est pas
concernée.

## 4. Échanger avec le PC

Les données ne se synchronisent pas : il n'y a aucun serveur, rien ne quitte
l'iPad sans votre action.

**Du PC vers l'iPad :**

1. Sur le PC, choisissez une méthode d'export :
   - **Fichier → Exporter les données** dans le logiciel : export complet, pièces jointes comprises ;
   - ou le bouton **Sauvegarder** d'un module.
2. Envoyez le fichier sur l'iPad par AirDrop, une clé ou la messagerie professionnelle.
3. Sur l'iPad, importez-le :
   - un export complet : **Sauvegardes → Restaurer** ;
   - une sauvegarde de module : bouton **Restaurer** du module.

**De l'iPad vers le PC**, par exemple après une réunion :

1. Sur l'iPad, ouvrez **Sauvegardes**, puis touchez **Sauvegarder** sous
   « Ce module » (Organisation quotidienne pour les notes et réunions).
2. Choisissez **Partager… → AirDrop** vers le PC, ou **Enregistrer dans
   Fichiers**.
3. Dans le logiciel, ouvrez le même module, puis **Restaurer → Compléter**.
   Les éléments créés sur l'iPad s'ajoutent sans écraser ceux du PC.

Les fichiers de sauvegarde ne sont pas chiffrés. Transmettez-les uniquement
par des canaux professionnels et supprimez-les une fois importés.

## 5. Ce qui change par rapport au logiciel PC

| | iPad |
|---|---|
| **Tous les modules** | Disponibles. |
| **Hors ligne** | Oui, une fois installé. |
| **Code d'accès, verrouillage** | Oui. Kolio se verrouille aussi dès qu'on quitte l'application. |
| **Recherche (⌘K), fiche élève 360°, accueil « Aujourd'hui »** | Oui. |
| **Imports SIECLE, Excel et CSV** | Oui, depuis l'app Fichiers. |
| **Sauvegardes et exports** | Ils passent par la feuille de partage : Enregistrer dans Fichiers, AirDrop, Mail. |
| **Impression et PDF** | Un aperçu s'ouvre dans Kolio. Le bouton **Imprimer / PDF** ouvre le menu d'impression d'iPadOS, qui permet aussi d'enregistrer le document en PDF. |
| **Glisser-déposer** (constitution des classes, répartitions, tâches annuelles) | Faites un appui long, puis glissez. |
| **Rappels** | Ils s'affichent dans Kolio pendant qu'il est ouvert. Sans serveur, iPadOS n'autorise pas de notifications programmées. |
| **Chiffrement du fichier de données** | Celui du PC n'existe pas ici. Les données sont protégées par le chiffrement de l'iPad, actif dès qu'un code de verrouillage est défini sur l'iPad, et par le code d'accès Kolio. |
| **Correcteur d'orthographe** | Celui de l'iPad. |

## 6. Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html`, `kolio-app.js` | Kolio (code protégé) |
| `kolio-ipad-avant.js`, `kolio-ipad.js`, `kolio-ipad.css` | Adaptations à l'iPad |
| `sw.js` | Fonctionnement hors ligne et mises à jour |
| `manifest.webmanifest`, `icones/` | Installation sur l'écran d'accueil |
| `vendor/` | Polices, JSZip, SheetJS et glisser-déposer tactile, avec leurs licences |
| `LICENCE.txt` | Contrat de licence de Kolio et licences des composants tiers |
