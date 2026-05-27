import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Table, Database, FileText, Check, Download, AlertTriangle, 
  RefreshCw, Users, History, ChevronRight, CheckCircle2, ArrowLeft, ArrowUpRight
} from 'lucide-react';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, signInWithGoogleForSheets } from '../lib/firebase';
import { Resident, Occurrence, AutonomyType, RiskLevelType } from '../types';

interface Lar {
  id: string;
  name: string;
}

interface SheetsImporterProps {
  selectedLar: Lar | null;
  triggerToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onBackToDashboard: () => void;
}

interface SheetTab {
  title: string;
}

export default function SheetsImporter({ selectedLar, triggerToast, onBackToDashboard }: SheetsImporterProps) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1G4q50mqTpci2AtsflnR2EPUD8P-0Rci957uzB_nr_sA/edit?gid=996814247#gid=996814247'
  );
  
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [spreadsheetsData, setSpreadsheetsData] = useState<any>(null);
  const [tabs, setTabs] = useState<SheetTab[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [showNetworkFallbackHelp, setShowNetworkFallbackHelp] = useState(false);
  
  // Loaded sheet rows
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importTarget, setImportTarget] = useState<'residents' | 'occurrences'>('residents');

  // New sync methods for fallback
  const [syncMethod, setSyncMethod] = useState<'google_api' | 'copy_paste'>('google_api');
  const [pasteData, setPasteData] = useState<string>('');

  // Schema Mapping definitions
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [mappedPreview, setMappedPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Parse direct clipboard copy-paste (tsv, csv, semicolons)
  const handleParsePastedData = () => {
    if (!pasteData.trim()) {
      triggerToast('Por favor, cole os dados copiados antes de carregar.', 'info');
      return;
    }

    try {
      // Split into lines and filter empty lines
      const lines = pasteData.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) {
        throw new Error('Certifique-se de que copiou o cabeçalho e pelo menos uma linha de dados.');
      }

      // Delimiter detection logic
      const delimiterDetection = (line: string) => {
        const tabs = (line.match(/\t/g) || []).length;
        const semic = (line.match(/;/g) || []).length;
        const commas = (line.match(/,/g) || []).length;
        if (tabs >= semic && tabs >= commas && tabs > 0) return '\t';
        if (semic >= commas && semic > 0) return ';';
        return ',';
      };

      const delimiter = delimiterDetection(lines[0]);

      // Parse fields split by delimiter
      const parsedRows = lines.map(line => {
        let cells: string[] = [];
        if (delimiter === '\t') {
          cells = line.split('\t');
        } else if (delimiter === ';') {
          cells = line.split(';');
        } else {
          cells = line.split(',');
        }
        return cells.map(cell => cell.replace(/^["']|["']$/g, '').trim());
      });

      const parsedHeaders = parsedRows[0];
      const parsedDataRows = parsedRows.slice(1);

      setHeaders(parsedHeaders);
      setRows(parsedDataRows);
      autoMapFields(parsedHeaders);
      triggerToast(`Sucesso! ${parsedDataRows.length} linhas lidas do texto colado. Proceda ao mapeamento abaixo.`, 'success');
    } catch (err: any) {
      console.error(err);
      triggerToast(`Erro ao ler dados colados: ${err.message}`, 'error');
    }
  };

  // Helper to extract Spreadsheet ID
  const getSpreadsheetId = () => {
    const match = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) return match[1];
    return spreadsheetUrl.trim();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogleForSheets();
      setAccessToken(result.accessToken);
      setGoogleUser(result.user);
      triggerToast('Google Sheets autorizado com sucesso!', 'success');
      setShowNetworkFallbackHelp(false);
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      const isPopupClosed = error?.code === 'auth/popup-closed-by-user' || 
                            String(error?.message || '').includes('popup-closed-by-user');
      const isFailedFetch = String(error?.message || '').includes('Failed to fetch') ||
                            String(error || '').includes('Failed to fetch');

      setShowNetworkFallbackHelp(true);

      if (isPopupClosed) {
        triggerToast('Janela de autorização fechada antes de concluir o processo.', 'info');
      } else if (isFailedFetch) {
        triggerToast('Falha ao comunicar com a Google. Verifique a sua ligação ou experimente noutro navegador.', 'error');
      } else {
        triggerToast(error.message || 'Erro ao autorizar Google Sheets.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Excel Sheet Tabs (Spreadsheet Metadata)
  const fetchSpreadsheetTabs = async () => {
    if (!accessToken) {
      triggerToast('Por favor, conecte a sua conta Google primeiro.', 'info');
      return;
    }
    const spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      triggerToast('URL ou ID da planilha inválida.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      setSpreadsheetsData(data);
      if (data.sheets && data.sheets.length > 0) {
        const sheetTabs = data.sheets.map((s: any) => ({ title: s.properties.title }));
        setTabs(sheetTabs);
        setSelectedTab(sheetTabs[0].title);
        triggerToast(`${sheetTabs.length} abas encontradas com sucesso!`, 'success');
      } else {
        triggerToast('Nenhuma aba encontrada na planilha.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      const isFailedFetch = String(err?.message || '').includes('Failed to fetch') ||
                            String(err || '').includes('Failed to fetch');
      if (isFailedFetch) {
        setShowNetworkFallbackHelp(true);
        triggerToast('Sem ligação com a Google. Verifique a rede ou as permissões de pop-up do navegador.', 'error');
      } else {
        triggerToast('Falha ao ler dados da planilha: ' + err.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Values of selected sheet tab
  const fetchSheetData = async () => {
    if (!accessToken || !selectedTab) return;
    const spreadsheetId = getSpreadsheetId();
    
    setIsLoading(true);
    try {
      const encodedTab = encodeURIComponent(selectedTab);
      const response = await fetch(
        `https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${encodedTab}!A1:Z500`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Erro HTTP ${response.status}`);
      }

      const valData = await response.json();
      if (valData.values && valData.values.length > 0) {
        const sheetHeaders = valData.values[0];
        const sheetRows = valData.values.slice(1);
        setHeaders(sheetHeaders);
        setRows(sheetRows);
        autoMapFields(sheetHeaders);
        triggerToast(`${sheetRows.length} registos lidos com sucesso!`, 'success');
      } else {
        setHeaders([]);
        setRows([]);
        triggerToast('Esta pasta de trabalho de planilha está vazia.', 'info');
      }
    } catch (err: any) {
      console.error(err);
      const isFailedFetch = String(err?.message || '').includes('Failed to fetch') ||
                            String(err || '').includes('Failed to fetch');
      if (isFailedFetch) {
        setShowNetworkFallbackHelp(true);
        triggerToast('Falha de ligação ao descarregar as linhas. Verifique a ligação.', 'error');
      } else {
        triggerToast('Erro ao ler linhas da aba: ' + err.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab) {
      fetchSheetData();
    }
  }, [selectedTab]);

  // Pre-mapping automation logic based on header titles in Portuguese and English
  const autoMapFields = (currentHeaders: string[]) => {
    const automap: Record<string, number> = {};
    const norm = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    currentHeaders.forEach((hdr, idx) => {
      const text = norm(hdr);
      
      // Resident mapping fields matching
      if (text === 'id' || text === 'codigo' || text === 'identificador' || text === 'residentid' || text === 'utente id') {
        automap['id'] = idx;
      } else if (text === 'nome' || text === 'name' || text === 'utente' || text === 'residente' || text === 'full name') {
        automap['name'] = idx;
      } else if (text === 'quarto' || text === 'room' || text === 'quarto numero' || text === 'room number') {
        automap['room'] = idx;
      } else if (text === 'idade' || text === 'age') {
        automap['age'] = idx;
      } else if (text === 'autonomia' || text === 'autonomy') {
        automap['autonomy'] = idx;
      } else if (text === 'pontuacao de risco' || text === 'score de risco' || text === 'risk score' || text === 'risco' || text === 'riskscore') {
        automap['riskScore'] = idx;
      } else if (text === 'nivel de risco' || text === 'risk level' || text === 'risklevel') {
        automap['riskLevel'] = idx;
      } else if (text === 'sangue' || text === 'grupo sanguineo' || text === 'blood type' || text === 'bloodtype') {
        automap['bloodType'] = idx;
      } else if (text === 'peso' || text === 'weight') {
        automap['weight'] = idx;
      } else if (text === 'patologias' || text === 'conditions' || text === 'doencas' || text === 'historico medico') {
        automap['conditions'] = idx;
      } else if (text === 'alergias' || text === 'allergies') {
        automap['allergies'] = idx;
      } else if (text === 'avatar' || text === 'foto' || text === 'photo' || text === 'imagem') {
        automap['avatar'] = idx;
      }

      // Occurrence mapping fields matching
      if (text === 'tipo' || text === 'type' || text === 'categoria') {
        automap['occ_type'] = idx;
      } else if (text === 'data' || text === 'date') {
        automap['occ_date'] = idx;
      } else if (text === 'hora' || text === 'time') {
        automap['occ_time'] = idx;
      } else if (text === 'descricao' || text === 'description' || text === 'detalhe') {
        automap['occ_description'] = idx;
      } else if (text === 'acao tomada' || text === 'action taken' || text === 'actiontaken' || text === 'intervencao') {
        automap['occ_actionTaken'] = idx;
      } else if (text === 'nome do utente' || text === 'resident name' || text === 'residentname') {
        automap['occ_residentName'] = idx;
      }
    });

    setMapping(automap);
  };

  // Regeneration of mapped live visualization previews
  useEffect(() => {
    if (rows.length === 0) {
      setMappedPreview([]);
      return;
    }

    const previewData: any[] = [];
    const dateString = new Date().toISOString().split('T')[0];
    const timeString = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

    rows.forEach((row, rowIndex) => {
      // Skip empty rows helper
      if (row.length === 0 || !row.some(val => val && val.trim() !== '')) return;

      const getVal = (key: string) => {
        const colIdx = mapping[key];
        return colIdx !== undefined && colIdx < row.length ? row[colIdx]?.trim() : '';
      };

      if (importTarget === 'residents') {
        const rawId = getVal('id');
        const nextId = rawId || `UT-SP-${String(rowIndex + 1).padStart(3, '0')}`;
        const rawAge = parseInt(getVal('age'), 10);
        const rawRisk = parseInt(getVal('riskScore'), 10);
        const rawWeight = parseFloat(getVal('weight').replace(',', '.'));
        
        const rawAutonomy = getVal('autonomy').toLowerCase();
        let autonomy: AutonomyType = 'parcial';
        if (rawAutonomy.includes('independente') || rawAutonomy === 'totalmente autonomo') autonomy = 'independente';
        else if (rawAutonomy.includes('total') || rawAutonomy.includes('dependente')) autonomy = 'total';

        const rawRiskLevel = getVal('riskLevel').toLowerCase();
        let riskLevel: RiskLevelType = 'médio';
        if (rawRiskLevel.includes('alto') || rawRiskLevel === 'grave') riskLevel = 'alto';
        else if (rawRiskLevel.includes('baixo') || rawRiskLevel === 'leve') riskLevel = 'baixo';

        const rawConditions = getVal('conditions');
        const rawAllergies = getVal('allergies');

        const inputAge = isNaN(rawAge) ? 75 : rawAge;
        const birthYear = 2026 - inputAge;
        const computedBirthDate = `15/06/${birthYear}`;

        const inputName = getVal('name') || `Residente Mapeado #${rowIndex + 1}`;
        const firstWord = inputName.trim().split(' ')[0];
        const femalePrefixes = ["Ana", "Helena", "Rita", "Catarina", "Maria", "Sofia", "Fernanda", "Paula", "Inês", "Teresa", "Mariana", "Beatriz", "Clara", "Margarida", "Leonor", "Alice", "Carolina"];
        const computedGender = femalePrefixes.includes(firstWord) ? "F" : "M";

        const computedMobility = autonomy === 'independente' ? 'Independente' : autonomy === 'parcial' ? 'Com apoio' : 'Acamado';

        const computedAgePoints = inputAge >= 90 ? 25 : inputAge >= 80 ? 20 : inputAge >= 70 ? 15 : 10;
        const computedMobilityPoints = autonomy === 'independente' ? 0 : autonomy === 'parcial' ? 15 : 45;

        const resident: Resident = {
          id: nextId,
          name: inputName,
          room: getVal('room') || 'Quarto Pendente',
          age: inputAge,
          avatar: getVal('avatar') || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(inputName)}`,
          autonomy,
          riskScore: isNaN(rawRisk) ? 35 : rawRisk,
          riskLevel,
          bloodType: getVal('bloodType') || 'O+',
          weight: isNaN(rawWeight) ? 70 : rawWeight,
          conditions: rawConditions ? rawConditions.split(/[,;|]/).map(s => s.trim()).filter(Boolean) : ['Hipertensão Geral'],
          allergies: rawAllergies ? rawAllergies.split(/[,;|]/).map(s => s.trim()).filter(Boolean) : ['Nenhuma conhecida'],
          vitals: {
            heartRate: 72,
            bloodPressure: '120/80',
            spo2: 98,
            temperature: 36.6,
            temperatureUnit: '°C'
          },
          medications: [],
          activities: [
            {
              id: 'act-sheet-import-' + Date.now(),
              date: dateString,
              time: timeString,
              description: 'Registo e ficha médica importados via Google Sheets.',
              type: 'routine'
            }
          ],
          hasActiveAlert: false,

          birthDate: computedBirthDate,
          gender: computedGender,
          mobility: computedMobility,
          generalState: 'Estável',
          responsibleFamily: 'Familiar Principal',
          familyContact: '912345678',
          agePoints: computedAgePoints,
          mobilityPoints: computedMobilityPoints
        };
        previewData.push(resident);
      } else {
        // Occurrences category mapping checks
        const rawType = getVal('occ_type').toLowerCase();
        let type: Occurrence['type'] = 'other';
        if (rawType.includes('vitals') || rawType.includes('sinais') || rawType.includes('tension')) type = 'vitals';
        else if (rawType.includes('fall') || rawType.includes('queda')) type = 'fall';
        else if (rawType.includes('medication') || rawType.includes('remedio') || rawType.includes('medica')) type = 'medication';
        else if (rawType.includes('routine') || rawType.includes('rotina')) type = 'routine';
        else if (rawType.includes('behavioral') || rawType.includes('comportamento') || rawType.includes('agitacao')) type = 'behavioral';

        const occurrence: Occurrence = {
          id: getVal('id') || `occ-sheet-${Date.now()}-${rowIndex}`,
          residentId: getVal('id') || 'UT-001',
          residentName: getVal('occ_residentName') || 'Paciente não identificado',
          type,
          date: getVal('occ_date') || dateString,
          time: getVal('occ_time') || timeString,
          description: getVal('occ_description') || 'Evento clínico ou atividade registada via importação auxiliar.',
          actionTaken: getVal('occ_actionTaken') || 'Observado e acompanhado pela equipa de plantão.'
        };
        previewData.push(occurrence);
      }
    });

    setMappedPreview(previewData);
  }, [mapping, rows, importTarget]);

  const handleUpdateMapping = (fieldKey: string, columnIndexStr: string) => {
    const colIdx = columnIndexStr === 'none' ? -1 : parseInt(columnIndexStr, 10);
    setMapping(prev => {
      const next = { ...prev };
      if (colIdx === -1) {
        delete next[fieldKey];
      } else {
        next[fieldKey] = colIdx;
      }
      return next;
    });
  };

  // Perform Final Database writing to Firestore
  const handleExecuteImport = async () => {
    if (!selectedLar) {
      triggerToast('Nenhum Lar selecionado na sessão. Por favor volte e selecione uma instituição.', 'error');
      return;
    }
    if (mappedPreview.length === 0) {
      triggerToast('Nenhum dado configurado no preview para ser migrado.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Deseja mesmo migrar e salvar estes ${mappedPreview.length} registos clínicos diretamente no Firestore para o Lar "${selectedLar.name}"?`
    );
    if (!confirmed) return;

    setIsImporting(true);
    let successCount = 0;
    
    try {
      if (importTarget === 'residents') {
        for (const resident of mappedPreview) {
          const resRef = doc(db, 'lares', selectedLar.id, 'residents', resident.id);
          await setDoc(resRef, resident).catch(err => handleFirestoreError(err, OperationType.CREATE, `lares/${selectedLar.id}/residents/${resident.id}`));
          successCount++;
        }
        triggerToast(`Sucesso! ${successCount} utentes migrados com sucesso para o banco Firestore do ${selectedLar.name}.`, 'success');
      } else {
        for (const occurrence of mappedPreview) {
          const occRef = doc(db, 'lares', selectedLar.id, 'occurrences', occurrence.id);
          await setDoc(occRef, occurrence).catch(err => handleFirestoreError(err, OperationType.CREATE, `lares/${selectedLar.id}/occurrences/${occurrence.id}`));
          successCount++;
        }
        triggerToast(`Sucesso! ${successCount} ocorrências adicionadas diretamente no Firestore para o ${selectedLar.name}.`, 'success');
      }
      onBackToDashboard();
    } catch (err: any) {
      console.error(err);
      triggerToast(`Importação interrompida no registo ${successCount + 1}: ${err.message}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-left max-w-5xl mx-auto animate-fadeIn relative">
      {/* Return button */}
      <button 
        onClick={onBackToDashboard}
        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Painel
      </button>

      {/* Top Heading banner */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
          <Table className="w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sincronizador Google Sheets</h2>
          <p className="text-slate-500 text-sm font-medium">Carregue, mapeie e migre informações da sua planilha SeniorCare diretamente para o Firestore.</p>
        </div>
      </div>

      {/* Selector of Import / Sync Method */}
      <div className="flex border-b border-slate-100 mb-6 font-semibold text-sm">
        <button
          onClick={() => setSyncMethod('google_api')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            syncMethod === 'google_api'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Ligação Cloud (Google Sheets API)
        </button>
        <button
          onClick={() => setSyncMethod('copy_paste')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            syncMethod === 'copy_paste'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Área de Transferência (Copiar & Colar)
        </button>
      </div>

      {showNetworkFallbackHelp && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 font-semibold space-y-1 text-left">
              <p className="font-extrabold text-sm text-amber-950">Problemas com a Ligação? (Falha de rede ou pop-ups bloqueados)</p>
              <p className="font-medium text-amber-700/90 leading-relaxed">
                Navegadores ou iFrames restritos podem bloquear as janelas de login da Google e conexões à API externa (erro "Failed to fetch"). 
                Não se preocupe: utilize o modo <strong>Área de Transferência (Copiar & Colar)</strong> acima para copiar e sincronizar os dados da sua planilha de forma 100% segura e instantânea!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSyncMethod('copy_paste');
              triggerToast('Mudou para o modo de Área de Transferência como alternativa de segurança.', 'info');
              setShowNetworkFallbackHelp(false);
            }}
            className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-xs px-4  py-3.5 rounded-xl transition-all self-end md:self-center shrink-0 uppercase tracking-widest shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            Ativar Copiar & Colar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Authentication block */}
      {syncMethod === 'google_api' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-slate-100 pb-8">
          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              Endereço URL da Planilha no Google Workspace
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={spreadsheetUrl} 
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="flex-grow px-4 py-2.5 text-slate-700 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium"
              />
              {accessToken && (
                <button
                  onClick={fetchSpreadsheetTabs}
                  disabled={isLoading}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl font-bold text-sm duration-150 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Carregar Abas
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>A planilha deve estar acessível para o usuário autenticado que aceitar as permissões Google Sheets.</span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-150 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
            {accessToken ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Conta Conectada</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold truncate max-w-[200px]">
                  {googleUser?.email || 'Acesso Autorizado'}
                </p>
                <button 
                  onClick={() => {
                    setAccessToken(null);
                    setGoogleUser(null);
                    setTabs([]);
                    setRows([]);
                  }}
                  className="text-[10px] text-red-500 underline uppercase tracking-wider font-extrabold"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-bold">Requer autenticação com conta Google pertencente à equipa de cuidados:</p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all mx-auto"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  )}
                  <span>Autorizar Google Sheets</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 mb-8 space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Mapeamento Direto por Cópia & Cola (Sem Login)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Selecione e copie as linhas diretamente da sua planilha (Ctrl+C ou Cmd+C) ou de qualquer ficheiro Excel/CSV, cole-as abaixo e clique em carregar.
            </p>
          </div>
          
          <textarea
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            rows={6}
            placeholder={`Código/ID\tNome\tQuarto\tIdade\tAutonomia\nUT-001\tMaria Silva\tQuarto 101\t82\tParcial\nUT-002\tJoão Sousa\tQuarto 102\t79\tIndependente`}
            className="w-full p-4 font-mono text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 h-40 focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 flex-wrap gap-4">
            <div>
              <span className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">
                Tipo de Coleção Alvo
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImportTarget('residents');
                    setHeaders([]);
                    setRows([]);
                  }}
                  className={`py-1.5 px-3 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all ${
                    importTarget === 'residents'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Utentes (Residents)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportTarget('occurrences');
                    setHeaders([]);
                    setRows([]);
                  }}
                  className={`py-1.5 px-3 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all ${
                    importTarget === 'occurrences'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Ocorrências (Occurrences)
                </button>
              </div>
            </div>

            <button
              onClick={handleParsePastedData}
              className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Processar Texto Colado
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Tab selection and Target Entity */}
      {syncMethod === 'google_api' && tabs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-slideUp bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              Aba / Página (Tab) da Planilha
            </label>
            <select
              value={selectedTab}
              onChange={(e) => setSelectedTab(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">Selecione a aba...</option>
              {tabs.map((tab) => (
                <option key={tab.title} value={tab.title}>{tab.title}</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1.5 block">Selecione onde estão os dados que quer importar.</span>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">
              Tipo de Importação (Coleção do Firestore)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setImportTarget('residents')}
                className={`py-2 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  importTarget === 'residents'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Utentes (Residents)
              </button>
              
              <button
                onClick={() => setImportTarget('occurrences')}
                className={`py-2 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  importTarget === 'occurrences'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4" />
                Ocorrências (Occurrences)
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 block">Define a estrutura padrão usada para salvar no Firestore.</span>
          </div>
        </div>
      )}

      {/* Step 3: Column Mapping GUI */}
      {headers.length > 0 && (
        <div className="mb-8 p-5 bg-white border border-slate-150 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Mapeamento de Colunas da Planilha
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-full border">
              Auto-Mapping Ativo
            </span>
          </div>
          
          <p className="text-xs text-slate-500 mb-4 font-medium">Configure correspondências entre as colunas lidas no cabeçalho da sua planilha e os campos requeridos na nossa base de dados clínica.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {importTarget === 'residents' ? (
              // Resident Mapping Config options
              <>
                {[
                  { key: 'id', label: 'Código do Utente (ID)', required: true },
                  { key: 'name', label: 'Nome Completo', required: true },
                  { key: 'room', label: 'Quarto', required: true },
                  { key: 'age', label: 'Idade', required: true },
                  { key: 'autonomy', label: 'Autonomia Funcional', required: false },
                  { key: 'riskScore', label: 'Score de Risco (0-100)', required: false },
                  { key: 'riskLevel', label: 'Classificação de Risco', required: false },
                  { key: 'bloodType', label: 'Grupo Sanguíneo', required: false },
                  { key: 'weight', label: 'Peso Corporal (kg)', required: false },
                  { key: 'conditions', label: 'Alergias / Condições Médicas', required: false },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs font-bold text-slate-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={mapping[field.key] !== undefined ? mapping[field.key] : 'none'}
                      onChange={(e) => handleUpdateMapping(field.key, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none"
                    >
                      <option value="none">-- Ignorar / Omitir --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Coluna: {h || `(Coluna #${i+1})`}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            ) : (
              // Occurrence Mapping Config options
              <>
                {[
                  { key: 'id', label: 'ID Ocorrência', required: false },
                  { key: 'occ_residentName', label: 'Nome do Utente', required: true },
                  { key: 'occ_type', label: 'Tipo / Categoria', required: true },
                  { key: 'occ_date', label: 'Data', required: true },
                  { key: 'occ_time', label: 'Hora', required: true },
                  { key: 'occ_description', label: 'Descrição Detalhada', required: true },
                  { key: 'occ_actionTaken', label: 'Ação Tomada', required: false },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-xs font-bold text-slate-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={mapping[field.key] !== undefined ? mapping[field.key] : 'none'}
                      onChange={(e) => handleUpdateMapping(field.key, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none"
                    >
                      <option value="none">-- Ignorar / Omitir --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Coluna: {h || `(Coluna #${i+1})`}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Preview mapped values before Migration execution */}
      {mappedPreview.length > 0 && (
        <div className="mb-6">
          <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                Visualização Prévia de Dados ({mappedPreview.length} linhas formatadas)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Reveja o mapeamento automático gerado a partir de {selectedTab} da sua planilha antes de gravar em tempo real no Firestore.</p>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={isImporting || mappedPreview.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 uppercase tracking-wide cursor-pointer"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Migrando para Firestore...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 font-bold" />
                  <span>Gravar no Firestore</span>
                </>
              )}
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto bg-slate-50/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-extrabold border-b border-slate-200">
                  {importTarget === 'residents' ? (
                    <>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Nome do Utente</th>
                      <th className="px-4 py-3">Quarto</th>
                      <th className="px-4 py-3">Idade</th>
                      <th className="px-4 py-3">Autonomia</th>
                      <th className="px-4 py-3">Risco</th>
                      <th className="px-4 py-3">Condições Clínicas</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3">Data/Hora</th>
                      <th className="px-4 py-3">Utente Associado</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Descrição Registada</th>
                      <th className="px-4 py-3">Ação e Intervenção</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {mappedPreview.map((item, id) => (
                  <tr key={id} className="hover:bg-slate-50 transition-colors">
                    {importTarget === 'residents' ? (
                      <>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{item.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 font-semibold text-slate-500">Quarto {item.room}</td>
                        <td className="px-4 py-3 text-slate-700">{item.age} anos</td>
                        <td className="px-4 py-3 text-slate-500">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${
                            item.autonomy === 'independente' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                            item.autonomy === 'parcial' ? 'bg-orange-50 text-orange-850 border border-orange-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                          }`}>
                            {item.autonomy}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                            item.riskLevel === 'baixo' ? 'bg-emerald-50 text-emerald-800' :
                            item.riskLevel === 'médio' ? 'bg-yellow-50 text-yellow-850' : 'bg-red-50 text-red-800'
                          }`}>
                            Risco {item.riskLevel} ({item.riskScore}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-semibold truncate max-w-[200px]" title={item.conditions.join(', ')}>
                          {item.conditions.join(', ')}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-semibold text-slate-500 font-mono">{item.date} {item.time}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{item.residentName}</td>
                        <td className="px-4 py-3 uppercase text-[10px] tracking-wider font-extrabold text-blue-700">{item.type}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium truncate max-w-[220px]" title={item.description}>{item.description}</td>
                        <td className="px-4 py-3 text-emerald-700 font-medium max-w-[200px]" title={item.actionTaken}>{item.actionTaken}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auxiliary hint banner */}
      <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3">
        <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed font-semibold text-left">
          <p>Dica de Sincronização:</p>
          <p className="text-blue-600/90 font-medium mt-0.5">Após confirmar e clicar em <strong>"Gravar no Firestore"</strong>, os dados do Google Sheets são imediatamente gravados no banco Firestore e propagados instantaneamente. Graças à sincronização com ouvintes em tempo real do Firestore, todos os enfermeiros e familiares conectados visualizarão os novos utentes imediatamente nas suas telas!</p>
        </div>
      </div>
    </div>
  );
}
