"use client";

import { useState, useEffect } from "react";
import { Parametres } from "../lib/types";
import {
  getParametres,
  saveParametres,
  exportAllData,
  importAllData,
} from "../lib/storage";

export default function ParametresTab() {
  const [parametres, setParametres] = useState<Parametres>({
    theme: "light",
    sauvegardeAuto: true,
    pasMinutes: 5,
  });
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Charger les paramètres au montage
  useEffect(() => {
    setParametres(getParametres());
  }, []);

  // Appliquer le thème
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-theme",
        parametres.theme === "auto" ? "light" : parametres.theme,
      );
    }
  }, [parametres.theme]);

  // Mettre à jour un paramètre
  const updateParametre = <K extends keyof Parametres>(
    key: K,
    value: Parametres[K],
  ) => {
    const newParams = { ...parametres, [key]: value };
    setParametres(newParams);
    saveParametres(newParams);
  };

  // Exporter les données
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gestion-temps-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: "Données exportées avec succès !", type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  // Importer les données
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setMessage({
          text: "Données importées avec succès ! Rechargez la page.",
          type: "success",
        });
      } else {
        setMessage({
          text: "Erreur lors de l'import des données",
          type: "error",
        });
      }
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsText(file);
  };

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

      {/* Carte Apparence */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Apparence</h2>

          {/* Thème */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Thème</span>
            </label>
            <div className="flex gap-2">
              <button
                className={`btn flex-1 ${parametres.theme === "light" ? "btn-primary" : "btn-outline"}`}
                onClick={() => updateParametre("theme", "light")}
              >
                ☀️ Clair
              </button>
              <button
                className={`btn flex-1 ${parametres.theme === "dark" ? "btn-primary" : "btn-outline"}`}
                onClick={() => updateParametre("theme", "dark")}
              >
                🌙 Sombre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carte Comportement */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Comportement</h2>

          {/* Sauvegarde auto */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-medium">
                Sauvegarde automatique
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={parametres.sauvegardeAuto}
                onChange={(e) =>
                  updateParametre("sauvegardeAuto", e.target.checked)
                }
              />
            </label>
            <p className="text-sm text-base-content/70 ml-1">
              Enregistre automatiquement les horaires quand vous changez de jour
            </p>
          </div>

          {/* Pas des minutes */}
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-medium">Pas des minutes</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={parametres.pasMinutes}
              onChange={(e) =>
                updateParametre("pasMinutes", Number(e.target.value))
              }
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
            <p className="text-sm text-base-content/70 ml-1 mt-1">
              Intervalle pour la saisie des horaires
            </p>
          </div>
        </div>
      </div>

      {/* Carte Données */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Données</h2>

          <div className="flex flex-col gap-4">
            {/* Export */}
            <div>
              <button
                className="btn btn-outline w-full sm:w-auto"
                onClick={handleExport}
              >
                📤 Exporter les données
              </button>
              <p className="text-sm text-base-content/70 mt-1">
                Télécharge toutes vos données au format JSON
              </p>
            </div>

            {/* Import */}
            <div>
              <label className="btn btn-outline w-full sm:w-auto">
                📥 Importer des données
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
              <p className="text-sm text-base-content/70 mt-1">
                Restaure vos données depuis un fichier JSON
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Carte À propos */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">À propos</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Version :</span> 2.0.0 (Next.js +
              React)
            </p>
            <p>
              <span className="font-medium">Technologies :</span> Next.js,
              React, TypeScript, Tailwind CSS, DaisyUI
            </p>
            <p className="text-base-content/70">
              Application PWA de gestion du temps de travail hebdomadaire.
              Fonctionne hors ligne et peut être installée sur votre appareil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
