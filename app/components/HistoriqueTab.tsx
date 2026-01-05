"use client";

import { useState, useEffect } from "react";
import { JourSemaine } from "../lib/types";
import {
  formatDateISO,
  getNumeroSemaine,
  getLundiSemaine,
  getDatesSemaine,
  getJourSemaine,
  calculerTotalJournee,
  minutesEnHeures,
  formatDifference,
  getDifferenceClass,
  JOURS_LABELS,
} from "../lib/utils";
import { getJournee, getJournees, getPlanningDefault } from "../lib/storage";

export default function HistoriqueTab() {
  const [dateReference, setDateReference] = useState<Date>(new Date());
  const [planning, setPlanning] = useState(getPlanningDefault());

  useEffect(() => {
    setPlanning(getPlanningDefault());
  }, []);

  // Changer de semaine
  const changerSemaine = (delta: number) => {
    const nouvelleDate = new Date(dateReference);
    nouvelleDate.setDate(nouvelleDate.getDate() + delta * 7);
    setDateReference(nouvelleDate);
  };

  // Semaine actuelle
  const retourSemaineActuelle = () => {
    setDateReference(new Date());
  };

  // Dates de la semaine
  const datesSemaine = getDatesSemaine(dateReference);
  const numeroSemaine = getNumeroSemaine(dateReference);
  const lundi = getLundiSemaine(dateReference);

  // Calculer les stats de la semaine
  const statsJours = datesSemaine.map((date) => {
    const jourSemaine = getJourSemaine(date) as JourSemaine;
    const dateISO = formatDateISO(date);
    const journee = getJournee(dateISO);
    const prevu = calculerTotalJournee(planning[jourSemaine]);
    const realise = journee ? journee.totalMinutes : 0;
    const difference = realise - prevu;

    return {
      date,
      dateISO,
      jourSemaine,
      realise,
      prevu,
      difference,
      enregistre: !!journee,
    };
  });

  const totalRealise = statsJours.reduce((acc, j) => acc + j.realise, 0);
  const totalPrevu = statsJours.reduce((acc, j) => acc + j.prevu, 0);
  const totalDifference = totalRealise - totalPrevu;

  // Historique des semaines précédentes
  const [historiqueVisible, setHistoriqueVisible] = useState(false);

  return (
    <div className="space-y-6">
      {/* Carte Résumé Semaine */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-lg">Semaine {numeroSemaine}</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => changerSemaine(-1)}
              >
                ◀ Précédente
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={retourSemaineActuelle}
              >
                Actuelle
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => changerSemaine(1)}
              >
                Suivante ▶
              </button>
            </div>
          </div>

          <p className="text-sm text-base-content/70">
            Du{" "}
            {lundi.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}{" "}
            au{" "}
            {new Date(
              lundi.getTime() + 4 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Stats globales */}
          <div className="stats stats-vertical sm:stats-horizontal shadow w-full mt-4">
            <div className="stat">
              <div className="stat-title">Total Réalisé</div>
              <div className="stat-value text-primary font-mono">
                {minutesEnHeures(totalRealise)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Prévu</div>
              <div className="stat-value font-mono">
                {minutesEnHeures(totalPrevu)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Différence</div>
              <div
                className={`stat-value font-mono ${getDifferenceClass(totalDifference)}`}
              >
                {formatDifference(totalDifference)}
              </div>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="overflow-x-auto mt-4">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Date</th>
                  <th>Réalisé</th>
                  <th>Prévu</th>
                  <th>Différence</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {statsJours.map((jour) => (
                  <tr key={jour.dateISO}>
                    <td className="font-medium">
                      {JOURS_LABELS[jour.jourSemaine]}
                    </td>
                    <td className="text-sm text-base-content/70">
                      {jour.date.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </td>
                    <td className="font-mono">
                      {jour.enregistre ? minutesEnHeures(jour.realise) : "--"}
                    </td>
                    <td className="font-mono text-base-content/70">
                      {minutesEnHeures(jour.prevu)}
                    </td>
                    <td
                      className={`font-mono ${getDifferenceClass(jour.difference)}`}
                    >
                      {jour.enregistre
                        ? formatDifference(jour.difference)
                        : "--"}
                    </td>
                    <td>
                      {jour.enregistre ? (
                        <span className="badge badge-success badge-sm">
                          Enregistré
                        </span>
                      ) : (
                        <span className="badge badge-ghost badge-sm">
                          Non saisi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={2}>Total Semaine</td>
                  <td className="font-mono text-primary">
                    {minutesEnHeures(totalRealise)}
                  </td>
                  <td className="font-mono">{minutesEnHeures(totalPrevu)}</td>
                  <td
                    className={`font-mono ${getDifferenceClass(totalDifference)}`}
                  >
                    {formatDifference(totalDifference)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Carte Historique */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setHistoriqueVisible(!historiqueVisible)}
          >
            <h2 className="card-title text-lg">Historique des Semaines</h2>
            <button className="btn btn-ghost btn-sm">
              {historiqueVisible ? "▲ Masquer" : "▼ Afficher"}
            </button>
          </div>

          {historiqueVisible && (
            <div className="mt-4">
              <HistoriqueSemaines />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant pour l'historique des semaines
function HistoriqueSemaines() {
  const [semaines, setSemaines] = useState<
    {
      numero: number;
      annee: number;
      totalMinutes: number;
      joursEnregistres: number;
    }[]
  >([]);

  useEffect(() => {
    const journees = getJournees();
    const planning = getPlanningDefault();

    // Grouper par semaine
    const semainesMap = new Map<string, { dates: string[]; total: number }>();

    Object.keys(journees).forEach((dateISO) => {
      const date = new Date(dateISO);
      const lundi = getLundiSemaine(date);
      const key = formatDateISO(lundi);

      if (!semainesMap.has(key)) {
        semainesMap.set(key, { dates: [], total: 0 });
      }

      const sem = semainesMap.get(key)!;
      sem.dates.push(dateISO);
      sem.total += journees[dateISO].totalMinutes;
    });

    // Convertir en tableau
    const result = Array.from(semainesMap.entries())
      .map(([lundiISO, data]) => {
        const lundi = new Date(lundiISO);
        return {
          numero: getNumeroSemaine(lundi),
          annee: lundi.getFullYear(),
          totalMinutes: data.total,
          joursEnregistres: data.dates.length,
        };
      })
      .sort((a, b) => {
        if (a.annee !== b.annee) return b.annee - a.annee;
        return b.numero - a.numero;
      })
      .slice(0, 10); // Limiter aux 10 dernières semaines

    setSemaines(result);
  }, []);

  if (semaines.length === 0) {
    return (
      <p className="text-center text-base-content/50 py-4">
        Aucune donnée enregistrée
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {semaines.map((sem) => (
        <div
          key={`${sem.annee}-${sem.numero}`}
          className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
        >
          <div>
            <span className="font-medium">Semaine {sem.numero}</span>
            <span className="text-sm text-base-content/70 ml-2">
              ({sem.annee})
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-base-content/70">
              {sem.joursEnregistres} jour{sem.joursEnregistres > 1 ? "s" : ""}
            </span>
            <span className="font-mono font-semibold">
              {minutesEnHeures(sem.totalMinutes)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
