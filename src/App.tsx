import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import { doc, setDoc, updateDoc, collection, getDoc, getDocs, onSnapshot, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  Plus, Search, Users, History, Bell, DoorOpen, Heart, Activity, 
  Wind, Pill, Utensils, ArrowLeft, AlertTriangle, FileText, 
  FileEdit, Download, CheckCircle2, ChevronDown, ChevronRight, 
  X, Scale, Droplet, Check, RefreshCw, Calendar, ClipboardList, LogOut, Table, LayoutGrid
} from 'lucide-react';

import { INITIAL_RESIDENTS, INITIAL_OCCURRENCES, INITIAL_MEDICATIONS, INITIAL_PEDIDOS } from './data';
import { Resident, Occurrence, AutonomyType, RiskLevelType, ActivityLog, Medication, MedicationRecord, VitalSigns, PedidoFamiliar } from './types';
import KPICards from './components/KPICards';
import ResidentCard from './components/ResidentCard';
import VitalsSparkline from './components/VitalsSparkline';
import OccurrenceRow from './components/OccurrenceRow';
import PriorityQueue from './components/PriorityQueue';
import LoginScreen from './components/LoginScreen';
import FamilyPortal from './components/FamilyPortal';
import NewResidentModal from './components/NewResidentModal';
import LarSelectionScreen, { Lar, AVAILABLE_LARES } from './components/LarSelectionScreen';
import SheetsImporter from './components/SheetsImporter';
import MedicationsTable from './components/MedicationsTable';
import PedidosTable from './components/PedidosTable';
// @ts-ignore
import seniorCareLogo from './assets/images/seniorcare_logo_1779656732247.png';

