import React, { useState } from 'react';
import { 
  MessageSquare, Search, Check, X, Calendar, User, 
  Clock, Filter, RefreshCw, AlertTriangle, Eye, Phone, Home, FileText
} from 'lucide-react';
import { PedidoFamiliar, Resident } from '../types';

interface PedidosTableProps {
  pedidos: PedidoFamiliar[];
  residents: Resident[];
  onToggleEstado: (pedido: PedidoFamiliar) => Promise<void>;
  triggerToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function PedidosTable({
  pedidos,
  residents,
  onToggleEstado,
  triggerToast
}: PedidosTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Pendente' | 'Resolvido'>('todos');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default 'asc' (oldest first as per queue logic)
  const [selectedPedido, setSelectedPedido] = useState<PedidoFamiliar | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredPedidos = pedidos
    .filter((ped) => {
      if (!ped) return false;
      const resident = residents.find((r) => r.id === ped.ID_Utente);
      const residentName = resident ? resident.name : ped.Nome_Utente || '';

      const matchesSearch = 
        ped.Assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ped.Mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ped.Familiar_Responsável.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ped.ID_Utente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'todos' || 
        ped.Estado === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date((a.Data_Hora || '').replace(/\//g, '-')).getTime();
      const timeB = new Date((b.Data_Hora || '').replace(/\//g, '-')).getTime();
      
      if (isNaN(timeA) || isNaN(timeB)) return 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

  // Count helper functions
  const totalCount = pedidos.length;
  const pendingCount = pedidos.filter((p) => p.Estado === 'Pendente').length;
  const resolvedCount = pedidos.filter((p) => p.Estado === 'Resolvido').length;

  const handleStatusChange = async (pedido: PedidoFamiliar) => {
    setIsUpdating(pedido.id);
    try {
      await onToggleEstado(pedido);
      // If we are currently viewing the updated request in detail modal, update it locally in details view
      if (selectedPedido && selectedPedido.id === pedido.id) {
        setSelectedPedido({
          ...selectedPedido,
          Estado: selectedPedido.Estado === 'Pendente' ? 'Resolvido' : 'Pendente'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  const getResidentInfo = (idUtente: string) => {
    return residents.find((r) => r.id === idUtente);
  };

  return (
    <div className="space-y-6" id="pedidos-management-container">
      {/* Header section with descriptive card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-605 rounded-xl">
              <MessageSquare className="w-5 h-5 font-bold" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Pedidos do Portal do Familiar</h1>
          </div>
          <p className="text-xs font-semibold text-slate-505 leading-relaxed max-w-2xl">
            Visualize e faça a gestão dos pedidos e comunicações submetidos pelos familiares dos utentes do seu lar em tempo real.
          </p>
        </div>
      </div>

      {/* Info Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total de Pedidos</p>
            <p className="text-lg font-black text-slate-800">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pendentes</p>
            <p className="text-lg font-black text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Resolvidos</p>
            <p className="text-lg font-black text-emerald-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filters and search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Procurar por assunto, utente, familiar ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="todos">Todos os Estados</option>
              <option value="Pendente">Pendentes</option>
              <option value="Resolvido">Resolvidos</option>
            </select>
          </div>

          {/* Sort Order filter */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="asc">Mais Antigos Primeiro</option>
            <option value="desc">Mais Recentes Primeiro</option>
          </select>
        </div>
      </div>

      {/* Main Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="family-requests-table">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Utente / Quarto</th>
                <th className="py-3 px-4">Familiar Responsável</th>
                <th className="py-3 px-4">Assunto</th>
                <th className="py-3 px-4">Data e Hora</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 uppercase tracking-wider font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      Nenhum pedido encontrado
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((ped) => {
                  const resident = getResidentInfo(ped.ID_Utente);
                  const isPending = ped.Estado === 'Pendente';

                  return (
                    <tr key={ped.id} className="hover:bg-slate-50 transition-colors">
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
                            <p className="font-bold text-slate-800">{resident ? resident.name : ped.Nome_Utente}</p>
                            <span className="bg-slate-100 text-slate-655 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                              {resident ? `Quarto ${resident.room}` : 'Sem Quarto'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* FAMILIAR */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {ped.Familiar_Responsável}
                      </td>

                      {/* ASSUNTO */}
                      <td className="py-3.5 px-4 font-bold text-blue-900 max-w-[200px] truncate" title={ped.Assunto}>
                        {ped.Assunto}
                      </td>

                      {/* DATA / HORA */}
                      <td className="py-3.5 px-4 font-normal text-slate-500 font-mono">
                        {ped.Data_Hora}
                      </td>

                      {/* ESTADO */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          isPending 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                        }`}>
                          {isPending ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                              Pendente
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                              Resolvido
                            </>
                          )}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPedido(ped)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Ver Detalhes do Pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(ped)}
                            disabled={isUpdating === ped.id}
                            className={`p-1.5 rounded-lg transition ${
                              isPending 
                                ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' 
                                : 'text-emerald-650 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={isPending ? 'Marcar como Resolvido' : 'Marcar como Pendente'}
                          >
                            {isUpdating === ped.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : isPending ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
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

      {/* Details Modal */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <FileText className="w-4 h-4 font-black" />
                </span>
                <h3 className="text-sm font-black text-slate-800">Detalhes do Pedido</h3>
              </div>
              <button 
                onClick={() => setSelectedPedido(null)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Subject & Status */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block mb-1">Assunto</span>
                <h4 className="text-base font-black text-blue-900 leading-snug">{selectedPedido.Assunto}</h4>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    selectedPedido.Estado === 'Pendente' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                  }`}>
                    {selectedPedido.Estado === 'Pendente' ? 'Pendente' : 'Resolvido'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Mensagem</span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPedido.Mensagem}</p>
              </div>

              {/* Resident profile lookup block */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Utente Associado</span>
                {(() => {
                  const res = getResidentInfo(selectedPedido.ID_Utente);
                  if (res) {
                    return (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                        <img 
                          src={res.avatar} 
                          alt={res.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">{res.name}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-slate-500">
                            <span className="flex items-center gap-0.5"><Home className="w-3 h-3 text-slate-400" /> Quarto {res.room}</span>
                            <span>•</span>
                            <span>Idade: {res.age} anos</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
                      Utente ID: {selectedPedido.ID_Utente} (não encontrado no lar atual)
                    </div>
                  );
                })()}
              </div>

              {/* Familiar Info & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Familiar Responsável</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedPedido.Familiar_Responsável}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Contacto de Urgência</span>
                  {(() => {
                    const res = getResidentInfo(selectedPedido.ID_Utente);
                    const contact = res ? res.familyContact : null;
                    return (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-850 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {contact ? (
                          <a href={`tel:${contact}`} className="hover:text-blue-650 hover:underline">{contact}</a>
                        ) : (
                          <span className="text-slate-400 italic">Não disponível</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Date & Time info */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Data e Hora de Submissão</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedPedido.Data_Hora}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition active:scale-95"
              >
                Fechar
              </button>
              <button
                type="button"
                disabled={isUpdating === selectedPedido.id}
                onClick={() => handleStatusChange(selectedPedido)}
                className={`px-4 py-2 text-white rounded-lg text-xs font-extrabold shadow-xs transition active:scale-95 flex items-center gap-1 ${
                  selectedPedido.Estado === 'Pendente'
                    ? 'bg-emerald-650 hover:bg-emerald-700 bg-emerald-600'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isUpdating === selectedPedido.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : selectedPedido.Estado === 'Pendente' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Marcar como Resolvido
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-white" />
                    Reabrir (Pendente)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
