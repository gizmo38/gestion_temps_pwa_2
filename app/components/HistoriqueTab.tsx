"use client";

import { useState, useEffect } from "react";
import { JourSemaine } from "../lib/types";
import {
  formatDateISO,
  getNumeroSemaine,
  getSemaineId,
  getLundiSemaine,
  getDatesSemaine,
  getJourSemaine,
  calculerTotalJournee,
  minutesEnHeures,
  formatDifference,
  getDifferenceClass,
  JOURS_LABELS,
} from "../lib/utils";
import {
  getJournee,
  getJourneesSalarie,
  getAssociationSemaine,
  getPlanningPourSemaine,
} from "../lib/storage";
import { PlanningDefault } from "../lib/types";
import { PLANNING_DEFAULT } from "../lib/utils";
import { useSalarie } from "../lib/SalarieContext";

export default function HistoriqueTab() {
  // Contexte salarié
  const { salarieActif } = useSalarie();

  const [dateReference, setDateReference] = useState<Date>(new Date());
  const [planning, setPlanning] = useState<PlanningDefault>(PLANNING_DEFAULT);
  const [planningNom, setPlanningNom] = useState<string | null>(null);
  const [statsJours, setStatsJours] = useState<
    {
      date: Date;
      dateISO: string;
      jourSemaine: JourSemaine;
      realise: number;
      prevu: number;
      difference: number;
      enregistre: boolean;
    }[]
  >([]);

  // Charger le planning de la semaine affichée
  useEffect(() => {
    (async () => {
      const semaineId = getSemaineId(dateReference);
      const association = await getAssociationSemaine(semaineId);
      setPlanningNom(association);
      const planningPourSemaine = await getPlanningPourSemaine(semaineId);
      setPlanning(planningPourSemaine);
    })();
  }, [dateReference]);

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
  useEffect(() => {
    (async () => {
      const salarieId = salarieActif?.id || "default";
      const stats = await Promise.all(
        datesSemaine.map(async (date) => {
          const jourSemaine = getJourSemaine(date) as JourSemaine;
          const dateISO = formatDateISO(date);
          const journee = await getJournee(dateISO, salarieId);
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
        }),
      );
      setStatsJours(stats);
    })();
  }, [dateReference, planning, datesSemaine, salarieActif]);

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

          <div className="flex flex-wrap items-center gap-2">
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
            <span
              className={`badge badge-sm ${planningNom ? "badge-info" : "badge-ghost"}`}
            >
              {planningNom ? `Planning: ${planningNom}` : "Planning par défaut"}
            </span>
          </div>

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
              <div className="stat-title">Heures Sup</div>
              <div
                className={`stat-value font-mono ${getDifferenceClass(totalDifference)}`}
              >
                {totalDifference > 0 ? "▲ " : totalDifference < 0 ? "▼ " : ""}
                {formatDifference(totalDifference)}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-base-content/70">Jours saisis</span>
              <span className="font-medium">
                {statsJours.filter((j) => j.enregistre).length} /{" "}
                {statsJours.length}
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={statsJours.filter((j) => j.enregistre).length}
              max={statsJours.length}
            ></progress>
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
                    <td>
                      {jour.enregistre ? (
                        <span
                          className={`badge badge-sm ${jour.difference >= 0 ? "badge-success" : "badge-error"}`}
                        >
                          {formatDifference(jour.difference)}
                        </span>
                      ) : (
                        <span className="text-base-content/50">--</span>
                      )}
                    </td>
                    <td>
                      {jour.enregistre ? (
                        <span className="badge badge-success badge-sm">
                          ✓ Enregistré
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
                  <td>
                    <span
                      className={`badge badge-sm ${totalDifference >= 0 ? "badge-success" : "badge-error"}`}
                    >
                      {formatDifference(totalDifference)}
                    </span>
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
      planningNom: string | null;
    }[]
  >([]);

  useEffect(() => {
    (async () => {
      const salarieId = salarieActif?.id || "default";
      const journees = await getJourneesSalarie(salarieId);

      // Grouper par semaine
      const semainesMap = new Map<string, { dates: string[]; total: number }>();

      journees.forEach((journee) => {
        const date = new Date(journee.date);
        const lundi = getLundiSemaine(date);
        const key = formatDateISO(lundi);

        if (!semainesMap.has(key)) {
          semainesMap.set(key, { dates: [], total: 0 });
        }

        const sem = semainesMap.get(key)!;
        sem.dates.push(journee.date);
        sem.total += journee.totalMinutes;
      });

      // Convertir en tableau
      const result = await Promise.all(
        Array.from(semainesMap.entries()).map(async ([lundiISO, data]) => {
          const lundi = new Date(lundiISO);
          const semaineId = getSemaineId(lundi);
          return {
            numero: getNumeroSemaine(lundi),
            annee: lundi.getFullYear(),
            totalMinutes: data.total,
            joursEnregistres: data.dates.length,
            planningNom: await getAssociationSemaine(semaineId),
          };
        }),
      );

      const sorted = result
        .sort((a, b) => {
          if (a.annee !== b.annee) return b.annee - a.annee;
          return b.numero - a.numero;
        })
        .slice(0, 10); // Limiter aux 10 dernières semaines

      setSemaines(sorted);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salarieActif?.id]);

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
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">Semaine {sem.numero}</span>
              <span className="text-sm text-base-content/70">
                ({sem.annee})
              </span>
            </div>
            {sem.planningNom && (
              <span className="text-xs text-info">
                Planning: {sem.planningNom}
              </span>
            )}
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
