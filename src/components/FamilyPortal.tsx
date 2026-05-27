import React, { useState } from 'react';
import { 
  LogOut, Heart, ShieldCheck, Pill, MessageSquare, PhoneCall, 
  Calendar, Activity, Clock, ClipboardList, Send, CheckCircle2, UserCheck
} from 'lucide-react';
import { Resident, Occurrence, ActivityLog } from '../types';
// @ts-ignore
import seniorCareLogo from '../assets/images/seniorcare_logo_1779656732247.png';

interface FamilyPortalProps {
  resident: Resident;
  relativeName: string;
  selectedLarName?: string;
  onLogout: () => void;
  onSendMessageSubmit: (messageText: string, subject: string) => void;
  triggerToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function FamilyPortal({ 
  resident, 
  relativeName, 
  selectedLarName = 'SeniorCare Bela Vista',
  onLogout, 
  onSendMessageSubmit, 
  triggerToast 
}: FamilyPortalProps) {
  const [subject, setSubject] = useState('phone_call');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map option value to friendly PT Portuguese label of the message subject
  const getSubjectLabel = (val: string) => {
    switch (val) {
      case 'phone_call': return 'Solicitação de Contacto Telefónico';
      case 'visit_schedule': return 'Agendamento / Aviso de Visita';
      case 'clinical_query': return 'Questão sobre Estado Clínico ou Medicação';
      default: return 'Geral / Outros Avisos';
    }
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      triggerToast('Por favor, escreva a sua mensagem antes de enviar.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate minor progress delay for high-fidelity feeling
    setTimeout(() => {
      onSendMessageSubmit(message, getSubjectLabel(subject));
      
      // Reset form fields
      setMessage('');
      setIsSubmitting(false);
      triggerToast('A sua mensagem foi enviada à equipa de enfermagem do turno.', 'success');
    }, 800);
  };

  // Determine vitals safety and custom descriptions for comforting clarity
  const getVitalsSafetyDescription = () => {
    const hr = resident.vitals.heartRate;
    const temp = resident.vitals.temperature;
    const spo2 = resident.vitals.spo2;

    if (resident.hasActiveAlert) {
      return {
        text: 'Sob atenção imediata da equipa clínica.',
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    }
    return {
      text: 'Sinais vitais normais e estáveis no último registo.',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-100'
    };
  };

  const statusInfo = getVitalsSafetyDescription();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col font-sans pb-16">
      
      {/* 1. Header Section */}
      <header className="fixed top-0 left-0 right-0 w-full px-4 md:px-8 h-14 z-40 bg-white border-b border-slate-200 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center overflow-hidden shadow-xs">
            <img 
              src={seniorCareLogo} 
              alt="Logo" 
              className="w-full h-full object-contain p-0.5" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm text-blue-900 tracking-tight block flex items-center gap-1">
              SeniorCare
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-bold border border-slate-200 uppercase tracking-wide">
                {selectedLarName}
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold block -mt-0.5 uppercase tracking-wider">Portal do Familiar</span>
          </div>
        </div>

        {/* User Context & Exit trigger */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800">{relativeName}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Família de {resident.name.split(' ')[0]}</p>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg transition-all active:scale-95"
            title="Terminar Sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminar Sessão</span>
          </button>
        </div>
      </header>

      {/* 2. Main Space Container */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 mt-20 flex flex-col gap-6 text-left">
        
        {/* Welcome Block Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4">
            <Heart className="w-48 h-48 text-white font-black" />
          </div>
          
          <div className="space-y-1 z-10">
            <span className="bg-blue-500/30 text-blue-100 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border border-blue-400/25">
              Portal Seguro Ativo
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Olá, {relativeName.split(' ')[0]}</h2>
            <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
              Consulte com total transparência o boletim diário de <span className="font-bold underline">{resident.name}</span>. A nossa equipa de cuidados está focada na máxima saúde e qualidade de vida.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-xs text-white z-10 font-medium whitespace-nowrap">
            <p className="opacity-80">Quarto do Utente:</p>
            <p className="text-lg font-black mt-0.5">Quarto {resident.room}</p>
          </div>
        </div>

        {/* Clinical Transparency Warning Summary */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${statusInfo.color}`}>
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-semibold leading-relaxed">
            <span className="font-bold">Estatuto de Cuidados:</span> {statusInfo.text}
          </p>
        </div>

        {/* 3. Main Data Columns split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: Resident Metadata + Daily Vitals state + Activity timeline */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Resident Bio info card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center gap-5">
              <img 
                alt={resident.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-50 shadow-inner"
                referrerPolicy="no-referrer"
                src={resident.avatar}
              />
              <div className="flex-grow text-center sm:text-left space-y-1">
                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                  Utente Registado • {resident.age} Anos
                </span>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{resident.name}</h3>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start text-xs text-slate-500 font-semibold pt-1">
                  <p>Grupo Sanguíneo: <span className="text-slate-800 font-bold">{resident.bloodType || 'N/A'}</span></p>
                  <p>Peso: <span className="text-slate-800 font-bold">{resident.weight || 62} kg</span></p>
                  <p>Grau de Autonomia: <span className="text-slate-800 font-bold uppercase">{resident.autonomy}</span></p>
                </div>
              </div>
            </div>

            {/* Vitals Cards Grid */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-400" />
                <span>Última Telemetria de Sinais Vitais</span>
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Heart Rate */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden">
                  <div className="absolute right-2 top-2 bg-red-50 text-red-500 rounded-full p-1">
                    <Heart className="w-4 h-4 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Freq. Cardíaca</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{resident.vitals.heartRate} <span className="text-xs font-semibold text-slate-500">bpm</span></p>
                  <span className={`text-[10px] font-bold block mt-2 ${resident.vitals.heartRate > 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {resident.vitals.heartRate > 90 ? 'Ligeiramente Elevada' : 'Frequência Estável'}
                  </span>
                </div>

                {/* 2. Blood Pressure */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden">
                  <div className="absolute right-2 top-2 bg-blue-50 text-blue-500 rounded-full p-1">
                    <Activity className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Pressão Arterial</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{resident.vitals.bloodPressure} <span className="text-[10px] font-semibold text-slate-500">mmHg</span></p>
                  <span className="text-emerald-600 text-[10px] font-bold block mt-2">Valores de Referência</span>
                </div>

                {/* 3. SpO2 Oxygenation */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden">
                  <div className="absolute right-2 top-2 bg-sky-50 text-sky-500 rounded-full p-1">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Saturação O₂</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{resident.vitals.spo2} <span className="text-xs font-semibold text-slate-500">%</span></p>
                  <span className="text-emerald-600 text-[10px] font-bold block mt-2">Nível Excelente</span>
                </div>

                {/* 4. Temperature */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden">
                  <div className="absolute right-2 top-2 bg-amber-50 text-amber-500 rounded-full p-1">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Temperatura</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{resident.vitals.temperature} <span className="text-sm font-semibold text-slate-500">°C</span></p>
                  <span className="text-emerald-600 text-[10px] font-bold block mt-2">Estado Normotérmico</span>
                </div>
              </div>
            </div>

            {/* Timline register box of current activities */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-blue-600" />
                  Diário Clínico & Rotinas Recentes
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">Hoje</span>
              </div>

              {resident.activities && resident.activities.length > 0 ? (
                <div className="flex flex-col gap-5 relative pl-4 border-l-2 border-slate-100 py-1">
                  {resident.activities.map((act) => (
                    <div key={act.id} className="relative flex flex-col gap-1 text-left">
                      {/* Timeline Dot decoration */}
                      <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border bg-white ${
                        act.type === 'critical' ? 'border-red-600 bg-red-105' : 'border-blue-500 bg-blue-105'
                      }`} />
                      
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{act.time}</span>
                        {act.type === 'critical' && (
                          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-extrabold border border-amber-200 text-[8px] uppercase">Atenção Especial</span>
                        )}
                      </div>
                      
                      <p className="text-xs font-semibold leading-relaxed text-slate-700 mt-0.5">{act.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Ainda sem rotinas logadas para hoje. Controlo de rotina em progresso.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1 COLUMN: Medication state + Send Message block */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Medications taken verification tracker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Pill className="w-4.5 h-4.5 text-indigo-600" />
                Medicação Prescrita
              </h4>

              <div className="flex flex-col gap-3">
                {resident.medications && resident.medications.length > 0 ? (
                  resident.medications.map((med) => (
                    <div key={med.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {med.status === 'tomado' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow text-xs space-y-0.5">
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-slate-500 text-[10px]">{med.dosage} • <span className="font-semibold text-slate-600">{med.schedule}</span></p>
                        
                        <div className="pt-1">
                          {med.status === 'tomado' ? (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold py-0.2 px-1.5 rounded">Administrado</span>
                          ) : (
                            <span className="text-[9px] bg-slate-100 text-slate-600 font-bold py-0.2 px-1.5 rounded">Preparado / Cuidado Ativo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">Sem medicação prescrita para hoje.</p>
                )}
              </div>
            </div>

            {/* Connect / Send Message Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-4.5 h-4.5 text-emerald-600" />
                Mensagem à Enfermagem
              </h4>

              <form onSubmit={handleSubmitMessage} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400" htmlFor="msg-subject">Motivo / Assunto</label>
                  <select
                    id="msg-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="phone_call">📞 Solicitar Chamada Telefónica</option>
                    <option value="visit_schedule">🗓️ Agendar / Avisar sobre Visita</option>
                    <option value="clinical_query">💊 Questão Clínica / Medicação</option>
                    <option value="others">💬 Outro assunto / Mensagem geral</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400" htmlFor="msg-text">A sua Mensagem</label>
                  <textarea
                    id="msg-text"
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva algo importante para a equipa..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-bounce' : ''}`} />
                  <span>{isSubmitting ? 'A enviar mensagem...' : 'Enviar Mensagem'}</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
