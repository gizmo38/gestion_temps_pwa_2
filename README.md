# Gestion du Temps de Travail - PWA v2

Application web progressive (PWA) de gestion du temps de travail hebdomadaire avec suivi des heures supplémentaires.

## Fonctionnalités

- **Saisie des horaires** : Enregistrement des heures d'arrivée, sortie midi, retour midi et sortie
- **Bilan hebdomadaire** : Vue d'ensemble avec cumul des heures supplémentaires de la semaine
- **Détail par jour** : Liste des jours de la semaine avec badge de différence individuel (heures sup/manque)
- **Planning hebdomadaire** : Configuration du planning par défaut avec possibilité de sauvegarder plusieurs plannings
- **Sélecteur de planning** : Choix rapide du planning depuis l'onglet Saisie
- **Historique** : Visualisation des heures par semaine avec calcul des différences
  - Badge de différence par jour (vert = heures sup, rouge = manque)
  - Barre de progression des jours saisis
  - Cumul hebdomadaire des heures supplémentaires
- **Multi-salariés** : Gestion des horaires pour plusieurs salariés avec sélecteur
- **Paramètres** : Thème clair/sombre, export/import des données

## Technologies

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS v4** - Styles utilitaires
- **DaisyUI v5** - Composants UI
- **next-pwa** - Fonctionnalités PWA (offline, installable)
- **IndexedDB (Dexie.js)** - Stockage persistant des données

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
│   ├── TabsNavigation.tsx     # Navigation par onglets
│   ├── SaisieTab.tsx          # Formulaire de saisie avec bilan hebdo
│   ├── PlanningsTab.tsx       # Gestion des plannings
│   ├── HistoriqueTab.tsx      # Historique semaines avec badges
│   ├── ParametresTab.tsx      # Paramètres application
│   └── SalarieSelector.tsx    # Sélecteur de salarié
├── lib/
│   ├── types.ts               # Types TypeScript
│   ├── utils.ts               # Fonctions utilitaires (calculerStatsSemaine)
│   ├── storage.ts             # Gestion IndexedDB (Dexie.js)
│   ├── db.ts                  # Base de données Dexie
│   └── SalarieContext.tsx     # Contexte React pour salarié actif
├── providers.tsx              # Providers React (SalarieProvider)
├── page.tsx                   # Page principale
├── layout.tsx                 # Layout global
└── globals.css                # Styles globaux
```

## PWA

L'application peut :
- Fonctionner hors ligne
- Être installée sur mobile/desktop
- Sauvegarder les données localement (IndexedDB)

## Stockage des données

Les données sont stockées dans IndexedDB via Dexie.js :
- `journees` : Journées enregistrées par salarié
- `plannings` : Plannings sauvegardés
- `associations_semaines_planning` : Association semaine/planning
- `salaries` : Liste des salariés

### Migration

Les données sont automatiquement migrées depuis localStorage vers IndexedDB au premier lancement.

## Fonctionnalités récentes

### v2.1 - Bilan Hebdomadaire et UI améliorée
- ✅ Ajout du Bilan Hebdomadaire avec cumul des heures supplémentaires
- ✅ Badges de différence par jour (vert/rouge)
- ✅ Barre de progression des jours saisis
- ✅ Sélecteur de planning dans l'en-tête "Saisie des horaires"
- ✅ Layout optimisé avec "Détail par jour" visible sans scroll
- ✅ Cohérence visuelle entre SaisieTab et HistoriqueTab

### v2.0 - Multi-salariés et IndexedDB
- ✅ Gestion multi-salariés avec sélecteur
- ✅ Migration automatique localStorage → IndexedDB
- ✅ Contexte React pour gestion du salarié actif
