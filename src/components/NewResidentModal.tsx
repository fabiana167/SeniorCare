import React, { useState } from 'react';
import { X, User, Home, Award, AlertTriangle, Activity, Trash2, PlusCircle, Check } from 'lucide-react';
import { Resident, AutonomyType, RiskLevelType, VitalSigns, Medication } from '../types';

interface NewResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resident: Omit<Resident, 'id' | 'activities' | 'hasActiveAlert'>) => void;
  triggerToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function NewResidentModal({ isOpen, onClose, onSave, triggerToast }: NewResidentModalProps) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [age, setAge] = useState('');
  const [autonomy, setAutonomy] = useState<AutonomyType>('independente');
  const [riskLevel, setRiskLevel] = useState<RiskLevelType>('baixo');
  const [bloodType, setBloodType] = useState('O+');
  const [weight, setWeight] = useState('');
  const [conditionsInput, setConditionsInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');

  // Initial Vitals fields
  const [heartRate, setHeartRate] = useState('75');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [spo2, setSpo2] = useState('98');
  const [temperature, setTemperature] = useState('36.5');

  // Custom medications list
  const [medications, setMedications] = useState<{ name: string; dosage: string; schedule: string; scheduleTimeLabel: 'Manhã' | 'Almoço' | 'Noite' }[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedSchedule, setNewMedSchedule] = useState('');
  const [newMedTimeLabel, setNewMedTimeLabel] = useState<'Manhã' | 'Almoço' | 'Noite'>('Manhã');

  if (!isOpen) return null;

  const handleAddMedicationTemp = () => {
    if (!newMedName.trim() || !newMedDosage.trim()) {
      triggerToast('Preencha o nome e dosagem do medicamento.', 'error');
      return;
    }
    setMedications(prev => [
      ...prev,
      {
        name: newMedName.trim(),
        dosage: newMedDosage.trim(),
        schedule: newMedSchedule.trim() || 'Diário',
        scheduleTimeLabel: newMedTimeLabel
      }
    ]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedSchedule('');
    triggerToast('Medicamento adicionado temporariamente.', 'info');
  };

  const handleRemoveMedicationTemp = (index: number) => {
    setMedications(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      triggerToast('O nome do utente é obrigatório.', 'error');
      return;
    }
    if (!room.trim()) {
      triggerToast('O número do quarto é obrigatório.', 'error');
      return;
    }
    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      triggerToast('Forneça uma idade válida.', 'error');
      return;
    }

    const parsedAge = Number(age);
    const parsedWeight = weight ? Number(weight) : 70;
    
    // Determine a default elderly profile avatar
    const randomSeed = Math.floor(Math.random() * 8) + 1;
    const defaultAvatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDWO_sPNv1Nc35beeFB6LVaBjcJbcpQmakSO9H_lYugEKLDn8Po3X26BV_AL_4s3wrBbmsZH-obbgP2WCoh5mr7uLJHqsRyahE3p8GVdHCvWJmYriQem4Tq28kAk8qki2rC202oeNabuGlVhC5ctP9GelusUp2z00kqzB6Iu6aHYMfEI4sqKu3wmj_tXN7l2zCx6GLSuUGfhU3Gnbqozzh0cT0BZNa511mcLKSKdtB5-K3GqJHADUOoc1QZNGXeQdNjmeeIVRnKTs0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAupF1U5BwusRNVA7pYrPg3F9LWvEclXdJ8f3cqJp7Pm9hYHvxky5Rhbj7zHrQVmln3f9PqPgR5DsqXV1eolYrxMM-Govw79aw19tdAlAGEcqbusbmLzW6GhiatqCUprk1gpE-s33PuSNkyhxGwvs7fLxk-KveNWqTUQFcTCxNC7iLihEJnCvSmdbuCZ9omcZ84R7iRY6xX1-I0ccXggL3_2l-PpvEsIuzpLYGNyzufp97ov689_70lgih59c0kBCCIA4O4h4h-FAU',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCk-Hbzjk_MS-wP4O81HU0ApV7pXHeYRuMkrPtTXtLoUY-vNcgGhAQnK_UOYB75w7GP2JIw8wJm8qCsf0nr6UB0hek1-85BXnOY9gd3Uy9mBz30AvDdlM0b5gcZjV6TFCMjnaZdOVlaAvG2TLioaIC4dEomOBgBLh6iutPBn9dSPjEZhUgvKtvDIH3b8Nz3mVSgL_XhBHjVxWuImSvJH7FNzETZYedZ-0ObExyfUHJgXe8Bp0JoV8SCttKxM0P0uvQG7RC4alhHVgc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBkiJimyjesDAtT0s4klRx6LZ0mmvW3_om82tgS_UvCiC7Lt2GTyCHtSqJpkBgqEoX8NaCdRfxLO50JrAPHcRhfd6_Y2nmXC915TJLzC7FI5LfhPF4Vec4dzCvaHSvWgRTFWlNTWkt5cgwWOq5m3Q0Tn1UELC6MSJfjkvQL6Rtacnwb2-v-F_Ww1RSu5TojIboMe3DK8xh0j4laq6IVtANbf5wy1miwz400nOtnBkkvYcKA8W_y3zOftrA1JKTmpWKfpaEtk06mJVI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMGWOu8KtamMvSHjA8HeTFsnrlRcHRtDdNVkW1c_B7In8DoW5mzwbNC1kW6nCTAgttUa0RpdrzdcteG3bkIQJi43t1dyQUl3OLFSne5j32ckkq1-0NKTvLz2JTut6m8ODXNEmjfsQhha-HJnxo3-aiiwQRwPRC9-JmG3idvsS_es1oaRBJA5bIgywuvLDFwIXqPnMieHQkeEOgIJYS9_ohKJ9CnEx53lYjwg92F5bgSufrPTLJFXi4OJb58YRU4LsNtnqWRdWTxqY',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200'
    ];
    const assignedAvatar = defaultAvatars[randomSeed % defaultAvatars.length];

    // Build conditions & allergies lists
    const conditions = conditionsInput
      ? conditionsInput.split(',').map(c => c.trim()).filter(Boolean)
      : [];
    const allergies = allergiesInput
      ? allergiesInput.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    // Parse Vitals
    const parsedVitals: VitalSigns = {
      heartRate: Number(heartRate) || 72,
      bloodPressure: bloodPressure || '120/80',
      spo2: Number(spo2) || 98,
      temperature: Number(temperature) || 36.5,
      temperatureUnit: '°C'
    };

    // Parse Medications mapping
    const parsedMedications: Medication[] = medications.map((med, idx) => ({
      id: `m-new-${Date.now()}-${idx}`,
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule,
      status: 'pendente',
      scheduleTimeLabel: med.scheduleTimeLabel
    }));

    // Auto-calculate structural riskScore
    const calculatedRiskScore = riskLevel === 'alto' 
      ? 85 
      : riskLevel === 'médio' 
      ? 45 
      : 15;

    // Calculate customized helper values for the database columns
    const birthYear = 2026 - parsedAge;
    const computedBirthDate = `15/06/${birthYear}`;
    
    const firstWord = name.trim().split(' ')[0];
    const femalePrefixes = ["Ana", "Helena", "Rita", "Catarina", "Maria", "Sofia", "Fernanda", "Paula", "Inês", "Teresa", "Mariana", "Beatriz", "Clara", "Margarida", "Leonor", "Alice", "Carolina"];
    const computedGender = femalePrefixes.includes(firstWord) ? "F" : "M";
    
    // Mobility Label matching standard options
    const computedMobility = autonomy === 'independente' ? 'Independente' : autonomy === 'parcial' ? 'Com apoio' : 'Acamado';
    
    const computedAgePoints = parsedAge >= 90 ? 25 : parsedAge >= 80 ? 20 : parsedAge >= 70 ? 15 : 10;
    const computedMobilityPoints = autonomy === 'independente' ? 0 : autonomy === 'parcial' ? 15 : 45;

    // Send payload to save callback
    onSave({
      name: name.trim(),
      room: room.trim(),
      age: parsedAge,
      avatar: assignedAvatar,
      autonomy,
      riskLevel,
      riskScore: calculatedRiskScore,
      bloodType,
      weight: parsedWeight,
      conditions,
      allergies,
      vitals: parsedVitals,
      medications: parsedMedications,
      
      birthDate: computedBirthDate,
      gender: computedGender,
      mobility: computedMobility,
      generalState: 'Estável',
      responsibleFamily: 'Familiar Principal',
      familyContact: '912345678',
      agePoints: computedAgePoints,
      mobilityPoints: computedMobilityPoints
    });

    // Reset Form fields
    setName('');
    setRoom('');
    setAge('');
    setAutonomy('independente');
    setRiskLevel('baixo');
    setBloodType('O+');
    setWeight('');
    setConditionsInput('');
    setAllergiesInput('');
    setHeartRate('75');
    setBloodPressure('120/80');
    setSpo2('98');
    setTemperature('36.5');
    setMedications([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col border border-slate-200 overflow-hidden leading-relaxed max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-slate-900 text-lg">Registar Novo Utente</h3>
              <p className="text-xs text-slate-500 font-medium">Adicionar ficha clínica e de monitorização à base de dados</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-md transition-all font-bold text-sm flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Fechar
          </button>
        </div>

        {/* Modal Form scroll container */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 text-left space-y-6">
          
          {/* Section 1: IDENTIFICAÇÃO E DADOS BASE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Identificação Básica
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-name">
                  Nome Completo do Utente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="new-res-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Manuel Antunes de Sousa"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-age">
                  Idade <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="new-res-age"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ex: 84"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-room">
                  Nº do Quarto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="new-res-room"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ex: Q.208 ou Quarto 104"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-blood">
                  Grupo Sanguíneo
                </label>
                <select
                  id="new-res-blood"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-weight">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  id="new-res-weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 68"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

            </div>
          </div>

          {/* Section 2: AUTONOMIA E RISCO CLÍNICO */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Níveis de Dependência e Risco
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-autonomy">
                  Grau de Autonomia
                </label>
                <select
                  id="new-res-autonomy"
                  value={autonomy}
                  onChange={(e) => setAutonomy(e.target.value as AutonomyType)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                >
                  <option value="independente">Independente (Sem Necessidade Suplementar)</option>
                  <option value="parcial">Parcial (Necessita Auxílio Ocasional)</option>
                  <option value="total">Total (Dependência Completa - Triagem Urgente)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-risk">
                  Nivel de Risco Clínico
                </label>
                <select
                  id="new-res-risk"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevelType)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                >
                  <option value="baixo">Baixo (Normal/Rotina)</option>
                  <option value="médio">Médio (Atenção moderada ou vigilância de sintomas)</option>
                  <option value="alto">Alto (Patologias complexas - Fila prioritária sempre)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 3: CONDIÇÕES E ALERGIAS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Patologias e Alergias conhecidas
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-conditions">
                  Condições Médicas / Diagnósticos (separadas por vírgula)
                </label>
                <textarea
                  id="new-res-conditions"
                  rows={2}
                  value={conditionsInput}
                  onChange={(e) => setConditionsInput(e.target.value)}
                  placeholder="Ex: Hipertensão, Diabetes Tipo 2, Risco de Queda"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-allergies">
                  Alergias Conocidas (separadas por vírgula)
                </label>
                <textarea
                  id="new-res-allergies"
                  rows={2}
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  placeholder="Ex: Penicilina, Paracetamol, Glúten"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
                />
              </div>

            </div>
          </div>

          {/* Section 4: SINAIS VITAIS DE ENTRADA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Primeiro Registo de Sinais Vitais (Sessão de Admissão)
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-hr">
                  Freq. Cardíaca (bpm)
                </label>
                <input
                  type="number"
                  id="new-res-hr"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-bp">
                  Pressão Arterial
                </label>
                <input
                  type="text"
                  id="new-res-bp"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-spo2">
                  Saturação O₂ (%)
                </label>
                <input
                  type="number"
                  id="new-res-spo2"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="new-res-temp">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="new-res-temp"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>

            </div>
          </div>

          {/* Section 5: PLANS / MEDICAMENTOS INICIAIS */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Prescrever Medicação de Admissão (Opcional)
            </h4>

            {/* List of currently temporary added medications */}
            {medications.length > 0 && (
              <div className="flex flex-col gap-2 mb-4 bg-white p-3 rounded-xl border border-slate-100">
                {medications.map((med, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0 pt-1.5 first:pt-0">
                    <div>
                      <p className="font-bold text-slate-800">{med.name} ({med.dosage})</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{med.schedule} • Administração à(ao) {med.scheduleTimeLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicationTemp(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form to append a medication */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                <input
                  type="text"
                  placeholder="Nome do Medicamento (ex: Paracetamol 500mg)"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-slate-300 focus:bg-white text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Dosagem / Instruções"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-slate-300 focus:bg-white text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <input
                  type="text"
                  placeholder="Frequência (ex: 1 comprimido de 12 em 12 horas)"
                  value={newMedSchedule}
                  onChange={(e) => setNewMedSchedule(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-slate-300 focus:bg-white text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <select
                  value={newMedTimeLabel}
                  onChange={(e) => setNewMedTimeLabel(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Almoço">Almoço</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMedicationTemp}
              className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              Adicionar Medicamento
            </button>
          </div>

          {/* Modal Actions Footer inside standard form */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              Guardar e Admitir Utente
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
