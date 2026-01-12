// Gestion du stockage IndexedDB avec Dexie pour la persistance des données

import { JourneeEnregistree, PlanningDefault, Parametres, PlanningSauvegarde, AssociationSemainePlanning } from "./types";
import { PLANNING_DEFAULT } from "./utils";
import { db } from "./db";

// Clés de stockage localStorage (pour backup/compatibilité)
export const STORAGE_KEYS = {
  JOURNEES: "gestion_temps_journees",
  PLANNING: "gestion_temps_planning",
  PLANNINGS_SAUVEGARDES: "gestion_temps_plannings_sauvegardes",
  PARAMETRES: "gestion_temps_parametres",
  ASSOCIATIONS_SEMAINES: "gestion_temps_associations_semaines",
};

// Vérifie si on est côté client (navigateur)
const isClient = typeof window !== "undefined";

// === JOURNÉES ===

export async function getJournees(): Promise<Record<string, JourneeEnregistree>> {
  if (!isClient) return {};
  try {
    const journees = await db.journees.toArray();
    // Convertir le tableau en objet avec date comme clé
    const result: Record<string, JourneeEnregistree> = {};
    journees.forEach(journee => {
      result[journee.date] = journee;
    });
    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération des journées:", error);
    return {};
  }
}

export async function getJournee(date: string): Promise<JourneeEnregistree | null> {
  if (!isClient) return null;
  try {
    const journee = await db.journees.get(date);
    return journee || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la journée:", error);
    return null;
  }
}

export async function saveJournee(journee: JourneeEnregistree): Promise<void> {
  if (!isClient) return;
  try {
    await db.journees.put(journee);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la journée:", error);
  }
}

export async function deleteJournee(date: string): Promise<void> {
  if (!isClient) return;
  try {
    await db.journees.delete(date);
  } catch (error) {
    console.error("Erreur lors de la suppression de la journée:", error);
  }
}

// === PLANNING PAR DÉFAUT ===

export async function getPlanningDefault(): Promise<PlanningDefault> {
  if (!isClient) return PLANNING_DEFAULT;
  try {
    const result = await db.planningDefault.get("default");
    return result?.planning || PLANNING_DEFAULT;
  } catch (error) {
    console.error("Erreur lors de la récupération du planning par défaut:", error);
    return PLANNING_DEFAULT;
  }
}

export async function savePlanningDefault(planning: PlanningDefault): Promise<void> {
  if (!isClient) return;
  try {
    await db.planningDefault.put({ id: "default", planning });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du planning par défaut:", error);
  }
}

// === PLANNINGS SAUVEGARDÉS ===

export async function getPlanningSauvegardes(): Promise<Record<string, PlanningDefault>> {
  if (!isClient) return {};
  try {
    const plannings = await db.planningsSauvegardes.toArray();
    // Convertir le tableau en objet avec nom comme clé
    const result: Record<string, PlanningDefault> = {};
    plannings.forEach(p => {
      result[p.nom] = p.planning;
    });
    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération des plannings sauvegardés:", error);
    return {};
  }
}

export async function savePlanningSauvegarde(
  nom: string,
  planning: PlanningDefault,
): Promise<void> {
  if (!isClient) return;
  try {
    await db.planningsSauvegardes.put({ nom, planning });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du planning:", error);
  }
}

export async function deletePlanningSauvegarde(nom: string): Promise<void> {
  if (!isClient) return;
  try {
    await db.planningsSauvegardes.delete(nom);
  } catch (error) {
    console.error("Erreur lors de la suppression du planning:", error);
  }
}

// === ASSOCIATIONS SEMAINE-PLANNING ===

// Obtenir toutes les associations semaine-planning
export async function getAssociationsSemaines(): Promise<Record<string, string>> {
  if (!isClient) return {};
  try {
    const associations = await db.associationsSemaines.toArray();
    // Convertir le tableau en objet avec semaineId comme clé
    const result: Record<string, string> = {};
    associations.forEach(a => {
      result[a.semaineId] = a.planningNom;
    });
    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération des associations:", error);
    return {};
  }
}

