// Base de données IndexedDB avec Dexie pour la gestion du temps
import Dexie, { Table } from 'dexie';
import type {
  JourneeEnregistree,
  PlanningDefault,
  PlanningSauvegarde,
  Parametres,
  AssociationSemainePlanning,
} from './types';

// Définition de la base de données
export class GestionTempsDB extends Dexie {
  // Tables typées
  journees!: Table<JourneeEnregistree, string>; // clé: date
  planningDefault!: Table<{ id: string; planning: PlanningDefault }, string>; // clé: id (toujours "default")
  planningsSauvegardes!: Table<PlanningSauvegarde, string>; // clé: nom
  associationsSemaines!: Table<AssociationSemainePlanning, string>; // clé: semaineId
  parametres!: Table<Parametres & { id: string }, string>; // clé: id (toujours "settings")

  constructor() {
    super('GestionTempsDB');

    // Définition du schéma version 1
    this.version(1).stores({
      // Index sur les champs recherchables
      journees: 'date, totalMinutes', // date est la clé primaire
      planningDefault: 'id', // id fixe "default"
      planningsSauvegardes: 'nom', // nom est la clé primaire
      associationsSemaines: 'semaineId, planningNom', // semaineId est la clé primaire, planningNom est indexé
      parametres: 'id', // id fixe "settings"
    });
  }
}

// Instance unique de la base de données
export const db = new GestionTempsDB();

// Fonction utilitaire pour vérifier si la base de données est accessible
export async function isDatabaseReady(): Promise<boolean> {
  try {
    await db.open();
    return true;
  } catch (error) {
    console.error('Erreur d\'accès à la base de données:', error);
    return false;
  }
}

// Fonction pour obtenir des statistiques sur la base de données
export async function getDatabaseStats() {
  try {
    const stats = {
      journees: await db.journees.count(),
      planningsSauvegardes: await db.planningsSauvegardes.count(),
      associationsSemaines: await db.associationsSemaines.count(),
      hasPlanningDefault: await db.planningDefault.count() > 0,
      hasParametres: await db.parametres.count() > 0,
    };
    return stats;
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return null;
  }
}
