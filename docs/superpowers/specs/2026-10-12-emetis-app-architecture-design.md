# Emetis App — Architecture & Conventions (design)

Date: 2026-10-12
Statut: Approuvé par l'utilisateur en chat (sections 1-4), en attente de revue finale du présent document.

## Contexte

Nouvelle app mobile React Native / Expo pour emetis.net. Plateforme multi-acteurs type
marketplace (traveler / host), avec écrans publics accessibles sans compte. Un 3e acteur
pourrait être ajouté plus tard (type non défini à ce stade) — l'architecture doit
l'accueillir sans refactor des acteurs existants.

Objectif de ce document: poser l'architecture technique, les conventions de nommage, le
workflow git/PR, la CI, et le contenu du scaffold initial, pour une équipe multi-devs.

Hors scope: fonctionnalités métier précises (recherche, réservation, paiement...). Ce
document ne couvre que la fondation technique et organisationnelle du projet.

## Décisions de stack (validées)

| Sujet                         | Choix                                                         |
| ----------------------------- | ------------------------------------------------------------- |
| Workflow Expo                 | Managed + EAS Build/Submit (pas de dossiers natifs committés) |
| Langage                       | TypeScript strict                                             |
| Lint/format                   | ESLint (eslint-config-expo) + Prettier                        |
| State management              | Zustand (état local/UI)                                       |
| Data fetching / cache serveur | TanStack Query                                                |
| Navigation                    | Expo Router (file-based)                                      |
| CI/CD                         | GitHub Actions                                                |
| Stratégie de branches         | Trunk-based simplifié (main + develop + branches courtes)     |
| Tests                         | Jest + React Native Testing Library (E2E différé)             |

## 1. Structure du repo

Organisation par **acteur** (traveler / host / public) puis par **feature**, pour isoler
le métier de chaque acteur et permettre l'ajout d'un futur acteur sans toucher aux
existants.

```
app/                              # Expo Router — fichiers = routes uniquement, pas de logique
├── (public)/                     # accessible sans compte: landing, découverte, fiche annonce publique, légal
│   ├── _layout.tsx
│   └── index.tsx
├── (auth)/                       # login/register/forgot — commun à tous acteurs
│   └── _layout.tsx
├── (traveler)/                   # routes protégées, role=traveler
│   ├── _layout.tsx               # guard: redirige si role != traveler
│   └── (tabs)/
│       ├── search.tsx
│       ├── bookings.tsx
│       └── ...
├── (host)/                       # routes protégées, role=host
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── listings.tsx
│       ├── calendar.tsx
│       └── ...
├── _layout.tsx                   # root: redirection selon rôle après login
└── +not-found.tsx

src/
├── actors/                       # toute logique métier isolée par acteur
│   ├── traveler/
│   │   ├── features/
│   │   │   ├── search/           # api.ts, hooks.ts, store.ts, types.ts, components/
│   │   │   ├── booking/
│   │   │   └── ...
│   │   └── components/           # composants spécifiques traveler
│   ├── host/
│   │   ├── features/
│   │   │   ├── listings/
│   │   │   ├── calendar/
│   │   │   └── ...
│   │   └── components/
│   └── shared/                   # business logic partagée entre acteurs (messaging, profile, notifications)
├── public/                       # features accessibles sans connexion
│   └── features/
│       ├── discovery/
│       └── legal/
├── auth/                         # login, session, détection/stockage du rôle
├── components/ui/                # design system pur, agnostique de l'acteur (Button, Card...)
├── lib/                          # apiClient, queryClient, config transverse
├── hooks/                        # hooks génériques réutilisables partout
├── constants/
├── utils/
└── types/                        # types globaux (User, Role, etc.)

assets/                            # images, fonts, icônes
.github/
├── workflows/                    # CI
├── PULL_REQUEST_TEMPLATE.md
└── ISSUE_TEMPLATE/
.husky/                            # git hooks (pre-commit, commit-msg)
docs/                              # ADRs, conventions, onboarding
app.config.ts                      # config Expo dynamique (env-aware)
eas.json
tsconfig.json
eslint.config.js
.prettierrc
package.json
```

**Règle extensibilité 3e acteur futur**: ajouter uniquement `app/(nouvel-acteur)/` +
`src/actors/nouvel-acteur/`. Zéro impact sur traveler/host existants. Le root
`_layout.tsx` route selon `user.role` (type union extensible, pas un enum TS fermé).

**Règle partage**: logique métier commune entre acteurs (ex: messagerie, édition profil)
→ `src/actors/shared/`, jamais dupliquée. UI pure sans logique métier → `src/components/ui/`.

**Règle `app/`**: routing uniquement. Chaque fichier de route délègue à un composant/hook
de `src/actors/<actor>/features/...` ou `src/public/features/...`. Aucune logique métier
ni appel API directement dans `app/`.

## 2. Conventions de nommage

**Fichiers & dossiers**

- Composants React: `PascalCase.tsx` → `ListingCard.tsx`, `BookingSummary.tsx`
- Hooks: `useCamelCase.ts` → `useBookingDraft.ts`, `useHostListings.ts`
- Routes Expo Router: groupes entre parenthèses (`(traveler)`), fichiers en `kebab-case`
  ou `camelCase` selon la convention Expo Router standard (`listing-details.tsx`)
