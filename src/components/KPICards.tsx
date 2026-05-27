import React from 'react';
import { Users, AlertTriangle, Bell } from 'lucide-react';

interface KPICardsProps {
  totalResidentsCount: number;
  highRiskCount: number;
  activeAlertsCount: number;
}

export default function KPICards({
  totalResidentsCount,
  highRiskCount,
  activeAlertsCount,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4" id="kpi-cards-grid">
      {/* Total Residents Card */}
      <div 
        className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 flex flex-col gap-1 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
        id="kpi-total-residents"
      >
        <div className="flex items-center gap-1.5 text-slate-500">
          <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-700 font-bold" />
          <span className="font-medium text-xs md:text-sm">Total de Utentes</span>
        </div>
        <div className="text-2xl md:text-3.5xl font-bold text-slate-900 leading-none mt-1">
          {totalResidentsCount}
        </div>
      </div>

      {/* High Risk Card */}
      <div 
        className="bg-red-50 rounded-xl border border-red-100 p-3 md:p-4 flex flex-col gap-1 shadow-sm transition-all hover:border-red-200 hover:shadow-md"
        id="kpi-high-risk"
      >
        <div className="flex items-center gap-1.5 text-red-800">
          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          <span className="font-semibold text-xs md:text-sm">Risco Elevado</span>
        </div>
        <div className="text-2xl md:text-3.5xl font-bold text-red-700 leading-none mt-1">
          {highRiskCount}
        </div>
      </div>

      {/* Active Alerts Card */}
      <div 
        className="bg-blue-600 rounded-xl border border-blue-600 p-3 md:p-4 flex flex-col gap-1 shadow-sm text-white transition-all hover:bg-blue-700 hover:shadow-md"
        id="kpi-active-alerts"
      >
        <div className="flex items-center gap-1.5 text-blue-100">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-white animate-pulse" />
          <span className="font-semibold text-xs md:text-sm">Alertas Ativos</span>
        </div>
        <div className="text-2xl md:text-3.5xl font-bold text-white leading-none mt-1">
          {activeAlertsCount}
        </div>
      </div>
    </div>
  );
}
