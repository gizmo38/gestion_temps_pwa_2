"use client";

import { useState, useEffect } from "react";
import { HorairesJour, JourSemaine } from "../lib/types";
import {
  formatDateISO,
  formatDateLong,
  getNumeroSemaine,
  getSemaineId,
  getJourSemaine,
  calculerTotalJournee,
  minutesEnHeures,
  formatDifference,
  getDifferenceClass,
  estAujourdhui,
  getDatesSemaine,
  JOURS_LABELS,
  PLANNING_DEFAULT,
} from "../lib/utils";
import {
  getJournee,
  saveJournee,
  getPlanningSauvegardes,
  getAssociationSemaine,
  saveAssociationSemaine,
  getPlanningPourSemaine,
} from "../lib/storage";
import { PlanningDefault } from "../lib/types";

export default function SaisieTab() {
  // Date sélectionnée
  const [dateSelectionnee, setDateSelectionnee] = useState<Date>(new Date());

  // Horaires du formulaire
  const [horaires, setHoraires] = useState<HorairesJour>({
    arrivee: "08:00",
    sortieMidi: "12:00",
    retourMidi: "13:30",
    sortie: "17:15",
  });

  // Message de sauvegarde
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Planning de la semaine
  const [planning, setPlanning] = useState<PlanningDefault>(PLANNING_DEFAULT);
  const [planningsDisponibles, setPlanningsDisponibles] = useState<
    Record<string, PlanningDefault>
  >({});
  const [planningSelectionne, setPlanningSelectionne] = useState<string>("default");

  // Identifiant de la semaine courante
  const semaineId = getSemaineId(dateSelectionnee);

  // Charger les plannings disponibles au montage
  useEffect(() => {
    setPlanningsDisponibles(getPlanningSauvegardes());
  }, []);

  // Charger le planning de la semaine quand la date change
  useEffect(() => {
    const association = getAssociationSemaine(semaineId);
    setPlanningSelectionne(association || "default");
    setPlanning(getPlanningPourSemaine(semaineId));
  }, [semaineId]);

  // Changer le planning de la semaine
  const changerPlanningSemaine = (nomPlanning: string) => {
    saveAssociationSemaine(semaineId, nomPlanning);
    setPlanningSelectionne(nomPlanning);
    setPlanning(getPlanningPourSemaine(semaineId));
    setMessage({
      text: `Planning "${nomPlanning === "default" ? "par défaut" : nomPlanning}" appliqué à la semaine ${getNumeroSemaine(dateSelectionnee)}`,
      type: "success",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  // Charger les horaires quand la date change
  useEffect(() => {
    const dateISO = formatDateISO(dateSelectionnee);
    const journeeSauvegardee = getJournee(dateISO);

    if (journeeSauvegardee) {
      setHoraires(journeeSauvegardee.horaires);
    } else {
      // Charger depuis le planning par défaut
      const jour = getJourSemaine(dateSelectionnee);
      if (jour && planning[jour]) {
        setHoraires(planning[jour]);
      }
    }
  }, [dateSelectionnee, planning]);

  // Changer de jour
  const changerJour = (delta: number) => {
    const nouvelleDate = new Date(dateSelectionnee);
    nouvelleDate.setDate(nouvelleDate.getDate() + delta);
    setDateSelectionnee(nouvelleDate);
  };

  // Retour à aujourd'hui
  const retourAujourdhui = () => {
    setDateSelectionnee(new Date());
  };

  // Mise à jour des horaires
  const updateHoraire = (champ: keyof HorairesJour, valeur: string) => {
    setHoraires((prev) => ({ ...prev, [champ]: valeur }));
  };

  // Enregistrer la journée
  const enregistrerJournee = () => {
    const totalMinutes = calculerTotalJournee(horaires);
    const dateISO = formatDateISO(dateSelectionnee);

    saveJournee({
      date: dateISO,
      horaires,
      totalMinutes,
    });

    setMessage({ text: "Journée enregistrée !", type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  // Effacer le formulaire
  const effacerFormulaire = () => {
    const jour = getJourSemaine(dateSelectionnee);
    if (jour && planning[jour]) {
      setHoraires(planning[jour]);
    } else {
      setHoraires({ arrivee: "", sortieMidi: "", retourMidi: "", sortie: "" });
    }
  };

  // Calculs
  const totalMinutes = calculerTotalJournee(horaires);
  const jour = getJourSemaine(dateSelectionnee);
  const prevuMinutes = jour ? calculerTotalJournee(planning[jour]) : 0;
  const differenceMinutes = totalMinutes - prevuMinutes;

  // Dates de la semaine pour le récap
  const datesSemaine = getDatesSemaine(dateSelectionnee);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Carte Saisie des horaires */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Saisie des Horaires</h2>

          {/* Navigation de date */}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">
                Date :{" "}
                <span className="text-primary font-semibold">
                  {formatDateLong(dateSelectionnee)}
                </span>
              </span>
            </label>
            <div className="join w-full">
              <button
                type="button"
                className="btn btn-outline join-item"
                onClick={() => changerJour(-1)}
                title="Jour précédent"
              >
                ◀
              </button>
              <input
                type="date"
                className="input input-bordered join-item flex-1 text-center"
                value={formatDateISO(dateSelectionnee)}
                onChange={(e) => setDateSelectionnee(new Date(e.target.value))}
              />
              <button
                type="button"
                className="btn btn-outline join-item"
                onClick={() => changerJour(1)}
                title="Jour suivant"
              >
                ▶
              </button>
              <button
                type="button"
                className="btn btn-primary join-item"
                onClick={retourAujourdhui}
              >
                Aujourd&apos;hui
              </button>
            </div>
          </div>

          <div className="divider my-2"></div>

          {/* Horaires en grille */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Groupe Matin */}
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="text-amber-500">☀️</span> Matin
              </h4>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Arrivée</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered input-sm w-full font-mono"
                    value={horaires.arrivee}
                    onChange={(e) => updateHoraire("arrivee", e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Sortie Midi</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered input-sm w-full font-mono"
                    value={horaires.sortieMidi}
                    onChange={(e) =>
                      updateHoraire("sortieMidi", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Groupe Après-midi */}
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="text-orange-500">🌅</span> Après-midi
              </h4>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Retour</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered input-sm w-full font-mono"
                    value={horaires.retourMidi}
                    onChange={(e) =>
                      updateHoraire("retourMidi", e.target.value)
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Sortie</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered input-sm w-full font-mono"
                    value={horaires.sortie}
                    onChange={(e) => updateHoraire("sortie", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              className="btn btn-primary flex-1"
              onClick={enregistrerJournee}
            >
              ✓ Enregistrer
            </button>
            <button className="btn btn-ghost" onClick={effacerFormulaire}>
              ✕ Effacer
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} mt-2`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Carte Résumé du jour */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Résumé du Jour</h2>

          {/* Stats du jour */}
          <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
            <div className="stat py-3 px-4">
              <div className="stat-title text-xs">Total</div>
              <div className="stat-value text-xl font-mono text-primary">
                {minutesEnHeures(totalMinutes)}
              </div>
            </div>
            <div className="stat py-3 px-4">
              <div className="stat-title text-xs">Prévu</div>
              <div className="stat-value text-xl font-mono">
                {minutesEnHeures(prevuMinutes)}
              </div>
            </div>
            <div className="stat py-3 px-4">
              <div className="stat-title text-xs">Différence</div>
              <div
                className={`stat-value text-xl font-mono ${getDifferenceClass(differenceMinutes)}`}
              >
                {formatDifference(differenceMinutes)}
              </div>
            </div>
          </div>

          <div className="divider my-2"></div>

          {/* Récap par jour de la semaine */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center justify-between">
              Récap Semaine
              <span className="badge badge-outline badge-sm">
                S{getNumeroSemaine(dateSelectionnee)}
              </span>
            </h3>

            {/* Sélecteur de planning pour la semaine */}
            <div className="mb-4 p-3 bg-base-200 rounded-lg">
              <label className="label py-0 mb-1">
                <span className="label-text text-xs font-medium">
                  Planning de la semaine
                </span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={planningSelectionne}
                onChange={(e) => changerPlanningSemaine(e.target.value)}
              >
                <option value="default">Planning par défaut</option>
                {Object.keys(planningsDisponibles).map((nom) => (
                  <option key={nom} value={nom}>
                    {nom}
                  </option>
                ))}
              </select>
              {planningSelectionne !== "default" && (
                <p className="text-xs text-info mt-1">
                  Planning "{planningSelectionne}" appliqué
                </p>
              )}
            </div>
            <div className="space-y-2">
              {datesSemaine.map((date) => {
                const jourSemaine = getJourSemaine(date) as JourSemaine;
                const dateISO = formatDateISO(date);
                const journee = getJournee(dateISO);
                const isToday = estAujourdhui(date);
                const isSelected =
                  formatDateISO(date) === formatDateISO(dateSelectionnee);

                return (
                  <div
                    key={dateISO}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-base-200 hover:bg-base-300"
                    }`}
                    onClick={() => setDateSelectionnee(date)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {JOURS_LABELS[jourSemaine]}
                        {isToday && " (Aujourd'hui)"}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {date.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">
                        {journee ? minutesEnHeures(journee.totalMinutes) : "--"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
