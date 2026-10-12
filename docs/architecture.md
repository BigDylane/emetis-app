# Architecture

Voir la spec complète: [2026-10-12-emetis-app-architecture-design.md](superpowers/specs/2026-10-12-emetis-app-architecture-design.md).

## Résumé

L'app est organisée par **acteur** (`public`, `traveler`, `host`) puis par **feature**:

- `app/` — Expo Router, routing uniquement, aucune logique métier.
- `src/actors/<acteur>/features/<feature>/` — logique métier, API, hooks, store par feature.
- `src/actors/shared/` — logique métier partagée entre acteurs (messagerie, profil...).
- `src/public/features/` — features accessibles sans compte.
- `src/components/ui/` — design system pur, agnostique de l'acteur.
- `src/lib/` — apiClient, queryClient, config transverse.

`app/` reste la racine du routing (voir `extra.router.root` dans `app.config.ts`) — Expo
Router basculerait sinon automatiquement sur `src/app` dès qu'un dossier `src/` existe.

## Ajouter un nouvel acteur

1. Créer `app/(nouvel-acteur)/` avec son `_layout.tsx` (guard de rôle, voir `app/(host)/_layout.tsx`).
2. Créer `src/actors/nouvel-acteur/features/`.
3. Étendre le type `UserRole` dans `src/types/user.ts`.

Aucun fichier des acteurs existants ne doit être modifié pour ça.

## Ajouter une feature à un acteur existant

1. Créer `src/actors/<acteur>/features/<feature>/` avec `api.ts`, `use<Feature>.ts`, `types.ts`.
2. Suivre le pattern de `src/actors/host/features/listings/` comme référence (query hook TanStack Query).
3. Créer l'écran dans `app/(<acteur>)/(tabs)/<feature>.tsx` qui importe depuis `src/actors/<acteur>/features/<feature>/`.
