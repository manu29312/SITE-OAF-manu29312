# Plan de travail reorganise - suite de session

## Resume rapide
Deja termine:
- Bloc 1: auth
- Bloc 2: clients/factures
- Bloc 3: settings (localStorage)
- Bloc 4: validation + format d erreur API

Objectif restant:
- Brancher la vraie persistance Supabase
- Rendre le dashboard 100% data-driven
- Ameliorer le visuel global

---

## Phase A - Debloquer Supabase (prerequis)
Priorite: Critique
Temps: 10-15 min

### Actions manuelles
- [ ] Remplacer `YOUR_DB_PASSWORD` dans `DATABASE_URL` du fichier `.env`.
- [ ] Remplacer `YOUR_DB_PASSWORD` dans `DIRECT_URL` du fichier `.env`.
- [ ] Faire la meme mise a jour dans `.env.local` si ce fichier est utilise.
- [ ] Verifier que le mot de passe est URL-encode si besoin (`@`, `:`, `/`, `?`, `#`, etc.).

### Verification technique
- [ ] Executer `npm run check:db`.
- [ ] Executer `npx prisma migrate status`.

### Sortie de phase
- [ ] Connexion DB valide (plus d erreur "Tenant or user not found").

---

## Phase B - Bloc 5: Persistance reelle dashboard
Priorite: Critique
Temps: 45-70 min

### Taches
- [ ] Executer `prisma generate` sans erreur.
- [ ] Appliquer migration si necessaire.
- [ ] Verifier ecriture DB reelle via API clients.
- [ ] Verifier ecriture DB reelle via API contrats.
- [ ] Verifier ecriture DB reelle via API factures.
- [ ] Verifier qu apres refresh/restart les donnees restent presentes.

### Fichiers cibles
- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `src/lib/mock-db.ts`
- `src/app/api/clients/route.ts`
- `src/app/api/contracts/route.ts`
- `src/app/api/invoices/route.ts`

### Sortie de phase
- [ ] Plus de dependance au fallback memoire en usage normal.

---

## Phase C - Bloc 6: Dashboard data-driven
Priorite: Haute
Temps: 45-60 min

### Taches
- [x] Brancher les KPI sur les donnees reelles (clients, contrats, factures) sans valeur hardcodee.
- [x] Centraliser les calculs KPI (CA, en attente, retard, taux signature) dans une logique claire et testable.
- [x] Ajouter un etat vide explicite par section (KPI, factures, contrats) quand aucune donnee n existe.
- [x] Ajouter un fallback d erreur lisible si une source data echoue (message dans le dashboard, pas ecran casse).
- [x] Remplacer les blocs timeline/rappels statiques par des indicateurs derives des donnees quand possible.
- [ ] Verifier que chaque creation metier met a jour le dashboard apres refresh.

### Sequence conseillee
- [x] Etape 1: nettoyer les constantes statiques du dashboard.
- [x] Etape 2: calculer les KPI depuis les donnees chargees.
- [x] Etape 3: traiter les etats vides et erreurs.
- [ ] Etape 4: valider manuellement avec 0, 1 et plusieurs enregistrements.

### Fichiers cibles
- `src/app/dashboard/page.tsx`
- `src/lib/mock-db.ts`
- `src/lib/formatters.ts`

### Sortie de phase
- [ ] Le dashboard evolue en temps reel avec les donnees creees.
- [x] Aucun KPI ne depend d une valeur statique.
- [x] UX correcte en absence de donnees et en cas d erreur data.

---

## Phase D - Bloc 7: Refonte visuelle (phase 1)
Priorite: Haute
Temps: 60-90 min

### Taches
- [x] Definir un systeme visuel simple: couleurs, niveaux de contraste, espacements, rayons, ombres.
- [x] Uniformiser la typographie (hierarchie h1/h2/h3, metadonnees, labels, tableaux).
- [x] Refaire topbar + navigation pour clarte et lisibilite (desktop et mobile).
- [x] Harmoniser cartes KPI et panneaux de contenu (marges, alignements, densite visuelle).
- [x] Ameliorer les tableaux (entetes, rythmes de lignes, etats vides, lisibilite).
- [x] Ajouter des animations courtes et utiles (apparition sections, hover CTA) sans surcharge.
- [x] Faire une passe responsive complete sur dashboard, clients, factures, parametres.

### Sequence conseillee
- [x] Etape 1: poser les variables design dans le CSS global.
- [x] Etape 2: appliquer au dashboard (ecran de reference).
- [x] Etape 3: propager aux autres ecrans (clients, factures, parametres).
- [x] Etape 4: verifier mobile/tablette/desktop puis ajuster les details.

### Fichiers cibles
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/features/clients/ClientsWorkspace.tsx`
- `src/features/invoices/InvoicesWorkspace.tsx`
- `src/features/settings/SettingsPanel.tsx`

### Sortie de phase
- [ ] UI plus premium, lisible et coherente sur mobile/tablette/desktop.
- [x] Plus aucun ecran ne donne une impression de style heterogene.
- [x] Navigation et actions principales restent immediatement comprehensibles.

---

## Ordre d execution recommande
1. Phase A
2. Phase B
3. Phase C
4. Phase D

---

## Checklist de cloture
- [ ] Lint OK (re-run final)
- [ ] Build OK (re-run final)
- [ ] Test manuel: creer client
- [ ] Test manuel: creer facture
- [ ] Test manuel: marquer facture payee
- [ ] Test manuel: sauvegarder parametres
- [ ] Test manuel: verifier persistance apres redemarrage
- [ ] Test manuel: verifier dashboard data-driven
- [ ] Test manuel: verifier rendu mobile/dashboard
- [ ] Commit propre avec message clair

---

## Commits restants proposes
1. `feat(data): enable supabase-backed persistence for dashboard flows`
2. `feat(dashboard): wire KPI and sections to real database data`
3. `feat(ui): refresh visual design system and responsive layout`
