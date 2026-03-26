# Plan pas-a-pas MVP App/Web - Outils administratifs freelances

## Objectif
Construire en 4 semaines une app web qui permet de:
1. Generer des factures PDF propres
2. Generer des contrats personnalises (templates + IA)
3. Envoyer par email + faire des rappels

Ce document est fait pour debutant complet.

---

## 0) Choix techniques (simples pour debuter)

Decision recommandee pour toi:
- Front + backend dans le meme projet: Next.js (App Router) + TypeScript + Tailwind
- Base de donnees: Postgres + Prisma
- Auth: Clerk
- PDF: HTML -> PDF via Puppeteer (rendu propre et flexible)
- Email: Resend
- Stockage PDF: Supabase Storage (ou Cloudflare R2)
- IA contrats: API OpenAI-compatible
- Cron rappels: Vercel Cron (simple pour MVP)

Pourquoi ce choix:
- 1 seul repo
- Beaucoup de tutos
- Plus facile a deployer vite

---

## 1) Prerequis machine (a faire une fois)

## Checklist
- [ ] Installer Node.js LTS
- [ ] Installer Git
- [ ] Installer VS Code
- [ ] Creer un compte GitHub
- [ ] Installer PostgreSQL local (ou creer une base Supabase)
- [ ] Creer comptes: Clerk, Resend, Supabase, OpenAI

## Validation
- [ ] La commande node -v fonctionne
- [ ] La commande npm -v fonctionne
- [ ] La commande git --version fonctionne

---

## 2) Initialiser le projet Next.js

## Checklist
- [ ] Ouvrir un terminal dans ton dossier projet
- [ ] Lancer: npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
- [ ] Lancer: npm run dev
- [ ] Ouvrir http://localhost:3000 et verifier que la page charge

## Definition de fini
- [ ] Le projet demarre sans erreur
- [ ] Tu peux modifier une page et voir le changement en live

---

## 3) Setup qualite de base (important)

## Checklist
- [ ] Configurer Prettier
- [ ] Configurer ESLint (si non deja fait)
- [ ] Creer un fichier .env.local (jamais commit)
- [ ] Configurer variables d env minimales

## Variables d env minimales
- [ ] DATABASE_URL
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] CLERK_SECRET_KEY
- [ ] RESEND_API_KEY
- [ ] OPENAI_API_KEY
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY

## Definition de fini
- [ ] npm run lint passe
- [ ] Aucune cle secrete dans le repo

---

## 4) Authentification (Clerk)

## Checklist
- [ ] Installer Clerk SDK Next.js
- [ ] Proteger les routes privees (/dashboard, /invoices, /contracts, /settings)
- [ ] Ajouter pages Sign in / Sign up
- [ ] Afficher utilisateur connecte dans le header

## Definition de fini
- [ ] Un visiteur non connecte ne peut pas voir le dashboard
- [ ] Un utilisateur connecte accede a ses pages

---

## 5) Base de donnees (Prisma + Postgres)

## Checklist
- [ ] Installer Prisma + client
- [ ] Initialiser Prisma
- [ ] Creer schema pour User, Client, Invoice, Contract, Reminder, EventLog
- [ ] Ajouter enums de status (invoice, contract)
- [ ] Lancer migration
- [ ] Verifier la base avec Prisma Studio

## Definition de fini
- [ ] Tables creees en base
- [ ] Tu peux inserer un client et le relire

---

## 6) Modele de donnees MVP (a implementer)

## Entites
- [ ] User: email, nom, societe, status, TVA, SIREN, adresse, IBAN, logo
- [ ] Client: userId, nom, email, adresse, TVA
- [ ] Invoice: userId, clientId, numero, dates, lignes, totaux, statut, pdfUrl
- [ ] Contract: userId, clientId, type, titre, contenu, pays, langue, signatureStatus, pdfUrl
- [ ] Reminder: userId, invoiceId, scheduleDate, status, channel
- [ ] EventLog: type, entityId, createdAt, metadata

