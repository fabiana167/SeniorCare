import { Resident, Occurrence, AutonomyType, RiskLevelType, ActivityLog, Medication, MedicationRecord, PedidoFamiliar } from './types';

// Deterministic portrait assignment based on ID or index
const AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWO_sPNv1Nc35beeFB6LVaBjcJbcpQmakSO9H_lYugEKLDn8Po3X26BV_AL_4s3wrBbmsZH-obbgP2WCoh5mr7uLJHqsRyahE3p8GVdHCvWJmYriQem4Tq28kAk8qki2rC202oeNabuGlVhC5ctP9GelusUp2z00kqzB6Iu6aHYMfEI4sqKu3wmj_tXN7l2zCx6GLSuUGfhU3Gnbqozzh0cT0BZNa511mcLKSKdtB5-K3GqJHADUOoc1QZNGXeQdNjmeeIVRnKTs0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAupF1U5BwusRNVA7pYrPg3F9LWvEclXdJ8f3cqJp7Pm9hYHvxky5Rhbj7zHrQVmln3f9PqPgR5DsqXV1eolYrxMM-Govw79aw19tdAlAGEcqbusbmLzW6GhiatqCUprk1gpE-s33PuSNkyhxGwvs7fLxk-KveNWqTUQFcTCxNC7iLihEJnCvSmdbuCZ9omcZ84R7iRY6xX1-I0ccXggL3_2l-PpvEsIuzpLYGNyzufp97ov689_70lgih59c0kBCCIA4O4h4h-FAU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCk-Hbzjk_MS-wP4O81HU0ApV7pXHeYRuMkrPtTXtLoUY-vNcgGhAQnK_UOYB75w7GP2JIw8wJm8qCsf0nr6UB0hek1-85BXnOY9gd3Uy9mBz30AvDdlM0b5gcZjV6TFCMjnaZdOVlaAvG2TLioaIC4dEomOBgBLh6iutPBn9dSPjEZhUgvKtvDIH3b8Nz3mVSgL_XhBHjVxWuImSvJH7FNzETZYedZ-0ObExyfUHJgXe8Bp0JoV8SCttKxM0P0uvQG7RC4alhHVgc',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkiJimyjesDAtT0s4klRx6LZ0mmvW3_om82tgS_UvCiC7Lt2GTyCHtSqJpkBgqEoX8NaCdRfxLO50JrAPHcRhfd6_Y2nmXC915TJLzC7FI5LfhPF4Vec4dzCvaHSvWgRTFWlNTWkt5cgwWOq5m3Q0Tn1UELC6MSJfjkvQL6Rtacnwb2-v-F_Ww1RSu5TojIboMe3DK8xh0j4laq6IVtANbf5wy1miwz400nOtnBkkvYcKA8W_y3zOftrA1JKTmpWKfpaEtk06mJVI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBMGWOu8KtamMvSHjA8HeTFsnrlRcHRtDdNVkW1c_B7In8DoW5mzwbNC1kW6nCTAgttUa0RpdrzdcteG3bkIQJi43t1dyQUl3OLFSne5j32ckkq1-0NKTvLz2JTut6m8ODXNEmjfsQhha-HJnxo3-aiiwQRwPRC9-JmG3idvsS_es1oaRBJA5bIgywuvLDFwIXqPnMieHQkeEOgIJYS_ohKJ9CnEx53lYjwg92F5bgSufrPTLJFXi4OJb58YRU4LsNtnqWRdWTxqY',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200'
];

interface RawRes {
  id: string;
  name: string;
  room: string;
  age: number;
  mob: string;
  state: string;
  fam: string;
  tel: string;
  weight: number;
  blood: string;
  allergies: string[];
  score: number;
}

