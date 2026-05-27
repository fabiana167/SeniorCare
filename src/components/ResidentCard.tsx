import React from 'react';
import { Resident } from '../types';

interface ResidentCardProps {
  key?: React.Key;
  resident: Resident;
  onClick: () => void;
}

export default function ResidentCard({ resident, onClick }: ResidentCardProps) {
  // Translate risk level to indicator dot
  const getRiskDotColor = () => {
    switch (resident.riskLevel) {
      case 'alto':
        return 'bg-red-600';
      case 'médio':
        return 'bg-amber-500';
      case 'baixo':
        return 'bg-blue-600';
      default:
        return 'bg-slate-400';
    }
  };

  // Autonomy badge style generator
  const getAutonomyBadge = () => {
    switch (resident.autonomy) {
      case 'total':
        return {
          bg: 'bg-red-50 text-red-700 border-red-100',
          label: 'Cuidados Totais',
        };
      case 'parcial':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          label: 'Cuidados Parciais',
        };
      case 'independente':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-100',
          label: 'Independente',
        };
    }
  };

  const autonomyBadge = getAutonomyBadge();

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col gap-3 group active:scale-[0.98]"
      id={`resident-card-${resident.id}`}
    >
      <div className="flex justify-between items-start" id={`resident-header-${resident.id}`}>
        <img
          src={resident.avatar}
          alt={resident.name}
          className="w-16 h-16 rounded-full object-cover border border-slate-100 group-hover:scale-105 transition-transform duration-200"
          referrerPolicy="no-referrer"
        />
        <span
          className={`w-3.5 h-3.5 rounded-full ${getRiskDotColor()} border-2 border-white ring-1 ring-slate-200 ${
            resident.hasActiveAlert ? 'animate-ping' : ''
          }`}
          title={`Risco ${resident.riskLevel}`}
        />
      </div>

      <div id={`resident-info-${resident.id}`}>
        <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
          {resident.name}
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          Quarto {resident.room}
        </p>
      </div>

      <div className="mt-auto pt-2 flex flex-wrap gap-1.5" id={`resident-badges-${resident.id}`}>
        {/* Autonomy Badge */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${autonomyBadge.bg}`}>
          {autonomyBadge.label}
        </span>

        {/* Dynamic Condition badge */}
        {resident.conditions.map((condition, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
          >
            {condition}
          </span>
        ))}
      </div>
    </div>
  );
}
