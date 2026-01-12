"use client";

import { useEffect, useState } from "react";
import { migrateFromLocalStorage, needsMigration } from "../lib/storage";

/**
 * Composant qui gère la migration automatique des données
 * de localStorage vers IndexedDB au premier chargement
 */
export default function MigrationHandler() {
  const [migrationStatus, setMigrationStatus] = useState<
    "checking" | "migrating" | "done" | "error"
  >("checking");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const performMigration = async () => {
      try {
        // Vérifier si une migration est nécessaire
        const needsIt = await needsMigration();

        if (needsIt) {
          console.log("Migration détectée comme nécessaire");
          setMigrationStatus("migrating");
          setShowNotification(true);

          // Effectuer la migration
          const success = await migrateFromLocalStorage();

          if (success) {
            setMigrationStatus("done");
            console.log("Migration terminée avec succès");
            // Masquer la notification après 5 secondes
            setTimeout(() => setShowNotification(false), 5000);
          } else {
            setMigrationStatus("error");
            console.error("Échec de la migration");
          }
        } else {
          setMigrationStatus("done");
          console.log("Pas de migration nécessaire");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification/migration:", error);
        setMigrationStatus("error");
      }
    };

    performMigration();
  }, []);

  // Ne rien afficher si la migration est terminée ou en cours de vérification
  if (!showNotification || migrationStatus === "checking") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      {migrationStatus === "migrating" && (
        <div className="alert alert-info shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="loading loading-spinner loading-sm"></span>
            <div>
              <h3 className="font-bold">Migration en cours...</h3>
              <div className="text-xs">
                Vos données sont en cours de migration vers IndexedDB
              </div>
            </div>
          </div>
        </div>
      )}

      {migrationStatus === "done" && (
        <div className="alert alert-success shadow-lg max-w-md">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Migration réussie!</h3>
              <div className="text-xs">
                Vos données ont été migrées vers IndexedDB avec succès
              </div>
            </div>
          </div>
        </div>
      )}

      {migrationStatus === "error" && (
        <div className="alert alert-error shadow-lg max-w-md">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Erreur de migration</h3>
              <div className="text-xs">
                Une erreur est survenue lors de la migration. Consultez la
                console.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
