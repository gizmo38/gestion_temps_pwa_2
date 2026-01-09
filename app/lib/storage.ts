// Gestion du localStorage pour la persistance des données

import { JourneeEnregistree, PlanningDefault, Parametres } from "./types";
import { PLANNING_DEFAULT } from "./utils";

const STORAGE_KEYS = {
  JOURNEES: "gestion_temps_journees",
  PLANNING: "gestion_temps_planning",
  PLANNINGS_SAUVEGARDES: "gestion_temps_plannings_sauvegardes",
  PARAMETRES: "gestion_temps_parametres",
  ASSOCIATIONS_SEMAINES: "gestion_temps_associations_semaines",
};

// Vérifie si on est côté client (navigateur)
const isClient = typeof window !== "undefined";

// === JOURNÉES ===

export function getJournees(): Record<string, JourneeEnregistree> {
  if (!isClient) return {};
  const data = localStorage.getItem(STORAGE_KEYS.JOURNEES);
  return data ? JSON.parse(data) : {};
}

export function getJournee(date: string): JourneeEnregistree | null {
  const journees = getJournees();
  return journees[date] || null;
}

export function saveJournee(journee: JourneeEnregistree): void {
  if (!isClient) return;
  const journees = getJournees();
  journees[journee.date] = journee;
  localStorage.setItem(STORAGE_KEYS.JOURNEES, JSON.stringify(journees));
}

export function deleteJournee(date: string): void {
  if (!isClient) return;
  const journees = getJournees();
  delete journees[date];
  localStorage.setItem(STORAGE_KEYS.JOURNEES, JSON.stringify(journees));
}

// === PLANNING PAR DÉFAUT ===

export function getPlanningDefault(): PlanningDefault {
  if (!isClient) return PLANNING_DEFAULT;
  const data = localStorage.getItem(STORAGE_KEYS.PLANNING);
  return data ? JSON.parse(data) : PLANNING_DEFAULT;
}

export function savePlanningDefault(planning: PlanningDefault): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.PLANNING, JSON.stringify(planning));
}

// === PLANNINGS SAUVEGARDÉS ===

export function getPlanningSauvegardes(): Record<string, PlanningDefault> {
  if (!isClient) return {};
  const data = localStorage.getItem(STORAGE_KEYS.PLANNINGS_SAUVEGARDES);
  return data ? JSON.parse(data) : {};
}

export function savePlanningSauvegarde(
  nom: string,
  planning: PlanningDefault,
): void {
  if (!isClient) return;
  const plannings = getPlanningSauvegardes();
  plannings[nom] = planning;
  localStorage.setItem(
    STORAGE_KEYS.PLANNINGS_SAUVEGARDES,
    JSON.stringify(plannings),
  );
}

export function deletePlanningSauvegarde(nom: string): void {
  if (!isClient) return;
  const plannings = getPlanningSauvegardes();
  delete plannings[nom];
  localStorage.setItem(
    STORAGE_KEYS.PLANNINGS_SAUVEGARDES,
    JSON.stringify(plannings),
  );
}

// === ASSOCIATIONS SEMAINE-PLANNING ===

// Obtenir toutes les associations semaine-planning
export function getAssociationsSemaines(): Record<string, string> {
  if (!isClient) return {};
  const data = localStorage.getItem(STORAGE_KEYS.ASSOCIATIONS_SEMAINES);
  return data ? JSON.parse(data) : {};
}

// Obtenir le planning associé à une semaine spécifique
export function getAssociationSemaine(semaineId: string): string | null {
  const associations = getAssociationsSemaines();
  return associations[semaineId] || null;
}

// Associer un planning à une semaine
export function saveAssociationSemaine(
  semaineId: string,
  planningNom: string,
): void {
  if (!isClient) return;
  const associations = getAssociationsSemaines();
  if (planningNom === "default") {
    // Si "default", on supprime l'association
    delete associations[semaineId];
  } else {
    associations[semaineId] = planningNom;
  }
  localStorage.setItem(
    STORAGE_KEYS.ASSOCIATIONS_SEMAINES,
    JSON.stringify(associations),
  );
}

// Supprimer une association
export function deleteAssociationSemaine(semaineId: string): void {
  if (!isClient) return;
  const associations = getAssociationsSemaines();
  delete associations[semaineId];
  localStorage.setItem(
    STORAGE_KEYS.ASSOCIATIONS_SEMAINES,
    JSON.stringify(associations),
  );
}

// Obtenir le planning effectif pour une semaine (associé ou default)
export function getPlanningPourSemaine(semaineId: string): PlanningDefault {
  const planningNom = getAssociationSemaine(semaineId);
  if (!planningNom) {
    return getPlanningDefault();
  }
  const plannings = getPlanningSauvegardes();
  // Vérifier que le planning existe toujours
  if (plannings[planningNom]) {
    return plannings[planningNom];
  }
  // Fallback sur le planning par défaut si le planning n'existe plus
  return getPlanningDefault();
}

// === PARAMÈTRES ===

const PARAMETRES_DEFAULT: Parametres = {
  theme: "light",
  sauvegardeAuto: true,
  pasMinutes: 5,
};

export function getParametres(): Parametres {
  if (!isClient) return PARAMETRES_DEFAULT;
  const data = localStorage.getItem(STORAGE_KEYS.PARAMETRES);
  return data
    ? { ...PARAMETRES_DEFAULT, ...JSON.parse(data) }
    : PARAMETRES_DEFAULT;
}

export function saveParametres(parametres: Parametres): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.PARAMETRES, JSON.stringify(parametres));
}

// === EXPORT/IMPORT ===

export function exportAllData(): string {
  return JSON.stringify({
    journees: getJournees(),
    planning: getPlanningDefault(),
    planningsSauvegardes: getPlanningSauvegardes(),
    associationsSemaines: getAssociationsSemaines(),
    parametres: getParametres(),
  });
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.journees) {
      localStorage.setItem(
        STORAGE_KEYS.JOURNEES,
        JSON.stringify(data.journees),
      );
    }
    if (data.planning) {
      localStorage.setItem(
        STORAGE_KEYS.PLANNING,
        JSON.stringify(data.planning),
      );
    }
    if (data.planningsSauvegardes) {
      localStorage.setItem(
        STORAGE_KEYS.PLANNINGS_SAUVEGARDES,
        JSON.stringify(data.planningsSauvegardes),
      );
    }
    if (data.associationsSemaines) {
      localStorage.setItem(
        STORAGE_KEYS.ASSOCIATIONS_SEMAINES,
        JSON.stringify(data.associationsSemaines),
      );
    }
    if (data.parametres) {
      localStorage.setItem(
        STORAGE_KEYS.PARAMETRES,
        JSON.stringify(data.parametres),
      );
    }
    return true;
  } catch {
    return false;
  }
}
