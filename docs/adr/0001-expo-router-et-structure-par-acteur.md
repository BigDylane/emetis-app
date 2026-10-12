# ADR 0001: Expo Router + structure par acteur

Date: 2026-10-12
Statut: Accepté

## Contexte

App multi-acteurs (traveler, host, public) avec un 3e acteur possible plus tard.
Besoin d'une structure qui isole le métier de chaque acteur sans bloquer l'ajout
d'un nouvel acteur.

## Décision

- Navigation via Expo Router (file-based), avec des groupes de routes par acteur:
  `(public)`, `(auth)`, `(traveler)`, `(host)`.
- Logique métier dans `src/actors/<acteur>/features/`, jamais dans `app/`.
- Logique partagée entre acteurs dans `src/actors/shared/`.
- `extra.router.root = "app"` fixé explicitement dans `app.config.ts`, car Expo
  Router bascule automatiquement sur `src/app` dès qu'un dossier `src/` existe —
  ce qui aurait cassé la séparation routing/métier voulue ici.

## Conséquences

- Ajouter un acteur = ajouter un dossier, zéro impact sur l'existant.
- `app/` reste fin et lisible, toute la complexité vit dans `src/`.
- Légère indirection (chaque route délègue à un composant dans `src/`) acceptée
  pour garder cette isolation.
