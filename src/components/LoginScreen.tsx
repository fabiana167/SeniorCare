import React, { useState } from 'react';
import { Activity, Lock, User, Heart, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Resident } from '../types';
import { INITIAL_RESIDENTS } from '../data';
// @ts-ignore
import seniorCareLogo from '../assets/images/seniorcare_logo_1779656732247.png';

interface LoginScreenProps {
  residents: Resident[];
  selectedLarName: string;
  rawFuncionarios: any[];
  rawFamiliares: any[];
  dbUtentes: any[];
  dbLares: any[];
  onBackToLarSelection: () => void;
  onLogin: (role: 'care_team' | 'family', residentId: string, relativeName: string, autoSwitchLar?: string) => void;
  triggerToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function LoginScreen({ residents, selectedLarName, rawFuncionarios, rawFamiliares, dbUtentes, dbLares, onBackToLarSelection, onLogin, triggerToast }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'care_team' | 'family'>('care_team');

  // Care Team state
  const [clinicianName, setClinicianName] = useState('');
  const [clinicianPin, setClinicianPin] = useState('');
  
  // Family state
  const [relativeEmail, setRelativeEmail] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [residentNameInput, setResidentNameInput] = useState('');
  const [familyPin, setFamilyPin] = useState('');

  const handleClinicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicianName.trim()) {
      triggerToast('Por favor, indique o seu nome profissional.', 'error');
      return;
    }
    
    // Check clinician in rawFuncionarios
    const matchedFunc = rawFuncionarios.find(
      f => f.Nome.toLowerCase().trim() === clinicianName.toLowerCase().trim()
    );

    if (!matchedFunc) {
      triggerToast('Acesso recusado. Nome profissional não registado na instituição.', 'error');
      return;
    }