- Non-composants (utils, api, types, store): `camelCase.ts` → `api.ts`, `bookingTypes.ts`
- Dossiers multi-mots: `kebab-case` → `src/actors/host/features/payout-settings/`
- Tests: co-localisés, suffixe `.test.ts(x)` → `ListingCard.test.tsx`

**Code**

- Composants/Types/Interfaces: `PascalCase` → `interface BookingDraft`, `type UserRole`
- Variables/fonctions: `camelCase`
- Constantes globales figées: `UPPER_SNAKE_CASE` → `MAX_GUESTS`, `API_BASE_URL`
- Hooks custom: préfixe `use` obligatoire
- Rôle utilisateur: union littérale `type UserRole = 'traveler' | 'host'`, pas un enum TS
  fermé, pour faciliter l'ajout d'un futur acteur
- Props interface: suffixe `Props` → `ListingCardProps`
- Zustand stores: suffixe `Store` → `useBookingStore`
- Query keys TanStack: factory par feature → `bookingKeys.detail(id)`

**Imports**

- Alias absolu `@/` (tsconfig `paths`) obligatoire pour tout import hors dossier courant.
  Jamais de `../../../../`.

**Branches Git**

- `feature/<ticket>-<description-courte>` → `feature/EM-124-host-calendar-sync`
- `fix/<ticket>-<description>` → `fix/EM-130-booking-date-overlap`
- `chore/<description>` → `chore/update-expo-sdk`
- `hotfix/<description>` si urgence prod

**Commits — Conventional Commits**

```
<type>(<scope>): <description courte à l'impératif>

[body optionnel: pourquoi, pas quoi]

[footer optionnel: Closes #123]
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`.
Scope = acteur ou module concerné: `feat(host): ajoute sync calendrier iCal`,
`fix(traveler): corrige overlap dates booking`, `chore(deps): bump expo sdk 52`.
Validé automatiquement par commitlint + husky (bloque le commit si format invalide).

## 3. PR, CI et validations

**Template de PR** (`.github/PULL_REQUEST_TEMPLATE.md`): sections Quoi / Pourquoi (lien
ticket) / Acteur(s) concerné(s) (public, traveler, host, shared) / Comment tester /
Screenshots / Checklist (testé iOS+Android, tests ajoutés, pas de console.log oublié, pas
de secret en dur, docs à jour si besoin).

**CI GitHub Actions** (`.github/workflows/ci.yml`), déclenchée sur chaque PR vers
`develop`/`main`:

1. `install` (cache du gestionnaire de paquets)
2. `lint` — ESLint
3. `typecheck` — `tsc --noEmit`
4. `test` — Jest avec seuil de couverture minimal (bas au départ, monte avec le temps)
5. `format:check` — Prettier en mode vérification (pas d'auto-fix en CI)

Chaque job est un check obligatoire avant merge. Un build EAS preview à la demande
(déclenché par label sur la PR) pourra être ajouté plus tard si besoin, hors scope du
scaffold initial.

**Protection des branches `main` et `develop`:**

- PR obligatoire, pas de push direct
- Au moins 1 review approuvée
- Tous les checks CI verts obligatoires
- Branche à jour avec la base avant merge
- Squash merge par défaut

**Husky (local, avant la CI):**

- `lint-staged` → ESLint + Prettier uniquement sur fichiers modifiés
- `commit-msg` → commitlint valide le format conventional commit

## 4. Documentation et scaffold initial

**`docs/`**

```
docs/
├── README.md               # vue d'ensemble, lien vers tout
├── getting-started.md      # clone, install, env vars, run app
├── architecture.md          # structure dossiers, pourquoi par acteur
├── conventions.md           # nommage, commits, branches
├── contributing.md          # workflow PR, review, checklist
└── adr/
    └── 0001-expo-router-et-structure-par-acteur.md
```

**README.md racine**: badge CI, stack, quickstart, lien vers `docs/`.

**Scripts `package.json`**: `start`, `android`, `ios`, `lint`, `lint:fix`, `format`,
`format:check`, `typecheck`, `test`, `test:watch`, `prepare` (husky).

**Env vars**: `.env.example` committé, `.env` ignoré. Validation au boot via un schéma
(`src/lib/env.ts`) — l'app échoue tôt et clairement si une variable manque, pas de bug
silencieux en prod.

**Contenu du scaffold à livrer:**

- `create-expo-app` (template TypeScript) + Expo Router installé et configuré
- ESLint (eslint-config-expo) + Prettier + Husky + lint-staged + commitlint configurés
- Structure de dossiers complète de la section 1, avec fichiers exemples minimaux
- 1 écran exemple par groupe de routes (public / traveler / host) pour valider le routing
  par rôle
- Store Zustand exemple (session/auth) + setup TanStack Query (`queryClient`, `apiClient`
  avec base URL emetis.net configurable par env)
- Jest + RNTL configurés + 1 test exemple
- `.github/workflows/ci.yml` + `PULL_REQUEST_TEMPLATE.md`
- `docs/` rempli selon la structure ci-dessus
- `app.config.ts` + `eas.json` (profils development/preview/production)

## Risques / points ouverts

- Le 3e acteur futur n'est pas défini: l'architecture par acteur est conçue pour
  l'accueillir sans refactor, mais son contenu métier réel n'est pas anticipé au-delà de
  la structure de dossiers.
- Le détail de l'API emetis.net (endpoints, auth, format des réponses) n'est pas encore
  connu à ce stade — `src/lib/apiClient` sera scaffoldé en générique (base URL + intercepteurs
  auth) et affiné quand l'API sera spécifiée.
