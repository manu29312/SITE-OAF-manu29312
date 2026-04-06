
### 1) Structure de l interface
Le fichier `index.html` contient:
- Un header avec le nom de l app et un bouton d action
- Une barre de navigation laterale avec 5 onglets
- Une zone de contenu qui affiche:
  - Dashboard avec KPI + activite recente
  - Clients avec tableau
  - Factures avec formulaire brouillon
  - Contrats avec templates
  - Parametres avec infos entreprise

### 2) Design moderne et lisible
Le fichier `styles.css` apporte:
- Un theme clair personnalise (pas de style par defaut)
- Une typographie plus "produit" (Space Grotesk + IBM Plex Sans)
- Des cartes KPI, badges de statut, tables et formulaires
- Un fond visuel avec gradients/formes
- Une adaptation mobile/desktop (responsive)

### 3) Interaction front
Le fichier `app.js` gere:
- Le changement d onglet avec ajout/retrait de classes CSS
- L affichage dynamique de la section active

## Comment lancer le front
Option la plus simple:
1. Ouvre le dossier du projet
2. Ouvre `index.html` dans le navigateur


Option serveur local (recommande):
1. Installe Node.js si besoin
2. Dans le dossier du projet: `npx serve .`
3. Ouvre l URL affichee (souvent http://localhost:3000 ou 5000)

## Pourquoi cette approche
J ai commence par un front statique propre pour:
- Visualiser rapidement ton produit
- Valider le parcours utilisateur avant de brancher le backend
- Eviter de te bloquer sur la configuration technique au debut

## Prochaine etape recommandee
Passer ensuite sur une base Next.js (comme ton plan MVP) en reprenant:
- Les sections et composants deja poses
- La navigation
- Le style visuel

Ensuite on pourra connecter:
- API clients/factures/contrats
- Authentification
- Base de donnees
