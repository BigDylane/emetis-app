# Conventions

## Nommage fichiers

- Composants: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Non-composants (api, types, utils): `camelCase.ts`
- Dossiers multi-mots: `kebab-case`
- Tests co-localisés: `*.test.ts(x)` (`.tsx` dès que le test contient du JSX, par ex. un `wrapper` de provider)

## Nommage code

- Composants/Types: `PascalCase`
- Variables/fonctions: `camelCase`
- Constantes figées: `UPPER_SNAKE_CASE`
- Props d'un composant `X`: `XProps`
- Store Zustand: suffixe `Store` (`useSessionStore`)
- Query keys TanStack: factory par feature (`listingsKeys.all`)

## Imports

Toujours l'alias `@/` pour sortir du dossier courant. Jamais de `../../../../`.

## Branches

- `feature/<ticket>-<description>`
- `fix/<ticket>-<description>`
- `chore/<description>`
- `hotfix/<description>`

## Commits (Conventional Commits)

```
<type>(<scope>): <description impérative>
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`.
Scope: acteur ou module (`feat(host): ...`, `fix(traveler): ...`).

Validé automatiquement par commitlint à chaque commit.
