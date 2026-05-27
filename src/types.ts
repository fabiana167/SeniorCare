export type AutonomyType = 'independente' | 'parcial' | 'total';
export type RiskLevelType = 'alto' | 'médio' | 'baixo';

export interface VitalSigns {
  heartRate: number; // bpm
  bloodPressure: string; // e.g. "120/80"
  spo2: number; // %
  temperature: number; // e.g. 36.5 (Celsius or Fahrenheit)
  temperatureUnit: '°C' | '°F';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  status: 'tomado' | 'pendente' | 'proxima';
  scheduleTimeLabel: string; // e.g., "Manhã", "Almoço", "Noite"
}

export interface ActivityLog {
  id: string;
  time: string;
  date: string;
  description: string;
  type: 'info' | 'critical' | 'routine';
}

export interface Resident {
  id: string;
  name: string;
  room: string;
  age: number;
  avatar: string; // Image URL
  autonomy: AutonomyType;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevelType;
  bloodType: string;
  weight: number; // kg
  conditions: string[];
  allergies: string[];
  vitals: VitalSigns;
  medications: Medication[];
  activities: ActivityLog[];
  hasActiveAlert: boolean;
  
  // Custom columns for 'utentes' clinical register table
  birthDate: string;        // Data_Nascimento
  gender: string;           // Sexo (M / F)
  mobility: string;         // Mobilidade
  generalState: string;     // Estado_Geral
  responsibleFamily: string;// Familiar_Responsável
  familyContact: string;    // Contacto_Familiar;
  agePoints: number;        // Idade_Pontos
  mobilityPoints: number;   // Mobilidade_Pontos
}

export interface Occurrence {
  id: string;
  residentId: string;
  residentName: string;
  residentAvatar?: string;
  type: 'vitals' | 'fall' | 'medication' | 'routine' | 'behavioral' | 'other';
  date: string;
  time: string;
  description: string;
  actionTaken?: string;
  vitalsRecorded?: Partial<VitalSigns>;
}

export interface MedicationRecord {
  id: string;
  ID_Utente: string;
  Medicamento: string;
  Dosagem: string;
  Horário: string;
  Frequência_dia: string;
  Médico_Prescitor: string;
  Data_Início: string;
  Data_Fim: string;
}
