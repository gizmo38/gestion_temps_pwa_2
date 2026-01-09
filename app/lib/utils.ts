// Utilitaires pour la gestion du temps de travail

import { HorairesJour, JourSemaine, PlanningDefault } from "./types";

// Planning par défaut
export const PLANNING_DEFAULT: PlanningDefault = {
  lundi: {
    arrivee: "08:00",
    sortieMidi: "12:00",
    retourMidi: "13:30",
    sortie: "17:15",
  },
  mardi: {
    arrivee: "08:00",
    sortieMidi: "12:00",
    retourMidi: "13:30",
    sortie: "17:15",
  },
  mercredi: {
    arrivee: "08:00",
    sortieMidi: "12:00",
    retourMidi: "",
    sortie: "",
  },
  jeudi: {
    arrivee: "08:00",
    sortieMidi: "12:00",
    retourMidi: "13:30",
    sortie: "17:15",
  },
  vendredi: {
    arrivee: "08:00",
    sortieMidi: "12:00",
    retourMidi: "13:30",
    sortie: "17:15",
  },
};

// Noms des jours en français
export const JOURS_SEMAINE: JourSemaine[] = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
];

export const JOURS_LABELS: Record<JourSemaine, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
};

// Convertit une heure "HH:mm" en minutes depuis minuit
export function heureEnMinutes(heure: string): number {
  if (!heure) return 0;
  const [h, m] = heure.split(":").map(Number);
  return h * 60 + m;
}

// Convertit des minutes en format "Xh Xmin"
export function minutesEnHeures(minutes: number): string {
  const heures = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  const signe = minutes < 0 ? "-" : "";
  if (mins === 0) return `${signe}${heures}h00`;
  return `${signe}${heures}h${mins.toString().padStart(2, "0")}`;
}

// Calcule le total des minutes travaillées pour une journée
export function calculerTotalJournee(horaires: HorairesJour): number {
  const arrivee = heureEnMinutes(horaires.arrivee);
  const sortieMidi = heureEnMinutes(horaires.sortieMidi);
  const retourMidi = heureEnMinutes(horaires.retourMidi);
  const sortie = heureEnMinutes(horaires.sortie);

  // Matin : sortie midi - arrivée
  const matin = sortieMidi - arrivee;

  // Après-midi : sortie - retour (si présent)
  let apresMidi = 0;
  if (retourMidi && sortie) {
    apresMidi = sortie - retourMidi;
  }

  return Math.max(0, matin + apresMidi);
}

// Obtient le nom du jour de la semaine à partir d'une date
export function getJourSemaine(date: Date): JourSemaine | null {
  const jour = date.getDay();
  // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  if (jour === 0 || jour === 6) return null; // Week-end
  const jours: JourSemaine[] = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
  ];
  return jours[jour - 1];
}

// Formate une date en "YYYY-MM-DD"
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Formate une date en format français long
export function formatDateLong(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("fr-FR", options);
}

// Obtient le numéro de la semaine
export function getNumeroSemaine(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Génère l'identifiant unique d'une semaine (ex: "S2-2026")
export function getSemaineId(date: Date): string {
  const numero = getNumeroSemaine(date);
  const annee = date.getFullYear();
  return `S${numero}-${annee}`;
}

// Obtient le lundi de la semaine contenant la date
export function getLundiSemaine(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Obtient toutes les dates de la semaine (lundi à vendredi)
export function getDatesSemaine(dateReference: Date): Date[] {
  const lundi = getLundiSemaine(dateReference);
  const dates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// Vérifie si une date est aujourd'hui
export function estAujourdhui(date: Date): boolean {
  const aujourdhui = new Date();
  return (
    date.getDate() === aujourdhui.getDate() &&
    date.getMonth() === aujourdhui.getMonth() &&
    date.getFullYear() === aujourdhui.getFullYear()
  );
}

// Vérifie si une date est un week-end
export function estWeekend(date: Date): boolean {
  const jour = date.getDay();
  return jour === 0 || jour === 6;
}

// Classe pour le style de différence (positif, négatif, neutre)
export function getDifferenceClass(minutes: number): string {
  if (minutes > 0) return "text-success";
  if (minutes < 0) return "text-error";
  return "text-base-content/50";
}

// Formate une différence avec signe
export function formatDifference(minutes: number): string {
  const signe = minutes > 0 ? "+" : "";
  return signe + minutesEnHeures(minutes);
}
