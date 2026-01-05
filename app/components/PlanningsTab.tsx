"use client";

import { useState, useEffect } from "react";
import { HorairesJour, JourSemaine, PlanningDefault } from "../lib/types";
import {
  JOURS_SEMAINE,
  JOURS_LABELS,
  PLANNING_DEFAULT,
  calculerTotalJournee,
  minutesEnHeures,
} from "../lib/utils";
import {
  getPlanningDefault,
  savePlanningDefault,
  getPlanningSauvegardes,
  savePlanningSauvegarde,
  deletePlanningSauvegarde,
} from "../lib/storage";

export default function PlanningsTab() {
  const [planning, setPlanning] = useState<PlanningDefault>(PLANNING_DEFAULT);
  const [planningsSauvegardes, setPlanningsSauvegardes] = useState<
    Record<string, PlanningDefault>
  >({});
  const [nouveauNom, setNouveauNom] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Charger les données au montage
  useEffect(() => {
    setPlanning(getPlanningDefault());
    setPlanningsSauvegardes(getPlanningSauvegardes());
  }, []);

  // Mise à jour d'un horaire
  const updateHoraire = (
    jour: JourSemaine,
    champ: keyof HorairesJour,
    valeur: string,
  ) => {
    setPlanning((prev) => ({
      ...prev,
      [jour]: { ...prev[jour], [champ]: valeur },
    }));
  };

  // Sauvegarder comme planning par défaut
  const sauvegarderDefaut = () => {
    savePlanningDefault(planning);
    setMessage({ text: "Planning par défaut enregistré !", type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  // Réinitialiser aux valeurs par défaut
  const reinitialiser = () => {
    setPlanning(PLANNING_DEFAULT);
    setMessage({
      text: "Planning réinitialisé aux valeurs par défaut",
      type: "success",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  // Sauvegarder un planning nommé
  const sauvegarderNomme = () => {
    if (!nouveauNom.trim()) {
      setMessage({
        text: "Veuillez entrer un nom pour le planning",
        type: "error",
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    savePlanningSauvegarde(nouveauNom.trim(), planning);
    setPlanningsSauvegardes(getPlanningSauvegardes());
    setNouveauNom("");
    setMessage({
      text: `Planning "${nouveauNom.trim()}" sauvegardé !`,
      type: "success",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  // Charger un planning sauvegardé
  const chargerPlanning = (nom: string) => {
    const p = planningsSauvegardes[nom];
    if (p) {
      setPlanning(p);
      setMessage({ text: `Planning "${nom}" chargé`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Supprimer un planning sauvegardé
  const supprimerPlanning = (nom: string) => {
    deletePlanningSauvegarde(nom);
    setPlanningsSauvegardes(getPlanningSauvegardes());
    setMessage({ text: `Planning "${nom}" supprimé`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  // Calculer le total hebdo
  const totalHebdo = JOURS_SEMAINE.reduce(
    (acc, jour) => acc + calculerTotalJournee(planning[jour]),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
        >
          {message.text}
        </div>
      )}

      {/* Carte Planning Hebdomadaire */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">
            Planning Hebdomadaire par Défaut
          </h2>
          <p className="text-sm text-base-content/70">
            Définissez vos horaires habituels pour chaque jour de la semaine.
          </p>

          {/* Tableau du planning */}
          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Arrivée</th>
                  <th>Sortie Midi</th>
                  <th>Retour Midi</th>
                  <th>Sortie</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {JOURS_SEMAINE.map((jour) => {
                  const h = planning[jour];
                  const total = calculerTotalJournee(h);
                  return (
                    <tr
                      key={jour}
                      className={jour === "mercredi" ? "bg-warning/10" : ""}
                    >
                      <td className="font-medium">{JOURS_LABELS[jour]}</td>
                      <td>
                        <input
                          type="time"
                          className="input input-bordered input-sm w-24 font-mono"
                          value={h.arrivee}
                          onChange={(e) =>
                            updateHoraire(jour, "arrivee", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="input input-bordered input-sm w-24 font-mono"
                          value={h.sortieMidi}
                          onChange={(e) =>
                            updateHoraire(jour, "sortieMidi", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="input input-bordered input-sm w-24 font-mono"
                          value={h.retourMidi}
                          onChange={(e) =>
                            updateHoraire(jour, "retourMidi", e.target.value)
                          }
                          placeholder={jour === "mercredi" ? "Optionnel" : ""}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="input input-bordered input-sm w-24 font-mono"
                          value={h.sortie}
                          onChange={(e) =>
                            updateHoraire(jour, "sortie", e.target.value)
                          }
                          placeholder={jour === "mercredi" ? "Optionnel" : ""}
                        />
                      </td>
                      <td className="font-mono font-semibold">
                        {minutesEnHeures(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="text-right font-semibold">
                    Total Hebdomadaire :
                  </td>
                  <td className="font-mono font-bold text-primary">
                    {minutesEnHeures(totalHebdo)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn btn-primary" onClick={sauvegarderDefaut}>
              💾 Définir comme Planning par Défaut
            </button>
            <button className="btn btn-outline" onClick={reinitialiser}>
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Carte Plannings Sauvegardés */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Plannings Sauvegardés</h2>
          <p className="text-sm text-base-content/70">
            Sauvegardez différentes configurations de planning pour les
            réutiliser.
          </p>

          {/* Sauvegarder nouveau */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Nom du planning..."
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={sauvegarderNomme}>
              📁 Sauvegarder
            </button>
          </div>

          {/* Liste des plannings */}
          {Object.keys(planningsSauvegardes).length > 0 ? (
            <div className="space-y-2 mt-4">
              {Object.keys(planningsSauvegardes).map((nom) => (
                <div
                  key={nom}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <span className="font-medium">{nom}</span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => chargerPlanning(nom)}
                    >
                      📂 Charger
                    </button>
                    <button
                      className="btn btn-sm btn-error btn-outline"
                      onClick={() => supprimerPlanning(nom)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/50 mt-4 text-center py-4">
              Aucun planning sauvegardé
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
