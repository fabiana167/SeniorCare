import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Pill, Activity, Utensils, Clipboard, Clock, User, DoorOpen } from 'lucide-react';
import { Occurrence } from '../types';

interface OccurrenceRowProps {
  key?: React.Key;
  occurrence: Occurrence;
  residentAvatar?: string;
  residentRoom?: string;
}

export default function OccurrenceRow({
  occurrence,
  residentAvatar,
  residentRoom,
}: OccurrenceRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to choose badge and styling based on occurrence type
  const getTypeMeta = () => {
    switch (occurrence.type) {
      case 'fall':
        return {
          label: 'Queda / Crítico',
          color: 'bg-red-50 text-red-700 border-red-100',
          dotBg: 'bg-red-100 text-red-700',
          Icon: AlertTriangle,
        };
      case 'medication':
        return {
          label: 'Medicação',
          color: 'bg-amber-50 text-amber-800 border-amber-100',
          dotBg: 'bg-amber-100 text-amber-800',
          Icon: Pill,
        };
      case 'vitals':
        return {
          label: 'Sinais Vitais',
          color: 'bg-blue-50 text-blue-800 border-blue-100',
          dotBg: 'bg-blue-100 text-blue-800',
          Icon: Activity,
        };
      case 'routine':
        return {
          label: 'Rotina',
          color: 'bg-slate-50 text-slate-800 border-slate-200',
          dotBg: 'bg-slate-100 text-slate-700',
          Icon: Utensils,
        };
      default:
        return {
          label: 'Ocorrência',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-100',
          dotBg: 'bg-indigo-100 text-indigo-800',
          Icon: Clipboard,
        };
    }
  };

  const meta = getTypeMeta();
  const IconComponent = meta.Icon;

  // Render nicely
  return (
    <div 
      className={`group flex flex-col border-b border-slate-100 transition-colors cursor-pointer ${
        occurrence.type === 'fall' 
          ? 'bg-red-50/20 hover:bg-red-50/40' 
          : 'hover:bg-slate-50/80'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
      id={`occurrence-row-${occurrence.id}`}
    >
      {/* Standard desktop grid layout / responsive mobile */}
      <div className="p-4 sm:grid sm:grid-cols-[110px_1.5fr_140px_2.5fr_40px] gap-4 items-center">
        
        {/* Mobile Header Wrap */}
        <div className="flex sm:hidden justify-between items-center mb-2" id={`occ-mobile-header-${occurrence.id}`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${meta.dotBg}`}>
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {occurrence.time}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        {/* Column 1: Time (Desktop only) */}
        <div className="hidden sm:flex flex-col text-left" id={`occ-col1-time-${occurrence.id}`}>
          <span className="font-semibold text-slate-800 text-sm">{occurrence.time}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            {occurrence.date}
          </span>
        </div>

        {/* Column 2: Resident Info */}
        <div className="flex items-center gap-3 mb-2 sm:mb-0" id={`occ-col2-resident-${occurrence.id}`}>
          {residentAvatar ? (
            <img 
              src={residentAvatar} 
              alt={occurrence.residentName} 
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="font-semibold text-slate-900 text-sm">
              {occurrence.residentName}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-0.5">
              <DoorOpen className="w-3 h-3 text-slate-400" /> Quarto {residentRoom || 'N/A'}
            </span>
          </div>
        </div>

        {/* Column 3: Event Type (Desktop only) */}
        <div className="hidden sm:flex items-center gap-2" id={`occ-col3-badge-${occurrence.id}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${meta.dotBg}`}>
            <IconComponent className="w-3.5 h-3.5" />
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        {/* Column 4: Short Description */}
        <div className="text-sm text-slate-700 pr-4 pl-0 sm:pl-0 text-left line-clamp-2 md:line-clamp-none" id={`occ-col4-descr-${occurrence.id}`}>
          {occurrence.description}
        </div>

        {/* Column 5: Expand controls (Desktop only) */}
        <div className="hidden sm:flex justify-end pr-2 text-slate-400" id={`occ-col5-control-${occurrence.id}`}>
          {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-600" /> : <ChevronRight className="w-5 h-5 select-none" />}
        </div>
      </div>

      {/* Expanded Actions Detail block */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2 text-left animate-fadeIn">
          {occurrence.actionTaken && (
            <div id={`occ-action-${occurrence.id}`}>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block mb-0.5">
                Ação Imediata Tomada
              </span>
              <p className="text-sm text-slate-800 bg-white p-2.5 rounded border border-slate-200 shadow-xs">
                {occurrence.actionTaken}
              </p>
            </div>
          )}

          {occurrence.vitalsRecorded && Object.keys(occurrence.vitalsRecorded).length > 0 && (
            <div className="mt-1" id={`occ-vitals-${occurrence.id}`}>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block mb-1">
                Sinais Vitais Registados na Ocorrência
              </span>
              <div className="flex gap-2.5 flex-wrap">
                {occurrence.vitalsRecorded.heartRate && (
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded border border-slate-200">
                    Frequência Cardíaca: <strong className="text-slate-900">{occurrence.vitalsRecorded.heartRate} bpm</strong>
                  </span>
                )}
                {occurrence.vitalsRecorded.bloodPressure && (
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded border border-slate-200">
                    Pressão Arterial: <strong className="text-slate-900">{occurrence.vitalsRecorded.bloodPressure} mmHg</strong>
                  </span>
                )}
                {occurrence.vitalsRecorded.temperature && (
                  <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded border border-slate-200">
                    Temperatura: <strong className="text-slate-900">{occurrence.vitalsRecorded.temperature}°C</strong>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
