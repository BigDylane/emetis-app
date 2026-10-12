# Contributing

## Workflow

1. Partir de `develop`, créer une branche (`feature/EM-123-description`).
2. Développer, committer en Conventional Commits (validé par husky).
3. Ouvrir une PR vers `develop` en remplissant le template.
4. La CI doit être verte (lint, typecheck, test, format) avant review.
5. Au moins 1 approbation requise avant merge.
6. Squash merge.

## Avant d'ouvrir une PR

```bash
npm run lint
npm run format:check
npx tsc --noEmit
npm test
```

## Revue de code

Vérifier: respect de la structure par acteur (pas de logique dans `app/`), nommage conforme à `docs/conventions.md`, tests sur la logique métier ajoutée.
