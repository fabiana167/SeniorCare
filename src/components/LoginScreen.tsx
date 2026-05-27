import React, { useState } from 'react';
import { Activity, Lock, User, Heart, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Resident } from '../types';
// @ts-ignore
import seniorCareLogo from '../assets/images/seniorcare_logo_1779656732247.png';

interface LoginScreenProps {
  residents: Resident[];
  selectedLarName: string;
  onBackToLarSelection: () => void;
  onLogin: (role: 'care_team' | 'family', residentId: string, relativeName: string) => void;
  triggerToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function LoginScreen({ residents, selectedLarName, onBackToLarSelection, onLogin, triggerToast }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'care_team' | 'family'>('care_team');

  // Care Team state
  const [clinicianName, setClinicianName] = useState('');
  const [clinicianPin, setClinicianPin] = useState('');
  
  // Family state
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [familyPin, setFamilyPin] = useState('');

  const handleClinicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicianName.trim()) {
      triggerToast('Por favor, indique o seu nome profissional.', 'error');
      return;
    }
    // Allow standard PIN or bypass for smooth user-testing
    if (clinicianPin.trim() === '8888' || clinicianPin.trim() === '') {
      onLogin('care_team', '', clinicianName.trim());
      triggerToast(`Sessão iniciada como Equipa de Cuidados: ${clinicianName}`, 'success');
    } else {
      triggerToast('Palavra-passe incorreta. Utilize a password "8888" ou deixe em branco para teste.', 'error');
    }
  };

  const handleFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) {
      triggerToast('Por favor, selecione o seu familiar residente.', 'error');
      return;
    }
    if (!relativeName.trim()) {
      triggerToast('Por favor, indique o seu nome e relação (ex: Fabiana - Filha).', 'error');
      return;
    }
    // Simple PIN check for family (room number, 1234, or empty for smooth design demo)
    const targetResident = residents.find(r => r.id === selectedResidentId);
    if (!targetResident) return;

    const acceptedPins = ['1234', '1111', targetResident.room.toLowerCase(), ''];
    if (acceptedPins.includes(familyPin.trim().toLowerCase())) {
      onLogin('family', selectedResidentId, relativeName);
      triggerToast(`Bem-vindo, ${relativeName}! Portal do familiar iniciado.`, 'success');
    } else {
      triggerToast(`Código incorreto. Introduza o PIN padrão "1234" ou o número do quarto "${targetResident.room}".`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12 font-sans">
      {/* Brand Logo Container */}
      <div className="flex flex-col items-center mb-6 text-center animate-fadeIn">
        <div className="w-36 h-36 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-4 ring-8 ring-blue-50/60 border border-slate-150 overflow-hidden">
          <img 
            src={seniorCareLogo} 
            alt="SeniorCare Logo" 
            className="w-full h-full object-contain p-1"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">SeniorCare</h1>
        <p className="text-slate-500 text-sm font-semibold max-w-sm mt-1 leading-relaxed">
          Plataforma Integrada de Gestão Residencial
        </p>
        
        {/* Selected Care Home Badge & Back-link */}
        <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full flex items-center gap-2.5 shadow-xs">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
          <p className="text-xs font-bold text-blue-900 leading-none">
            Unidade: <span className="text-blue-700">{selectedLarName}</span>
          </p>
          <button 
            type="button"
            onClick={onBackToLarSelection}
            className="text-[10px] font-extrabold text-slate-500 hover:text-blue-600 transition-colors bg-white px-2 py-0.5 rounded border border-slate-200 uppercase cursor-pointer"
          >
            Alterar
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden animate-slideUp">
        {/* Navigation Selector Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('care_team')}
            className={`flex-1 py-4 text-center text-sm font-bold transition-all relative flex items-center justify-center gap-2 ${
              activeTab === 'care_team'
                ? 'text-blue-700 bg-white border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Equipa de Cuidados
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`flex-1 py-4 text-center text-sm font-bold transition-all relative flex items-center justify-center gap-2 ${
              activeTab === 'family'
                ? 'text-blue-700 bg-white border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4 text-red-500" />
            Portal do Familiar
          </button>
        </div>

        {/* Tab Forms Body */}
        <div className="p-6 text-left">
          {activeTab === 'care_team' ? (
            /* CARE TEAM LOGIN FORM */
            <form onSubmit={handleClinicianSubmit} className="flex flex-col gap-5">
              <div className="space-y-1">
                <h3 className="text-brand-dark text-lg font-bold tracking-tight">Painel Clinico & Triagem</h3>
                <p className="text-slate-400 text-xs">Acesso exclusivo a médicos, enfermeiros e auxiliares autorizados.</p>
              </div>

              {/* Static Credential hint context (For smooth testing experience) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 leading-relaxed font-semibold">
                  <p>Modo de Demonstração Ativo:</p>
                  <p className="text-blue-600 mt-0.5 text-[10px]">Utilize qualquer Nome de profissional e palavra-passe <span className="font-bold underline">8888</span> (ou deixe em branco).</p>
                </div>
              </div>

              {/* Professional Name input box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="clinician-name">
                  Nome do Profissional <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    id="clinician-name"
                    required
                    value={clinicianName}
                    onChange={(e) => setClinicianName(e.target.value)}
                    placeholder="Ex: Sarah Jenkins (Enfermeira)"
                    className="w-full pl-9 pr-4 py-2.5 text-slate-700 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Pin Code input box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="clinician-pin">
                  Palavra-passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    id="clinician-pin"
                    value={clinicianPin}
                    onChange={(e) => setClinicianPin(e.target.value)}
                    placeholder="Palavra-passe de teste '8888' ou deixe em branco"
                    className="w-full pl-9 pr-4 py-2.5 text-slate-700 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all text-sm mt-1"
              >
                Aceder ao Painel de Triagem
              </button>
            </form>
          ) : (
            /* FAMILY MEMBER LOGIN FORM */
            <form onSubmit={handleFamilySubmit} className="flex flex-col gap-4">
              <div className="space-y-1">
                <h3 className="text-brand-dark text-lg font-bold tracking-tight">Espaço de Ligação Familiar</h3>
                <p className="text-slate-400 text-xs">Consulte o plano de cuidados, medicação e o registo de bem-estar diário.</p>
              </div>

              {/* Hint Box */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800 leading-relaxed font-semibold">
                  <p>Acesso Seguro e Protegido</p>
                  <p className="text-rose-600 mt-0.5 text-[10px]">PIN de teste: <span className="font-bold underline">1234</span> ou o número do quarto do utente.</p>
                </div>
              </div>

              {/* Resident Dropdown Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="family-resident">
                  Selecione o Utente (Familiar) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <select
                    id="family-resident"
                    required
                    value={selectedResidentId}
                    onChange={(e) => setSelectedResidentId(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold appearance-none cursor-pointer"
                  >
                    <option value="">Selecione o utente correspondente...</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Quarto {r.room})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" />
                </div>
              </div>

              {/* Family relative name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="family-relative">
                  O Seu Nome e Parêntesco <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="family-relative"
                  required
                  value={relativeName}
                  onChange={(e) => setRelativeName(e.target.value)}
                  placeholder="Ex: Fabiana Silva (Filha)"
                  className="w-full px-4 py-2.5 text-slate-700 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

              {/* Room custom security PIN */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700" htmlFor="family-pin">
                    Código PIN de Segurança <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Usa PIN '1234' para teste</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    id="family-pin"
                    required
                    value={familyPin}
                    onChange={(e) => setFamilyPin(e.target.value)}
                    placeholder="Digite o PIN ou o Nº do Quarto"
                    className="w-full pl-9 pr-4 py-2.5 text-slate-700 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all text-sm mt-2"
              >
                Aceder ao Portal do Familiar
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-xs text-slate-400 font-medium">
        SeniorCare v1.2 © 2026 • Sistema de monitorização clínica segura em instituição de residência sénior.
      </p>
    </div>
  );
}
