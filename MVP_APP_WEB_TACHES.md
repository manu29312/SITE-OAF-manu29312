# Plan pas-a-pas MVP App/Web - Outils administratifs freelances

Mise a jour du plan selon l etat reel du code du repo au 06/04/2026.

## Objectif MVP
Construire une app web qui permet de:
1. Generer des factures PDF propres
2. Generer des contrats personnalises (templates + IA)
3. Envoyer par email + faire des rappels automatiques

---

## 1) Etat actuel du projet (ce qui est deja fait)

### Base technique
- [x] Projet Next.js App Router + TypeScript initialise
- [x] Scripts npm de base (`dev`, `build`, `start`, `lint`)
- [x] Structure modulaire en place (`src/app`, `src/components`, `src/features`, `src/lib`, `src/types`)
- [x] Front legacy conserve dans `legacy-static/`

### UI et composants
- [x] Layout global et styles globaux en place
- [x] Composants reutilisables deja presents (header, sidebar, table, badges, cards)
- [x] Page principale avec vue dashboard/migration
- [~] Navigation metier visible mais pas encore en routes separees

### API et logique metier
- [x] API clients: `GET /api/clients`, `POST /api/clients`
- [x] API factures: `GET /api/invoices`, `POST /api/invoices`
- [x] API contrats: `GET /api/contracts`, `POST /api/contracts`
- [x] Validation serveur minimale des payloads
- [x] Formulaire creation facture avec calcul HT/TTC en direct (front)
- [x] Donnees mock en place (`mock-db`)

### Qualite
- [x] ESLint configure via Next.js
- [x] Fichier `.env.example` present
- [ ] Prettier non configure
- [ ] Tests automatises absents

---

## 2) Ce qui reste a faire (priorise)

## Priorite P0 - Foundation produit (a faire en premier)
- [~] Ajouter authentification (Clerk) et protection des routes privees
- [~] Passer de `mock-db` vers Postgres + Prisma
- [x] Creer schema Prisma complet: User, Client, Invoice, Contract, Reminder, EventLog
- [~] Ajouter migrations + seed + Prisma Studio
- [x] Definir et appliquer les regles metier critiques cote serveur

Pour finaliser les points [~] en local:
- [x] Installer les dependances: npm install
- [x] Generer Prisma Client: npm run prisma:generate
- [ ] Lancer migration: npm run prisma:migrate (bloque: PostgreSQL inaccessible sur localhost:5432)
- [ ] Charger le seed: npm run prisma:seed (bloque: PostgreSQL inaccessible sur localhost:5432)
- [ ] Ouvrir Prisma Studio: npm run prisma:studio
- [~] Ajouter tes vraies cles Clerk dans `.env.local` (fichier cree, cles encore placeholders)

## Priorite P1 - Facturation MVP solide
- [ ] Completer CRUD client (update + delete + recherche)
- [ ] Completer CRUD facture (detail par id, update statut, marquer payee)
- [ ] Ajouter lignes de facture (items) avec calcul HT/TVA/TTC cote serveur
- [ ] Garantir numero facture sequentiel et immutable apres emission
- [ ] Brancher le bouton "Enregistrer brouillon" sur un vrai POST + feedback utilisateur

## Priorite P2 - PDF + envoi + tracking
- [ ] Template HTML facture A4
- [ ] Generation PDF serveur (Puppeteer)
- [ ] Upload PDF (Supabase Storage ou R2)
- [ ] Endpoint envoi email facture (Resend)
- [ ] Tracking ouverture (pixel) + events `sent/viewed/downloaded`

## Priorite P3 - Contrats MVP
- [ ] Templates contrats (Prestation, NDA, Cession)
- [ ] Creation contrat enrichie (champs mission + clauses)
- [ ] Endpoint IA suggestion clauses
- [ ] PDF contrat + envoi email
- [ ] Signature simple par lien d acceptation

## Priorite P4 - Dashboard + rappels
- [ ] KPI dashboard (factures en attente, retard, taux signature, etc.)
- [ ] Graphe mensuel
- [ ] Planification rappels (J-3, J+3, J+10)
- [ ] Endpoint cron `run-due`
- [ ] Relance manuelle

---

## 3) Detail par bloc initial (fait / partiel / a faire)

## Bloc Setup
- [x] Next.js initialise
- [~] Variables d env: modele present, valeurs reelles a configurer
- [ ] Prettier

## Bloc Auth
- [ ] Clerk complet

## Bloc Base de donnees
- [ ] Prisma + Postgres

## Bloc UI structure
- [~] Composants de base OK
- [ ] Pages App Router separees a creer:
	- [ ] `/dashboard`
	- [ ] `/clients`
	- [ ] `/invoices`
	- [ ] `/invoices/new`
	- [ ] `/invoices/[id]`
	- [ ] `/contracts`
	- [ ] `/contracts/new`
	- [ ] `/contracts/[id]`
	- [ ] `/settings`

## Bloc API (etat reel)
- [x] `POST /api/clients`
- [x] `GET /api/clients`
- [x] `POST /api/invoices`
- [x] `GET /api/invoices`
- [x] `POST /api/contracts`
- [x] `GET /api/contracts`
- [ ] `GET /api/clients?query=`
- [ ] `GET /api/invoices/:id`
- [ ] `POST /api/invoices/:id/mark-paid`
- [ ] Endpoints PDF / send / tracking
- [ ] Endpoints reminders

## Bloc tests
- [ ] Tests unitaires calcul totaux
- [ ] Tests API creation facture/client/contrat
- [ ] Tests transition de statut facture

---

## 4) Plan d execution recommande (7 prochains jours)

## Jour 1
- [ ] Installer Prisma + config Postgres
- [ ] Ecrire schema initial + migration
- [ ] Remplacer lecture mock par Prisma sur clients

## Jour 2
- [ ] Migrer factures vers Prisma
- [ ] Ajouter route facture detail (`GET /api/invoices/[id]`)
- [ ] Ajouter `mark-paid` avec regles de transition

## Jour 3
- [ ] CRUD clients complet (search + update)
- [ ] Connecter formulaire facture a API reelle
- [ ] Ajouter toasts succes/erreur

## Jour 4
- [ ] Template facture HTML A4
- [ ] Generation PDF serveur
- [ ] Stockage PDF + `pdfUrl`

## Jour 5
- [ ] Envoi email Resend
- [ ] Tracking ouverture + event log

## Jour 6
- [ ] Contrats: templates + endpoint suggestion IA
- [ ] PDF contrat + envoi

## Jour 7
- [ ] Rappels auto + cron
- [ ] Tests minimaux + correction bugs
- [ ] Preparation deploy

---

## 5) Checklist de fin MVP (a cocher en fin de cycle)

- [ ] Profil utilisateur cree et sauvegarde
- [ ] Client cree/modifie/recherche
- [ ] Facture brouillon creee avec totaux valides serveur
- [ ] Facture PDF generee et envoyee
- [ ] Tracking vue facture actif
- [ ] Contrat genere avec aide IA
- [ ] Contrat envoye et accepte
- [ ] Rappels auto envoyes sans doublon
- [ ] Dashboard KPI lisible
- [ ] Deploy production valide

---

## Notes importantes
- L etat ci-dessus se base sur le code actuellement present dans le repo.
- Certaines taches "machine/comptes" (Node installe, comptes Clerk/Resend/Supabase/OpenAI) restent a verifier manuellement.
- Le repo est bien avance sur la structure, mais les briques MVP critiques (auth, vraie DB, PDF, email, reminders) sont encore a implementer.
