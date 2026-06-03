import React, { useState } from 'react';
import { 
  Pill, Search, Plus, Trash2, Edit2, Check, X, Calendar, User, 
  Clock, Stethoscope, Hash, Filter, ChevronDown, RefreshCw, AlertTriangle
} from 'lucide-react';
import { MedicationRecord, Resident } from '../types';
import { doc, setDoc, deleteDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MedicationsTableProps {
  medicationRecords: MedicationRecord[];
  residents: Resident[];
  selectedLarId: string;
  triggerToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function MedicationsTable({ 
  medicationRecords, 
  residents, 
  selectedLarId, 
  triggerToast 
}: MedicationsTableProps) {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResidentFilter, setSelectedResidentFilter] = useState('todos');

  // Modal / Form states for creation
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [formUtente, setFormUtente] = useState('');
  const [formMedicamento, setFormMedicamento] = useState('');
  const [formDosagem, setFormDosagem] = useState('');
  const [formHorario, setFormHorario] = useState('08:00');
  const [formFrequencia, setFormFrequencia] = useState('1x ao dia');
  const [formMedico, setFormMedico] = useState('');
  const [formIdMedicamento, setFormIdMedicamento] = useState('');
  const [formDataInicio, setFormDataInicio] = useState(() => {
    return new Date().toISOString().split('T')[0].split('-').reverse().join('/');
  });
  const [formDataFim, setFormDataFim] = useState('01/12/2026');

  // Editing state
  const [editingRecord, setEditingRecord] = useState<MedicationRecord | null>(null);

  // Filter logic
  const filteredRecords = medicationRecords.filter((rec) => {
    const resident = residents.find(r => r.id === rec.ID_Utente);
    const residentName = resident ? resident.name : '';
    
    const matchesSearch = 
      rec.Medicamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.Médico_Prescitor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.ID_Utente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResident = 
      selectedResidentFilter === 'todos' || 
      rec.ID_Utente === selectedResidentFilter;

    return matchesSearch && matchesResident;
  });

  // Handle Add Form submission
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formUtente || !formMedicamento || !formDosagem || !formMedico) {
      triggerToast('Por favor preencha todos os campos obrigatórios.', 'error');
      return;
    }

    try {
      const newId = `med-rec-${formUtente}-${Date.now()}`;
      
      const newRecord: MedicationRecord = {
        id: newId,
        ID_Utente: formUtente,
        Medicamento: formMedicamento.trim(),
        Dosagem: formDosagem.trim(),
        Horário: formHorario.trim(),
        Frequência_dia: formFrequencia.trim(),
        Médico_Prescitor: formMedico.trim(),
        Data_Início: formDataInicio,
        Data_Fim: formDataFim,
        ID_Medicamento: formIdMedicamento.trim() || `MED-${String(Date.now()).substring(7)}`
      };

      // Firestore doc path: lares/{larId}/medication_records/{id}
      const recordDocRef = doc(db, 'lares', selectedLarId, 'medication_records', newId);
      await setDoc(recordDocRef, newRecord);

      triggerToast(`Prescrição de ${formMedicamento} adicionada com sucesso no Firebase!`, 'success');
      
      // Close and reset form
      setIsAddFormOpen(false);
      setFormMedicamento('');
      setFormIdMedicamento('');
      setFormDosagem('');
      setFormMedico('');
    } catch (err: any) {
      console.error('Erro ao salvar medicação no Firebase:', err);
      triggerToast(`Erro ao gravar: ${err.message || err}`, 'error');
    }
  };

  // Handle Editing submission
  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (!editingRecord.Medicamento || !editingRecord.Dosagem || !editingRecord.Médico_Prescitor) {
      triggerToast('Por favor preencha todos os campos obrigatórios.', 'error');
      return;
    }

    try {
      const recordDocRef = doc(db, 'lares', selectedLarId, 'medication_records', editingRecord.id);
      await setDoc(recordDocRef, editingRecord);

      triggerToast('Prescrição atualizada com sucesso no Firebase!', 'success');
      setEditingRecord(null);
    } catch (err: any) {
      console.error('Erro ao atualizar medicação no Firebase:', err);
      triggerToast(`Erro ao atualizar: ${err.message || err}`, 'error');
    }
  };

  // Handle deletion
  const handleDeleteRecord = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza de que deseja eliminar a prescrição de ${name}?`)) return;

    try {
      const recordDocRef = doc(db, 'lares', selectedLarId, 'medication_records', id);
      await deleteDoc(recordDocRef);
      triggerToast('Prescrição removida com sucesso no Firebase!', 'success');
    } catch (err: any) {
      console.error('Erro ao remover do Firebase:', err);
      triggerToast(`Erro ao remover: ${err.message || err}`, 'error');
    }
  };

  return (
    <div className="space-y-6" id="medications-management-container">
      {/* Header section with explanatory card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Pill className="w-5 h-5 font-bold" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Tabela de Medicação no Firebase</h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-2xl">
            Esta tabela interage em tempo real com a coleção <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">medication_records</code> do Cloud Firestore. Quaisquer alterações (criação, edição e exclusão) são sincronizadas instantaneamente na nuvem do Firebase conforme especificado.
          </p>
        </div>

        <button
          onClick={() => {
            if (residents.length > 0 && !formUtente) {
              setFormUtente(residents[0].id);
            }
            setIsAddFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-white font-bold" />
          Nova Prescrição
        </button>
      </div>

      {/* Info Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-650 font-bold">
            <Pill className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total de Prescrições</p>
            <p className="text-lg font-black text-slate-800">{medicationRecords.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-655 font-bold">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Utentes Monitorizados</p>
            <p className="text-lg font-black text-slate-800">
              {new Set(medicationRecords.map(r => r.ID_Utente)).size}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-655 font-bold">
            <RefreshCw className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Estado de Sincronização</p>
            <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
              Ligado ao Firestore
            </p>
          </div>
        </div>
      </div>

      {/* Filters and search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Procurar por medicamento, médico prescritor ou ID de utente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
          />
        </div>

        <div className="w-full md:w-64 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedResidentFilter}
            onChange={(e) => setSelectedResidentFilter(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="todos">Todos os Utentes</option>
            {residents.map((res) => (
              <option key={res.id} value={res.id}>
                {res.id} - {res.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="firebase-medication-records-table">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">ID_Utente / Nome</th>
                <th className="py-3 px-4">Medicamento</th>
                <th className="py-3 px-4">ID_Medicamento</th>
                <th className="py-3 px-4">Dosagem</th>
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4">Frequência/Dia</th>
                <th className="py-3 px-4">Médico Prescritor</th>
                <th className="py-3 px-4">Data Início</th>
                <th className="py-3 px-4">Data Fim</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 uppercase tracking-wider font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      Nenhum registo de medicação correspondente
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const resident = residents.find(r => r.id === rec.ID_Utente);
                  const isEditing = editingRecord?.id === rec.id;

                  if (isEditing && editingRecord) {
                    return (
                      <tr key={rec.id} className="bg-blue-50/50">
                        {/* UTENTE READONLY */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {resident && (
                              <img 
                                src={resident.avatar} 
                                alt={resident.name} 
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{resident ? resident.name : 'Desconhecido'}</p>
                              <span className="bg-slate-200 text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded-full font-mono">{rec.ID_Utente}</span>
                            </div>
                          </div>
                        </td>
                        {/* MEDICAMENTO */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-full text-xs font-medium focus:outline-none focus:border-blue-500" 
                            value={editingRecord.Medicamento}
                            onChange={(e) => setEditingRecord({ ...editingRecord, Medicamento: e.target.value })}
                          />
                        </td>
                        {/* ID_MEDICAMENTO */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-full text-xs font-semibold focus:outline-none focus:border-blue-500 font-mono text-slate-500" 
                            value={editingRecord.ID_Medicamento}
                            onChange={(e) => setEditingRecord({ ...editingRecord, ID_Medicamento: e.target.value })}
                          />
                        </td>
                        {/* DOSAGEM */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-full text-xs font-medium focus:outline-none focus:border-blue-500" 
                            value={editingRecord.Dosagem}
                            onChange={(e) => setEditingRecord({ ...editingRecord, Dosagem: e.target.value })}
                          />
                        </td>
                        {/* HORARIO */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-20 text-xs font-medium focus:outline-none focus:border-blue-500 font-mono" 
                            value={editingRecord.Horário}
                            onChange={(e) => setEditingRecord({ ...editingRecord, Horário: e.target.value })}
                          />
                        </td>
                        {/* FREQ_DIA */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-24 text-xs font-medium focus:outline-none focus:border-blue-500" 
                            value={editingRecord.Frequência_dia}
                            onChange={(e) => setEditingRecord({ ...editingRecord, Frequência_dia: e.target.value })}
                          />
                        </td>
                        {/* MEDICO */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-full text-xs font-medium focus:outline-none focus:border-blue-500" 
                            value={editingRecord.Médico_Prescitor}
                            onChange={(e) => setEditingRecord({ ...editingRecord, Médico_Prescitor: e.target.value })}
                          />
                        </td>
                        {/* START DATE */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-24 text-xs font-medium focus:outline-none focus:border-blue-500 font-mono" 
                            value={editingRecord.Data_Início}
                            onChange={(e) => setEditingRecord({ ...editingRecord, Data_Início: e.target.value })}
                          />
                        </td>
                        {/* END DATE */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            className="bg-white border border-slate-300 rounded px-2 py-1 w-24 text-xs font-medium focus:outline-none focus:border-blue-500 font-mono" 
                            value={editingRecord.Data_Fim}
                            onChange={(e) => setEditingRecord({ ...editingRecord, Data_Fim: e.target.value })}
                          />
                        </td>
                        {/* EDIT SAVING ACTIONS */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={handleUpdateRecord}
                              className="p-1 px-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                              title="Gravar no Firebase"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingRecord(null)}
                              className="p-1 px-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                              title="Cancelar edição"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      {/* UTENTE */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {resident && (
                            <img 
                              src={resident.avatar} 
                              alt={resident.name} 
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-850 hover:text-blue-700 cursor-pointer">{resident ? resident.name : 'Desconhecido'}</p>
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full font-mono">{rec.ID_Utente}</span>
                          </div>
                        </div>
                      </td>

                      {/* MEDICAMENTO */}
                      <td className="py-3.5 px-4 font-bold text-blue-900">
                        {rec.Medicamento}
                      </td>
                      {/* ID_MEDICAMENTO */}
                      <td className="py-3.5 px-4 font-semibold font-mono text-slate-550">
                        {rec.ID_Medicamento}
                      </td>

                      {/* DOSAGEM */}
                      <td className="py-3.5 px-4 font-normal text-slate-600">
                        {rec.Dosagem}
                      </td>

                      {/* HORARIO */}
                      <td className="py-3.5 px-4 font-medium font-mono text-slate-600">
                        {rec.Horário}
                      </td>

                      {/* FREQUENCIA */}
                      <td className="py-3.5 px-4 font-normal text-slate-605">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {rec.Frequência_dia}
                        </span>
                      </td>

                      {/* MEDICO */}
                      <td className="py-3.5 px-4 font-normal text-slate-600">
                        {rec.Médico_Prescitor}
                      </td>

                      {/* DATAS */}
                      <td className="py-3.5 px-4 font-mono font-normal text-slate-500">
                        {rec.Data_Início}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-normal text-slate-500">
                        {rec.Data_Fim}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingRecord({ ...rec })}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Editar Prescrição"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.Medicamento)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                            title="Eliminar Prescrição"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over or dialog configuration to Create a new Prescription */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Pill className="w-4 h-4 font-black" />
                </span>
                <h3 className="text-sm font-black text-slate-800">Nova Prescrição de Medicação</h3>
              </div>
              <button 
                onClick={() => setIsAddFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Selecionar Utente <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formUtente}
                  onChange={(e) => setFormUtente(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
                >
                  {residents.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.id} - {res.name} (Quarto {res.room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Medicamento <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Metformina"
                    value={formMedicamento}
                    onChange={(e) => setFormMedicamento(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dosagem <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 850 mg ou 1 comp"
                    value={formDosagem}
                    onChange={(e) => setFormDosagem(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Código ID_Medicamento <span className="text-slate-400">(Opcional)</span></label>
                <input
                  type="text"
                  placeholder="Ex: MED-001 (Deixe em branco para gerar auto)"
                  value={formIdMedicamento}
                  onChange={(e) => setFormIdMedicamento(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 placeholder:text-slate-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Horário Predeterminado <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 08:00 ou 08h e 20h"
                    value={formHorario}
                    onChange={(e) => setFormHorario(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Frequência Diária <span className="text-red-500">*</span></label>
                  <select
                    value={formFrequencia}
                    onChange={(e) => setFormFrequencia(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="1x ao dia">1x ao dia</option>
                    <option value="2x ao dia">2x ao dia</option>
                    <option value="3x ao dia">3x ao dia</option>
                    <option value="4x ao dia">4x ao dia</option>
                    <option value="De 12h em 12h">De 12h em 12h</option>
                    <option value="Se necessário (SOS)">Se necessário (SOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Médico Prescritor <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dr. Manuel Silva"
                    value={formMedico}
                    onChange={(e) => setFormMedico(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data Início <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/AAAA"
                    value={formDataInicio}
                    onChange={(e) => setFormDataInicio(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data Fim <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/AAAA"
                    value={formDataFim}
                    onChange={(e) => setFormDataFim(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-extrabold shadow-xs transition active:scale-95 flex items-center gap-1"
                >
                  <Check className="w-4 h-4 text-white" />
                  Salvar Prescrição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