// 80 clinical resident admissions directly from the PDFclinical database (Pages 1 & 2 + Triagens page 35)
const RAW_RESIDENTS: RawRes[] = [
  { id: "UT-001", name: "Carlos Silva", room: "129", age: 77, mob: "Com apoio", state: "Recuperação", fam: "Daniel Ferreira", tel: "966629388", weight: 64, blood: "A-", allergies: ["Picadas de insetos"], score: 82 },
  { id: "UT-002", name: "Ana Silva", room: "138", age: 94, mob: "Com apoio", state: "Estável", fam: "Teresa Santos", tel: "970855700", weight: 79.7, blood: "B-", allergies: ["Lactose", "Ácaros"], score: 70 },
  { id: "UT-003", name: "Helena Costa", room: "166", age: 74, mob: "Independente", state: "Estável", fam: "Beatriz Martins", tel: "994214382", weight: 96.3, blood: "B+", allergies: ["Pólen", "Penicilina"], score: 80 },
  { id: "UT-004", name: "Bruno Silva", room: "140", age: 69, mob: "Acamado", state: "Estável", fam: "Beatriz Oliveira", tel: "975228535", weight: 82.3, blood: "A+", allergies: ["Pólen"], score: 103 },
  { id: "UT-005", name: "Rita Martins", room: "174", age: 74, mob: "Com apoio", state: "Estável", fam: "Tiago Sousa", tel: "922660194", weight: 99.7, blood: "A-", allergies: ["Penicilina"], score: 83 },
  { id: "UT-006", name: "Helena Oliveira", room: "155", age: 85, mob: "Acamado", state: "Estável", fam: "Pedro Santos", tel: "917849494", weight: 89.8, blood: "AB-", allergies: ["Penicilina", "Ácaros"], score: 102 },
  { id: "UT-007", name: "Catarina Almeida", room: "110", age: 90, mob: "Acamado", state: "Recuperação", fam: "Pedro Pereira", tel: "942787299", weight: 52.7, blood: "AB-", allergies: ["Picadas de insetos"], score: 70 },
  { id: "UT-008", name: "Carlos Santos", room: "148", age: 71, mob: "Com apoio", state: "Estável", fam: "Mariana Martins", tel: "958942697", weight: 46.5, blood: "B+", allergies: [], score: 67 },
  { id: "UT-009", name: "Luís Sousa", room: "104", age: 82, mob: "Com apoio", state: "Recuperação", fam: "André Pereira", tel: "924549543", weight: 102.2, blood: "AB-", allergies: [], score: 85 },
  { id: "UT-010", name: "Maria Oliveira", room: "156", age: 77, mob: "Independente", state: "Crítico", fam: "Beatriz Almeida", tel: "978608612", weight: 97.4, blood: "AB+", allergies: ["Picadas de insetos"], score: 66 },
  { id: "UT-011", name: "Catarina Almeida", room: "171", age: 87, mob: "Cadeira de rodas", state: "Recuperação", fam: "André Oliveira", tel: "944788100", weight: 73.8, blood: "B+", allergies: [], score: 81 },
  { id: "UT-012", name: "Bruno Pereira", room: "163", age: 77, mob: "Acamado", state: "Crítico", fam: "Inês Almeida", tel: "972732043", weight: 66.9, blood: "AB+", allergies: ["Marisco"], score: 105 },
  { id: "UT-013", name: "Catarina Oliveira", room: "178", age: 81, mob: "Cadeira de rodas", state: "Crítico", fam: "Nuno Martins", tel: "913446499", weight: 62.2, blood: "B-", allergies: ["Penicilina"], score: 95 },
  { id: "UT-014", name: "Sofia Pereira", room: "158", age: 68, mob: "Independente", state: "Recuperação", fam: "Teresa Ferreira", tel: "913852048", weight: 81, blood: "B-", allergies: [], score: 61 },
  { id: "UT-015", name: "Miguel Santos", room: "116", age: 73, mob: "Com apoio", state: "Estável", fam: "Beatriz Sousa", tel: "989133014", weight: 99.5, blood: "A+", allergies: ["Glúten", "Marisco"], score: 60 },
  { id: "UT-016", name: "Ricardo Almeida", room: "167", age: 91, mob: "Com apoio", state: "Crítico", fam: "Inês Almeida", tel: "967556566", weight: 108.2, blood: "AB+", allergies: ["Picadas de insetos"], score: 85 },
  { id: "UT-017", name: "Catarina Santos", room: "152", age: 85, mob: "Acamado", state: "Crítico", fam: "André Sousa", tel: "915350023", weight: 76.6, blood: "B+", allergies: ["Lactose"], score: 105 },
  { id: "UT-018", name: "Carlos Rodrigues", room: "170", age: 88, mob: "Cadeira de rodas", state: "Estável", fam: "Beatriz Martins", tel: "958557203", weight: 102, blood: "AB-", allergies: ["Amendoim"], score: 91 },
  { id: "UT-019", name: "Rita Rodrigues", room: "101", age: 80, mob: "Acamado", state: "Recuperação", fam: "Paula Oliveira", tel: "969934576", weight: 101.7, blood: "AB-", allergies: ["Penicilina", "Ácaros"], score: 101 },
  { id: "UT-020", name: "Helena Costa", room: "170", age: 93, mob: "Cadeira de rodas", state: "Estável", fam: "Tiago Silva", tel: "922130508", weight: 73.7, blood: "B+", allergies: ["Glúten", "Lactose"], score: 110 },
  { id: "UT-021", name: "António Rodrigues", room: "139", age: 76, mob: "Independente", state: "Crítico", fam: "André Pereira", tel: "961185849", weight: 48, blood: "O-", allergies: ["Penicilina"], score: 65 },
  { id: "UT-022", name: "Rita Martins", room: "115", age: 78, mob: "Com apoio", state: "Estável", fam: "Teresa Costa", tel: "984801233", weight: 52.3, blood: "O+", allergies: ["Picadas de insetos"], score: 80 },
  { id: "UT-023", name: "Ricardo Almeida", room: "113", age: 71, mob: "Acamado", state: "Crítico", fam: "Nuno Santos", tel: "939161443", weight: 103.9, blood: "A+", allergies: ["Marisco", "Pólen"], score: 71 },
  { id: "UT-024", name: "Maria Costa", room: "103", age: 75, mob: "Acamado", state: "Estável", fam: "Mariana Santos", tel: "980610004", weight: 59.1, blood: "A-", allergies: [], score: 108 },
  { id: "UT-025", name: "Carlos Santos", room: "156", age: 94, mob: "Com apoio", state: "Crítico", fam: "Nuno Santos", tel: "963516659", weight: 102.4, blood: "B-", allergies: [], score: 75 },
  { id: "UT-026", name: "Miguel Rodrigues", room: "178", age: 90, mob: "Acamado", state: "Estável", fam: "Daniel Rodrigues", tel: "955610493", weight: 45.6, blood: "A-", allergies: ["Glúten"], score: 80 },
  { id: "UT-027", name: "Ricardo Santos", room: "168", age: 77, mob: "Cadeira de rodas", state: "Estável", fam: "Nuno Silva", tel: "917352710", weight: 102.8, blood: "O+", allergies: ["Penicilina"], score: 87 },
  { id: "UT-028", name: "Ana Rodrigues", room: "156", age: 69, mob: "Cadeira de rodas", state: "Crítico", fam: "Pedro Ferreira", tel: "939738898", weight: 68.6, blood: "AB+", allergies: [], score: 60 },
  { id: "UT-029", name: "Catarina Martins", room: "148", age: 66, mob: "Acamado", state: "Recuperação", fam: "Paula Silva", tel: "989736043", weight: 66.7, blood: "AB+", allergies: ["Picadas de insetos"], score: 95 },
  { id: "UT-030", name: "Fernanda Costa", room: "145", age: 68, mob: "Cadeira de rodas", state: "Estável", fam: "Pedro Santos", tel: "985017250", weight: 109.1, blood: "A-", allergies: [], score: 95 },
  { id: "UT-031", name: "Catarina Pereira", room: "140", age: 88, mob: "Cadeira de rodas", state: "Crítico", fam: "Nuno Almeida", tel: "947818761", weight: 80.2, blood: "AB-", allergies: ["Amendoim"], score: 100 },
  { id: "UT-032", name: "Sofia Ferreira", room: "137", age: 71, mob: "Acamado", state: "Recuperação", fam: "Inês Oliveira", tel: "992590645", weight: 86.3, blood: "AB-", allergies: ["Lactose"], score: 72 },
  { id: "UT-033", name: "Maria Rodrigues", room: "150", age: 86, mob: "Acamado", state: "Recuperação", fam: "André Sousa", tel: "919067690", weight: 96.1, blood: "B+", allergies: [], score: 85 },
  { id: "UT-034", name: "Ricardo Rodrigues", room: "144", age: 84, mob: "Cadeira de rodas", state: "Recuperação", fam: "Nuno Rodrigues", tel: "979696025", weight: 78.7, blood: "O-", allergies: [], score: 75 },
  { id: "UT-035", name: "Luís Rodrigues", room: "178", age: 90, mob: "Com apoio", state: "Crítico", fam: "Teresa Almeida", tel: "920319387", weight: 69.7, blood: "AB-", allergies: ["Amendoim"], score: 120 },
  { id: "UT-036", name: "Carlos Pereira", room: "164", age: 71, mob: "Com apoio", state: "Recuperação", fam: "Beatriz Ferreira", tel: "984040798", weight: 61.5, blood: "B+", allergies: [], score: 95 },
  { id: "UT-037", name: "António Almeida", room: "165", age: 88, mob: "Independente", state: "Estável", fam: "Tiago Almeida", tel: "915529005", weight: 77.3, blood: "O-", allergies: ["Picadas de insetos"], score: 82 },
  { id: "UT-038", name: "Sofia Pereira", room: "135", age: 85, mob: "Com apoio", state: "Estável", fam: "Beatriz Pereira", tel: "948951595", weight: 55.3, blood: "B+", allergies: ["Amendoim"], score: 95 },
  { id: "UT-039", name: "Luís Sousa", room: "150", age: 77, mob: "Acamado", state: "Recuperação", fam: "Pedro Santos", tel: "922976369", weight: 70.3, blood: "O+", allergies: [], score: 95 },
  { id: "UT-040", name: "Miguel Silva", room: "122", age: 91, mob: "Acamado", state: "Recuperação", fam: "Beatriz Silva", tel: "986849080", weight: 48.7, blood: "O+", allergies: [], score: 93 },
  { id: "UT-041", name: "Sofia Martins", room: "137", age: 80, mob: "Acamado", state: "Crítico", fam: "Teresa Santos", tel: "948983895", weight: 53, blood: "O+", allergies: ["Penicilina"], score: 97 },
  { id: "UT-042", name: "António Silva", room: "169", age: 68, mob: "Independente", state: "Crítico", fam: "André Santos", tel: "963283709", weight: 53, blood: "O+", allergies: [], score: 56 },
  { id: "UT-043", name: "Bruno Costa", room: "134", age: 76, mob: "Independente", state: "Crítico", fam: "Teresa Rodrigues", tel: "950526484", weight: 107.8, blood: "B-", allergies: ["Glúten", "Lactose"], score: 72 },
  { id: "UT-044", name: "Fernanda Ferreira", room: "115", age: 79, mob: "Acamado", state: "Estável", fam: "Pedro Ferreira", tel: "970858653", weight: 95.9, blood: "AB+", allergies: ["Penicilina"], score: 95 },
  { id: "UT-045", name: "Fernanda Pereira", room: "139", age: 65, mob: "Com apoio", state: "Recuperação", fam: "Nuno Santos", tel: "943220503", weight: 83.3, blood: "O+", allergies: ["Ácaros", "Pólen"], score: 71 },
  { id: "UT-046", name: "José Rodrigues", room: "107", age: 89, mob: "Acamado", state: "Recuperação", fam: "Paula Almeida", tel: "964795619", weight: 85.9, blood: "AB+", allergies: ["Lactose"], score: 110 },
  { id: "UT-047", name: "Sofia Oliveira", room: "125", age: 65, mob: "Cadeira de rodas", state: "Estável", fam: "Beatriz Sousa", tel: "942122457", weight: 86, blood: "O-", allergies: [], score: 70 },
  { id: "UT-048", name: "Luís Ferreira", room: "124", age: 71, mob: "Independente", state: "Estável", fam: "Nuno Martins", tel: "965350347", weight: 98, blood: "B-", allergies: [], score: 100 },
  { id: "UT-049", name: "Luís Rodrigues", room: "129", age: 85, mob: "Independente", state: "Recuperação", fam: "Tiago Costa", tel: "964395532", weight: 98.9, blood: "O-", allergies: ["Lactose", "Penicilina"], score: 80 },
  { id: "UT-050", name: "Helena Ferreira", room: "107", age: 68, mob: "Cadeira de rodas", state: "Estável", fam: "Mariana Silva", tel: "991224373", weight: 89.3, blood: "AB-", allergies: [], score: 85 },
  { id: "UT-051", name: "Carlos Silva", room: "171", age: 69, mob: "Independente", state: "Crítico", fam: "Teresa Ferreira", tel: "965540647", weight: 100.3, blood: "AB+", allergies: [], score: 60 },
  { id: "UT-052", name: "Sofia Almeida", room: "141", age: 73, mob: "Independente", state: "Crítico", fam: "Mariana Sousa", tel: "987293208", weight: 100.4, blood: "A-", allergies: [], score: 76 },
  { id: "UT-053", name: "Ana Santos", room: "122", age: 76, mob: "Com apoio", state: "Crítico", fam: "Tiago Rodrigues", tel: "911415698", weight: 86, blood: "A+", allergies: ["Amendoim"], score: 78 },
  { id: "UT-054", name: "Miguel Sousa", room: "143", age: 72, mob: "Independente", state: "Estável", fam: "Pedro Costa", tel: "935016429", weight: 65.9, blood: "AB+", allergies: ["Penicilina"], score: 70 },
  { id: "UT-055", name: "Miguel Oliveira", room: "148", age: 70, mob: "Acamado", state: "Crítico", fam: "Teresa Sousa", tel: "961500679", weight: 54.1, blood: "O+", allergies: ["Penicilina"], score: 85 },
  { id: "UT-056", name: "Bruno Sousa", room: "174", age: 87, mob: "Com apoio", state: "Recuperação", fam: "Teresa Oliveira", tel: "915584869", weight: 49.5, blood: "B+", allergies: ["Pólen"], score: 76 },
  { id: "UT-057", name: "João Oliveira", room: "117", age: 94, mob: "Independente", state: "Recuperação", fam: "Paula Sousa", tel: "962707402", weight: 82.7, blood: "O-\", allergies: [\"Lactose\", \"Ácaros\"], score: 81 },
  { id: "UT-058", name: "Catarina Silva", room: "157", age: 70, mob: "Com apoio", state: "Crítico", fam: "Beatriz Santos", tel: "997241147", weight: 87.3, blood: "O+", allergies: ["Lactose"], score: 60 },
  { id: "UT-059", name: "Fernanda Rodrigues", room: "109", age: 70, mob: "Acamado", state: "Crítico", fam: "Beatriz Sousa", tel: "994299475", weight: 96.2, blood: "O+", allergies: ["Penicilina"], score: 90 },
  { id: "UT-060", name: "Helena Almeida", room: "170", age: 83, mob: "Independente", state: "Estável", fam: "Pedro Santos", tel: "919064068", weight: 87.2, blood: "AB-", allergies: ["Glúten", "Marisco"], score: 87 },
  { id: "UT-061", name: "José Santos", room: "102", age: 65, mob: "Com apoio", state: "Crítico", fam: "Teresa Pereira", tel: "959911470", weight: 85.3, blood: "A-", allergies: ["Marisco"], score: 95 },
  { id: "UT-062", name: "Miguel Costa", room: "141", age: 76, mob: "Com apoio", state: "Recuperação", fam: "Beatriz Santos", tel: "977382794", weight: 67.4, blood: "B+", allergies: ["Amendoim"], score: 82 },
  { id: "UT-063", name: "Ricardo Martins", room: "136", age: 67, mob: "Cadeira de rodas", state: "Estável", fam: "Daniel Almeida", tel: "971533194", weight: 50, blood: "O-", allergies: [], score: 78 },
  { id: "UT-064", name: "Rita Santos", room: "139", age: 69, mob: "Independente", state: "Recuperação", fam: "Nuno Sousa", tel: "943315361", weight: 106.3, blood: "B-", allergies: [], score: 45 },
  { id: "UT-065", name: "Helena Martins", room: "155", age: 66, mob: "Independente", state: "Estável", fam: "Paula Almeida", tel: "947561442", weight: 62.1, blood: "B+", allergies: ["Amendoim"], score: 61 },
  { id: "UT-066", name: "José Santos", room: "135", age: 76, mob: "Com apoio", state: "Recuperação", fam: "Mariana Sousa", tel: "933315234", weight: 47.8, blood: "A-", allergies: [], score: 80 },
  { id: "UT-067", name: "Ana Costa", room: "176", age: 94, mob: "Independente", state: "Crítico", fam: "Paula Pereira", tel: "931139813", weight: 45.9, blood: "AB-", allergies: ["Pólen"], score: 85 },
  { id: "UT-068", name: "Luís Oliveira", room: "107", age: 69, mob: "Com apoio", state: "Recuperação", fam: "Tiago Costa", tel: "965568711", weight: 53.1, blood: "B-", allergies: ["Marisco"], score: 56 },
  { id: "UT-069", name: "António Oliveira", room: "107", age: 75, mob: "Acamado", state: "Estável", fam: "Pedro Pereira", tel: "910512117", weight: 98.2, blood: "A-", allergies: ["Amendoim"], score: 105 },
  { id: "UT-070", name: "Ricardo Almeida", room: "150", age: 75, mob: "Acamado", state: "Recuperação", fam: "Inês Sousa", tel: "950111251", weight: 76.2, blood: "B-", allergies: ["Amendoim", "Glúten"], score: 93 },
  { id: "UT-071", name: "Carlos Almeida", room: "169", age: 69, mob: "Acamado", state: "Crítico", fam: "Tiago Silva", tel: "986775659", weight: 89.4, blood: "AB+", allergies: ["Lactose"], score: 71 },
  { id: "UT-072", name: "João Sousa", room: "140", age: 72, mob: "Cadeira de rodas", state: "Recuperação", fam: "Paula Martins", tel: "935872271", weight: 69.5, blood: "AB+", allergies: ["Marisco"], score: 76 },
  { id: "UT-073", name: "Maria Martins", room: "177", age: 70, mob: "Acamado", state: "Crítico", fam: "Nuno Martins", tel: "966882385", weight: 49, blood: "B+", allergies: ["Glúten"], score: 80 },
  { id: "UT-074", name: "Sofia Pereira", room: "146", age: 88, mob: "Com apoio", state: "Recuperação", fam: "Mariana Ferreira", tel: "923100061", weight: 89.6, blood: "A-", allergies: ["Picadas de insetos"], score: 61 },
  { id: "UT-075", name: "Bruno Costa", room: "141", age: 93, mob: "Cadeira de rodas", state: "Crítico", fam: "Paula Silva", tel: "932629881", weight: 93, blood: "A-", allergies: ["Picadas de insetos", "Marisco"], score: 100 },
  { id: "UT-076", name: "Sofia Martins", room: "122", age: 81, mob: "Independente", state: "Estável", fam: "Pedro Sousa", tel: "938345472", weight: 73, blood: "B+", allergies: ["Picadas de insetos"], score: 72 },
  { id: "UT-077", name: "António Santos", room: "126", age: 69, mob: "Acamado", state: "Recuperação", fam: "Beatriz Costa", tel: "964996550", weight: 99.5, blood: "B+", allergies: ["Lactose"], score: 60 },
  { id: "UT-078", name: "Catarina Almeida", room: "148", age: 76, mob: "Com apoio", state: "Estável", fam: "André Ferreira", tel: "971275585", weight: 68.1, blood: "A+", allergies: ["Marisco"], score: 75 },
  { id: "UT-079", name: "Miguel Martins", room: "120", age: 80, mob: "Cadeira de rodas", state: "Recuperação", fam: "André Sousa", tel: "972986894", weight: 68.9, blood: "B-", allergies: [], score: 76 },
  { id: "UT-080", name: "Catarina Costa", room: "129", age: 81, mob: "Independente", state: "Recuperação", fam: "Pedro Silva", tel: "970737878", weight: 74.8, blood: "B+", allergies: ["Ácaros"], score: 68 }
];

// Prescribed medications mapping (Pages 6 - 10)
const MEDS_DATA: Record<string, { name: string; dosage: string; schedule: string; timeLabel: string }[]> = {
  "UT-001": [
    { name: "Metformina", dosage: "850 mg", schedule: "Diário - 08h", timeLabel: "Manhã" },
    { name: "Losartan", dosage: "100mg", schedule: "Diário - 20h", timeLabel: "Noite" }
  ],
  "UT-002": [
    { name: "Diazepam", dosage: "10mg", schedule: "Diário - 20h", timeLabel: "Noite" },
    { name: "Montelucaste", dosage: "10mg", schedule: "Diário - 12h", timeLabel: "Almoço" }
  ],
  "UT-003": [
    { name: "Memantina", dosage: "10mg", schedule: "Geral - 08h e 20h", timeLabel: "Manhã" }
  ],
  "UT-004": [
    { name: "Enalapril", dosage: "10mg", schedule: "Diário - 08h", timeLabel: "Manhã" },
    { name: "Omeprazol", dosage: "10mg", schedule: "Diário - 08h e 20h", timeLabel: "Manhã" }
  ],
  "UT-005": [
    { name: "Omeprazol", dosage: "10mg", schedule: "Diário - 08h e 20h", timeLabel: "Manhã" },
    { name: "Enalapril", dosage: "10mg", schedule: "Diário - 08h", timeLabel: "Manhã" }
  ],
  "UT-006": [
    { name: "Metformina", dosage: "1000mg", schedule: "Diário - 08h", timeLabel: "Manhã" }
  ],
  "UT-007": [
    { name: "Montelucaste", dosage: "10mg", schedule: "Diário - 20h", timeLabel: "Noite" }
  ],
  "UT-008": [
    { name: "Metformina", dosage: "500mg", schedule: "Bidiário - 08h e 20h", timeLabel: "Manhã" }
  ],
  "UT-009": [
    { name: "Inalapril", dosage: "10mg", schedule: "Bidiário - 08h e 20h", timeLabel: "Manhã" },
    { name: "Carvedilol", dosage: "10mg", schedule: "Diário - 12h", timeLabel: "Almoço" }
  ],
  "UT-010": [
    { name: "Sertralina", dosage: "100mg", schedule: "Diário - 08h", timeLabel: "Manhã" },
    { name: "Mirtazapina", dosage: "10mg", schedule: "Diário - 21h30m", timeLabel: "Noite" }
  ],
  "UT-011": [
    { name: "Levodopa", dosage: "100mg", schedule: "De 8h em 8h", timeLabel: "Manhã" },
    { name: "Entacapone", dosage: "100mg", schedule: "Bidiário", timeLabel: "Manhã" }
  ],
  "UT-012": [
    { name: "Memantina", dosage: "10mg", schedule: "Bidiário", timeLabel: "Manhã" }
  ],
  "UT-013": [
    { name: "Paracetamol", dosage: "1000mg", schedule: "S/ Necessidade (SOS)", timeLabel: "Almoço" }
  ],
  "UT-014": [
    { name: "Sertralina", dosage: "100mg", schedule: "Diário - Manhã", timeLabel: "Manhã" },
    { name: "Mirtazapina", dosage: "10mg", schedule: "Diário - Noite", timeLabel: "Noite" }
  ],
  "UT-015": [
    { name: "Paracetamol", dosage: "500mg", schedule: "SOS para dores", timeLabel: "Almoço" }
  ]
};

// Raw Clinical Sinais Vitais (Page 11 & 12)
const VITALS_DATA: Record<string, { temp: number; bp: string; spo2: number; hr: number }> = {
  "UT-001": { temp: 36.4, bp: "147/78", spo2: 92, hr: 70 },
  "UT-002": { temp: 37.1, bp: "105/69", spo2: 99, hr: 77 },
  "UT-003": { temp: 37.9, bp: "110/91", spo2: 93, hr: 94 },
  "UT-004": { temp: 37.9, bp: "144/94", spo2: 95, hr: 79 },
  "UT-005": { temp: 36.1, bp: "131/95", spo2: 93, hr: 72 },
  "UT-006": { temp: 36.2, bp: "121/72", spo2: 93, hr: 75 },
  "UT-007": { temp: 37.9, bp: "116/74", spo2: 96, hr: 66 },
  "UT-008": { temp: 37.9, bp: "125/75", spo2: 94, hr: 61 },
  "UT-009": { temp: 37.4, bp: "110/86", spo2: 100, hr: 72 },
  "UT-010": { temp: 36.3, bp: "112/77", spo2: 99, hr: 64 },
  "UT-011": { temp: 36.5, bp: "130/87", spo2: 93, hr: 69 },
  "UT-012": { temp: 36.1, bp: "134/80", spo2: 95, hr: 80 },
  "UT-013": { temp: 37.4, bp: "129/91", spo2: 93, hr: 96 },
  "UT-014": { temp: 37.1, bp: "143/76", spo2: 93, hr: 86 },
  "UT-015": { temp: 36.5, bp: "113/87", spo2: 96, hr: 68 },
  "UT-016": { temp: 36.5, bp: "145/72", spo2: 94, hr: 86 },
  "UT-017": { temp: 37.2, bp: "121/85", spo2: 100, hr: 88 },
  "UT-018": { temp: 36.2, bp: "150/89", spo2: 95, hr: 70 },
  "UT-019": { temp: 36.5, bp: "136/71", spo2: 97, hr: 90 },
  "UT-020": { temp: 36.7, bp: "137/74", spo2: 95, hr: 86 },
  "UT-021": { temp: 37.7, bp: "128/94", spo2: 95, hr: 82 },
  "UT-022": { temp: 37.6, bp: "133/73", spo2: 95, hr: 61 },
  "UT-023": { temp: 36.4, bp: "117/84", spo2: 93, hr: 73 },
  "UT-024": { temp: 36.4, bp: "149/71", spo2: 100, hr: 89 },
  "UT-025": { temp: 36.1, bp: "115/72", spo2: 98, hr: 83 },
  "UT-026": { temp: 37.5, bp: "123/82", spo2: 98, hr: 81 },
  "UT-027": { temp: 37.0, bp: "137/75", spo2: 94, hr: 94 },
  "UT-028": { temp: 37.5, bp: "119/77", spo2: 93, hr: 76 },
  "UT-029": { temp: 37.9, bp: "138/73", spo2: 97, hr: 65 },
  "UT-030": { temp: 36.7, bp: "121/76", spo2: 97, hr: 91 },
  "UT-031": { temp: 37.7, bp: "145/73", spo2: 100, hr: 67 },
  "UT-032": { temp: 37.6, bp: "125/79", spo2: 93, hr: 75 },
  "UT-033": { temp: 37.6, bp: "121/94", spo2: 99, hr: 90 },
  "UT-034": { temp: 36.7, bp: "128/79", spo2: 99, hr: 87 },
  "UT-035": { temp: 37.0, bp: "145/73", spo2: 96, hr: 76 },
  "UT-036": { temp: 37.6, bp: "114/74", spo2: 97, hr: 64 },
  "UT-037": { temp: 37.0, bp: "150/87", spo2: 96, hr: 79 },
  "UT-038": { temp: 37.0, bp: "142/84", spo2: 99, hr: 91 },
  "UT-039": { temp: 36.1, bp: "112/74", spo2: 97, hr: 90 },
  "UT-040": { temp: 37.5, bp: "140/93", spo2: 92, hr: 68 },
  "UT-041": { temp: 36.5, bp: "145/92", spo2: 96, hr: 66 },
  "UT-042": { temp: 36.9, bp: "144/86", spo2: 99, hr: 92 },
  "UT-043": { temp: 37.8, bp: "129/92", spo2: 93, hr: 78 },
  "UT-044": { temp: 36.5, bp: "110/93", spo2: 95, hr: 64 },
  "UT-045": { temp: 36.4, bp: "116/89", spo2: 92, hr: 98 },
  "UT-046": { temp: 37.8, bp: "145/83", spo2: 98, hr: 93 },
  "UT-047": { temp: 36.9, bp: "140/94", spo2: 97, hr: 83 },
  "UT-048": { temp: 36.1, bp: "150/91", spo2: 99, hr: 91 },
  "UT-049": { temp: 37.3, bp: "131/88", spo2: 93, hr: 62 },
  "UT-050": { temp: 36.9, bp: "147/91", spo2: 98, hr: 99 }
};

// Diagnosed conditions mapping (Pages 3 - 5)
const CONDITIONS_DATA: Record<string, string[]> = {
  "UT-001": ["Diabetes Tipo 2", "Hipercolesterolemia"],
  "UT-002": ["Asma Brônquica", "Refluxo Gastroesofágico"],
  "UT-003": ["Alzheimer Avançado", "Risco Elevado de Logopenia"],
  "UT-004": ["Hipertensão Arterial Sistemática"],
  "UT-005": ["Hipertensão Arterial Resistente", "Osteoartrite ligeira"],
  "UT-006": ["Diabetes Crónica Grave"],
  "UT-007": ["Asma Moderada", "Insuficiência Cardíaca Crónica"],
  "UT-008": ["Diabetes Mellitus Tipo 2"],
  "UT-009": ["Insuficiência Cardíaca Geral"],
  "UT-010": ["Depressão Major Grave"],
  "UT-011": ["Doença de Parkinson", "Défice Cognitivo Moderado"],
  "UT-012": ["Alzheimer precoce"],
  "UT-013": ["Artrite Reumatóide Grave"],
  "UT-014": ["Depressão Atípica"],
  "UT-015": ["Artrite Crónica Leve"],
  "UT-016": ["Artrite Reumatóide Crónica"],
  "UT-017": ["Insuficiência Cardíaca Congestiva"],
  "UT-018": ["Depressão Geriátrica"],
  "UT-019": ["Depressão Moderada"],
  "UT-020": ["Insuficiência Cardíaca Conjestiva Crónica"],
  "UT-021": ["Asma Alérgica Crónica"],
  "UT-022": ["Asma Leve"],
  "UT-023": ["Depressão Moderada"],
  "UT-024": ["Hipertensão Arterial"],
  "UT-025": ["Insuficiência Cardíaca Grave"]
};

// Production clinical timeline occurrences mapped to the UT-001 to UT-080 dataset
export const INITIAL_OCCURRENCES: Occurrence[] = [
  {
    id: "occ-101",
    residentId: "UT-001",
    residentName: "Carlos Silva",
    residentAvatar: AVATARS[0],
    type: "routine",
    date: "2026-05-23",
    time: "11:20",
    description: "Sinais vitais avaliados durante a primeira ronda do turno matinal. PA ligeiramente elevada (147/78), mas estável para o perfil clínico do utente.",
    actionTaken: "Aconselhado repouso e hidratação. Plano de Metformina diário mantido regular.",
    vitalsRecorded: { heartRate: 70, bloodPressure: "147/78", temperature: 36.4, spo2: 92 }
  },
  {
    id: "occ-102",
    residentId: "UT-003",
    residentName: "Helena Costa",
    residentAvatar: AVATARS[2],
    type: "vitals",
    date: "2026-05-23",
    time: "09:15",
    description: "Utente queixou-se de tonturas passageiras ao levantar-se da cama. Febricula registada (37.9°C).",
    actionTaken: "Administrada hidratação oral acrescida. Vigilância apertada durante as próximas horas regulamentada.",
    vitalsRecorded: { heartRate: 94, bloodPressure: "110/91", temperature: 37.9, spo2: 93 }
  },
  {
    id: "occ-103",
    residentId: "UT-012",
    residentName: "Bruno Pereira",
    residentAvatar: AVATARS[4],
    type: "fall",
    date: "2026-05-22",
    time: "18:40",
    description: "Queda ligeira de própria altura ao tentar passar da cadeira de rodas para a poltrona sem apoio de auxiliar.",
    actionTaken: "Devidamente auxiliado pela equipa técnica de enfermagem. Ausência de fraturas visíveis ou queixas álgicas agudas. Gelo local aplicado.",
    vitalsRecorded: { heartRate: 82, bloodPressure: "135/82" }
  },
  {
    id: "occ-104",
    residentId: "UT-035",
    residentName: "Luís Rodrigues",
    residentAvatar: AVATARS[3],
    type: "medication",
    date: "2026-05-23",
    time: "08:00",
    description: "Ausência de aceitação inicial para a toma de medicação matinal prescrita para o controlo da Artrite Crónica.",
    actionTaken: "Aconselhamento por parte da psicóloga Mariana Silva. Utente tomou a terapia em ambiente controlado com compota alimentar.",
    vitalsRecorded: { heartRate: 76, bloodPressure: "145/73" }
  }
];

// Consultas mapping (Pages 19 & 20)
const CONSULTAS_DATA: Record<string, { dr: string; spec: string; date: string; diagnosis: string }[]> = {
  "UT-001": [{ dr: "Dr. Jorge Santos", spec: "Cardiologia", date: "2026-05-15", diagnosis: "Hipertensão controlada com Losartan" }],
  "UT-003": [{ dr: "Dra. Antónia Ferreira", spec: "Neurologia", date: "2026-05-20", diagnosis: "Alzheimer Avançado, início de terapia cognitiva" }],
  "UT-011": [{ dr: "Dr. Jorge Santos", spec: "Neurologia", date: "2026-05-10", diagnosis: "Parkinson estável sob Levodopa" }]
};

// Exames de Diagnóstico mapping (Pages 23 & 24)
const EXAMES_DATA: Record<string, { type: string; result: string; date: string }[]> = {
  "UT-001": [{ type: "Ecocardiograma", result: "Fração de ejeção de 55% - normal", date: "2026-05-02" }],
  "UT-004": [{ type: "Análise de Sangue", result: "Hemoglobina Glicada 6.4%", date: "2026-05-12" }]
};

// Conversions for clean internal model types
function getAutonomy(mob: string): AutonomyType {
  const m = mob.toLowerCase();
  if (m.includes("independente")) return "independente";
  if (m.includes("acamado")) return "total";
  return "parcial"; // 'Com apoio' / 'Cadeira de rodas'
}

function getRiskLevel(score: number): RiskLevelType {
  if (score >= 90) return "alto";
  if (score >= 65) return "médio";
  return "baixo";
}

// Generate complete list of residents logically using raw DB rows
export const INITIAL_RESIDENTS: Resident[] = RAW_RESIDENTS.map((raw, idx) => {
  const defaultVitalsObj = VITALS_DATA[raw.id] || { temp: 36.6, bp: "120/80", spo2: 98, hr: 72 };
  const conditionList = CONDITIONS_DATA[raw.id] || ["Monitorização Geriátrica de Rotina"];
  
  const formattedMeds: Medication[] = (MEDS_DATA[raw.id] || []).map((med, medIdx) => ({
    id: `m-${raw.id}-${medIdx}`,
    name: med.name,
    dosage: med.dosage,
    schedule: med.schedule,
    status: medIdx === 0 ? "tomado" : "pendente",
    scheduleTimeLabel: med.timeLabel
  }));

  const initialActivities: ActivityLog[] = [];

  // 1. Add occurrences for this resident from INITIAL_OCCURRENCES if any
  const associatedOccurrences = INITIAL_OCCURRENCES.filter(occ => occ.residentId === raw.id);
  associatedOccurrences.forEach(occ => {
    initialActivities.push({
      id: `act-occ-${occ.id}`,
      time: occ.time,
      date: occ.date,
      description: `Ocorrência registada: ${occ.description}`,
      type: occ.type === 'vitals' ? 'info' : occ.type === 'fall' || occ.type === 'behavioral' ? 'critical' : 'routine'
    });
  });

  // 2. Add consultations if any
  const residentConsults = CONSULTAS_DATA[raw.id] || [];
  residentConsults.forEach((con, cIdx) => {
    initialActivities.push({
      id: `act-con-${raw.id}-${cIdx}`,
      time: "14:30",
      date: con.date,
      description: `Consulta médica (${con.spec}): ${con.dr}. Diagnóstico: ${con.diagnosis}.`,
      type: "routine"
    });
  });

  // 3. Add exams if any
  const residentExams = EXAMES_DATA[raw.id] || [];
  residentExams.forEach((exa, eIdx) => {
    initialActivities.push({
      id: `act-exa-${raw.id}-${eIdx}`,
      time: "11:00",
      date: exa.date,
      description: `Exame de diagnóstico (${exa.type}): ${exa.result}.`,
      type: "info"
    });
  });

  // 4. Add system alert if priority final is high (has priority limits exceeded)
  const hasAlert = raw.score >= 95 || raw.id === "UT-012" || raw.id === "UT-035" || raw.id === "UT-046";
  if (hasAlert) {
    initialActivities.push({
      id: `act-${raw.id}-alert`,
      time: "10:30",
      date: "2026-05-23",
      description: `Alerta Autónomo do Sistema: Índice de triagem clínica em patamar crítico (${raw.score} Pontos). Equipa médica notificada.`,
      type: "critical"
    });
  }

  // Sort activities chronologically (newest first)
  initialActivities.sort((a, b) => {
    const datetimeA = new Date(`${a.date}T${a.time}`).getTime();
    const datetimeB = new Date(`${b.date}T${b.time}`).getTime();
    return datetimeB - datetimeA;
  });

  // Calculate customized Portuguese 'utentes' columns deterministically
  const birthYear = 2026 - raw.age;
  const bDay = String((idx * 7) % 28 + 1).padStart(2, '0');
  const bMonth = String((idx * 3) % 12 + 1).padStart(2, '0');
  const computedBirthDate = `${bDay}/${bMonth}/${birthYear}`;

  const firstWord = raw.name.split(' ')[0];
  const femalePrefixes = ["Ana", "Helena", "Rita", "Catarina", "Maria", "Sofia", "Fernanda", "Paula", "Inês", "Teresa", "Mariana", "Beatriz", "Clara", "Margarida", "Leonor", "Alice", "Carolina"];
  const computedGender = femalePrefixes.includes(firstWord) ? "F" : "M";

  // Calculate standard age points and mobility points
  const computedAgePoints = raw.age >= 90 ? 25 : raw.age >= 80 ? 20 : raw.age >= 70 ? 15 : 10;
  
  let computedMobilityPoints = 15;
  const mobLower = raw.mob.toLowerCase();
  if (mobLower.includes("independente")) {
    computedMobilityPoints = 0;
  } else if (mobLower.includes("apoio")) {
    computedMobilityPoints = 15;
  } else if (mobLower.includes("cadeira")) {
    computedMobilityPoints = 30;
  } else if (mobLower.includes("acamado")) {
    computedMobilityPoints = 45;
  }

  return {
    id: raw.id,
    name: raw.name,
    room: raw.room,
    age: raw.age,
    avatar: AVATARS[idx % AVATARS.length],
    autonomy: getAutonomy(raw.mob),
    riskScore: raw.score,
    riskLevel: getRiskLevel(raw.score),
    bloodType: raw.blood,
    weight: raw.weight,
    conditions: conditionList,
    allergies: raw.allergies.length > 0 ? raw.allergies : ["Nenhuma alergia conhecida"],
    vitals: {
      heartRate: defaultVitalsObj.hr,
      bloodPressure: defaultVitalsObj.bp,
      spo2: defaultVitalsObj.spo2,
      temperature: defaultVitalsObj.temp,
      temperatureUnit: "°C"
    },
    medications: formattedMeds,
    activities: initialActivities,
    hasActiveAlert: hasAlert,

    // Custom Portuguese values
    birthDate: computedBirthDate,
    gender: computedGender,
    mobility: raw.mob,
    generalState: raw.state,
    responsibleFamily: raw.fam,
    familyContact: raw.tel,
    agePoints: computedAgePoints,
    mobilityPoints: computedMobilityPoints
  };
});

const MED_ID_MAP: Record<string, string> = {
  "UT-001_Metformina": "MED-001",
  "UT-001_Losartan": "MED-002",
  "UT-002_Diazepam": "MED-003",
  "UT-002_Montelucaste": "MED-004",
  "UT-003_Memantina": "MED-005",
  "UT-004_Enalapril": "MED-006",
  "UT-004_Omeprazol": "MED-007",
  "UT-005_Omeprazol": "MED-007",
  "UT-005_Enalapril": "MED-006",
  "UT-006_Metformina": "MED-001",
  "UT-007_Montelucaste": "MED-004",
  "UT-008_Metformina": "MED-001",
  "UT-009_Inalapril": "MED-013",
  "UT-009_Carvedilol": "MED-014",
  "UT-010_Sertralina": "MED-015",
  "UT-010_Mirtazapina": "MED-016",
  "UT-011_Levodopa": "MED-017",
  "UT-011_Entacapone": "MED-018",
  "UT-012_Memantina": "MED-005",
  "UT-013_Paracetamol": "MED-020",
  "UT-014_Sertralina": "MED-015",
  "UT-014_Mirtazapina": "MED-016",
  "UT-015_Paracetamol": "MED-020",
  "UT-016_Paracetamol": "MED-020",
  "UT-017_Ramipril": "MED-025",
  "UT-017_Carvedilol": "MED-014",
  "UT-018_Sertralina": "MED-015",
  "UT-018_Mirtazapina": "MED-016",
  "UT-019_Sertralina": "MED-015",
  "UT-019_Mirtazapina": "MED-016",
  "UT-020_Ramipril": "MED-025",
  "UT-021_Montelucaste": "MED-004",
  "UT-022_Montelucaste": "MED-004",
  "UT-023_Sertralina": "MED-015",
  "UT-023_Mirtazapina": "MED-016",
  "UT-024_Losartan": "MED-002",
  "UT-025_Ramipril": "MED-025",
  "UT-026_Montelucaste": "MED-004",
  "UT-027_Metformina": "MED-001",
  "UT-028_Montelucaste": "MED-004",
  "UT-029_Ramipril": "MED-025",
  "UT-030_Ramipril": "MED-025",
  "UT-030_Carvedilol": "MED-014",
  "UT-031_Ramipril": "MED-025",
  "UT-031_Carvedilol": "MED-014",
  "UT-032_Metformina": "MED-001",
  "UT-033_Montelucaste": "MED-004",
  "UT-034_Prednisolona": "MED-048",
  "UT-035_Memantina": "MED-005",
  "UT-035_Donepezilo": "MED-050",
  "UT-036_Memantina": "MED-005",
  "UT-036_Donepezilo": "MED-050",
  "UT-037_Metformina": "MED-001",
  "UT-038_Sacubitril": "MED-054",
  "UT-039_Sacubitril": "MED-054",
  "UT-040_Losartan": "MED-002",
  "UT-040_Amlodipina": "MED-057",
  "UT-041_Atorvastatina": "MED-058",
  "UT-041_Lorazepam": "MED-059",
  "UT-042_Diazepam": "MED-003",
  "UT-042_Warfarina": "MED-061",
  "UT-043_Metformina": "MED-001",
  "UT-043_Diazepam": "MED-003",
  "UT-044_Omeprazol": "MED-007",
  "UT-044_Warfarina": "MED-061",
  "UT-045_Metformina": "MED-001",
  "UT-045_Rivaroxabano": "MED-067",
  "UT-046_Memantina": "MED-005",
  "UT-046_Warfarina": "MED-061",
  "UT-047_Omeprazol": "MED-007",
  "UT-047_Budesonida": "MED-071",
  "UT-048_Memantina": "MED-005",
  "UT-048_Quetiapina": "MED-073",
  "UT-049_Enalapril": "MED-006",
  "UT-049_Atorvastatina": "MED-058",
  "UT-050_Enalapril": "MED-006",
  "UT-050_Ramipril": "MED-025",
  "UT-051_Omeprazol": "MED-007",
  "UT-051_Sinvastatina": "MED-079",
  "UT-052_Omeprazol": "MED-007",
  "UT-052_Sinemet": "MED-081",
  "UT-053_Sinvastatina": "MED-079",
  "UT-053_Amlodipina": "MED-057",
  "UT-054_Atorvastatina": "MED-058",
  "UT-054_Sinvastatina": "MED-079",
  "UT-055_Enalapril": "MED-006",
  "UT-055_Ramipril": "MED-025",
  "UT-056_Lorazepam": "MED-059",
  "UT-056_Alprazolam": "MED-089",
  "UT-057_Atorvastatina": "MED-058",
  "UT-057_Diazepam": "MED-003",
  "UT-058_Quetiapina": "MED-073",
  "UT-058_Tramadol": "MED-093",
  "UT-059_Memantina": "MED-005",
  "UT-059_Donepezilo": "MED-050",
  "UT-060_Metformina": "MED-001",
  "UT-060_Apixabano": "MED-097",
  "UT-061_Lorazepam": "MED-059",
  "UT-061_Memantina": "MED-005",
  "UT-062_Metformina": "MED-001",
  "UT-062_Omeprazol": "MED-007",
  "UT-063_Metformina": "MED-001",
  "UT-063_Enalapril": "MED-006",
  "UT-064_Losartan": "MED-002",
  "UT-064_Metformina": "MED-001",
  "UT-065_Lorazepam": "MED-059",
  "UT-065_Warfarina": "MED-061",
  "UT-066_Omeprazol": "MED-007",
  "UT-066_Memantina": "MED-005",
  "UT-067_Metformina": "MED-001",
  "UT-067_Sinvastatina": "MED-079",
  "UT-068_Atorvastatina": "MED-058",
  "UT-068_Diazepam": "MED-003",
  "UT-069_Metformina": "MED-001",
  "UT-069_Enalapril": "MED-006",
  "UT-070_Omeprazol": "MED-007",
  "UT-070_Atorvastatina": "MED-058",
  "UT-071_Atorvastatina": "MED-058",
  "UT-071_Diazepam": "MED-003",
  "UT-072_Atorvastatina": "MED-058",
  "UT-072_Sinemet": "MED-081",
  "UT-073_Metformina": "MED-001",
  "UT-073_Enalapril": "MED-006",
  "UT-074_Enalapril": "MED-006",
  "UT-074_Apixabano": "MED-097",
  "UT-075_Omeprazol": "MED-007",
  "UT-075_Memantina": "MED-005",
  "UT-076_Losartan": "MED-002",
  "UT-076_Diazepam": "MED-003",
  "UT-077_Atorvastatina": "MED-058",
  "UT-077_Diclofenac": "MED-131",
  "UT-078_Lorazepam": "MED-059",
  "UT-078_Diclofenac": "MED-131",
  "UT-079_Losartan": "MED-002",
  "UT-079_Diazepam": "MED-003",
  "UT-080_Losartan": "MED-002",
  "UT-080_Ramipril": "MED-025"
};

export const INITIAL_MEDICATIONS: MedicationRecord[] = [];

RAW_RESIDENTS.forEach((res) => {
  const mList = MEDS_DATA[res.id] || [];
  mList.forEach((m, idx) => {
    const hourMatch = m.schedule.match(/(\d{2}h)/) || m.schedule.match(/(\d{2}:\d{2})/);
    const resolvedHour = hourMatch ? hourMatch[0].replace('h', ':00') : '08:00';
    const isBidiario = m.schedule.toLowerCase().includes('bidiário') || m.schedule.toLowerCase().includes('e');
    const freq = isBidiario ? '2x ao dia' : '1x ao dia';
    
    const key = `${res.id}_${m.name}`;
    const medId = MED_ID_MAP[key] || `MED-NEW-${Date.now()}-${idx}`;
    
    INITIAL_MEDICATIONS.push({
      id: `med-rec-${res.id}-${idx}`,
      ID_Utente: res.id,
      Medicamento: m.name,
      Dosagem: m.dosage,
      Horário: resolvedHour,
      Frequência_dia: freq,
      Médico_Prescitor: 'Dr. Manuel Silva',
      Data_Início: '01/05/2026',
      Data_Fim: '01/10/2026',
      ID_Medicamento: medId
    });
  });
});

export const INITIAL_PEDIDOS: PedidoFamiliar[] = [
  {
    id: "ped-001",
    ID_Pedido: "PED-001",
    ID_Utente: "UT-001",
    Nome_Utente: "Carlos Silva",
    Familiar_Responsável: "Daniel Ferreira",
    Assunto: "Solicitação de Contacto Telefónico",
    Mensagem: "Gostaria de saber se o meu irmão Carlos está disponível para uma breve chamada telefónica hoje ao final do dia. Obrigado.",
    Data_Hora: "2026/06/02 18:30:00",
    Estado: "Pendente",
    Lar: "Monte do Sol"
  },
  {
    id: "ped-002",
    ID_Pedido: "PED-002",
    ID_Utente: "UT-002",
    Nome_Utente: "Maria Santos",
    Familiar_Responsável: "Teresa Santos",
    Assunto: "Agendamento / Aviso de Visita",
    Mensagem: "Estou a planear visitar a minha mãe amanhã (dia 3 de junho) por volta das 15:30. Estará no quarto a essa hora?",
    Data_Hora: "2026/06/02 20:15:00",
    Estado: "Pendente",
    Lar: "Pinhal de Coimbra"
  },
  {
    id: "ped-003",
    ID_Pedido: "PED-003",
    ID_Utente: "UT-003",
    Nome_Utente: "António Oliveira",
    Familiar_Responsável: "Carla Oliveira",
    Assunto: "Questão sobre Estado Clínico ou Medicação",
    Mensagem: "Reparei que ele andava um pouco queixoso das pernas no domingo. Poderiam verificar se a medicação para a circulação está a fazer o efeito esperado?",
    Data_Hora: "2026/06/02 21:00:00",
    Estado: "Pendente",
    Lar: "Bela Vista"
  }
];