// Obtenir le planning associé à une semaine spécifique
export async function getAssociationSemaine(semaineId: string): Promise<string | null> {
  if (!isClient) return null;
  try {
    const association = await db.associationsSemaines.get(semaineId);
    return association?.planningNom || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'association:", error);
    return null;
  }
}

// Associer un planning à une semaine
export async function saveAssociationSemaine(
  semaineId: string,
  planningNom: string,
): Promise<void> {
  if (!isClient) return;
  try {
    if (planningNom === "default") {
      // Si "default", on supprime l'association
      await db.associationsSemaines.delete(semaineId);
    } else {
      await db.associationsSemaines.put({ semaineId, planningNom });
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'association:", error);
  }
}

// Supprimer une association
export async function deleteAssociationSemaine(semaineId: string): Promise<void> {
  if (!isClient) return;
  try {
    await db.associationsSemaines.delete(semaineId);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'association:", error);
  }
}

// Obtenir le planning effectif pour une semaine (associé ou default)
export async function getPlanningPourSemaine(semaineId: string): Promise<PlanningDefault> {
  const planningNom = await getAssociationSemaine(semaineId);
  if (!planningNom) {
    return await getPlanningDefault();
  }
  const plannings = await getPlanningSauvegardes();
  // Vérifier que le planning existe toujours
  if (plannings[planningNom]) {
    return plannings[planningNom];
  }
  // Fallback sur le planning par défaut si le planning n'existe plus
  return await getPlanningDefault();
}

// === PARAMÈTRES ===

const PARAMETRES_DEFAULT: Parametres = {
  theme: "light",
  sauvegardeAuto: true,
  pasMinutes: 5,
};

export async function getParametres(): Promise<Parametres> {
  if (!isClient) return PARAMETRES_DEFAULT;
  try {
    const result = await db.parametres.get("settings");
    if (!result) return PARAMETRES_DEFAULT;
    // Retirer l'id et merger avec les valeurs par défaut
    const { id, ...parametres } = result;
    return { ...PARAMETRES_DEFAULT, ...parametres };
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return PARAMETRES_DEFAULT;
  }
}

export async function saveParametres(parametres: Parametres): Promise<void> {
  if (!isClient) return;
  try {
    await db.parametres.put({ id: "settings", ...parametres });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres:", error);
  }
}

// === EXPORT/IMPORT ===

export async function exportAllData(): Promise<string> {
  try {
    const data = {
      journees: await getJournees(),
      planning: await getPlanningDefault(),
      planningsSauvegardes: await getPlanningSauvegardes(),
      associationsSemaines: await getAssociationsSemaines(),
      parametres: await getParametres(),
    };
    return JSON.stringify(data);
  } catch (error) {
    console.error("Erreur lors de l'export des données:", error);
    return JSON.stringify({});
  }
}

export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);

    // Importer les journées
    if (data.journees) {
      const journeesArray = Object.values(data.journees) as JourneeEnregistree[];
      await db.journees.bulkPut(journeesArray);
    }

    // Importer le planning par défaut
    if (data.planning) {
      await db.planningDefault.put({ id: "default", planning: data.planning });
    }

    // Importer les plannings sauvegardés
    if (data.planningsSauvegardes) {
      const planningsArray: PlanningSauvegarde[] = Object.entries(data.planningsSauvegardes).map(
        ([nom, planning]) => ({ nom, planning: planning as PlanningDefault })
      );
      await db.planningsSauvegardes.bulkPut(planningsArray);
    }

    // Importer les associations semaines
    if (data.associationsSemaines) {
      const associationsArray: AssociationSemainePlanning[] = Object.entries(
        data.associationsSemaines
      ).map(([semaineId, planningNom]) => ({ semaineId, planningNom: planningNom as string }));
      await db.associationsSemaines.bulkPut(associationsArray);
    }

    // Importer les paramètres
    if (data.parametres) {
      await db.parametres.put({ id: "settings", ...data.parametres });
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'import des données:", error);
    return false;
  }
}

