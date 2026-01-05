// Types pour la gestion du temps de travail

export type JourSemaine = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi";

export interface HorairesJour {
  arrivee: string; // Format "HH:mm"
  sortieMidi: string; // Format "HH:mm"
  retourMidi: string; // Format "HH:mm" ou vide
  sortie: string; // Format "HH:mm" ou vide
}

export interface JourneeEnregistree {
  date: string; // Format "YYYY-MM-DD"
  horaires: HorairesJour;
  totalMinutes: number;
}

export interface PlanningHebdo {
  [key: string]: HorairesJour;
}

export interface PlanningDefault {
  lundi: HorairesJour;
  mardi: HorairesJour;
  mercredi: HorairesJour;
  jeudi: HorairesJour;
  vendredi: HorairesJour;
}

export interface PlanningSauvegarde {
  nom: string;
  planning: PlanningDefault;
}

export interface Parametres {
  theme: "light" | "dark" | "auto";
  sauvegardeAuto: boolean;
  pasMinutes: number;
}

export interface ResumeSemaine {
  totalMinutes: number;
  totalPrevu: number;
  difference: number;
  jours: {
    date: string;
    jour: JourSemaine;
    totalMinutes: number;
    prevu: number;
    difference: number;
  }[];
}