## Regles metier critiques
- [ ] Numero de facture sequentiel et immutable apres emission
- [ ] Calcul total HT, TVA, TTC cote serveur (jamais uniquement front)
- [ ] Une facture payee ne redevient pas brouillon

---

## 7) UI structure (App Router)

## Pages a creer
- [ ] /dashboard
- [ ] /clients
- [ ] /invoices
- [ ] /invoices/new
- [ ] /invoices/[id]
- [ ] /contracts
- [ ] /contracts/new
- [ ] /contracts/[id]
- [ ] /settings

## Composants de base
- [ ] Header navigation
- [ ] Sidebar (optionnel)
- [ ] Table reutilisable
- [ ] Form fields reutilisables
- [ ] Badge de status
- [ ] Toast de succes/erreur

## Definition de fini
- [ ] Navigation complete sans lien casse
- [ ] Design propre et lisible mobile + desktop

---

## 8) Semaine 1 - Clients + Factures CRUD (sans PDF)

## Taches
- [ ] CRUD Client (create/list/update)
- [ ] Recherche client (nom/email)
- [ ] Ecran nouvelle facture (form complet)
- [ ] Ajouter/supprimer lignes facture
- [ ] Calculs HT/TVA/TTC en live + validation serveur
- [ ] Sauvegarder facture en draft
- [ ] Liste des factures avec statuts

## API minimales
- [ ] POST /api/clients
- [ ] GET /api/clients?query=
- [ ] POST /api/invoices
- [ ] GET /api/invoices
- [ ] GET /api/invoices/:id
- [ ] POST /api/invoices/:id/mark-paid

## Tests minimaux
- [ ] Test calcul totaux
- [ ] Test creation facture
- [ ] Test transition de statut vers paid

## Definition de fini S1
- [ ] On peut creer un client
- [ ] On peut creer une facture brouillon
- [ ] Les totaux sont corrects

---

## 9) Semaine 2 - PDF + stockage + email + tracking

## Taches
- [ ] Creer template HTML facture (A4)
- [ ] Generer PDF serveur avec Puppeteer
- [ ] Uploader PDF vers Supabase Storage
- [ ] Sauvegarder pdfUrl
- [ ] Envoyer facture par email via Resend
- [ ] Ajouter tracking pixel de vue
- [ ] Logguer events: sent, viewed, downloaded

## API minimales
- [ ] POST /api/invoices/:id/pdf
- [ ] POST /api/invoices/:id/send
- [ ] GET /api/track/open?invoiceId=...

## Tests minimaux
- [ ] PDF se genere sans erreur
- [ ] Email recu en boite test
- [ ] Event viewed enregistre

## Definition de fini S2
- [ ] Une facture peut etre envoyee avec son PDF
- [ ] Le statut passe sent puis viewed

---

## 10) Semaine 3 - Contrats (templates + IA) + PDF + signature simple

## Taches
- [ ] Creer 3 templates de base (Prestation, NDA, Cession droits)
- [ ] Form contrat (details mission, livrables, delais, tarifs, loi)
- [ ] Endpoint IA pour suggerer clauses
- [ ] Champs editables apres suggestion IA
- [ ] Generer PDF contrat
- [ ] Envoyer contrat par email
- [ ] Signature simple par lien d acceptation (MVP)

## API minimales
- [ ] POST /api/contracts
- [ ] POST /api/contracts/:id/suggest-clauses
- [ ] POST /api/contracts/:id/pdf
- [ ] POST /api/contracts/:id/send
- [ ] POST /api/contracts/:id/accept

## Tests minimaux
- [ ] Suggestion IA retourne du texte structure
- [ ] Contrat exportable en PDF
- [ ] Acceptation par lien change le status signed

## Definition de fini S3
- [ ] Tu peux creer, envoyer et faire accepter un contrat

---

## 11) Semaine 4 - Dashboard + rappels auto + polish

