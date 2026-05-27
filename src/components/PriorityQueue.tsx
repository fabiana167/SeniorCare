import React from 'react';
import { Resident } from '../types';
import { ShieldAlert, DoorOpen } from 'lucide-react';

interface PriorityQueueProps {
  residents: Resident[];
  onSelectResident: (id: string) => void;
}

export default function PriorityQueue({
  residents,
  onSelectResident,
}: PriorityQueueProps) {
  // Sort by riskScore descending, only showing those with score > 20
  const prioritizedResidents = [...residents]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRiskBorderColor = (level: string) => {
    switch (level) {
      case 'alto':
        return 'border-l-red-600';
      case 'médio':
        return 'border-l-amber-500';
      default:
        return 'border-l-slate-400';
    }
  };

  const getRiskValueColor = (level: string) => {
    switch (level) {
      case 'alto':
        return 'text-red-700';
      case 'médio':
        return 'text-amber-700';
      default:
        return 'text-slate-500';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'alto':
        return <span className="hidden sm:inline bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Alto</span>;
      case 'médio':
        return <span className="hidden sm:inline bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Médio</span>;
      default:
        return <span className="hidden sm:inline bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider font-semibold">Baixo</span>;
    }
  };

  return (
    <div className="flex flex-col gap-3" id="priority-queue-wrapper">
      {prioritizedResidents.map((resident) => {
        const initials = getInitials(resident.name);
        return (
          <div
            key={resident.id}
            onClick={() => onSelectResident(resident.id)}
            className={`bg-white rounded-xl border-l-[6px] ${getRiskBorderColor(
              resident.riskLevel
            )} border border-slate-200 p-4 flex items-center justify-between shadow-sm hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.99]`}
            id={`priority-row-${resident.id}`}
          >
            {/* Left side info */}
            <div className="flex items-center gap-3.5">
              {/* Initials badge instead of complex image when quick triage scanning is preferred */}
              <div 
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                  resident.riskLevel === 'alto'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : resident.riskLevel === 'médio'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {initials}
              </div>

              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-900 text-sm md:text-base">
                  {resident.name}
                </span>
                <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold mt-0.5">
                  <DoorOpen className="w-3.5 h-3.5 text-slate-400" /> Quarto {resident.room}
                </div>
              </div>
            </div>

            {/* Right side metric and custom priority labels */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Pontuação de Risco
                </span>
                <span className={`text-xl md:text-2xl font-black ${getRiskValueColor(resident.riskLevel)}`}>
                  {resident.riskScore}
                </span>
              </div>
              {getRiskBadge(resident.riskLevel)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
