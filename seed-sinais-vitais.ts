import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset fornecido pelo utilizador (80 Utentes)
const RAW_DATA = `UT-001	2026-05-18 08:14	36,4	0	147/78	10	92	5	167	20	70	10	45
UT-002	2026-05-19 16:14	37,1	5	105/69	5	99	10	118	10	77	10	40
UT-003	2026-05-19 05:14	37,9	5	110/91	0	93	5	157	20	94	15	45
UT-004	2026-05-18 07:14	37,9	5	144/94	10	95	10	161	20	79	10	55
UT-005	2026-05-20 01:14	36,1	0	131/95	10	93	5	101	10	72	10	35
UT-006	2026-05-17 20:14	36,2	0	121/72	0	93	5	156	20	75	10	35
UT-007	2026-05-18 23:14	37,9	5	116/74	0	96	10	84	5	66	5	25
UT-008	2026-05-19 18:14	37,9	5	125/75	0	94	5	122	15	61	5	30
UT-009	2026-05-20 08:14	37,4	5	110/86	0	100	10	157	20	72	10	45
UT-010	2026-05-19 12:14	36,3	0	112/77	0	99	10	148	15	64	5	30
UT-011	2026-05-19 07:14	36,5	5	130/87	10	93	5	87	5	69	5	30
UT-012	2026-05-19 14:14	36,1	0	134/80	10	95	10	128	15	80	10	45
UT-013	2026-05-20 00:14	37,4	5	129/91	0	93	5	171	20	96	15	45
UT-014	2026-05-19 02:14	37,1	5	143/76	10	93	5	100	10	86	15	45
UT-015	2026-05-19 21:14	36,5	5	113/87	0	96	10	159	20	68	5	40
UT-016	2026-05-19 17:14	36,5	5	145/72	10	94	5	70	0	86	15	35
UT-017	2026-05-19 03:14	37,2	5	121/85	0	100	10	153	20	88	15	50
UT-018	2026-05-17 23:14	36,2	0	150/89	10	95	10	160	20	70	10	50
UT-019	2026-05-18 12:14	36,5	5	136/71	10	97	10	165	20	90	15	60
UT-020	2026-05-19 00:14	36,7	5	137/74	10	95	10	137	15	86	15	55
UT-021	2026-05-17 22:14	37,7	5	128/94	0	95	10	147	15	82	10	40
UT-022	2026-05-18 13:14	37,6	5	133/73	10	95	10	130	15	61	5	45
UT-023	2026-05-19 02:14	36,4	0	117/84	0	93	5	154	20	73	10	35
UT-024	2026-05-17 21:14	36,4	0	149/71	10	100	10	108	10	89	15	45
UT-025	2026-05-18 01:14	36,1	0	115/72	0	98	10	82	5	83	10	25
UT-026	2026-05-20 02:14	37,5	5	123/82	0	98	10	128	15	81	10	40
UT-027	2026-05-20 13:14	37	5	137/75	10	94	5	118	10	94	15	45
UT-028	2026-05-18 17:14	37,5	5	119/77	0	93	5	88	5	76	10	25
UT-029	2026-05-19 18:14	37,9	5	138/73	10	97	10	161	20	65	5	50
UT-030	2026-05-20 11:14	36,7	5	121/76	0	97	10	168	20	91	15	50
UT-031	2026-05-18 00:14	37,7	5	145/73	10	100	10	178	20	67	5	50
UT-032	2026-05-19 23:14	37,6	5	125/79	0	93	5	76	0	75	10	20
UT-033	2026-05-18 18:14	37,6	5	121/94	0	99	10	159	20	90	15	50
UT-034	2026-05-20 03:14	36,7	5	128/79	0	99	10	147	15	87	15	45
UT-035	2026-05-17 22:14	37	5	145/73	10	96	10	169	20	76	10	55
UT-036	2026-05-18 09:14	37,6	5	114/74	0	97	10	152	20	64	5	40
UT-037	2026-05-20 10:14	37	5	150/87	10	96	10	152	20	79	10	55
UT-038	2026-05-19 17:14	37	5	142/84	10	99	10	109	10	91	15	50
UT-039	2026-05-17 21:14	36,1	0	112/74	0	97	10	172	20	90	15	45
UT-040	2026-05-17 21:14	37,5	5	140/93	10	92	5	160	20	68	5	45
UT-041	2026-05-17 17:14	36,5	5	145/92	10	96	10	87	5	66	5	35
UT-042	2026-05-19 01:14	36,9	5	144/86	10	99	10	87	5	92	15	45
UT-043	2026-05-17 21:14	37,8	5	129/92	0	93	5	151	20	78	10	40
UT-044	2026-05-18 11:14	36,5	5	110/93	0	95	10	144	15	64	5	35
UT-045	2026-05-19 07:14	36,4	0	116/89	0	92	5	127	15	98	15	35
UT-046	2026-05-18 02:14	37,8	5	145/83	10	98	10	141	15	93	15	55
UT-047	2026-05-17 22:14	36,9	5	140/94	10	97	10	96	5	83	10	40
UT-048	2026-05-18 14:14	36,1	0	150/91	10	99	10	154	20	91	15	55
UT-049	2026-05-18 06:14	37,3	5	131/88	10	93	5	137	15	62	5	40
UT-050	2026-05-18 13:14	36,9	5	147/91	10	98	10	80	5	99	15	45
UT-051	2026-05-19 03:14	36,6	5	141/74	10	93	5	91	5	87	15	40
UT-052	2026-05-17 16:14	36,4	0	145/70	10	99	10	160	20	73	10	50
UT-053	2026-05-17 21:14	36,3	0	111/85	0	93	5	107	10	86	15	30
UT-054	2026-05-19 02:14	37,5	5	114/88	0	93	5	172	20	94	15	45
UT-055	2026-05-19 20:14	36,4	0	138/89	10	92	5	180	20	82	10	45
UT-056	2026-05-18 17:14	37,7	5	115/84	0	93	5	169	20	75	10	40
UT-057	2026-05-19 02:14	37,4	5	133/84	10	99	10	111	10	97	15	50
UT-058	2026-05-19 16:14	36,1	0	150/79	10	95	10	124	15	65	5	40
UT-059	2026-05-18 17:14	37,9	5	130/95	10	94	5	101	10	77	10	40
UT-060	2026-05-18 08:14	36,8	5	135/72	10	100	10	138	15	99	15	55
UT-061	2026-05-20 05:14	36,5	5	146/90	10	93	5	133	15	89	15	50
UT-062	2026-05-18 20:14	36,2	0	139/70	10	97	10	95	5	78	10	35
UT-063	2026-05-18 06:14	37,3	5	118/77	0	96	10	103	10	80	10	35
UT-064	2026-05-17 15:14	36,5	5	139/73	10	94	5	85	5	60	5	30
UT-065	2026-05-20 06:14	36,2	0	134/74	10	98	10	95	5	93	15	40
UT-066	2026-05-19 19:14	37,1	5	122/95	0	99	10	139	15	79	10	40
UT-067	2026-05-18 22:14	37,5	5	128/74	0	94	5	163	20	60	5	35
UT-068	2026-05-19 17:14	36,9	5	112/79	0	92	5	110	10	76	10	30
UT-069	2026-05-19 00:14	38	5	140/73	10	96	10	170	20	85	15	60
UT-070	2026-05-19 10:14	37,6	5	118/71	0	98	10	80	5	87	15	35
UT-071	2026-05-18 11:14	37,8	5	131/92	10	95	10	76	0	90	15	40
UT-072	2026-05-18 02:14	37	5	150/73	10	92	5	100	10	83	10	40
UT-073	2026-05-20 00:14	36	0	133/87	10	96	10	108	10	66	5	35
UT-074	2026-05-19 09:14	36,7	5	129/83	0	97	10	117	10	76	10	35
UT-075	2026-05-18 00:14	36,8	5	112/87	0	95	10	163	20	83	10	45
UT-076	2026-05-20 07:14	37,2	5	113/91	0	93	5	153	20	61	5	35
UT-077	2026-05-20 13:14	36	0	115/73	0	99	10	89	5	65	5	20
UT-078	2026-05-20 00:14	36,8	5	147/85	10	99	10	93	5	99	15	45
UT-079	2026-05-19 09:14	37,1	5	134/82	10	95	10	80	5	89	15	45
UT-080	2026-05-18 14:14	37,4	5	112/75	0	99	10	87	5	86	15	35`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Sinais vitais...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);

  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Tentar separar por tabulações; caso falhe (por ex. conversão de tabs para espaços múltiplos), usar regex inteligente
    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 13) {
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }

    if (parts.length < 13) {
      console.error(`✗ Erro ao processar linha inválida: "${line}". Obtido ${parts.length} colunas.`);
      continue;
    }

    const idUtente = parts[0];
    const dataHora = parts[1];
    const temperatura = parseFloat(parts[2].replace(',', '.'));
    const tempPts = parseInt(parts[3], 10);
    const tensaoArterial = parts[4];
    const tensaoPts = parseInt(parts[5], 10);
    const saturacao = parseInt(parts[6], 10);
    const satPts = parseInt(parts[7], 10);
    const glicemia = parseFloat(parts[8].replace(',', '.'));
    const glicemiaPts = parseInt(parts[9], 10);
    const freqCardiaca = parseInt(parts[10], 10);
    const freqPts = parseInt(parts[11], 10);
    const totalPts = parseInt(parts[12], 10);

    const docId = `sv-${idUtente}`;
    const vitalsDocRef = doc(db, 'Sinais vitais', docId);

    const data = {
      id: docId,
      ID_Utente: idUtente,
      Data_Hora: dataHora,
      Temperatura: temperatura,
      Temperatura_Pontos: tempPts,
      Tensão_Arterial: tensaoArterial,
      Tensão_Arterial_Pontos: tensaoPts,
      Saturação: saturacao,
      Saturação_Pontos: satPts,
      Glicemia: glicemia,
      Glicemia_Pontos: glicemiaPts,
      Frequência_Cardíaca: freqCardiaca,
      Frequência_Cardíaca_Pontos: freqPts,
      SinaisVitais_Pontos: totalPts
    };

    try {
      await setDoc(vitalsDocRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao mapear sinais vitais de ${idUtente}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} sinais vitais carregados no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