## Taches
- [ ] Dashboard KPI (total facture, en attente, retard, taux signature)
- [ ] Graphe mensuel (bar chart)
- [ ] Planification rappels auto (J-3, J+3, J+10)
- [ ] Job cron quotidien pour envoyer les rappels
- [ ] Bouton relance manuelle
- [ ] Finaliser UX (messages erreurs, etats vides, loading)
- [ ] Preparer demo publique

## API minimales
- [ ] POST /api/reminders/schedule
- [ ] POST /api/reminders/run-due (appele par cron)

## Tests minimaux
- [ ] Un rappel du jour est envoye
- [ ] Pas de doublon d envoi

## Definition de fini S4
- [ ] Le cycle complet marche: creation -> envoi -> suivi -> relance

---

## 12) Ordre de developpement ultra concret (jour par jour)

## Jours 1-2
- [ ] Setup projet + auth + base

## Jours 3-5
- [ ] CRUD clients + facture draft + calculs

## Jours 6-8
- [ ] PDF facture + stockage

## Jours 9-10
- [ ] Email envoi + tracking

## Jours 11-14
- [ ] Contrats templates + IA + PDF

## Jours 15-17
- [ ] Signature simple + suivi statuts

## Jours 18-20
- [ ] Dashboard + KPI + graphiques

## Jours 21-23
- [ ] Rappels auto + cron

## Jours 24-26
- [ ] Tests, correction bugs, UX

## Jours 27-28
- [ ] Deployment + demo

---

## 13) Checklist legal MVP (France/EU)

- [ ] Numerotation facture sequentielle non modifiable
- [ ] Mentions TVA correctes
- [ ] Mentions penalites retard
- [ ] Conditions de reglement
- [ ] Clauses contrat de base revisees par juriste
- [ ] Journal d evenements conserve

Important:
- Ceci n est pas un conseil juridique. Fais valider les templates par un juriste.

---

## 14) Deploy (simple)

## Checklist
- [ ] Push sur GitHub
- [ ] Deploy web sur Vercel
- [ ] Configurer variables d env en production
- [ ] Connecter base Postgres prod
- [ ] Configurer domaine email (SPF, DKIM, DMARC)
- [ ] Tester parcours complet en prod

## Definition de fini
- [ ] URL publique accessible
- [ ] Creation facture + envoi email fonctionne en prod

---

## 15) KPI a suivre des le debut

- [ ] Activation: profil complete
- [ ] Time to first invoice
- [ ] Conversion Freemium -> Pro
- [ ] DSO (retard moyen)

---

## 16) Pricing MVP (a afficher plus tard)

- [ ] Freemium: 3 docs/mois + watermark leger
- [ ] Pro 12 EUR/mois: illimite + rappels auto + themes PDF + suivi vues
- [ ] Business 29 EUR/mois: multi-societes + signatures avancees + export comptable

---

## 17) Regles de reussite (DoD global)

Le MVP est pret si:
- [ ] Un freelance cree son profil
- [ ] Cree et envoie une facture PDF
- [ ] Recoit un statut de vue
- [ ] Genere un contrat avec aide IA
- [ ] Envoie le contrat et recoit acceptation
- [ ] Les rappels partent automatiquement
- [ ] Le dashboard affiche KPI essentiels

---

## 18) Si tu veux commencer tout de suite (ordre exact)

1. Faire le setup machine
2. Initialiser Next.js
3. Ajouter Clerk
4. Ajouter Prisma + Postgres
5. Creer CRUD Client
6. Creer CRUD Facture draft
7. Ajouter generation PDF
8. Ajouter email envoi + suivi
9. Ajouter module Contrat + IA
10. Ajouter rappels + dashboard
11. Deploy + demo

---

## 19) A eviter (gros pieges)

- [ ] Ne pas coder mobile tout de suite
- [ ] Ne pas faire trop de templates au debut
- [ ] Ne pas calculer les montants uniquement dans le front
- [ ] Ne pas oublier les logs d evenements
- [ ] Ne pas deployer sans tests de base

---

Si tu veux, prochaine etape je peux te generer un second fichier: ROADMAP_JOUR_1.md
avec seulement les taches du premier jour, commande par commande.
