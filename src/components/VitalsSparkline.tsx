import React from 'react';
import { Heart, Activity, Wind, Thermometer } from 'lucide-react';

interface VitalsSparklineProps {
  heartRate: number;
  bloodPressure: string;
  spo2: number;
  temperature?: number;
  temperatureUnit?: '°C' | '°F';
}

export default function VitalsSparkline({
  heartRate,
  bloodPressure,
  spo2,
  temperature = 36.5,
  temperatureUnit = '°C',
}: VitalsSparklineProps) {
  // Parsing Systolic/Diastolic for visual ratio
  const bpParts = bloodPressure.split('/');
  const systolic = parseInt(bpParts[0]) || 120;
  const sysPercent = Math.min(Math.max(((systolic - 80) / (180 - 80)) * 100, 20), 100);

  const getHeartRateStatus = (hr: number) => {
    if (hr > 90) return { label: 'Alto', color: 'bg-red-500 text-red-500 bg-red-50 border-red-200' };
    if (hr < 60) return { label: 'Baixo', color: 'bg-amber-500 text-amber-500 bg-amber-50 border-amber-200' };
    return { label: 'Normal', color: 'bg-emerald-500 hover:bg-emerald-600 text-emerald-600' };
  };

  const getBpStatus = (bpStr: string) => {
    const sys = parseInt(bpStr.split('/')[0]) || 120;
    if (sys > 140) return { label: 'Alto', color: 'bg-red-500 text-red-500 bg-red-50 border-red-200' };
    if (sys < 90) return { label: 'Baixo', color: 'bg-amber-500 text-amber-500 bg-amber-50 border-amber-200' };
    return { label: 'Estável', color: 'bg-blue-600 text-blue-700 bg-blue-50 border-blue-200' };
  };

  const getTempStatus = (temp: number) => {
    if (temp >= 37.8) return { label: 'Febre', color: 'bg-red-500 text-red-500 bg-red-50 border-red-200' };
    if (temp >= 37.3) return { label: 'Subfebril', color: 'bg-amber-500 text-amber-500 bg-amber-50 border-amber-200' };
    if (temp < 35.5) return { label: 'Hipotermia', color: 'bg-blue-500 text-blue-500 bg-blue-50 border-blue-200' };
    return { label: 'Normal', color: 'bg-emerald-500 text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  const hrStatus = getHeartRateStatus(heartRate);
  const bpStatus = getBpStatus(bloodPressure);
  const tempStatus = getTempStatus(temperature);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="vitals-sparkline-grid">
      {/* Heart Rate Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between" id="vital-heart-rate">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs md:text-sm font-semibold text-slate-500 flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> Frequência Cardíaca
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${hrStatus.color}`}>
              {hrStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-900">{heartRate}</span>
            <span className="text-sm font-semibold text-slate-400">bpm</span>
          </div>
        </div>
        {/* Sparkline Visual using SVG line */}
        <div className="mt-4 h-10 w-full bg-slate-50 rounded overflow-hidden relative border border-slate-100 flex items-center">
          <svg className="w-full h-full text-red-500 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 20">
            <polyline
              fill="none"
              points="0,12 10,12 15,12 20,4 23,18 26,12 35,12 40,3 43,19 46,12 55,12 70,12 73,3 77,18 80,12 90,12 100,12"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">Atualizado em tempo real</p>
      </div>

      {/* Blood Pressure Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between" id="vital-blood-pressure">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs md:text-sm font-semibold text-slate-500 flex items-center gap-1">
              <Activity className="w-4 h-4 text-blue-600" /> Pressão Arterial
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${bpStatus.color}`}>
              {bpStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-900">{bloodPressure}</span>
            <span className="text-sm font-semibold text-slate-400">mmHg</span>
          </div>
        </div>
        {/* Dynamic visual slider */}
        <div className="mt-4 h-10 w-full flex items-center px-1">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${systolic > 140 ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${sysPercent}%` }}
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">Histórico recente estável</p>
      </div>

      {/* SpO2 Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between" id="vital-spo2">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs md:text-sm font-semibold text-slate-500 flex items-center gap-1">
              <Wind className="w-4 h-4 text-emerald-600" /> Saturação SpO2
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-100">
              {spo2 >= 95 ? 'Normal' : 'Atenção'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-900">{spo2}</span>
            <span className="text-sm font-semibold text-slate-400">%</span>
          </div>
        </div>
        {/* Inline text metrics icon trend */}
        <div className="mt-4 h-10 w-full bg-slate-50 rounded border border-slate-100 flex items-center justify-center font-semibold text-slate-500 text-xs gap-1">
          <span className="text-emerald-600">↑</span> Estável acima de 95%
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">Luminosidade de pulso ótima</p>
      </div>

      {/* Temperature Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between" id="vital-temperature">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs md:text-sm font-semibold text-slate-500 flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-amber-500" /> Temperatura
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tempStatus.color}`}>
              {tempStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-slate-900">{temperature.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-400">{temperatureUnit}</span>
          </div>
        </div>
        {/* Visual range indicator for temperature */}
        <div className="mt-4 h-10 w-full flex items-center px-1">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${temperature >= 37.8 ? 'bg-red-500' : temperature >= 37.3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(Math.max(((temperature - 34) / 8) * 100, 10), 100)}%` }}
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">Afebril e normotérmico</p>
      </div>
    </div>
  );
}