    // Pin check (allow 8888 or empty for demonstration)
    if (clinicianPin.trim() === '8888' || clinicianPin.trim() === '') {
      const finalName = `${matchedFunc.Cargo}: ${matchedFunc.Nome}`;
      onLogin('care_team', '', finalName);
      triggerToast(`Sessão iniciada como ${matchedFunc.Cargo} (${matchedFunc.Departamento}): ${clinicianName}`, 'success');
    } else {
      triggerToast('Palavra-passe incorreta. Utilize a password "8888" ou deixe em branco para teste.', 'error');
    }
  };

  const handleFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relativeEmail.trim()) {
      triggerToast('Por favor, indique o seu email de familiar.', 'error');
      return;
    }
    if (!relativeName.trim()) {
      triggerToast('Por favor, indique o seu nome de familiar.', 'error');
      return;
    }
    if (!residentNameInput.trim()) {
      triggerToast('Por favor, indique o nome do utente.', 'error');
      return;
    }
    
    // 1. Find relative in rawFamiliares by Email (Requirement 1)
    const matchedFam = rawFamiliares.find(
      f => f.Email.toLowerCase().trim() === relativeEmail.toLowerCase().trim()
    );

    if (!matchedFam) {
      triggerToast('Acesso recusado. Email de familiar não registado nesta instituição.', 'error');
      return;
    }

    // Helper to normalize names (lowercase, trim, strip accents)
    const normalizeName = (name: string) => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    };

    const cleanInputFam = normalizeName(relativeName);
    const cleanDbFam = normalizeName(matchedFam.Nome);

    // 2. Validate family member's Name with smart normalization check
    const inputFamWords = cleanInputFam.split(/\s+/);
    const dbFamWords = cleanDbFam.split(/\s+/);
    
    // Enforce that at least the first name matches, and all entered words exist in the database name
    const isFamMatch = inputFamWords[0] === dbFamWords[0] && 
      inputFamWords.every(word => dbFamWords.includes(word));

    if (!isFamMatch) {
      triggerToast(`Acesso recusado. O nome do familiar não corresponde ao registado para este email.`, 'error');
      return;
    }

    // 3. Locate the resident matching matchedFam.ID_Utente in the entire database (unfiltered)
    const utenteSource = dbUtentes && dbUtentes.length > 0 ? dbUtentes : INITIAL_RESIDENTS;
    const targetUtente = utenteSource.find(u => (u.ID_Utente || u.id) === matchedFam.ID_Utente);
    
    if (!targetUtente) {
      triggerToast('Acesso recusado. O utente associado a este familiar não foi encontrado no sistema.', 'error');
      return;
    }

    const cleanInputRes = normalizeName(residentNameInput);
    const cleanDbRes = normalizeName(targetUtente.Nome || targetUtente.name);

    // 4. Validate resident's entered Name (Requirement 2)
    const inputResWords = cleanInputRes.split(/\s+/);
    const dbResWords = cleanDbRes.split(/\s+/);

    const isResMatch = inputResWords[0] === dbResWords[0] && 
      inputResWords.every(word => dbResWords.includes(word));
    
    if (!isResMatch) {
      triggerToast(`Acesso recusado. O nome do utente introduzido não corresponde ao familiar registado.`, 'error');
      return;
    }

    // 5. Get the Lar name where the resident actually belongs
    const mockLaresMappings = [
      { ID_Utente: "UT-001", Lar: "Monte do Sol" },
      { ID_Utente: "UT-002", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-003", Lar: "Bela Vista" },
      { ID_Utente: "UT-004", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-005", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-006", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-007", Lar: "Monte do Sol" },
      { ID_Utente: "UT-008", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-009", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-010", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-011", Lar: "Bela Vista" },
      { ID_Utente: "UT-012", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-013", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-014", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-015", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-016", Lar: "Bela Vista" },
      { ID_Utente: "UT-017", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-018", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-019", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-020", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-021", Lar: "Monte do Sol" },
      { ID_Utente: "UT-022", Lar: "Monte do Sol" },
      { ID_Utente: "UT-023", Lar: "Monte do Sol" },
      { ID_Utente: "UT-024", Lar: "Bela Vista" },
      { ID_Utente: "UT-025", Lar: "Bela Vista" },
      { ID_Utente: "UT-026", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-027", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-028", Lar: "Monte do Sol" },
      { ID_Utente: "UT-029", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-030", Lar: "Monte do Sol" },
      { ID_Utente: "UT-031", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-032", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-033", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-034", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-035", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-036", Lar: "Monte do Sol" },
      { ID_Utente: "UT-037", Lar: "Bela Vista" },
      { ID_Utente: "UT-038", Lar: "Monte do Sol" },
      { ID_Utente: "UT-039", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-040", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-041", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-042", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-043", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-044", Lar: "Bela Vista" },
      { ID_Utente: "UT-045", Lar: "Bela Vista" },
      { ID_Utente: "UT-046", Lar: "Monte do Sol" },
      { ID_Utente: "UT-047", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-048", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-049", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-050", Lar: "Bela Vista" },
      { ID_Utente: "UT-051", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-052", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-053", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-054", Lar: "Bela Vista" },
      { ID_Utente: "UT-055", Lar: "Monte do Sol" },
      { ID_Utente: "UT-056", Lar: "Bela Vista" },
      { ID_Utente: "UT-057", Lar: "Bela Vista" },
      { ID_Utente: "UT-058", Lar: "Bela Vista" },
      { ID_Utente: "UT-059", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-060", Lar: "Monte do Sol" },
      { ID_Utente: "UT-061", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-062", Lar: "Monte do Sol" },
      { ID_Utente: "UT-063", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-064", Lar: "Bela Vista" },
      { ID_Utente: "UT-065", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-066", Lar: "Bela Vista" },
      { ID_Utente: "UT-067", Lar: "Bela Vista" },
      { ID_Utente: "UT-068", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-069", Lar: "Bela Vista" },
      { ID_Utente: "UT-070", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-071", Lar: "Bela Vista" },
      { ID_Utente: "UT-072", Lar: "Bela Vista" },
      { ID_Utente: "UT-073", Lar: "Bela Vista" },
      { ID_Utente: "UT-074", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-075", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-076", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-077", Lar: "Bela Vista" },
      { ID_Utente: "UT-078", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-079", Lar: "Monte do Sol" },
      { ID_Utente: "UT-080", Lar: "Monte do Sol" }
    ];

    const laresSource = dbLares && dbLares.length > 0 ? dbLares : mockLaresMappings;
    const mapping = laresSource.find(m => m && (m.ID_Utente === targetUtente.id || m.ID_Utente === targetUtente.ID_Utente));
    const targetLarName = mapping ? mapping.Lar : '';

    // Simple PIN check for family (room number, 1234, or empty for smooth design demo)
    const roomVal = targetUtente.Quarto || targetUtente.room || '100';
    const acceptedPins = ['1234', '1111', roomVal.toLowerCase(), ''];
    if (acceptedPins.includes(familyPin.trim().toLowerCase())) {
      onLogin('family', targetUtente.id || targetUtente.ID_Utente, matchedFam.Nome, targetLarName);
      if (targetLarName && targetLarName !== selectedLarName.replace('SeniorCare ', '')) {
        triggerToast(`Redirecionando sessão para a unidade correta: ${targetLarName}`, 'info');
      } else {
        triggerToast(`Bem-vindo, ${matchedFam.Nome}! Portal do familiar iniciado.`, 'success');
      }
    } else {
      triggerToast(`Código incorreto. Introduza o PIN padrão "1234" ou o número do quarto "${roomVal}".`, 'error');
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
                ? 'text-blue-700 bg-white border-b-2 border-blue-605'
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
                ? 'text-blue-700 bg-white border-b-2 border-blue-606'
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

              {/* Family relative Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="family-email">
                  O Seu Email de Familiar <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="family-email"
                  required
                  value={relativeEmail}
                  onChange={(e) => setRelativeEmail(e.target.value)}
                  placeholder="Ex: daniel.ferreira@gmail.com"
                  className="w-full px-4 py-2.5 text-slate-700 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

              {/* Family relative name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="family-relative">
                  O Seu Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="family-relative"
                  required
                  value={relativeName}
                  onChange={(e) => setRelativeName(e.target.value)}
                  placeholder="Ex: Daniel Ferreira"
                  className="w-full px-4 py-2.5 text-slate-700 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

              {/* Resident / Utente Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="family-resident-name">
                  Nome do Familiar Residente (Utente) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="family-resident-name"
                  required
                  value={residentNameInput}
                  onChange={(e) => setResidentNameInput(e.target.value)}
                  placeholder="Ex: Carlos Silva"
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