export default function App() {
  // --- Selected Care Home (Lar) State ---
  const [selectedLar, setSelectedLar] = useState<Lar | null>(null);

  // --- User Authentication State ---
  const [auth, setAuth] = useState<{
    role: 'none' | 'care_team' | 'family';
    residentId: string;
    userName: string;
  }>({
    role: 'none',
    residentId: '',
    userName: '',
  });

  // --- Persistent Reactive State Engine ---
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [occurrences, setOccurrences] = useState<Occurrence[]>(INITIAL_OCCURRENCES);
  const [medicationRecords, setMedicationRecords] = useState<MedicationRecord[]>(INITIAL_MEDICATIONS);
  const [pedidos, setPedidos] = useState<PedidoFamiliar[]>(INITIAL_PEDIDOS);
  
  // Navigation: 'painel' | 'utentes' | 'historico' | 'registar' | 'utente-detalhe' | 'sheets-import' | 'medicacoes' | 'pedidos'
  const [currentTab, setCurrentTab] = useState<'painel' | 'utentes' | 'historico' | 'registar' | 'utente-detalhe' | 'sheets-import' | 'medicacoes' | 'pedidos'>('painel');
  const [selectedResidentId, setSelectedResidentId] = useState<string>('UT-001'); // Default Carlos Silva
  
  // Clean UI Toast notification system 
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- Search / Filter States ---
  // Utentes tab
  const [searchQuery, setSearchQuery] = useState('');
  const [autonomyFilter, setAutonomyFilter] = useState<'todos' | AutonomyType>('todos');
  const [isNewResidentModalOpen, setIsNewResidentModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Histórico tab
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState<'hoje' | '7dias' | '30dias' | 'todos'>('todos');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'todos' | 'vitals' | 'fall' | 'medication' | 'routine'>('todos');

  // Add Dynamic Activity Note modal / state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'info' | 'critical' | 'routine'>('info');

  // --- Dynamic New Incident Form State ---
  const [formResidentId, setFormResidentId] = useState('');
  const [formType, setFormType] = useState<'vitals' | 'fall' | 'medication' | 'routine' | 'behavioral' | 'other'>('vitals');
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [formTime, setFormTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [formBP, setFormBP] = useState('');
  const [formHR, setFormHR] = useState('');
  const [formTemp, setFormTemp] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formActionTaken, setFormActionTaken] = useState('');

  // --- Selected Resident Profile sub-tabs ---
  // Clinical profile has internal navigation tabs: 'Info Clínica' | 'Atividades'
  const [profileSubTab, setProfileSubTab] = useState<'info' | 'atividades'>('info');

  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  const handleForceSyncFirebase = async () => {
    if (!selectedLar) {
      triggerToast('Nenhum lar selecionado para sincronização.', 'error');
      return;
    }
    
    setIsSyncingFirebase(true);
    triggerToast('Iniciando sincronização completa de 80 utentes no seu Firebase...', 'info');
    
    try {
      const batch = writeBatch(db);
      
      const larMappings: Record<string, string> = {
        "UT-001": "Monte do Sol",
        "UT-002": "Pinhal de Coimbra",
        "UT-003": "Bela Vista",
        "UT-004": "Jardim das Flores",
        "UT-005": "Pinhal de Coimbra",
        "UT-006": "Jardim das Flores",
        "UT-007": "Monte do Sol",
        "UT-008": "Jardim das Flores",
        "UT-009": "Pinhal de Coimbra",
        "UT-010": "Jardim das Flores",
        "UT-011": "Bela Vista",
        "UT-012": "Pinhal de Coimbra",
        "UT-013": "Jardim das Flores",
        "UT-014": "Jardim das Flores",
        "UT-015": "Pinhal de Coimbra",
        "UT-016": "Bela Vista",
        "UT-017": "Pinhal de Coimbra",
        "UT-018": "Pinhal de Coimbra",
        "UT-019": "Jardim das Flores",
        "UT-020": "Jardim das Flores",
        "UT-021": "Monte do Sol",
        "UT-022": "Monte do Sol",
        "UT-023": "Monte do Sol",
        "UT-024": "Bela Vista",
        "UT-025": "Bela Vista",
        "UT-026": "Pinhal de Coimbra",
        "UT-027": "Pinhal de Coimbra",
        "UT-028": "Monte do Sol",
        "UT-029": "Pinhal de Coimbra",
        "UT-030": "Monte do Sol",
        "UT-031": "Jardim das Flores",
        "UT-032": "Jardim das Flores",
        "UT-033": "Jardim das Flores",
        "UT-034": "Jardim das Flores",
        "UT-035": "Jardim das Flores",
        "UT-036": "Monte do Sol",
        "UT-037": "Bela Vista",
        "UT-038": "Monte do Sol",
        "UT-039": "Pinhal de Coimbra",
        "UT-040": "Pinhal de Coimbra",
        "UT-041": "Jardim das Flores",
        "UT-042": "Jardim das Flores",
        "UT-043": "Pinhal de Coimbra",
        "UT-044": "Bela Vista",
        "UT-045": "Bela Vista",
        "UT-046": "Monte do Sol",
        "UT-047": "Jardim das Flores",
        "UT-048": "Jardim das Flores",
        "UT-049": "Pinhal de Coimbra",
        "UT-050": "Bela Vista",
        "UT-051": "Pinhal de Coimbra",
        "UT-052": "Pinhal de Coimbra",
        "UT-053": "Pinhal de Coimbra",
        "UT-054": "Bela Vista",
        "UT-055": "Monte do Sol",
        "UT-056": "Bela Vista",
        "UT-057": "Bela Vista",
        "UT-058": "Bela Vista",
        "UT-059": "Jardim das Flores",
        "UT-060": "Monte do Sol",
        "UT-061": "Pinhal de Coimbra",
        "UT-062": "Monte do Sol",
        "UT-063": "Pinhal de Coimbra",
        "UT-064": "Bela Vista",
        "UT-065": "Jardim das Flores",
        "UT-066": "Bela Vista",
        "UT-067": "Bela Vista",
        "UT-068": "Pinhal de Coimbra",
        "UT-069": "Bela Vista",
        "UT-070": "Pinhal de Coimbra",
        "UT-071": "Bela Vista",
        "UT-072": "Bela Vista",
        "UT-073": "Bela Vista",
        "UT-074": "Jardim das Flores",
        "UT-075": "Jardim das Flores",
        "UT-076": "Pinhal de Coimbra",
        "UT-077": "Bela Vista",
        "UT-078": "Jardim das Flores",
        "UT-079": "Monte do Sol",
        "UT-080": "Monte do Sol"
      };

      // 1. Sync residents in top-level collection 'Utentes' and map them in 'Lares'
      for (const res of INITIAL_RESIDENTS) {
        const utenteDocRef = doc(db, 'Utentes', res.id);
        const data = {
          id: res.id,
          ID_Utente: res.id,
          Nome: res.name,
          Data_Nascimento: res.birthDate || '15/06/1946',
          Idade: res.age,
          Sexo: res.gender || 'M',
          Quarto: res.room,
          Mobilidade: res.mobility || 'Independente',
          Estado_Geral: res.generalState || 'Estável',
          Familiar_Responsável: res.responsibleFamily || 'Familiar Principal',
          Contacto_Familiar: res.familyContact || '912345678',
          Peso: res.weight || 70,
          Tipo_sanguineo: res.bloodType || 'O+',
          Alergias: res.allergies || [],
          Idade_Pontos: res.agePoints || 0,
          Mobilidade_Pontos: res.mobilityPoints || 0
        };
        batch.set(utenteDocRef, data);

        const mappingRef = doc(db, 'Lares', res.id);
        batch.set(mappingRef, {
          id: res.id,
          ID_Utente: res.id,
          Lar: larMappings[res.id] || 'Bela Vista'
        });
      }

      // 2. Sync medications in top-level collection 'Medicação'
      for (const med of INITIAL_MEDICATIONS) {
        const medRef = doc(db, 'Medicação', med.id);
        batch.set(medRef, med);
      }

      // 3. Sync occurrences in top-level collection 'Ocorrências'
      for (const occ of INITIAL_OCCURRENCES) {
        const docId = occ.id.toLowerCase().startsWith('oc-') ? occ.id.toLowerCase() : `oc-${occ.id.toLowerCase()}`;
        const occRef = doc(db, 'Ocorrências', docId);
        
        const dateString = occ.date.replace(/-/g, '/');
        const timeString = occ.time || '08:00';
        const datetimeStr = `${dateString} ${timeString}:00`;

        const dbOccur = {
          id: docId,
          ID_Ocorrencia: occ.id,
          ID_Utente: occ.residentId,
          Tipo_Ocorrência: occ.type === 'fall' ? 'Queda' : occ.type === 'vitals' ? 'Sinais Vitais' : occ.type === 'medication' ? 'Medicação' : 'Outro',
          Data_Hora: datetimeStr,
          Data_Hora_Registo: datetimeStr,
          Gravidade: occ.type === 'fall' ? 'Alta' : 'Baixa',
          Descrição: occ.description,
          Ações_Tomadas: occ.actionTaken || 'Supervisionado sem intercorrências imediatas.',
          Familiar_Responsável: 'Familiar Principal',
          Encaminhamento_Hospital: false,
          Internamento: false,
          Internamento_Pontos: 0
        };
        batch.set(occRef, dbOccur);
      }

      await batch.commit();
      triggerToast(`Sucesso! ${INITIAL_RESIDENTS.length} utentes, mappings, medicação e ocorrências sincronizados no seu Firebase (Tabelas de Topo) em lote único.`, 'success');
    } catch (err: any) {
      console.error('Erro ao carregar utentes no Firebase:', err);
      triggerToast(`Erro ao gravar dados: ${err.message || err}`, 'error');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  // --- 15 Top-Level Cloud Firestore Collections States ---
  const [dbUtentes, setDbUtentes] = useState<any[]>([]);
  const [dbLares, setDbLares] = useState<any[]>([]);
  const [dbPatologias, setDbPatologias] = useState<any[]>([]);
  const [dbMedicacao, setDbMedicacao] = useState<any[]>([]);
  const [dbSinaisVitais, setDbSinaisVitais] = useState<any[]>([]);
  const [dbOcorrencias, setDbOcorrencias] = useState<any[]>([]);
  const [dbQuestionarios, setDbQuestionarios] = useState<any[]>([]);
  const [dbConsultas, setDbConsultas] = useState<any[]>([]);
  const [dbExames, setDbExames] = useState<any[]>([]);
  const [dbFamiliares, setDbFamiliares] = useState<any[]>([]);
  const [dbAlertas, setDbAlertas] = useState<any[]>([]);
  const [dbTriagem, setDbTriagem] = useState<any[]>([]);
  const [dbFuncionarios, setDbFuncionarios] = useState<any[]>([]);
  const [dbErros, setDbErros] = useState<any[]>([]);
  const [dbAcessos, setDbAcessos] = useState<any[]>([]);
  const [dbPedidos, setDbPedidos] = useState<any[]>([]);

  // Dynamically calculate resident counts per Lar from dbLares snapshot
  const laresWithCounts = useMemo(() => {
    return AVAILABLE_LARES.map(lar => {
      const cleanName = lar.name.replace('SeniorCare ', '');
      const count = dbLares.filter(m => m.Lar === cleanName).length;
      return {
        ...lar,
        residentsCount: count || lar.residentsCount // fallback to hardcoded if loading
      };
    });
  }, [dbLares]);

  // Portrait assignment avatar strings copy
  const AVATARS = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWO_sPNv1Nc35beeFB6LVaBjcJbcpQmakSO9H_lYugEKLDn8Po3X26BV_AL_4s3wrBbmsZH-obbgP2WCoh5mr7uLJHqsRyahE3p8GVdHCvWJmYriQem4Tq28kAk8qki2rC202oeNabuGlVhC5ctP9GelusUp2z00kqzB6Iu6aHYMfEI4sqKu3wmj_tXN7l2zCx6GLSuUGfhU3Gnbqozzh0cT0BZNa511mcLKSKdtB5-K3GqJHADUOoc1QZNGXeQdNjmeeIVRnKTs0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAupF1U5BwusRNVA7pYrPg3F9LWvEclXdJ8f3cqJp7Pm9hYHvxky5Rhbj7zHrQVmln3f9PqPgR5DsqXV1eolYrxMM-Govw79aw19tdAlAGEcqbusbmLzW6GhiatqCUprk1gpE-s33PuSNkyhxGwvs7fLxk-KveNWqTUQFcTCxNC7iLihEJnCvSmdbuCZ9omcZ84R7iRY6xX1-I0ccXggL3_2l-PpvEsIuzpLYGNyzufp97ov689_70lgih59c0kBCCIA4O4h4h-FAU',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCk-Hbzjk_MS-wP4O81HU0ApV7pXHeYRuMkrPtTXtLoUY-vNcgGhAQnK_UOYB75w7GP2JIw8wJm8qCsf0nr6UB0hek1-85BXnOY9gd3Uy9mBz30AvDdlM0b5gcZjV6TFCMjnaZdOVlaAvG2TLioaIC4dEomOBgBLh6iutPBn9dSPjEZhUgvKtvDIH3b8Nz3mVSgL_XhBHjVxWuImSvJH7FNzETZYedZ-0ObExyfUHJgXe8Bp0JoV8SCttKxM0P0uvQG7RC4alhHVgc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBkiJimyjesDAtT0s4klRx6LZ0mmvW3_om82tgS_UvCiC7Lt2GTyCHtSqJpkBgqEoX8NaCdRfxLO50JrAPHcRhfd6_Y2nmXC915TJLzC7FI5LfhPF4Vec4dzCvaHSvWgRTFWlNTWkt5cgwWOq5m3Q0Tn1UELC6MSJfjkvQL6Rtacnwb2-v-F_Ww1RSu5TojIboMe3DK8xh0j4laq6IVtANbf5wy1miwz400nOtnBkkvYcKA8W_y3zOftrA1JKTmpWKfpaEtk06mJVI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBMGWOu8KtamMvSHjA8HeTFsnrlRcHRtDdNVkW1c_B7In8DoW5mzwbNC1kW6nCTAgttUa0RpdrzdcteG3bkIQJi43t1dyQUl3OLFSne5j32ckkq1-0NKTvLz2JTut6m8ODXNEmjfsQhha-HJnxo3-aiiwQRwPRC9-JmG3idvsS_es1oaRBJA5bIgywuvLDFwIXqPnMieHQkeEOgIJYS9_ohKJ9CnEx53lYjwg92F5bgSufrPTLJFXi4OJb58YRU4LsNtnqWRdWTxqY',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200'
  ];

  // --- Real-time Real Data Sync Engine with Firestore ---
  useEffect(() => {
    if (!selectedLar) {
      setResidents(INITIAL_RESIDENTS);
      setOccurrences(INITIAL_OCCURRENCES);
      setMedicationRecords(INITIAL_MEDICATIONS);
      return;
    }

    const collectionsSpecs = [
      { name: 'Utentes', setter: setDbUtentes },
      { name: 'Lares', setter: setDbLares },
      { name: 'Patologias', setter: setDbPatologias },
      { name: 'Medicação', setter: setDbMedicacao },
      { name: 'Sinais vitais', setter: setDbSinaisVitais },
      { name: 'Ocorrências', setter: setDbOcorrencias },
      { name: 'Questionários', setter: setDbQuestionarios },
      { name: 'Consultas', setter: setDbConsultas },
      { name: 'Exames', setter: setDbExames },
      { name: 'Familiares', setter: setDbFamiliares },
      { name: 'alertas', setter: setDbAlertas },
      { name: 'Triagem', setter: setDbTriagem },
      { name: 'Funcionários', setter: setDbFuncionarios },
      { name: 'Erros', setter: setDbErros },
      { name: 'acessos', setter: setDbAcessos },
      { name: 'PedidosFamiliares', setter: setDbPedidos }
    ];

    const unsubs = collectionsSpecs.map(colSpec => {
      return onSnapshot(collection(db, colSpec.name), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(doc => {
          list.push({ ...doc.data(), id: doc.id });
        });
        colSpec.setter(list);
      }, (err) => {
        console.warn(`onSnapshot collection ${colSpec.name} failed:`, err);
      });
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [selectedLar]);

  // --- Unified Clinical Fusion Engine ---
  useEffect(() => {
    if (!selectedLar) {
      setResidents(INITIAL_RESIDENTS);
      setOccurrences(INITIAL_OCCURRENCES);
      setMedicationRecords(INITIAL_MEDICATIONS);
      return;
    }

    const cleanLarName = selectedLar.name.replace('SeniorCare ', '');

    // Fallback mock mappings from seed-lares.ts in case dbLares is empty/loading
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
      { ID_Utente: "UT-076", Pinhal de Coimbra: "Pinhal de Coimbra" },
      { ID_Utente: "UT-076", Lar: "Pinhal de Coimbra" },
      { ID_Utente: "UT-077", Lar: "Bela Vista" },
      { ID_Utente: "UT-078", Lar: "Jardim das Flores" },
      { ID_Utente: "UT-079", Lar: "Monte do Sol" },
      { ID_Utente: "UT-080", Lar: "Monte do Sol" }
    ];

    const laresSource = dbLares.length > 0 ? dbLares : mockLaresMappings;

    // 1. Get resident mappings for current Lar
    const mappedUtenteIds = new Set(
      laresSource
        .filter(mapping => mapping && mapping.Lar === cleanLarName)
        .map(mapping => mapping.ID_Utente)
        .filter(Boolean)
    );

    const utenteSource = dbUtentes.length > 0 ? dbUtentes : INITIAL_RESIDENTS;
    const filteredUtentes = utenteSource.filter(utente => utente && mappedUtenteIds.has(utente.ID_Utente || utente.id));

    // 2. Map and fuse clinical history data
    const fusedList: Resident[] = filteredUtentes.map((utente) => {
      const uId = utente.ID_Utente || utente.id;

      // Extract patologies list
      const conditions = dbPatologias
        .filter(p => p && p.ID_Utente === uId && p.Patologia)
        .map(p => p.Patologia);

      // Extract prescriptions
      const medications = dbMedicacao
        .filter(m => m && m.ID_Utente === uId && m.Medicamento)
        .map(m => ({
          id: m.id || m.ID_Medicamento || `med-${Date.now()}`,
          name: m.Medicamento || '',
          dosage: m.Dosagem || '',
          schedule: m.Horário || '',
          status: 'pendente' as const,
          scheduleTimeLabel: (m.Horário || '').includes('Manhã') ? 'Manhã' : (m.Horário || '').includes('Almoço') ? 'Almoço' : 'Noite'
        }));

      // Extract latest vitals signs
      const vitRecord = dbSinaisVitais
        .filter(s => s && s.ID_Utente === uId)
        .sort((a, b) => {
          const tA = a.Data_Hora ? new Date(a.Data_Hora).getTime() : 0;
          const tB = b.Data_Hora ? new Date(b.Data_Hora).getTime() : 0;
          return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
        })[0];

      const vitals: VitalSigns = vitRecord ? {
        heartRate: vitRecord.Frequência_Cardíaca || 75,
        bloodPressure: vitRecord.Tensão_Arterial || '120/80',
        spo2: vitRecord.Saturação || 97,
        temperature: vitRecord.Temperatura || 36.5,
        temperatureUnit: '°C'
      } : {
        heartRate: 75,
        bloodPressure: '120/80',
        spo2: 97,
        temperature: 36.5,
        temperatureUnit: '°C'
      };

      // Triage priority and risk score calculations
      const triageRecord = dbTriagem.find(t => t && t.ID_Utente === uId);
      const riskScore = triageRecord ? (triageRecord.Score_Total || 0) : 0;
      const rawPriority = triageRecord ? (triageRecord.Prioridade_Final || 'baixa') : 'baixo';
      const riskLevel: RiskLevelType =
        (rawPriority || 'baixo').toString().toLowerCase() === 'urgente' || (rawPriority || 'baixo').toString().toLowerCase() === 'alta' ? 'alto' :
        (rawPriority || 'baixo').toString().toLowerCase() === 'média' ? 'médio' : 'baixo';

      // Active alert trigger check
      const hasActiveAlert = dbAlertas.some(a => a && a.ID_Utente === uId && a.Estado === 'Ativo');

      // Timeline Aggregate for this resident
      const occActivities = dbOcorrencias
        .filter(o => o && o.ID_Utente === uId)
        .map(o => {
          const dtParts = (o.Data_Hora || '').split(' ');
          const d = dtParts[0]?.replace(/\//g, '-') || '';
          const t = dtParts[1] || '';
          return {
            id: o.id || `occ-${o.ID_Ocorrencia}`,
            time: t,
            date: d,
            description: `${o.Tipo_Ocorrência || 'Ocorrência'}: ${o.Descrição || ''} ${o.Ações_Tomadas ? `Ação: ${o.Ações_Tomadas}` : ''}`,
            type: o.Gravidade === 'Alta' ? 'critical' as const : 'info' as const
          };
        });

      const conActivities = dbConsultas
        .filter(c => c && c.ID_Utente === uId)
        .map(c => ({
          id: c.id || `con-${c.ID_Consulta}`,
          time: '09:00',
          date: c.Data_Consulta || '',
          description: `Consulta de ${c.Especialidade || ''} com ${c.Médico || ''}. Diagnóstico: ${c.Diagnóstico || ''}. Próxima consulta: ${c.Próxima_Consulta || ''}`,
          type: 'routine' as const
        }));

      const exActivities = dbExames
        .filter(e => e && e.ID_Utente === uId)
        .map(e => ({
          id: e.id || `ex-${e.ID_Exame}`,
          time: '10:00',
          date: e.Data_Exame || '',
          description: `Exame realizado (${e.Tipo_Exame || ''}). Resultado: ${e.Resultado || ''}. Documento: ${e.PDF_Exame || ''}`,
          type: 'info' as const
        }));

      const errActivities = dbErros
        .filter(e => e && e.ID_Utente === uId)
        .map(e => ({
          id: e.id || `err-${e.ID_Erro}`,
          time: '08:00',
          date: e.Data_Erro || '',
          description: `Erro clínico registado (${e.Tipo_Erro || ''}). Gravidade: ${e.Gravidade || ''}. Período: ${e.Período || ''}`,
          type: 'critical' as const
        }));

      const accActivities = dbAcessos
        .filter(a => a && a.ID_Utente === uId)
        .map(a => {
          const dtParts = (a.Data_hora_login || '').split(' ');
          const d = dtParts[0]?.replace(/\//g, '-') || '';
          const t = dtParts[1] || '';
          return {
            id: a.id || `log-${a.ID_Log}`,
            time: t,
            date: d,
            description: `Acesso ao dossiê pelo Funcionário ${a.ID_Funcionário || ''}. Duração: ${a.Tempo_Acesso_Segundos || 0} segundos.`,
            type: 'routine' as const
          };
        });

      const combinedActivities = [
        ...occActivities,
        ...conActivities,
        ...exActivities,
        ...errActivities,
        ...accActivities
      ].sort((a, b) => {
        const dateAStr = a.date ? `${a.date.replace(/\//g, '-')}T${a.time || '00:00'}` : '';
        const dateBStr = b.date ? `${b.date.replace(/\//g, '-')}T${b.time || '00:00'}` : '';
        const timeA = dateAStr ? new Date(dateAStr).getTime() : 0;
        const timeB = dateBStr ? new Date(dateBStr).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

      const mockRes = INITIAL_RESIDENTS.find(r => r && r.id === uId);
      const idx = filteredUtentes.indexOf(utente);
      const avatar = mockRes ? mockRes.avatar : AVATARS[idx >= 0 ? idx % AVATARS.length : 0];

      return {
        id: uId,
        name: utente.Nome || 'Residente Sem Nome',
        room: utente.Quarto || '100',
        age: utente.Idade || 80,
        avatar,
        autonomy: utente.Mobilidade === 'Independente' ? 'independente' : utente.Mobilidade === 'Com apoio' ? 'parcial' : 'total',
        riskScore,
        riskLevel,
        bloodType: utente.Tipo_sanguineo || 'O+',
        weight: utente.Peso || 70,
        conditions: conditions.length > 0 ? conditions : ['Nenhuma patologia registada'],
        allergies: utente.Alergias || [],
        vitals,
        medications: medications.length > 0 ? medications : [],
        activities: combinedActivities.length > 0 ? combinedActivities : [{
          id: `act-init-${uId}`,
          time: '08:00',
          date: '2026-05-20',
          description: 'Admissão e registo clínico concluídos nas instalações.',
          type: 'info'
        }],
        hasActiveAlert,
        birthDate: utente.Data_Nascimento || '15/06/1946',
        gender: utente.Sexo || 'M',
        mobility: utente.Mobilidade || 'Independente',
        generalState: utente.Estado_Geral || 'Estável',
        responsibleFamily: utente.Familiar_Responsável || 'Familiar Principal',
        familyContact: utente.Contacto_Familiar || '912345678',
        agePoints: utente.Idade_Pontos || 0,
        mobilityPoints: utente.Mobilidade_Pontos || 0
      };
    });

    setResidents(fusedList);

    // Global timeline occurrences list
    const allOccs: Occurrence[] = dbOcorrencias
      .filter(o => o && o.ID_Utente && mappedUtenteIds.has(o.ID_Utente))
      .map(o => {
        const dtParts = (o.Data_Hora || '').split(' ');
        const d = dtParts[0]?.replace(/\//g, '-') || '';
        const t = dtParts[1] || '';
        const res = utenteSource.find(u => u && (u.ID_Utente || u.id) === o.ID_Utente);
        const mockRes = INITIAL_RESIDENTS.find(r => r && r.id === o.ID_Utente);
        return {
          id: o.id || `occ-${o.ID_Ocorrencia}`,
          residentId: o.ID_Utente,
          residentName: res ? (res.Nome || 'Utente') : 'Utente',
          residentAvatar: mockRes ? mockRes.avatar : AVATARS[0],
          type: o.Tipo_Ocorrência === 'Queda' ? 'fall' as const : o.Tipo_Ocorrência === 'Sinais Vitais' ? 'vitals' as const : o.Tipo_Ocorrência === 'Medicação' ? 'medication' as const : 'other' as const,
          date: d,
          time: t,
          description: o.Descrição || '',
          actionTaken: o.Ações_Tomadas || 'Supervisionado sem intercorrências imediatas.'
        };
      })
      .sort((a, b) => {
        const dateAStr = a.date ? `${a.date}T${a.time || '00:00'}` : '';
        const dateBStr = b.date ? `${b.date}T${b.time || '00:00'}` : '';
        const timeA = dateAStr ? new Date(dateAStr).getTime() : 0;
        const timeB = dateBStr ? new Date(dateBStr).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

    setOccurrences(allOccs.length > 0 ? allOccs : INITIAL_OCCURRENCES);

    const allMeds: MedicationRecord[] = dbMedicacao
      .filter(m => m && m.ID_Utente && mappedUtenteIds.has(m.ID_Utente))
      .sort((a, b) => (a.ID_Utente || '').localeCompare(b.ID_Utente || ''));

    setMedicationRecords(allMeds.length > 0 ? allMeds : INITIAL_MEDICATIONS);

    // Dynamic filtering for relative requests (Pedidos de Familiares)
    const filteredPedidos = dbPedidos
      .filter(p => p && p.ID_Utente && (mappedUtenteIds.has(p.ID_Utente) || p.Lar === cleanLarName))
      .map(p => {
        const res = utenteSource.find(u => u && (u.ID_Utente || u.id) === p.ID_Utente);
        return {
          id: p.id,
          ID_Pedido: p.ID_Pedido || `PED-${p.id}`,
          ID_Utente: p.ID_Utente,
          Nome_Utente: p.Nome_Utente || (res ? res.Nome : 'Utente'),
          Familiar_Responsável: p.Familiar_Responsável || 'Familiar',
          Assunto: p.Assunto || 'Sem Assunto',
          Mensagem: p.Mensagem || '',
          Data_Hora: p.Data_Hora || '2026/06/02 00:00:00',
          Estado: p.Estado || 'Pendente',
          Lar: p.Lar || cleanLarName
        } as PedidoFamiliar;
      });

    const finalPedidos = filteredPedidos.length > 0 
      ? filteredPedidos 
      : INITIAL_PEDIDOS.filter(p => p.Lar === cleanLarName);

    setPedidos(finalPedidos);
  }, [
    selectedLar,
    dbUtentes,
    dbLares,
    dbPatologias,
    dbMedicacao,
    dbSinaisVitais,
    dbOcorrencias,
    dbQuestionarios,
    dbConsultas,
    dbExames,
    dbFamiliares,
    dbAlertas,
    dbTriagem,
    dbFuncionarios,
    dbErros,
    dbAcessos,
    dbPedidos
  ]);

  // --- Dynamic Real-time Audit Access Log Writer ---
  const logAccess = async (residentId: string) => {
    if (auth.role !== 'care_team') return;
    
    // Find the logged-in staff member ID
    const nameOnly = auth.userName.includes(':') ? auth.userName.split(':')[1].trim() : auth.userName.trim();
    const matchedFunc = dbFuncionarios.find(f => f.Nome.toLowerCase().trim() === nameOnly.toLowerCase().trim());
    const staffId = matchedFunc ? matchedFunc.ID_Funcionário : 'FUNC-001';
    
    const logId = `log-${Date.now()}`;
    const dateString = new Date().toISOString().split('T')[0];
    const timeString = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const datetimeStr = `${dateString.replace(/-/g, '/')} ${timeString}`;
    
    const accessData = {
      id: logId,
      ID_Log: `LOG-ADD-${Date.now()}`,
      ID_Funcionário: staffId,
      ID_Utente: residentId,
      Data_hora_login: datetimeStr,
      Data_Hora_Acesso_Histórico: datetimeStr,
      Tempo_Acesso_Segundos: Math.floor(Math.random() * 200) + 60
    };
    
    try {
      const docRef = doc(db, 'acessos', logId);
      await setDoc(docRef, accessData);
      console.log(`Access log recorded in Firestore: ${logId}`);
    } catch (err) {
      console.warn('Failed to record access log:', err);
    }
  };

  // --- Helper state actions ---
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch tabs cleanly
  const handleTabChange = (tab: typeof currentTab) => {
    setCurrentTab(tab);
    // Auto-scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectResidentProfile = (id: string) => {
    setSelectedResidentId(id);
    setProfileSubTab('info'); // Reset subtab standard
    handleTabChange('utente-detalhe');
    logAccess(id); // Dynamic Audit Log write to Firestore!
  };

  // Dynamic calculations based on live state list
  const selectedResident = useMemo(() => {
    return residents.find(r => r.id === selectedResidentId) || residents[0];
  }, [residents, selectedResidentId]);

  const kpis = useMemo(() => {
    return {
      totalCount: residents.length,
      highRiskCount: residents.filter(r => r.riskLevel === 'alto').length,
      activeAlertsCount: residents.filter(r => r.hasActiveAlert).length,
    };
  }, [residents]);

  // Priority proportions for chart calculations
  const triagePercentages = useMemo(() => {
    const total = residents.length || 1;
    const high = residents.filter(r => r.riskLevel === 'alto').length;
    const medium = residents.filter(r => r.riskLevel === 'médio').length;
    const low = residents.filter(r => r.riskLevel === 'baixo').length;
    return {
      highCount: high,
      mediumCount: medium,
      lowCount: low,
      highPercent: Math.round((high / total) * 100),
      mediumPercent: Math.round((medium / total) * 100),
      lowPercent: Math.round((low / total) * 100),
    };
  }, [residents]);

  // --- Submissions handlers ---

  // Append Quick Clinician Note to patient activity timeline
  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const timeString = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const dateString = new Date().toISOString().split('T')[0];

    // Create log item
    const newLogItem: ActivityLog = {
      id: 'activity-' + Date.now(),
      time: timeString,
      date: dateString,
      description: noteText,
      type: noteType
    };

    // Feed to chronological occurrences lists under type routine or info
    const associatedType = noteType === 'critical' ? 'behavioral' : 'routine';
    const newOccur: Occurrence = {
      id: 'occ-added-' + Date.now(),
      residentId: selectedResidentId,
      residentName: selectedResident.name,
      residentAvatar: selectedResident.avatar,
      type: associatedType,
      date: dateString,
      time: timeString,
      description: noteText,
      actionTaken: 'Registado por equipa de enfermagem em nota livre.'
    };

    const updateLocalState = () => {
      setResidents(prev => prev.map(res => {
        if (res.id === selectedResidentId) {
          return {
            ...res,
            activities: [newLogItem, ...res.activities]
          };
        }
        return res;
      }));
      setOccurrences(prev => [newOccur, ...prev]);
    };

    if (selectedLar) {
      try {
        const occurrenceId = `OCO-ADD-${Date.now()}`;
        const docId = `oc-${occurrenceId.toLowerCase()}`;
        const datetimeStr = `${dateString.replace(/-/g, '/')} ${timeString}:00`;

        const occurrenceDoc = {
          id: docId,
          ID_Ocorrencia: occurrenceId,
          ID_Utente: selectedResidentId,
          Tipo_Ocorrência: noteType === 'critical' ? 'Outro' : 'Notas Livres',
          Data_Hora: datetimeStr,
          Data_Hora_Registo: datetimeStr,
          Gravidade: noteType === 'critical' ? 'Alta' : 'Baixa',
          Descrição: noteText,
          Familiar_Responsável: selectedResident.responsibleFamily || 'Familiar Principal',
          Encaminhamento_Hospital: false,
          Internamento: false,
          Internamento_Pontos: 0
        };

        const occRef = doc(db, 'Ocorrências', docId);
        await setDoc(occRef, occurrenceDoc);
      } catch (err) {
        console.warn('Falha ao sincronizar nota no Firestore. Gravando localmente:', err);
        updateLocalState();
      }
    } else {
      updateLocalState();
    }

    // Close and purge
    setIsNoteModalOpen(false);
    setNoteText('');
    setNoteType('info');
    triggerToast('Nota adicionada com sucesso ao dossiê clínico.');
  };

  // Toggle Red Alert Nurse Call for Patient
  const handleToggleAlert = async (id: string) => {
    const res = residents.find(r => r.id === id);
    if (!res) return;

    const nextState = !res.hasActiveAlert;
    if (nextState) {
      triggerToast(`Alerta emitido de emergência para ${res.name}! Enfermagem acionada.`, 'error');
    } else {
      triggerToast(`Sinal de urgência cancelado para ${res.name}.`, 'info');
    }

    const updateLocalState = () => {
      setResidents(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, hasActiveAlert: nextState };
        }
        return item;
      }));
    };

    if (selectedLar) {
      try {
        const dateString = new Date().toISOString().split('T')[0];
        const timeString = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        const datetimeStr = `${dateString} ${timeString}`;

        if (nextState) {
          // Create active alert in top-level 'alertas' collection
          const alertId = `ALE-ADD-${Date.now()}`;
          const docId = `al-${alertId.toLowerCase()}`;
          const alertDoc = {
            id: docId,
            ID_Alerta: alertId,
            ID_Utente: id,
            Tipo_Alerta: 'Chamada de Emergência',
            Prioridade: 'Urgente',
            Data_Hora: datetimeStr,
            Data_Intervenção: datetimeStr,
            Estado: 'Ativo'
          };
          await setDoc(doc(db, 'alertas', docId), alertDoc);
        } else {
          // Resolve all active alerts in top-level 'alertas' collection
          const activeAlertDocs = dbAlertas.filter(a => a.ID_Utente === id && a.Estado === 'Ativo');
          for (const alert of activeAlertDocs) {
            await updateDoc(doc(db, 'alertas', alert.id), { Estado: 'Resolvido', Data_Intervenção: datetimeStr });
          }
        }
      } catch (err) {
        console.warn('Falha ao registar alerta no Firestore. Atualizando localmente:', err);
        updateLocalState();
      }
    } else {
      updateLocalState();
    }
  };

  // Toggle individual medicine taken state
  const handleToggleMedicine = async (resId: string, medId: string) => {
    const res = residents.find(r => r.id === resId);
    if (!res) return;

    let nextStatus: 'tomado' | 'pendente' | 'proxima' = 'pendente';
    const updatedMeds = res.medications.map(med => {
      if (med.id === medId) {
        nextStatus = med.status === 'tomado' ? 'pendente' : 'tomado';
        triggerToast(
          `Medicação "${med.name}" de ${res.name} marcada como ${nextStatus === 'tomado' ? 'Administrada' : 'Pendente'}.`,
          'success'
        );
        return { ...med, status: nextStatus };
      }
      return med;
    });

    const updateLocalState = () => {
      setResidents(prev => prev.map(item => {
        if (item.id === resId) {
          return { ...item, medications: updatedMeds };
        }
        return item;
      }));
    };

    if (selectedLar) {
      try {
        const resRef = doc(db, 'lares', selectedLar.id, 'residents', resId);
        await updateDoc(resRef, { medications: updatedMeds });
      } catch (err) {
        console.warn('Falha ao registar medicação no Firestore. Atualizando localmente:', err);
        updateLocalState();
      }
    } else {
      updateLocalState();
    }
  };

  // Main Form Submission to register a dynamic Occurrence
  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formResidentId) {
      triggerToast('Por favor, selecione um utente.', 'error');
      return;
    }

    const targetPatient = residents.find(r => r.id === formResidentId);
    if (!targetPatient) return;

    // Create occurrence
    const parsedHR = parseInt(formHR) || 75;
    const parsedTemp = parseFloat(formTemp) || 36.6;
    const parsedBP = formBP || '120/80';

    const newOccurrence: Occurrence = {
      id: 'occ-created-' + Date.now(),
      residentId: formResidentId,
      residentName: targetPatient.name,
      residentAvatar: targetPatient.avatar,
      type: formType,
      date: formDate,
      time: formTime,
      description: formDescription,
      actionTaken: formActionTaken || 'Supervisionado sem intercorrências imediatas.',
      vitalsRecorded: {
        heartRate: parsedHR,
        bloodPressure: parsedBP,
        temperature: parsedTemp,
        spo2: 97,
        temperatureUnit: '°C'
      }
    };

    // Also inject activity logging inside the resident profile
    const newActivity: ActivityLog = {
      id: 'activity-created-' + Date.now(),
      time: formTime,
      date: formDate,
      description: formDescription + (formActionTaken ? ` Ação: ${formActionTaken}` : ''),
      type: formType === 'fall' ? 'critical' : formType === 'medication' ? 'routine' : 'info'
    };

    // Severe falls increase risk rating immediately to Alto
    const nextRiskScore = formType === 'fall' ? Math.min(targetPatient.riskScore + 15, 95) : targetPatient.riskScore;
    const nextRiskLevel: RiskLevelType = nextRiskScore >= 75 ? 'alto' : nextRiskScore >= 40 ? 'médio' : 'baixo';

    const updateLocalState = () => {
      // Update clinical occurrences data list
      setOccurrences(prev => [newOccurrence, ...prev]);

      // Update targeted resident clinical details
      setResidents(prev => prev.map(res => {
        if (res.id === formResidentId) {
          return {
            ...res,
            riskScore: nextRiskScore,
            riskLevel: nextRiskLevel,
            hasActiveAlert: formType === 'fall' ? true : res.hasActiveAlert,
            vitals: {
              ...res.vitals,
              heartRate: parsedHR,
              bloodPressure: parsedBP,
              temperature: parsedTemp
            },
            activities: [newActivity, ...res.activities]
          };
        }
        return res;
      }));
    };

    if (selectedLar) {
      try {
        const timeString = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateString = new Date().toISOString().split('T')[0];
        const datetimeStr = `${dateString.replace(/-/g, '/')} ${timeString}`;

        const occurrenceId = `OCO-ADD-${Date.now()}`;
        const occDocId = `oc-${occurrenceId.toLowerCase()}`;

        const occurrenceDoc = {
          id: occDocId,
          ID_Ocorrencia: occurrenceId,
          ID_Utente: formResidentId,
          Tipo_Ocorrência: formType === 'fall' ? 'Queda' : formType === 'vitals' ? 'Sinais Vitais' : formType === 'medication' ? 'Medicação' : 'Outro',
          Data_Hora: datetimeStr,
          Data_Hora_Registo: datetimeStr,
          Gravidade: formType === 'fall' ? 'Alta' : 'Baixa',
          Descrição: formDescription,
          Familiar_Responsável: targetPatient.responsibleFamily || 'Familiar Principal',
          Encaminhamento_Hospital: false,
          Internamento: false,
          Internamento_Pontos: 0
        };

        const occRef = doc(db, 'Ocorrências', occDocId);
        await setDoc(occRef, occurrenceDoc);

        // Also write to Sinais vitais if type is vitals!
        if (formType === 'vitals') {
          const vitalsDocId = `sv-${formResidentId}`;
          const vitalsDoc = {
            id: vitalsDocId,
            ID_Utente: formResidentId,
            Data_Hora: datetimeStr,
            Temperatura: parsedTemp,
            Temperatura_Pontos: parsedTemp > 37.5 ? 5 : 0,
            Tensão_Arterial: parsedBP,
            Tensão_Arterial_Pontos: parsedBP.startsWith('14') ? 10 : 0,
            Saturação: 97,
            Saturação_Pontos: 5,
            Glicemia: 120,
            Glicemia_Pontos: 10,
            Frequência_Cardíaca: parsedHR,
            Frequência_Cardíaca_Pontos: parsedHR > 100 ? 10 : 0,
            SinaisVitais_Pontos: (parsedTemp > 37.5 ? 5 : 0) + (parsedBP.startsWith('14') ? 10 : 0) + 5 + 10 + (parsedHR > 100 ? 10 : 0)
          };
          await setDoc(doc(db, 'Sinais vitais', vitalsDocId), vitalsDoc);
        }

        // Also write to alertas if type is fall!
        if (formType === 'fall') {
          const alertId = `ALE-ADD-${Date.now()}`;
          const alDocId = `al-${alertId.toLowerCase()}`;
          const alertDoc = {
            id: alDocId,
            ID_Alerta: alertId,
            ID_Utente: formResidentId,
            Tipo_Alerta: 'Queda',
            Prioridade: 'Alta',
            Data_Hora: datetimeStr,
            Data_Intervenção: datetimeStr,
            Estado: 'Ativo'
          };
          await setDoc(doc(db, 'alertas', alDocId), alertDoc);
        }
      } catch (err) {
        console.warn('Falha ao registar ocorrência no Firestore. Atualizando localmente:', err);
        updateLocalState();
      }
    } else {
      updateLocalState();
    }

    // Clean form values
    setFormDescription('');
    setFormActionTaken('');
    setFormBP('');
    setFormHR('');
    setFormTemp('');

    triggerToast('Registo de ocorrência e atualização clínica salvos!', 'success');
    
    // Redirect to occurrence logs history view
    handleTabChange('historico');
  };

  // Export clinical record triggers beautiful toast
  const handleExportHistory = () => {
    triggerToast('Preparando compilação PDF do relatório... Guardado na pasta de transferências.', 'success');
  };

  // Submit Family Message to clinical timeline and occurrences feeds
  const handleFamilyMessageSubmit = async (messageText: string, subject: string) => {
    if (auth.role !== 'family' || !auth.residentId) return;

    const timeString = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const dateString = new Date().toISOString().split('T')[0];

    const targetResident = residents.find(r => r.id === auth.residentId);
    if (!targetResident) return;

    // Create ActivityLog entry for resident
    const newActivity: ActivityLog = {
      id: 'family-msg-' + Date.now(),
      time: timeString,
      date: dateString,
      description: `Mensagem do Familiar (${auth.userName}) • ${subject}: "${messageText}"`,
      type: 'info'
    };

    // Create Occurrence entry for nurse panel overview
    const newOccur: Occurrence = {
      id: 'occ-family-msg-' + Date.now(),
      residentId: auth.residentId,
      residentName: targetResident.name,
      residentAvatar: targetResident.avatar,
      type: 'routine',
      date: dateString,
      time: timeString,
      description: `Mensagem de ${auth.userName} sobre assunto [${subject}]: "${messageText}"`,
      actionTaken: 'Registo automático do Portal do Familiar. Equipa do turno alertada.'
    };

    const updateLocalState = () => {
      setResidents(prev => prev.map(res => {
        if (res.id === auth.residentId) {
          return {
            ...res,
            activities: [newActivity, ...res.activities]
          };
        }
        return res;
      }));

      setOccurrences(prev => [newOccur, ...prev]);

      const pad = (n: number) => n.toString().padStart(2, '0');
      const now = new Date();
      const fullDatetimeStr = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newPed: PedidoFamiliar = {
        id: `ped-${Date.now()}`,
        ID_Pedido: `PED-ADD-${Date.now()}`,
        ID_Utente: auth.residentId,
        Nome_Utente: targetResident.name,
        Familiar_Responsável: auth.userName,
        Assunto: subject,
        Mensagem: messageText,
        Data_Hora: fullDatetimeStr,
        Estado: 'Pendente',
        Lar: selectedLar ? selectedLar.name.replace('SeniorCare ', '') : ''
      };
      setPedidos(prev => [newPed, ...prev]);
    };

    if (selectedLar) {
      try {
        const occurrenceId = `OCO-ADD-${Date.now()}`;
        const occDocId = `oc-${occurrenceId.toLowerCase()}`;
        const datetimeStr = `${dateString.replace(/-/g, '/')} ${timeString}:00`;

        const occurrenceDoc = {
          id: occDocId,
          ID_Ocorrencia: occurrenceId,
          ID_Utente: auth.residentId,
          Tipo_Ocorrência: 'Outro',
          Data_Hora: datetimeStr,
          Data_Hora_Registo: datetimeStr,
          Gravidade: 'Baixa',
          Descrição: `Mensagem de ${auth.userName} sobre assunto [${subject}]: "${messageText}"`,
          Familiar_Responsável: auth.userName,
          Encaminhamento_Hospital: false,
          Internamento: false,
          Internamento_Pontos: 0
        };

        const occRef = doc(db, 'Ocorrências', occDocId);
        await setDoc(occRef, occurrenceDoc);

        // Also write to PedidosFamiliares collection
        const pedidoId = `ped-${Date.now()}`;
        const cleanLarName = selectedLar.name.replace('SeniorCare ', '');
        const pad = (n: number) => n.toString().padStart(2, '0');
        const now = new Date();
        const fullDatetimeStr = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const pedidoDoc = {
          id: pedidoId,
          ID_Pedido: `PED-ADD-${Date.now()}`,
          ID_Utente: auth.residentId,
          Nome_Utente: targetResident.name,
          Familiar_Responsável: auth.userName,
          Assunto: subject,
          Mensagem: messageText,
          Data_Hora: fullDatetimeStr,
          Estado: 'Pendente',
          Lar: cleanLarName
        };

        const pedidoRef = doc(db, 'PedidosFamiliares', pedidoId);
        await setDoc(pedidoRef, pedidoDoc);
      } catch (err) {
        console.warn('Falha ao enviar mensagem familiar no Firestore. Gravando em modo offline:', err);
        updateLocalState();
      }
    } else {
      updateLocalState();
    }
  };

  const handleTogglePedidoEstado = async (pedido: PedidoFamiliar) => {
    const novoEstado = pedido.Estado === 'Pendente' ? 'Resolvido' : 'Pendente';
    
    const updateLocal = () => {
      setPedidos(prev => prev.map(p => {
        if (p.id === pedido.id) {
          return { ...p, Estado: novoEstado };
        }
        return p;
      }));
    };

    if (selectedLar) {
      try {
        const docRef = doc(db, 'PedidosFamiliares', pedido.id);
        await updateDoc(docRef, { Estado: novoEstado });
        triggerToast(`Estado do pedido atualizado para ${novoEstado}!`, 'success');
      } catch (err: any) {
        console.warn('Erro ao atualizar estado no Firestore. Usando modo offline:', err);
        updateLocal();
      }
    } else {
      updateLocal();
    }
  };

  // Action to save a newly registered resident
  const handleRegisterSave = async (newResData: Omit<Resident, 'id' | 'activities' | 'hasActiveAlert'>) => {
    const timeString = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const dateString = new Date().toISOString().split('T')[0];

    // Gerar ID sequencial e previsível baseado nos existentes (UT-081, UT-082, etc)
    const maxNum = residents.reduce((acc, r) => {
      const match = r.id.match(/UT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > acc ? num : acc;
      }
      return acc;
    }, 80);
    const nextNum = maxNum + 1;
    const newId = `UT-${nextNum.toString().padStart(3, '0')}`;

    const initialActivity: ActivityLog = {
      id: 'activity-register-' + Date.now(),
      time: timeString,
      date: dateString,
      description: 'Admissão e registo clínico concluídos nas instalações.',
      type: 'info'
    };

    // Calculate customized values for newly admitted residents
    const birthYear = 2026 - newResData.age;
    const computedBirthDate = `15/06/${birthYear}`;
    
    const firstWord = newResData.name.split(' ')[0];
    const femalePrefixes = ["Ana", "Helena", "Rita", "Catarina", "Maria", "Sofia", "Fernanda", "Paula", "Inês", "Teresa", "Mariana", "Beatriz", "Clara", "Margarida", "Leonor", "Alice", "Carolina"];
    const computedGender = femalePrefixes.includes(firstWord) ? "F" : "M";
    
    const computedAgePoints = newResData.age >= 90 ? 25 : newResData.age >= 80 ? 20 : newResData.age >= 70 ? 15 : 10;
    const computedMobilityPoints = newResData.autonomy === 'independente' ? 0 : newResData.autonomy === 'parcial' ? 15 : 45;

    const newResident: Resident = {
      ...newResData,
      id: newId,
      activities: [initialActivity],
      hasActiveAlert: false,
      
      birthDate: computedBirthDate,
      gender: computedGender,
      mobility: newResData.autonomy === 'independente' ? 'Independente' : newResData.autonomy === 'parcial' ? 'Com apoio' : 'Acamado',
      generalState: 'Estável',
      responsibleFamily: 'Familiar Principal',
      familyContact: '912345678',
      agePoints: computedAgePoints,
      mobilityPoints: computedMobilityPoints
    };

    // Create admission occurrence
    const admissionOccur: Occurrence = {
      id: 'occ-admission-' + Date.now(),
      residentId: newId,
      residentName: newResData.name,
      residentAvatar: newResData.avatar,
      type: 'routine',
      date: dateString,
      time: timeString,
      description: `Admissão do novo utente ${newResData.name} no Quarto ${newResData.room}. Ficha clínica inicial registada.`,
      actionTaken: `Procedimento de admissão formal concluído. Sinais vitais de entrada registados: ${newResData.vitals.bloodPressure} PA, ${newResData.vitals.heartRate} Freq. Cardíaca, ${newResData.vitals.temperature}°C.`
    };

    const updateLocalState = () => {
      setResidents(prev => [...prev, newResident]);
      setOccurrences(prev => [admissionOccur, ...prev]);
    };

    if (selectedLar) {
      try {
        const utenteDoc = {
          id: newId,
          ID_Utente: newId,
          Nome: newResident.name,
          Data_Nascimento: newResident.birthDate,
          Idade: newResident.age,
          Sexo: newResident.gender,
          Quarto: newResident.room,
          Mobilidade: newResident.mobility,
          Estado_Geral: newResident.generalState,
          Familiar_Responsável: newResident.responsibleFamily,
          Contacto_Familiar: newResident.familyContact,
          Peso: newResident.weight,
          Tipo_sanguineo: newResident.bloodType,
          Alergias: newResident.allergies,
          Idade_Pontos: newResident.agePoints,
          Mobilidade_Pontos: newResident.mobilityPoints
        };

        const resRef = doc(db, 'Utentes', newId);
        await setDoc(resRef, utenteDoc);

        // Map resident to current Lar
        const cleanLarName = selectedLar.name.replace('SeniorCare ', '');
        const mappingRef = doc(db, 'Lares', newId);
        await setDoc(mappingRef, {
          id: newId,
          ID_Utente: newId,
          Lar: cleanLarName
        });

        // Initial admission occurrence doc
        const occurrenceId = `OCO-ADD-${Date.now()}`;
        const occDocId = `oc-${occurrenceId.toLowerCase()}`;
        const datetimeStr = `${dateString.replace(/-/g, '/')} ${timeString}:00`;

        const occurrenceDoc = {
          id: occDocId,
          ID_Ocorrencia: occurrenceId,
          ID_Utente: newId,
          Tipo_Ocorrência: 'Outro',
          Data_Hora: datetimeStr,
          Data_Hora_Registo: datetimeStr,
          Gravidade: 'Baixa',
          Descrição: `Admissão do novo utente ${newResData.name} no Quarto ${newResData.room}. Ficha clínica inicial registada.`,
          Familiar_Responsável: newResident.responsibleFamily,
          Encaminhamento_Hospital: false,
          Internamento: false,
          Internamento_Pontos: 0
        };
        await setDoc(doc(db, 'Ocorrências', occDocId), occurrenceDoc);

      } catch (err) {
        console.warn('Falha ao registar novo utente no Firestore. Gravando localmente:', err);
        updateLocalState();
      }
    } else {
      updateLocalState();
    }

    setIsNewResidentModalOpen(false);
    triggerToast(`Utente ${newResData.name} registado com sucesso!`, 'success');
  };

  // --- Filtering computations ---
  const filteredResidents = useMemo(() => {
    return residents.filter(res => {
      const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.room.includes(searchQuery);
      
      const matchesAutonomy = autonomyFilter === 'todos' || res.autonomy === autonomyFilter;
      
      return matchesSearch && matchesAutonomy;
    });
  }, [residents, searchQuery, autonomyFilter]);

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(occ => {
      const matchesSearch = occ.residentName.toLowerCase().includes(historySearchQuery.toLowerCase()) || 
                            occ.description.toLowerCase().includes(historySearchQuery.toLowerCase());
      
      const matchesType = historyTypeFilter === 'todos' || occ.type === historyTypeFilter;
      
      // Simulating simple date filter comparison for prototype
      let matchesDate = true;
      if (historyDateFilter === 'hoje') {
        const todayStr = '2026-05-23'; // current simulation date
        matchesDate = occ.date === todayStr;
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [occurrences, historySearchQuery, historyTypeFilter, historyDateFilter]);


  // --- Core Authentication Redirects ---
  if (auth.role === 'none') {
    return (
      <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
        {toast && (
          <div 
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2 max-w-sm animate-fadeIn ${
              toast.type === 'error' 
                ? 'bg-red-50 text-red-800 border-red-200' 
                : toast.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
            id="system-toast-alert"
          >
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        )}
        
        {!selectedLar ? (
          <LarSelectionScreen 
            availableLares={laresWithCounts}
            onSelectLar={(lar) => {
              setSelectedLar(lar);
              triggerToast(`Instituição selecionada: ${lar.name}`, 'info');
            }} 
          />
        ) : (
          <LoginScreen 
            residents={residents} 
            selectedLarName={selectedLar.name}
            rawFuncionarios={dbFuncionarios}
            rawFamiliares={dbFamiliares}
            dbUtentes={dbUtentes}
            dbLares={dbLares}
            onBackToLarSelection={() => setSelectedLar(null)}
            onLogin={(role, resId, uName, autoSwitchLar) => {
              if (autoSwitchLar) {
                const targetLar = AVAILABLE_LARES.find(l => l.name.replace('SeniorCare ', '') === autoSwitchLar);
                if (targetLar) {
                  setSelectedLar(targetLar);
                }
              }
              setAuth({ role, residentId: resId, userName: uName });
            }}
            triggerToast={triggerToast} 
          />
        )}
      </div>
    );
  }

  if (auth.role === 'family') {
    const familyMemberResident = residents.find(r => r.id === auth.residentId) || residents[0];
    return (
      <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
        {toast && (
          <div 
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2 max-w-sm animate-fadeIn ${
              toast.type === 'error' 
                ? 'bg-red-50 text-red-800 border-red-200' 
                : toast.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
            id="system-toast-alert"
          >
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        )}
        <FamilyPortal 
          resident={familyMemberResident} 
          relativeName={auth.userName} 
          selectedLarName={selectedLar?.name}
          onLogout={() => setAuth({ role: 'none', residentId: '', userName: '' })} 
          onSendMessageSubmit={handleFamilyMessageSubmit}
          triggerToast={triggerToast}
        />
      </div>
    );
  }

  // --- Clinician Role (auth.role === 'care_team') Layout Rendering ---
  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col pt-14 pb-20 md:pb-0 md:pl-64">
      
      {/* Toast Notification Widget */}
      {toast && (
        <div 
          className={`fixed top-18 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2 max-w-sm animate-fadeIn ${
            toast.type === 'error' 
              ? 'bg-red-50 text-red-800 border-red-200' 
              : toast.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
          id="system-toast-alert"
        >
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      {/* --- Top Global Navigation bar --- */}
      <header className="fixed top-0 left-0 right-0 w-full px-4 md:px-8 h-14 z-40 bg-white border-b border-slate-200 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          {/* Circular picture of logged-in Clinician */}
          <img 
            alt="Profissional de Saúde" 
            className="w-8 h-8 rounded-full object-cover border border-slate-300 ring-2 ring-blue-50"
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCuGbBaKZyvSpc_nLUx2xt0AiBVZljwijf_zgPT5tsO3zvcpLJtYZQFV7znjtDcJ_UK2SB-oZcSbLSnkB2eLSYGrkr1VhqIuXLKnp95ui0C_SPmaF94iG_igP4JqmCRIvsYg23Hzm2DwL6J-PWHuOJ_mn_ID3APG5w5PoROiYtMJDwi8KYFjBAZv3r-qJMCphIYonCyQcs8e051QJgfFrKQbTMAIFoi8OHy-DcW26nYdUtmCWg3RX34sdpVqkDQxOhZfK3AfFHZPk"
          />
          <span 
            className="font-bold text-lg text-blue-900 tracking-tight cursor-pointer hover:opacity-85 flex items-center gap-1.5"
            onClick={() => handleTabChange('painel')}
          >
            <img 
              src={seniorCareLogo} 
              alt="Logo" 
              className="w-11 h-11 object-contain shrink-0" 
              referrerPolicy="no-referrer"
            />
            SeniorCare
          </span>
          {selectedLar && (
            <span className="hidden sm:inline bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
              {selectedLar.name}
            </span>
          )}
        </div>

        {/* Global Action Add trigger and Logout buttons */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => handleTabChange('sheets-import')}
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-xs transition-colors active:scale-95 shrink-0 border ${
              currentTab === 'sheets-import'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                : 'bg-emerald-50 border-emerald-100 text-emerald-750 hover:bg-emerald-100 font-bold'
            }`}
            title="Sincronizar dados do Google Sheets"
          >
            <Table className="w-5 h-5 font-bold" />
          </button>

          <button 
            onClick={() => handleTabChange('registar')}
            className="bg-blue-600 text-white hover:bg-blue-700 w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all active:scale-95 shrink-0"
            title="Registar Ocorrência / Sinais Vitais"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>

          <button 
            onClick={() => {
              setAuth({ role: 'none', residentId: '', userName: '' });
              triggerToast('Sessão terminada.', 'info');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-10 h-10 flex items-center justify-center rounded-full shadow-xs transition-all active:scale-95 shrink-0"
            title="Sair (Terminar Sessão)"
          >
            <LogOut className="w-5 h-5 text-red-500 font-bold shrink-0" />
          </button>
        </div>
      </header>

      {/* --- Desktop Left Sidebar (Hidden on Mobile) --- */}
      <aside className="hidden md:flex flex-col fixed left-0 top-14 h-[calc(100vh-56px)] w-64 bg-white border-r border-slate-200 p-4 gap-2 z-35">
        <div className="mb-4 px-2">
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">NAVEGAÇÃO</p>
        </div>
        
        <button 
          onClick={() => handleTabChange('painel')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-left transition-all ${
            currentTab === 'painel' 
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span>Painel de Triagem</span>
        </button>

        <button 
          onClick={() => handleTabChange('utentes')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-left transition-all ${
            currentTab === 'utentes' || currentTab === 'utente-detalhe'
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Utentes (Perfis)</span>
        </button>

        <button 
          onClick={() => handleTabChange('historico')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-left transition-all ${
            currentTab === 'historico' 
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span>Histórico Médico</span>
        </button>

        <button 
          onClick={() => handleTabChange('pedidos')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-left transition-all ${
            currentTab === 'pedidos' 
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Pedidos de Familiares</span>
          {pedidos.filter(p => p.Estado === 'Pendente').length > 0 && (
            <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {pedidos.filter(p => p.Estado === 'Pendente').length}
            </span>
          )}
        </button>

        {/* Dummy quick help section */}
        <div className="mt-auto px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <span>Turno Clínico</span>
          </div>
          <p className="leading-relaxed">Enf. Sarah Jenkins</p>
          <p className="mt-1 text-[10px] text-slate-400">Hospital Central de Cuidados</p>
        </div>
      </aside>

      {/* --- Main Contents Panels Canvas --- */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6 md:px-8">
        
        {/* TAB 1: PAINEL DE TRIAGEM */}
        {currentTab === 'painel' && (
          <div className="flex flex-col gap-6 animate-fadeIn" id="panel-dashboard">
            {/* Header context */}
            <div className="flex flex-col gap-1 text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Painel de Triagem</h2>
              <p className="text-slate-500 text-sm font-medium">Monitoramento clínico em tempo real e triagem de prioridade.</p>
            </div>

            {/* KPI top widget cards */}
            <KPICards 
              totalResidentsCount={kpis.totalCount} 
              highRiskCount={kpis.highRiskCount} 
              activeAlertsCount={kpis.activeAlertsCount} 
            />

            {/* Main content split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left col: Priority Queue list (Takes 2 cols) */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Fila de Prioridade Clínica</h3>
                  <button 
                    onClick={() => {
                      setAutonomyFilter('todos');
                      handleTabChange('utentes');
                    }}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    Ver Todos Utentes <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <PriorityQueue 
                  residents={residents} 
                  onSelectResident={handleSelectResidentProfile} 
                />
              </div>

              {/* Right col: Visão geral overview bar chart */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight text-left">Visão Geral da Triagem</h3>
                
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-4">
                    {/* High Risk row */}
                    <div className="flex flex-col gap-1.5" id="chart-high">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-semibold flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" /> Alto Risco
                        </span>
                        <span className="text-red-700 font-extrabold">{triagePercentages.highCount} Utentes ({triagePercentages.highPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                        <div className="bg-red-600 h-full rounded-full transition-all duration-500" style={{ width: `${triagePercentages.highPercent}%` }} />
                      </div>
                    </div>

                    {/* Medium Risk row */}
                    <div className="flex flex-col gap-1.5 mt-2" id="chart-medium">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-semibold flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" /> Médio Risco
                        </span>
                        <span className="text-amber-700 font-extrabold">{triagePercentages.mediumCount} Utentes ({triagePercentages.mediumPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${triagePercentages.mediumPercent}%` }} />
                      </div>
                    </div>

                    {/* Low Risk row */}
                    <div className="flex flex-col gap-1.5 mt-2" id="chart-low">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-semibold flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" /> Baixo Risco
                        </span>
                        <span className="text-blue-700 font-extrabold">{triagePercentages.lowCount} Utentes ({triagePercentages.lowPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${triagePercentages.lowPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-300 shrink-0 animate-spin-slow" /> Dados atualizados há 2 mins
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: UTENTES LIST */}
        {currentTab === 'utentes' && (
          <div className="flex flex-col gap-6 animate-fadeIn" id="residents-panel">
            {/* Title block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Utentes</h2>
                <p className="text-slate-500 text-sm font-medium">Gerir e visualizar perfis clínicos dos utentes.</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  disabled={isSyncingFirebase}
                  onClick={handleForceSyncFirebase}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
                    isSyncingFirebase 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                  title="Forçar o carregamento de todos os 80 utentes pré-definidos no Cloud Firestore"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingFirebase ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
                  <span>{isSyncingFirebase ? 'Sincronizando...' : 'Recarregar 80 Utentes (Firebase)'}</span>
                </button>

                <button 
                  onClick={() => setIsNewResidentModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Registar Novo Utente</span>
                </button>
              </div>
            </div>

            {/* Live Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              {/* Search input bar */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome ou quarto..."
                  className="w-full pl-9 pr-4 py-2 text-slate-700 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Autonomy Badge Filter Chips */}
              <div className="flex flex-wrap gap-1.5 items-center text-left">
                <span className="text-xs font-bold text-slate-500 mr-1.5">Autonomia:</span>
                
                <button 
                  onClick={() => setAutonomyFilter('todos')}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    autonomyFilter === 'todos'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Todos
                </button>

                <button 
                  onClick={() => setAutonomyFilter('independente')}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    autonomyFilter === 'independente'
                      ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-xs font-extrabold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Independente
                </button>

                <button 
                  onClick={() => setAutonomyFilter('parcial')}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    autonomyFilter === 'parcial'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs font-extrabold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Parcial
                </button>

                <button 
                  onClick={() => setAutonomyFilter('total')}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    autonomyFilter === 'total'
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-xs font-extrabold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Total
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 max-w-fit self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-blue-50 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Table className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tabela Completa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-emerald-50 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cartões</span>
                </button>
              </div>
            </div>

            {/* Grid or Tabela Completa of actual Residents filtered live */}
            {filteredResidents.length > 0 ? (
              viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn" id="residents-cards-grid">
                  {filteredResidents.map(resident => (
                    <ResidentCard 
                      key={resident.id}
                      resident={resident}
                      onClick={() => handleSelectResidentProfile(resident.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden leading-relaxed animate-fadeIn" id="residents-table-view">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                          <th className="py-4 px-4 font-extrabold text-slate-600">ID Utente</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600">Nome</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600">Data Nasc.</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600 text-center">Idade</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600 text-center">Sexo</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600 text-center">Quarto</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600">Mobilidade</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600">Estado Geral</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600">Familiar Responsável</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600">Contacto Familiar</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600 text-center">Peso</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600 text-center">Tipo Sanguíneo</th>
                          <th className="py-4 px-4 font-extrabold text-slate-600">Alergias</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredResidents.map((resident, idx) => {
                          const isHighRisk = resident.riskLevel === 'alto' || resident.hasActiveAlert;
                          
                          // Autonomy/Mobility theme styles helper
                          const getMobilityStyle = (mob: string) => {
                            const m = String(mob || '').toLowerCase();
                            if (m.includes("independente")) return "bg-sky-50 text-sky-700 border-sky-200";
                            if (m.includes("apoio")) return "bg-amber-50 text-amber-700 border-amber-200";
                            if (m.includes("cadeira")) return "bg-orange-50 text-orange-700 border-orange-200";
                            return "bg-red-50 text-red-700 border-red-200 w-fit"; // Acamado
                          };

                          // Estado Geral status theme decorator
                          const getStateStyle = (state: string) => {
                            const s = String(state || '').toLowerCase();
                            if (s.includes("crítico") || s.includes("critico")) return "bg-red-50 text-red-700 border-red-200 font-extrabold animate-pulse w-fit";
                            if (s.includes("recupera")) return "bg-amber-50 text-amber-700 border-amber-200 w-fit";
                            return "bg-emerald-50 text-emerald-700 border-emerald-200 w-fit"; // Estável
                          };

                          return (
                            <tr 
                              key={resident.id}
                              onClick={() => handleSelectResidentProfile(resident.id)}
                              className={`border-b border-slate-100 text-slate-800 text-sm hover:bg-blue-50/50 transition-all duration-150 cursor-pointer group ${
                                isHighRisk ? 'bg-red-50/20' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                              }`}
                            >
                              {/* ID_Utente */}
                              <td className="py-3 px-4 font-bold text-xs text-slate-500 font-mono">
                                <span className="group-hover:text-blue-700 transition-colors">
                                  {resident.id}
                                </span>
                              </td>
                              
                              {/* Nome */}
                              <td className="py-3 px-4 font-bold text-slate-900 min-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={resident.avatar} 
                                    alt={resident.name} 
                                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="group-hover:text-blue-700 transition-colors whitespace-nowrap">
                                    {resident.name}
                                  </span>
                                </div>
                              </td>
                              
                              {/* Data_Nascimento */}
                              <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                                {resident.birthDate}
                              </td>
                              
                              {/* Idade */}
                              <td className="py-3 px-4 text-center font-bold text-slate-800">
                                {resident.age}
                              </td>
                              
                              {/* Sexo */}
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                  resident.gender === 'F' 
                                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {resident.gender}
                                </span>
                              </td>
                              
                              {/* Quarto */}
                              <td className="py-3 px-4 text-center font-extrabold text-xs text-slate-700 whitespace-nowrap">
                                <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono">
                                  Q.{resident.room}
                                </span>
                              </td>
                              
                              {/* Mobilidade */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getMobilityStyle(resident.mobility)}`}>
                                  {resident.mobility}
                                </span>
                              </td>
                              
                              {/* Estado_Geral */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getStateStyle(resident.generalState)}`}>
                                  {resident.generalState}
                                </span>
                              </td>
                              
                              {/* Familiar_Responsável */}
                              <td className="py-3 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                {resident.responsibleFamily}
                              </td>
                              
                              {/* Contacto_Familiar */}
                              <td className="py-3 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                                {resident.familyContact}
                              </td>
                              
                              {/* Peso */}
                              <td className="py-3 px-4 text-center text-xs font-bold text-slate-700 whitespace-nowrap">
                                {resident.weight} kg
                              </td>
                              
                              {/* Tipo_sanguineo */}
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold">
                                  {resident.bloodType}
                                </span>
                              </td>
                              
                              {/* Alergias */}
                              <td className="py-3 px-4 max-w-[220px]">
                                <div className="flex flex-wrap gap-1">
                                  {resident.allergies.map((allergy, aIdx) => (
                                    <span 
                                      key={aIdx} 
                                      className="inline-block px-1.5 py-0.5 hover:scale-105 transition-all text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded whitespace-nowrap"
                                      title={allergy}
                                    >
                                      {allergy}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Table Footer */}
                  <div className="bg-slate-50 py-3 px-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 font-semibold whitespace-nowrap">
                    <span>A visualizar {filteredResidents.length} de {residents.length} utentes inscritos</span>
                    <span className="text-blue-600 font-extrabold tracking-wide uppercase">Dica: clique numa linha para aceder à ficha clínica individual</span>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="font-semibold text-sm">Nenhum utente corresponds aos filtros aplicados.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setAutonomyFilter('todos');
                  }}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OCORRÊNCIAS HISTÓRICO */}
        {currentTab === 'historico' && (
          <div className="flex flex-col gap-6 animate-fadeIn" id="history-panel">
            {/* Header section with page tools */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ocorrências Médicas</h2>
                <p className="text-slate-500 text-sm font-medium">Histórico cronológico e rotinas assistidas.</p>
              </div>
              
              <button 
                onClick={handleExportHistory}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Exportar Relatório</span>
              </button>
            </div>

            {/* Event Filter tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              
              {/* Filter 1: Quick Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Procurar logs ou nome..."
                  className="w-full pl-9 pr-4 py-2 text-slate-700 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Filter 2: Date select */}
              <div className="relative flex items-center">
                <Calendar className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
                <select
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value as any)}
                  className="w-full pl-9 pr-4 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold appearance-none cursor-pointer"
                >
                  <option value="todos">Todos os Períodos</option>
                  <option value="hoje">Hoje (23 Maio)</option>
                  <option value="7dias">Últimos 7 Dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                </select>
                <ChevronDown className="absolute right-3 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Filter 3: Occurrence Type select */}
              <div className="flex items-center relative">
                <ClipboardList className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value as any)}
                  className="w-full pl-9 pr-4 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold appearance-none cursor-pointer"
                >
                  <option value="todos">Todos Eventos</option>
                  <option value="fall">Quedas / Emergências</option>
                  <option value="medication">Verificação Medicação</option>
                  <option value="vitals">Sinais Vitais</option>
                  <option value="routine">Rotinas e Alimentação</option>
                </select>
                <ChevronDown className="absolute right-3 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>

            </div>

            {/* Occurrences Hybrid Bento Table Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Header Titles (Desktop only) */}
              <div className="hidden sm:grid grid-cols-[110px_1.5fr_140px_2.5fr_40px] gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 font-bold text-[10px] text-slate-400 uppercase tracking-widest text-left">
                <div>Hora</div>
                <div>Filiação Utente</div>
                <div>Tipo</div>
                <div>Descrição Clinica</div>
                <div></div>
              </div>

              {/* Listing Row */}
              {filteredOccurrences.length > 0 ? (
                <div className="flex flex-col divide-y divide-slate-100">
                  {filteredOccurrences.map((occ) => {
                    const residentObj = residents.find(r => r.id === occ.residentId);
                    return (
                      <OccurrenceRow 
                        key={occ.id}
                        occurrence={occ}
                        residentAvatar={occ.residentAvatar || residentObj?.avatar}
                        residentRoom={residentObj?.room}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                  <ClipboardList className="w-10 h-10 opacity-30 mb-2" />
                  <p className="font-semibold text-sm">Nenhum evento corresponde ao filtro selecionado.</p>
                </div>
              )}

              {/* Load More Button */}
              <div className="p-4 bg-slate-50 flex justify-center border-t border-slate-100">
                <button 
                  onClick={() => triggerToast('Mais dados do servidor indisponíveis no momento.', 'info')}
                  className="text-xs font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 px-5 py-2 rounded-full transition-all active:scale-95"
                >
                  Carregar mais ocorrências
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: NEW INCIDENT FORM / REGISTER */}
        {currentTab === 'registar' && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-3xl mx-auto" id="register-incident-panel">
            {/* Header description */}
            <div className="flex justify-between items-start text-left">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registar Evento Clínico</h2>
                <p className="text-slate-500 text-sm font-medium">Logar novos episódios clínicos ou atualizar os sinais vitais vigentes.</p>
              </div>
              <button 
                onClick={() => handleTabChange('painel')}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 duration-150 active:scale-90"
                title="Voltar"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            {/* Form body container */}
            <form onSubmit={handleRegisterFormSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left gap-6 flex flex-col">
              
              {/* SECTION I: PATIENT CONTEXT */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Informação do Utente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dropdown patients selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Nome do Utente <span className="text-red-600">*</span></label>
                    <div className="relative">
                      <select
                        required
                        value={formResidentId}
                        onChange={(e) => setFormResidentId(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold appearance-none cursor-pointer"
                      >
                        <option value="">Selecionar residente...</option>
                        {residents.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} (Quarto {r.room})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Incident occurrence type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Tipo de Ocorrência <span className="text-red-600">*</span></label>
                    <div className="relative">
                      <select
                        required
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full pl-3 pr-8 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold appearance-none cursor-pointer"
                      >
                        <option value="vitals">Atualização Sinais Vitais</option>
                        <option value="fall">Queda / Acidente</option>
                        <option value="medication">Medicação Recusada / Erro</option>
                        <option value="routine">Registo de Alimentação / Banho</option>
                        <option value="behavioral">Alteração Comportamental</option>
                        <option value="other">Outro Episódio Clínico</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Logged Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Data do Evento <span className="text-red-600">*</span></label>
                    <input 
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
                    />
                  </div>

                  {/* Logged Hour */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Hora do Evento <span className="text-red-600">*</span></label>
                    <input 
                      type="time"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
                    />
                  </div>
                </div>

              </div>

              {/* SECTION II: DETECTED VITALS UPDATE */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-5 h-5 text-red-600 animate-pulse shrink-0" />
                  <span className="font-bold text-sm text-slate-800">Registar Variações Sinais Vitais (Opcional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Blood Pressure Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 font-semibold" htmlFor="field-bp">Pressão Arterial</label>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        id="field-bp"
                        value={formBP}
                        onChange={(e) => setFormBP(e.target.value)}
                        placeholder="Ex: 120/80"
                        className="w-full pl-3 pr-1 py-1.5 bg-white border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 font-semibold placeholder:text-slate-300"
                      />
                      <span className="px-2 py-2 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-400 rounded-r-lg uppercase">mmHg</span>
                    </div>
                  </div>

                  {/* Heart rate Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 font-semibold" htmlFor="field-hr">Frequência Cardíaca</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        id="field-hr"
                        value={formHR}
                        onChange={(e) => setFormHR(e.target.value)}
                        placeholder="Ex: 72"
                        className="w-full pl-3 pr-1 py-1.5 bg-white border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 font-semibold placeholder:text-slate-300"
                      />
                      <span className="px-2 py-2 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-400 rounded-r-lg uppercase">bpm</span>
                    </div>
                  </div>

                  {/* Temperature Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 font-semibold" htmlFor="field-temp">Temperatura</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        step="0.1"
                        id="field-temp"
                        value={formTemp}
                        onChange={(e) => setFormTemp(e.target.value)}
                        placeholder="Ex: 36.6"
                        className="w-full pl-3 pr-1 py-1.5 bg-white border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 font-semibold placeholder:text-slate-300"
                      />
                      <span className="px-2 py-2 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-400 rounded-r-lg uppercase">°C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION III: CLINICAL DESCRIPTION */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Descrição da Ocorrência</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Relatório da Equipa de Enfermagem <span className="text-red-600">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Descreva minuciosamente o estado físico, reclamações e o que foi registrado no local..."
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 font-medium text-slate-700 placeholder:text-slate-400 resize-y"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Ação de Enfermagem Proativa Tomada</label>
                  <textarea
                    rows={2}
                    value={formActionTaken}
                    onChange={(e) => setFormActionTaken(e.target.value)}
                    placeholder="Ex: Medicação ministrada, aplicação de pensos de primeiros socorros, acompanhamento permanente..."
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 font-medium text-slate-700 placeholder:text-slate-400 resize-y"
                  />
                </div>
              </div>

              {/* Submission buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => handleTabChange('painel')}
                  className="px-6 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold text-center hover:text-slate-900 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 text-white" />
                  Submeter Registo Clínico
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 6: GOOGLE SHEETS IMPORTER AND SYNC */}
        {currentTab === 'sheets-import' && (
          <div className="animate-fadeIn" id="sheets-importer-panel">
            <SheetsImporter 
              selectedLar={selectedLar}
              triggerToast={triggerToast}
              onBackToDashboard={() => handleTabChange('painel')}
            />
          </div>
        )}

        {/* TAB 7: MEDICATION RECORDS FIREBASE TABLE */}
        {currentTab === 'medicacoes' && selectedLar && (
          <div className="animate-fadeIn" id="medicacoes-management-panel">
            <MedicationsTable 
              medicationRecords={medicationRecords}
              residents={residents}
              selectedLarId={selectedLar.id}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* TAB 8: PEDIDOS DE FAMILIARES TABLE */}
        {currentTab === 'pedidos' && (
          <div className="animate-fadeIn" id="pedidos-management-panel">
            <PedidosTable 
              pedidos={pedidos}
              residents={residents}
              onToggleEstado={handleTogglePedidoEstado}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* TAB 5: UTENTE CLINICAL DETAIL DOSSIER */}
        {currentTab === 'utente-detalhe' && selectedResident && (
          <div className="flex flex-col gap-6 animate-fadeIn" id="resident-clinical-profile">
            
            {/* Nav back sub-header */}
            <div className="flex justify-between items-center" id="profile-detailed-header">
              <button 
                onClick={() => handleTabChange('utentes')}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-bold transition-all py-1"
              >
                <ArrowLeft className="w-4 h-4 shrink-0 text-blue-700" />
                <span>Voltar à lista</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider hidden sm:inline">Identificação Segura</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">ID Ativo</span>
              </div>
            </div>

            {/* Split layout: Clinical Identity summary card + Action sub-boards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Identity Profile Frame (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Profile Identity Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                  
                  {/* Danger status line indicator */}
                  <div className={`w-full h-1.5 absolute top-0 left-0 ${selectedResident.riskLevel === 'alto' ? 'bg-red-600' : 'bg-amber-400'}`} />

                  <div className="relative w-28 h-28 mb-4">
                    <img 
                      src={selectedResident.avatar} 
                      alt={selectedResident.name} 
                      className="w-full h-full object-cover rounded-full border-4 border-slate-50 shadow-md"
                      referrerPolicy="no-referrer"
                    />

                    {/* Highly sensitive dynamic indicator warning Badge */}
                    {selectedResident.riskLevel === 'alto' && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 font-semibold text-[10px] px-2.5 py-1 rounded-full border border-red-300 flex items-center gap-1 whitespace-nowrap shadow-xs uppercase font-extrabold">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce" />
                        Risco Elevado
                      </div>
                    )}
                  </div>

                  <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{selectedResident.name}</h1>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">Idade {selectedResident.age} • Quarto {selectedResident.room}</p>

                  {/* Immediate Critical Action Box with real interactive actions! */}
                  <div className="flex gap-2.5 mt-6 w-full">
                    {/* Append a clinical activity note log item */}
                    <button 
                      onClick={() => setIsNoteModalOpen(true)}
                      className="flex-1 bg-blue-600 text-white font-bold text-xs py-2.5 px-2 rounded-lg flex justify-center items-center gap-1 hover:bg-blue-700 shadow-xs transition-transform active:scale-95"
                    >
                      <FileEdit className="w-4 h-4 text-white" />
                      <span>Adicionar Nota</span>
                    </button>

                    {/* Toggle nurse intervention alert */}
                    <button 
                      onClick={() => handleToggleAlert(selectedResident.id)}
                      className={`flex-1 font-bold text-xs py-2.5 px-2 rounded-lg flex justify-center items-center gap-1 transition-all shadow-xs active:scale-95 ${
                        selectedResident.hasActiveAlert
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{selectedResident.hasActiveAlert ? 'Silenciar Alerta' : 'Alerta Urgente'}</span>
                    </button>
                  </div>

                </div>

                {/* Quick Info Identity Bento Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Blood Type container */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs text-left flex flex-col justify-center items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-red-500 fill-red-400" /> Tipo Sangue
                    </span>
                    <span className="text-2xl font-black text-slate-900 mt-1">{selectedResident.bloodType}</span>
                  </div>

                  {/* Weight container */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs text-left flex flex-col justify-center items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-blue-500" /> Peso Geral
                    </span>
                    <span className="text-2xl font-black text-slate-900 mt-1">{selectedResident.weight} kg</span>
                  </div>
                </div>

                {/* Allergies & Pathological conditions Block */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-left flex flex-col gap-4">
                  {/* Conditions */}
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                      <ClipboardList className="w-4 h-4 text-blue-700" /> Condições Principais
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedResident.conditions.map((cond, idx) => (
                        <span 
                          key={idx}
                          className="bg-amber-50 text-amber-800 font-semibold text-xs px-2.5 py-1 rounded-full border border-amber-200"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" /> Sensibilidade / Alergias
                    </h3>
                    {selectedResident.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedResident.allergies.map((alg, idx) => (
                          <span 
                            key={idx}
                            className="bg-red-50 text-red-800 font-semibold text-xs px-2.5 py-1 rounded-full border border-red-200"
                          >
                            {alg}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold italic">Sem alergias reportadas</span>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive sub-tab clinical activities (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                
                {/* Segment tab keys */}
                <div className="flex gap-4 border-b border-slate-200 pb-1" id="profile-detailed-tabbar">
                  <button 
                    onClick={() => setProfileSubTab('info')}
                    className={`font-semibold text-sm pb-2.5 px-2 transition-all relative border-b-2 ${
                      profileSubTab === 'info'
                        ? 'text-blue-700 border-blue-600 font-bold'
                        : 'text-slate-500 hover:text-slate-800 border-transparent'
                    }`}
                  >
                    Info Clínica
                  </button>

                  <button 
                    onClick={() => setProfileSubTab('atividades')}
                    className={`font-semibold text-sm pb-2.5 px-2 transition-all relative border-b-2 ${
                      profileSubTab === 'atividades'
                        ? 'text-blue-700 border-blue-600 font-bold'
                        : 'text-slate-500 hover:text-slate-800 border-transparent'
                    }`}
                  >
                    Atividades ({selectedResident.activities.length})
                  </button>


                </div>

                {/* SUB TAB CONTROLLER CONTENT */}
                <div className="flex flex-col gap-5 animate-fadeIn" id="profile-subtab-viewer">
                  
                  {/* SUBTAB 1: CLINICAL GENERAL DATA (Vitals, Medicines, Recent activities) */}
                  {profileSubTab === 'info' && (
                    <div className="flex flex-col gap-5 text-left">
                      
                      {/* Interactive Sparklines displays */}
                      <VitalsSparkline 
                        heartRate={selectedResident.vitals.heartRate} 
                        bloodPressure={selectedResident.vitals.bloodPressure} 
                        spo2={selectedResident.vitals.spo2} 
                        temperature={selectedResident.vitals.temperature}
                        temperatureUnit={selectedResident.vitals.temperatureUnit}
                      />

                      {/* Split: Medications list and Activity log preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Current Medications checklist */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-base">
                              <Pill className="w-4 h-4 text-blue-700" /> Medicação Vigente
                            </h3>
                            <span className="text-[10px] uppercase font-extrabold text-slate-400">Verificação</span>
                          </div>

                          <div className="flex flex-col divide-y divide-slate-100">
                            {selectedResident.medications.length === 0 ? (
                              <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                                Sem medicação ativa prescrita na base de dados.
                              </div>
                            ) : (
                              selectedResident.medications.map(med => (
                                <div 
                                  key={med.id} 
                                  className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-all"
                                  onClick={() => handleToggleMedicine(selectedResident.id, med.id)}
                                >
                                  <div>
                                    <p className="font-semibold text-slate-900 text-sm">{med.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{med.dosage} • {med.schedule}</p>
                                  </div>
                                  <span className="flex items-center shrink-0">
                                    {med.status === 'tomado' ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                                    ) : med.status === 'pendente' ? (
                                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                        Pendente ({med.scheduleTimeLabel})
                                      </span>
                                    ) : (
                                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                        Próxima
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Recent mini Activities Timeline check */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
                          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-base">
                            <History className="w-4 h-4 text-blue-700" /> Atividade Recente
                          </h3>

                          <div className="relative border-l-2 border-slate-100 ml-2.5 flex flex-col gap-4 pl-3.5 pb-1">
                            {selectedResident.activities.length === 0 ? (
                              <div className="text-slate-400 text-xs font-semibold py-6 text-center">
                                Sem ocorrências ou atividades recentes registadas na base de dados.
                              </div>
                            ) : (
                              selectedResident.activities.slice(0, 3).map((act) => (
                                <div key={act.id} className="relative text-left flex flex-col">
                                  {/* Bullet indicator based on activity type */}
                                  <div className={`absolute -left-[19.5px] top-1.5 w-3 h-3 rounded-full border border-white ${
                                    act.type === 'critical' 
                                      ? 'bg-red-600 animate-ping shadow-sm' 
                                      : act.type === 'routine' 
                                      ? 'bg-slate-400' 
                                      : 'bg-blue-600'
                                  }`} />
                                  
                                  <span className="text-[10px] text-slate-400 font-bold">{act.time} • {act.date}</span>
                                  <p className={`text-xs mt-0.5 text-slate-700 leading-relaxed font-semibold p-1.5 rounded bg-slate-50 border border-slate-100/50`}>
                                    {act.description}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* SUBTAB 2: FULL DETAILED HISTORICAL TIMELINE */}
                  {profileSubTab === 'atividades' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-left flex flex-col gap-4">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">Histórico Completo de Atividades</h3>
                        <button 
                          onClick={() => setIsNoteModalOpen(true)}
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95"
                        >
                          + Adicionar Nova Nota
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 relative border-l-2 border-slate-100 ml-2.5 pl-4 py-2">
                        {selectedResident.activities.map((act) => (
                          <div key={act.id} className="relative text-left flex flex-col">
                            {/* Color Bullet */}
                            <div className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              act.type === 'critical' ? 'bg-red-600' : act.type === 'routine' ? 'bg-slate-400' : 'bg-blue-600'
                            }`} />
                            
                            <span className="text-xs text-slate-400 font-bold">{act.time} • {act.date}</span>
                            <p className="text-sm text-slate-800 mt-1 font-semibold leading-relaxed bg-slate-50 p-2 border border-slate-100 rounded">
                              {act.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* QUICK LOG CLINICAL NOTE MODAL */}
            {isNoteModalOpen && (
              <div className="fixed inset-0 z-55 bg-indigo-950/25 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-left animate-fadeIn">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1">
                      <FileEdit className="w-5 h-5 text-blue-700 shrink-0" />
                      Registar Nota Clínica Livre
                    </h3>
                    <button 
                      onClick={() => setIsNoteModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 active:scale-90 transition-all p-1 bg-slate-50 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddNoteSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Tipo da Nota</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setNoteType('info')}
                          className={`py-1 rounded text-xs font-semibold border ${
                            noteType === 'info'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          Sessão Social
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteType('routine')}
                          className={`py-1 rounded text-xs font-semibold border ${
                            noteType === 'routine'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          Rotina Diária
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteType('critical')}
                          className={`py-1 rounded text-xs font-semibold border ${
                            noteType === 'critical'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          Observação Crítica
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700" htmlFor="modal-note-content">Conteúdo Clínico <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        id="modal-note-content"
                        rows={4}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Insira detalhes objetivos (ex: 'Recusou o lanche da tarde alegando dores de dente', 'Estabilidade motora excelente durante os degraus')..."
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 font-medium text-slate-700 text-left resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsNoteModalOpen(false)}
                        className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-extrabold shadow-sm active:scale-95 text-center flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        Gravar Nota
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* --- Mobile Bottom Navigation and Inset (Visible ONLY on hand-helds) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full flex justify-around items-center bg-white border-t border-slate-200 py-2.5 px-4 shadow-lg z-45 pb-safe rounded-t-xl" id="mobile-navigation-bar">
        
        {/* Painel link */}
        <button 
          onClick={() => handleTabChange('painel')}
          className={`flex flex-col items-center justify-center px-4 py-1 scale-95 transition-all text-xs font-bold gap-1 rounded-xl ${
            currentTab === 'painel' 
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px]">Painel</span>
        </button>

        {/* Utentes link */}
        <button 
          onClick={() => handleTabChange('utentes')}
          className={`flex flex-col items-center justify-center px-4 py-1 scale-95 transition-all text-xs font-bold gap-1 rounded-xl ${
            currentTab === 'utentes' || currentTab === 'utente-detalhe'
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Utentes</span>
        </button>

        {/* Histórico link */}
        <button 
          onClick={() => handleTabChange('historico')}
          className={`flex flex-col items-center justify-center px-4 py-1 scale-95 transition-all text-xs font-bold gap-1 rounded-xl ${
            currentTab === 'historico' 
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Histórico</span>
        </button>

        {/* Medicação link */}
        <button 
          onClick={() => handleTabChange('medicacoes')}
          className={`flex flex-col items-center justify-center px-4 py-1 scale-95 transition-all text-xs font-bold gap-1 rounded-xl ${
            currentTab === 'medicacoes' 
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-5 h-5 text-amber-500" />
          <span className="text-[10px]">Medicação</span>
        </button>

        {/* Pedidos link */}
        <button 
          onClick={() => handleTabChange('pedidos')}
          className={`flex flex-col items-center justify-center px-4 py-1 scale-95 transition-all text-xs font-bold gap-1 relative rounded-xl ${
            currentTab === 'pedidos' 
              ? 'bg-blue-50 text-blue-800' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Pedidos</span>
          {pedidos.filter(p => p.Estado === 'Pendente').length > 0 && (
            <span className="absolute top-0.5 right-4 w-4 h-4 bg-amber-500 text-white text-[9px] flex items-center justify-center rounded-full border border-white font-extrabold">
              {pedidos.filter(p => p.Estado === 'Pendente').length}
            </span>
          )}
        </button>
      </nav>

      <NewResidentModal 
        isOpen={isNewResidentModalOpen}
        onClose={() => setIsNewResidentModalOpen(false)}
        onSave={handleRegisterSave}
        triggerToast={triggerToast}
      />

      {/* Tailwind safe notched padding on iOS */}
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
      `}</style>

    </div>
  );
}