// === MIGRATION DEPUIS LOCALSTORAGE ===

// Fonction pour migrer les données de localStorage vers IndexedDB
export async function migrateFromLocalStorage(): Promise<boolean> {
  if (!isClient) return false;

  try {
    // Vérifier si des données existent dans localStorage
    const hasLocalStorageData =
      localStorage.getItem(STORAGE_KEYS.JOURNEES) ||
      localStorage.getItem(STORAGE_KEYS.PLANNING) ||
      localStorage.getItem(STORAGE_KEYS.PLANNINGS_SAUVEGARDES) ||
      localStorage.getItem(STORAGE_KEYS.ASSOCIATIONS_SEMAINES) ||
      localStorage.getItem(STORAGE_KEYS.PARAMETRES);

    if (!hasLocalStorageData) {
      console.log("Aucune donnée localStorage à migrer");
      return false;
    }

    console.log("Migration des données localStorage → IndexedDB...");

    // Migrer les journées
    const journeesData = localStorage.getItem(STORAGE_KEYS.JOURNEES);
    if (journeesData) {
      const journees: Record<string, JourneeEnregistree> = JSON.parse(journeesData);
      const journeesArray = Object.values(journees);
      if (journeesArray.length > 0) {
        await db.journees.bulkPut(journeesArray);
        console.log(`✓ ${journeesArray.length} journées migrées`);
      }
    }

    // Migrer le planning par défaut
    const planningData = localStorage.getItem(STORAGE_KEYS.PLANNING);
    if (planningData) {
      const planning: PlanningDefault = JSON.parse(planningData);
      await db.planningDefault.put({ id: "default", planning });
      console.log("✓ Planning par défaut migré");
    }

    // Migrer les plannings sauvegardés
    const planningsData = localStorage.getItem(STORAGE_KEYS.PLANNINGS_SAUVEGARDES);
    if (planningsData) {
      const plannings: Record<string, PlanningDefault> = JSON.parse(planningsData);
      const planningsArray: PlanningSauvegarde[] = Object.entries(plannings).map(
        ([nom, planning]) => ({ nom, planning })
      );
      if (planningsArray.length > 0) {
        await db.planningsSauvegardes.bulkPut(planningsArray);
        console.log(`✓ ${planningsArray.length} plannings sauvegardés migrés`);
      }
    }

    // Migrer les associations
    const associationsData = localStorage.getItem(STORAGE_KEYS.ASSOCIATIONS_SEMAINES);
    if (associationsData) {
      const associations: Record<string, string> = JSON.parse(associationsData);
      const associationsArray: AssociationSemainePlanning[] = Object.entries(associations).map(
        ([semaineId, planningNom]) => ({ semaineId, planningNom })
      );
      if (associationsArray.length > 0) {
        await db.associationsSemaines.bulkPut(associationsArray);
        console.log(`✓ ${associationsArray.length} associations migrées`);
      }
    }

    // Migrer les paramètres
    const parametresData = localStorage.getItem(STORAGE_KEYS.PARAMETRES);
    if (parametresData) {
      const parametres: Parametres = JSON.parse(parametresData);
      await db.parametres.put({ id: "settings", ...parametres });
      console.log("✓ Paramètres migrés");
    }

    console.log("✓ Migration terminée avec succès!");

    // On garde localStorage comme backup (ne pas supprimer pour le moment)

    return true;
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    return false;
  }
}

// Fonction pour vérifier si la migration a déjà été effectuée
export async function needsMigration(): Promise<boolean> {
  if (!isClient) return false;

  try {
    // Si IndexedDB est vide et localStorage a des données, on a besoin de migrer
    const dbCount = await db.journees.count();
    const hasLocalStorage = !!localStorage.getItem(STORAGE_KEYS.JOURNEES);

    return dbCount === 0 && hasLocalStorage;
  } catch (error) {
    console.error("Erreur lors de la vérification de migration:", error);
    return false;
  }
}
