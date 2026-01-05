# Gestion du Temps de Travail - PWA v2

Application web progressive (PWA) de gestion du temps de travail hebdomadaire.

## Fonctionnalités

- **Saisie des horaires** : Enregistrement des heures d'arrivée, sortie midi, retour midi et sortie
- **Planning hebdomadaire** : Configuration du planning par défaut avec possibilité de sauvegarder plusieurs plannings
- **Historique** : Visualisation des heures par semaine avec calcul des différences
- **Paramètres** : Thème clair/sombre, export/import des données

## Technologies

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS v4** - Styles utilitaires
- **DaisyUI v5** - Composants UI
- **next-pwa** - Fonctionnalités PWA (offline, installable)

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Production

```bash
npm run build
npm start
```

## Structure du projet

```
app/
├── components/
│   ├── TabsNavigation.tsx   # Navigation par onglets
│   ├── SaisieTab.tsx        # Formulaire de saisie
│   ├── PlanningsTab.tsx     # Gestion des plannings
│   ├── HistoriqueTab.tsx    # Historique semaines
│   └── ParametresTab.tsx    # Paramètres application
├── lib/
│   ├── types.ts             # Types TypeScript
│   ├── utils.ts             # Fonctions utilitaires
│   └── storage.ts           # Gestion localStorage
├── page.tsx                 # Page principale
├── layout.tsx               # Layout global
└── globals.css              # Styles globaux
```

## PWA

L'application peut :
- Fonctionner hors ligne
- Être installée sur mobile/desktop
- Sauvegarder les données localement (localStorage)

## Stockage des données

Les données sont stockées dans le localStorage du navigateur :
- `gestion_temps_journees` : Journées enregistrées
- `gestion_temps_planning` : Planning par défaut
- `gestion_temps_plannings_sauvegardes` : Plannings sauvegardés
- `gestion_temps_parametres` : Paramètres utilisateur
