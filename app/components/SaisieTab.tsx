"use client";

import { useState, useEffect } from "react";
import { HorairesJour } from "../lib/types";
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
  calculerStatsSemaine,
  StatsHebdo,
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
import { useSalarie } from "../lib/SalarieContext";

export default function SaisieTab() {
  // Contexte salarié
  const { salarieActif } = useSalarie();

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
  const [planningSelectionne, setPlanningSelectionne] =
    useState<string>("default");

  // Journées de la semaine
  const [journeesSemaine, setJourneesSemaine] = useState<
    Record<string, { totalMinutes: number }>
  >({});

  // Identifiant de la semaine courante
  const semaineId = getSemaineId(dateSelectionnee);

  // Charger les plannings disponibles au montage
  useEffect(() => {
    (async () => {
      const plannings = await getPlanningSauvegardes();
      setPlanningsDisponibles(plannings);
    })();
  }, []);

  // Charger le planning de la semaine quand la date change
  useEffect(() => {
    (async () => {
      const association = await getAssociationSemaine(semaineId);
      setPlanningSelectionne(association || "default");
      const planningPourSemaine = await getPlanningPourSemaine(semaineId);
      setPlanning(planningPourSemaine);
    })();
  }, [semaineId]);

  // Changer le planning de la semaine
  const changerPlanningSemaine = async (nomPlanning: string) => {
    await saveAssociationSemaine(semaineId, nomPlanning);
    setPlanningSelectionne(nomPlanning);
    const planningPourSemaine = await getPlanningPourSemaine(semaineId);
    setPlanning(planningPourSemaine);
    setMessage({
      text: `Planning "${nomPlanning === "default" ? "par défaut" : nomPlanning}" appliqué à la semaine ${getNumeroSemaine(dateSelectionnee)}`,
      type: "success",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  // Charger les horaires quand la date ou le salarié change
  useEffect(() => {
    (async () => {
      const dateISO = formatDateISO(dateSelectionnee);
      const salarieId = salarieActif?.id || "default";
      const journeeSauvegardee = await getJournee(dateISO, salarieId);

      if (journeeSauvegardee) {
        setHoraires(journeeSauvegardee.horaires);
      } else {
        // Charger depuis le planning par défaut
        const jour = getJourSemaine(dateSelectionnee);
        if (jour && planning[jour]) {
          setHoraires(planning[jour]);
        }
      }
    })();
  }, [dateSelectionnee, planning, salarieActif]);

  // Charger les journées de la semaine pour le salarié actif
  useEffect(() => {
    (async () => {
      const dates = getDatesSemaine(dateSelectionnee);
      const journees: Record<string, { totalMinutes: number }> = {};
      const salarieId = salarieActif?.id || "default";

      for (const date of dates) {
        const dateISO = formatDateISO(date);
        const journee = await getJournee(dateISO, salarieId);
        if (journee) {
          journees[dateISO] = { totalMinutes: journee.totalMinutes };
        }
      }

      setJourneesSemaine(journees);
    })();
  }, [dateSelectionnee, salarieActif]);

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
  const enregistrerJournee = async () => {
    const totalMinutes = calculerTotalJournee(horaires);
    const dateISO = formatDateISO(dateSelectionnee);
    const salarieId = salarieActif?.id || "default";

    await saveJournee({
      salarieId,
      date: dateISO,
      horaires,
      totalMinutes,
    });

    // Rafraîchir l'affichage du récap semaine
    setJourneesSemaine((prev) => ({
      ...prev,
      [dateISO]: { totalMinutes },
    }));

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

  // Calculer les stats hebdomadaires
  const statsHebdo: StatsHebdo = calculerStatsSemaine(
    datesSemaine,
    planning,
    journeesSemaine,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Carte Saisie des horaires */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {/* En-tête avec titre et sélecteur de planning */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-lg">Saisie des Horaires</h2>
            <div className="flex items-center gap-2">
              <select
                className="select select-bordered select-xs"
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
            </div>
          </div>

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
          {/* Stats du jour - compactées */}
          <h2 className="card-title text-lg mb-2">Résumé du Jour</h2>
          <div className="stats stats-vertical sm:stats-horizontal shadow-sm w-full mb-3">
            <div className="stat py-2 px-3">
              <div className="stat-title text-xs">Total</div>
              <div className="stat-value text-lg font-mono text-primary">
                {minutesEnHeures(totalMinutes)}
              </div>
            </div>
            <div className="stat py-2 px-3">
              <div className="stat-title text-xs">Prévu</div>
              <div className="stat-value text-lg font-mono">
                {minutesEnHeures(prevuMinutes)}
              </div>
            </div>
            <div className="stat py-2 px-3">
              <div className="stat-title text-xs">Différence</div>
              <div
                className={`stat-value text-lg font-mono ${getDifferenceClass(differenceMinutes)}`}
              >
                {formatDifference(differenceMinutes)}
              </div>
            </div>
          </div>

          <div className="divider my-2"></div>

          {/* Détail par jour - REMONTÉ EN HAUT */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-3">Détail par jour</h3>
            <div className="space-y-2">
              {statsHebdo.jours.map((jour) => {
                const isToday = estAujourdhui(jour.date);
                const isSelected =
                  jour.dateISO === formatDateISO(dateSelectionnee);

                return (
                  <div
                    key={jour.dateISO}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-base-200 hover:bg-base-300"
                    }`}
                    onClick={() => setDateSelectionnee(jour.date)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {JOURS_LABELS[jour.jourSemaine]}
                        {isToday && ` (Aujourd'hui)`}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {jour.date.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {jour.enregistre && (
                        <span
                          className={`badge badge-sm ${jour.difference >= 0 ? "badge-success" : "badge-error"}`}
                        >
                          {formatDifference(jour.difference)}
                        </span>
                      )}
                      <span className="font-mono text-sm">
                        {jour.enregistre ? minutesEnHeures(jour.realise) : "--"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bilan Hebdomadaire - en bas de la 2ème colonne */}
          <div className="p-4 bg-gradient-to-br from-base-200 to-base-300 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span>📊</span>
              <span>Bilan Semaine S{getNumeroSemaine(dateSelectionnee)}</span>
            </h3>

            {/* Stats hebdomadaires compactées */}
            <div className="stats stats-vertical sm:stats-horizontal shadow-sm w-full bg-base-100 rounded-lg mb-3">
              <div className="stat py-2 px-3">
                <div className="stat-title text-xs">Total Réalisé</div>
                <div className="stat-value text-base font-mono text-primary">
                  {minutesEnHeures(statsHebdo.totalRealise)}
                </div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-xs">Total Prévu</div>
                <div className="stat-value text-base font-mono">
                  {minutesEnHeures(statsHebdo.totalPrevu)}
                </div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-xs">Heures Sup</div>
                <div
                  className={`stat-value text-base font-mono ${getDifferenceClass(statsHebdo.totalDifference)}`}
                >
                  {statsHebdo.totalDifference > 0
                    ? "▲ "
                    : statsHebdo.totalDifference < 0
                      ? "▼ "
                      : ""}
                  {formatDifference(statsHebdo.totalDifference)}
                </div>
              </div>
            </div>

            {/* Barre de progression compacte */}
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-base-content/70">Jours saisis</span>
              <span className="font-medium">
                {statsHebdo.joursSaisis} / {statsHebdo.joursTotal}
              </span>
            </div>
            <progress
              className="progress progress-primary w-full h-2"
              value={statsHebdo.joursSaisis}
              max={statsHebdo.joursTotal}
            ></progress>
          </div>
        </div>
      </div>
    </div>
  );
}
