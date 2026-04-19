# Plan de travail MVP - Outil administratif freelances

## Objectif
Construire une version fiable, claire et exploitable en production: Clients + Contrats + Factures + Suivi + Rappels.

## Ordre de priorite
1. Securite et fondations
2. Fiabilite metier
3. Valeur utilisateur visible
4. Qualite et scalabilite

---

## Sprint 1 - Fondations (priorite haute)

### 1. Authentification reelle
- [ ] Choisir la strategie auth (maison ou provider)
- [ ] Remplacer le mode local actuel dans src/lib/auth-user.ts
- [ ] Proteger les pages metier (dashboard, clients, contrats, factures, parametres)
- [ ] Proteger les routes API (clients, contrats, factures)
- [ ] Ajouter gestion de session (expiration, deconnexion)

Definition of done
- [ ] Un utilisateur non connecte ne peut pas acceder aux pages privees
- [ ] Les APIs refusent tout appel non authentifie

### 2. Validation unifiee front + API
- [ ] Ajouter une couche de schemas de validation (ex: Zod)
- [ ] Valider payloads dans les formulaires
- [ ] Valider payloads dans les routes API
- [ ] Uniformiser les messages d erreurs utilisateur

Definition of done
- [ ] Meme regle de validation appliquee partout
- [ ] Aucune creation invalide ne passe en base

### 3. Regles metier de base facture
- [ ] Verrouiller la numerotation sequentielle
- [ ] Empcher les doublons de numero
- [ ] Encadrer transitions de statut (brouillon -> envoyee -> payee/retard)
- [ ] Journaliser les actions critiques (creation, envoi, paiement)

Definition of done
- [ ] Numerotation stable et coherente
- [ ] Transitions de statut conformes

---

## Sprint 2 - Valeur produit (priorite haute)

### 4. PDF Facture et Contrat
- [ ] Choisir moteur PDF
- [ ] Creer template facture (mentions legales, TVA, penalites, IBAN)
- [ ] Creer template contrat (sections numerotees, clauses, signatures)
- [ ] Ajouter bouton telecharger PDF sur factures
- [ ] Ajouter bouton telecharger PDF sur contrats

Definition of done
- [ ] PDF genere depuis l UI
- [ ] Mise en page lisible et stable

### 5. Rappels automatiques
- [ ] Creer moteur de planification J-3, J+3, J+10
- [ ] Lier les rappels aux factures en attente/retard
- [ ] Ajouter historique des rappels envoyes
- [ ] Ajouter action relance manuelle

Definition of done
- [ ] Les rappels auto sont traces
- [ ] Le dashboard affiche un etat clair des rappels

### 6. Timeline et suivi
- [ ] Alimenter EventLog sur chaque evenement metier
- [ ] Afficher une timeline utile dans dashboard
- [ ] Ajouter filtres simples (facture, contrat, client)

Definition of done
- [ ] La timeline correspond aux actions reelles

---

## Sprint 3 - Qualite et mise en production

### 7. Tests essentiels
- [ ] Tests unitaires calculs (HT, TVA, TTC, remises)
- [ ] Tests unitaires transitions de statut
- [ ] Tests integration API (clients, contrats, factures)
- [ ] Test E2E du parcours principal

Definition of done
- [ ] Pipeline de test vert
- [ ] Parcours critique stable

### 8. Performance et scalabilite
- [ ] Ajouter pagination serveur (clients, factures, contrats)
- [ ] Ajouter filtres/tri serveur
- [ ] Optimiser requetes Prisma et indexes

Definition of done
- [ ] Pages performantes meme avec gros volume

### 9. CI/CD minimum
- [ ] Configurer workflow CI (lint + typecheck + tests + build)
- [ ] Bloquer merge si CI en echec
- [ ] Ajouter checks PR obligatoires

Definition of done
- [ ] Chaque PR est verifiee automatiquement

---

## Backlog post-MVP
- [ ] Signature avancee (eIDAS via prestataire)
- [ ] Paiement en ligne (ex: Stripe)
- [ ] Integrations externes (banque, compta, messagerie)
- [ ] Multi-societes / multi-pays / multi-devises
- [ ] OCR pieces et rapprochement automatique

---

## Routine hebdomadaire conseillee

### Chaque debut de semaine
- [ ] Choisir 5 a 8 taches max
- [ ] Prioriser par impact utilisateur
- [ ] Estimer charge (petite/moyenne/grande)

### Chaque fin de semaine
- [ ] Verifier definition of done
- [ ] Noter blocages et decisions
- [ ] Mettre a jour ce plan

---

## Tableau de suivi rapide

### A faire
- [ ] Sprint 1 - Auth
- [ ] Sprint 1 - Validation
- [ ] Sprint 1 - Regles facture

### En cours
- [ ] (aucune)

### Termine
- [ ] Refonte visuelle globale
- [ ] Nettoyage des dependances/fichiers inutilises
