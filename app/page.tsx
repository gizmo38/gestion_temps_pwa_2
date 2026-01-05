"use client";

import { useState, useEffect } from "react";
import TabsNavigation, { TabId } from "./components/TabsNavigation";
import SaisieTab from "./components/SaisieTab";
import PlanningsTab from "./components/PlanningsTab";
import HistoriqueTab from "./components/HistoriqueTab";
import ParametresTab from "./components/ParametresTab";
import { formatDateLong, getNumeroSemaine } from "./lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("saisie");
  const [dateInfo, setDateInfo] = useState("");

  // Mettre à jour les infos de date
  useEffect(() => {
    const today = new Date();
    const semaine = getNumeroSemaine(today);
    setDateInfo(`${formatDateLong(today)} - Semaine ${semaine}`);
  }, []);

  // Rendu de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case "saisie":
        return <SaisieTab />;
      case "plannings":
        return <PlanningsTab />;
      case "historique":
        return <HistoriqueTab />;
      case "parametres":
        return <ParametresTab />;
      default:
        return <SaisieTab />;
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <header className="navbar bg-base-100 rounded-box shadow-sm mb-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary">
              Gestion du Temps de Travail
            </h1>
          </div>
          <div className="flex-none">
            <span className="text-sm text-base-content/70">{dateInfo}</span>
          </div>
        </header>

        {/* Navigation par onglets */}
        <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Contenu de l'onglet actif */}
        <main>{renderTabContent()}</main>
      </div>
    </div>
  );
}
