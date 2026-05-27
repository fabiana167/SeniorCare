import React from 'react';
import { motion } from 'motion/react';
import { Building2, MapPin, Users, Phone, ArrowRight, Activity } from 'lucide-react';
// @ts-ignore
import seniorCareLogo from '../assets/images/seniorcare_logo_1779656732247.png';

export interface Lar {
  id: string;
  name: string;
  location: string;
  residentsCount: number;
  type: string;
  phone: string;
  accentClass: string;
  hoverAccentClass: string;
  borderClass: string;
  bgCircleClass: string;
}

export const AVAILABLE_LARES: Lar[] = [
  {
    id: 'lar-belavista',
    name: 'SeniorCare Bela Vista',
    location: 'Lisboa (Alvalade)',
    residentsCount: 80,
    type: 'Residência Médica Sénior Continuada',
    phone: '+351 213 456 789',
    accentClass: 'text-blue-600 bg-blue-50 border-blue-200',
    hoverAccentClass: 'hover:border-blue-400 hover:ring-blue-100',
    borderClass: 'border-slate-200',
    bgCircleClass: 'bg-blue-500',
  },
  {
    id: 'lar-jardimflores',
    name: 'SeniorCare Jardim das Flores',
    location: 'Porto (Foz do Douro)',
    residentsCount: 64,
    type: 'Clínica Geriátrica e Reabilitação',
    phone: '+351 224 891 023',
    accentClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    hoverAccentClass: 'hover:border-emerald-400 hover:ring-emerald-100',
    borderClass: 'border-slate-200',
    bgCircleClass: 'bg-emerald-500',
  },
  {
    id: 'lar-pinhal',
    name: 'SeniorCare Pinhal de Coimbra',
    location: 'Coimbra (Solum)',
    residentsCount: 50,
    type: 'Lar de Repouso e Vivência Assistida',
    phone: '+351 239 125 432',
    accentClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    hoverAccentClass: 'hover:border-indigo-400 hover:ring-indigo-100',
    borderClass: 'border-slate-200',
    bgCircleClass: 'bg-indigo-500',
  },
  {
    id: 'lar-montesol',
    name: 'SeniorCare Monte do Sol',
    location: 'Faro (Região Central)',
    residentsCount: 45,
    type: 'Residência Assistida de Cuidados Especiais',
    phone: '+351 289 777 111',
    accentClass: 'text-amber-600 bg-amber-50 border-amber-200',
    hoverAccentClass: 'hover:border-amber-400 hover:ring-amber-100',
    borderClass: 'border-slate-200',
    bgCircleClass: 'bg-amber-500',
  }
];

interface LarSelectionScreenProps {
  onSelectLar: (lar: Lar) => void;
}

export default function LarSelectionScreen({ onSelectLar }: LarSelectionScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12 font-sans md:py-20">
      {/* Brand & Introduction Header */}
      <div className="flex flex-col items-center mb-10 text-center animate-fadeIn">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6 ring-8 ring-blue-50/70 overflow-hidden border border-slate-100/80"
        >
          <img 
            src={seniorCareLogo} 
            alt="SeniorCare Logo" 
            className="w-full h-full object-contain p-1"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight md:text-4xl">
          Portal Multi-Institucional
        </h1>
        <p className="text-slate-500 text-sm font-medium max-w-md mt-2 leading-relaxed">
          Para aceder ao registo clínico ou ligar-se à sua família, selecione abaixo a residência sénior onde se pretende autenticar.
        </p>
      </div>

      {/* Grid List of Available Care Homes */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6" id="lar-selection-grid">
        {AVAILABLE_LARES.map((lar, index) => {
          return (
            <motion.div
              key={lar.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => onSelectLar(lar)}
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-300 relative overflow-hidden group hover:shadow-md ring-4 ring-transparent ${lar.hoverAccentClass}`}
              id={`lar-card-${lar.id}`}
            >
              {/* Highlight background blob on hover */}
              <div className="absolute right-0 top-0 -mt-6 -mr-6 w-24 h-24 bg-slate-50 rounded-full transition-transform group-hover:scale-125 duration-500 opacity-60 pointer-events-none" />
              
              <div className="z-10 text-left">
                {/* Header info */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${lar.bgCircleClass} shadow-xs`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${lar.accentClass}`}>
                    Ativo
                  </span>
                </div>

                {/* Name & Type */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {lar.name}
                </h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5 line-clamp-1">
                  {lar.type}
                </p>

                {/* Details layout */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{lar.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{lar.residentsCount} utentes registados na unidade</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{lar.phone}</span>
                  </div>
                </div>
              </div>

              {/* Bottom bar with action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors z-10 text-left">
                <span>Entrar no sistema de segurança</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>Selecionar</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer copyright */}
      <p className="mt-12 text-xs text-slate-400 font-medium animate-fadeIn">
        SeniorCare v1.2 © 2026 • Sistema Central de Triagem Integrada e Apoio Residencial de Saúde.
      </p>
    </div>
  );
}
