# Assets de marque

Le chevron Emetis est la **seule source de vérité** : `assets/brand/chevron-*.svg`
(vectoriel, sans dépendance de police). Tous les PNG de l'app en sont générés.

## Structure

```
assets/
├── brand/
│   ├── chevron-pink.svg     # #FF2D55, pour fond clair
│   ├── chevron-white.svg    # pour fond rose ou sombre
│   ├── chevron-black.svg    # monochrome, impression
│   └── exports/             # PNG générés (transparent, marge 10 %), 512 et 1024 px
└── images/                  # PNG utilisés par l'app (générés, ne pas éditer à la main)
scripts/generate-assets.mjs  # le générateur
```

## Régénérer les assets

```bash
npm run assets
```

Les PNG sont écrasés. Commiter le résultat avec les SVG modifiés.

| Fichier généré                         | Usage                    | Chevron                           |
| -------------------------------------- | ------------------------ | --------------------------------- |
| `images/icon.png` (1024)               | icône iOS / Expo Go      | blanc sur `#FF2D55`, 75 % largeur |
| `images/android-icon-foreground.png`   | icône adaptive Android   | rose, transparent, 71,6 % largeur |
| `images/android-icon-monochrome.png`   | icône thématique Android | noir, transparent                 |
| `images/splash-icon.png` (400)         | splash + header          | blanc, transparent                |
| `images/favicon.png` (196)             | web                      | blanc sur `#FF2D55`               |
| `brand/exports/chevron-<couleur>-<px>` | export pour l'équipe     | transparent, marge 10 %           |

## Modifier

- **Forme ou couleur** : éditer le SVG, puis `npm run assets`.
- **Taille du chevron dans une icône** : changer `width` (fraction du canvas) dans
  `scripts/generate-assets.mjs`.
- **Android adaptive** : garder le chevron dans la zone visible (cercle central ~66 % du
  canvas), sinon un masque rond le rogne.

## Autres fichiers

`images/logo-dark.png` (chevron + mot « emetis », noir) n'est pas généré : c'est un fichier
fourni tel quel. Pour le refaire, il faut l'SVG du logotype.
