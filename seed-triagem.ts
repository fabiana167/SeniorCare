import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Triagem fornecido pelo utilizador (80 registos)
const RAW_DATA = `TRI-001	UT-001	5	5	17	10	0	45	82	Alta	2026-05-20
TRI-002	UT-002	10	5	5	10	0	40	70	Média	2026-05-20
TRI-003	UT-003	0	15	20	0	0	45	80	Alta	2026-05-20
TRI-004	UT-004	0	15	13	20	0	55	103	Urgente	2026-05-20
TRI-005	UT-005	0	15	13	10	10	35	83	Alta	2026-05-20
TRI-006	UT-006	5	15	17	20	10	35	102	Urgente	2026-05-20
TRI-007	UT-007	10	10	5	20	0	25	70	Média	2026-05-20
TRI-008	UT-008	0	10	17	10	0	30	67	Média	2026-05-20
TRI-009	UT-009	5	10	15	10	0	45	85	Alta	2026-05-20
TRI-010	UT-010	5	15	6	0	10	30	66	Média	2026-05-20
TRI-011	UT-011	5	15	16	15	0	30	81	Alta	2026-05-20
TRI-012	UT-012	5	15	20	20	0	45	105	Urgente	2026-05-20
TRI-013	UT-013	5	15	5	15	10	45	95	Urgente	2026-05-20
TRI-014	UT-014	0	10	6	0	0	45	61	Média	2026-05-20
TRI-015	UT-015	0	5	5	10	0	40	60	Média	2026-05-20
TRI-016	UT-016	10	15	5	10	10	35	85	Alta	2026-05-20
TRI-017	UT-017	5	15	15	20	0	50	105	Urgente	2026-05-20
TRI-018	UT-018	5	15	6	15	0	50	91	Urgente	2026-05-20
TRI-019	UT-019	5	10	6	20	0	60	101	Urgente	2026-05-20
TRI-020	UT-020	10	5	15	15	10	55	110	Urgente	2026-05-20
TRI-021	UT-021	5	15	5	0	0	40	65	Média	2026-05-20
TRI-022	UT-022	5	5	5	10	10	45	80	Alta	2026-05-20
TRI-023	UT-023	0	10	6	20	0	35	71	Média	2026-05-20
TRI-024	UT-024	5	15	13	20	10	45	108	Urgente	2026-05-20
TRI-025	UT-025	10	15	15	10	0	25	75	Alta	2026-05-20
TRI-026	UT-026	10	5	5	20	0	40	80	Alta	2026-05-20
TRI-027	UT-027	5	5	17	15	0	45	87	Alta	2026-05-20
TRI-028	UT-028	0	5	5	15	10	25	60	Média	2026-05-20
TRI-029	UT-029	0	10	15	20	0	50	95	Urgente	2026-05-20
TRI-030	UT-030	0	15	15	15	0	50	95	Urgente	2026-05-20
TRI-031	UT-031	5	15	15	15	0	50	100	Urgente	2026-05-20
TRI-032	UT-032	0	5	17	20	10	20	72	Média	2026-05-20
TRI-033	UT-033	5	5	5	20	0	50	85	Alta	2026-05-20
TRI-034	UT-034	5	5	5	15	0	45	75	Alta	2026-05-20
TRI-035	UT-035	10	15	20	10	10	55	120	Urgente	2026-05-20
TRI-036	UT-036	0	15	20	10	10	40	95	Urgente	2026-05-20
TRI-037	UT-037	5	5	17	0	0	55	82	Alta	2026-05-20
TRI-038	UT-038	5	15	15	10	0	50	95	Urgente	2026-05-20
TRI-039	UT-039	5	10	15	20	0	45	95	Urgente	2026-05-20
TRI-040	UT-040	10	5	13	20	0	45	93	Urgente	2026-05-20
TRI-041	UT-041	5	10	17	20	10	35	97	Urgente	2026-05-20
TRI-042	UT-042	0	5	6	0	0	45	56	Baixa	2026-05-20
TRI-043	UT-043	5	10	17	0	0	40	72	Média	2026-05-20
TRI-044	UT-044	5	15	20	20	0	35	95	Urgente	2026-05-20
TRI-045	UT-045	0	10	6	10	10	35	71	Média	2026-05-20
TRI-046	UT-046	5	10	20	20	0	55	110	Urgente	2026-05-20
TRI-047	UT-047	0	10	5	15	0	40	70	Média	2026-05-20
TRI-048	UT-048	0	15	20	0	10	55	100	Urgente	2026-05-20
TRI-049	UT-049	5	10	15	0	10	40	80	Alta	2026-05-20
TRI-050	UT-050	0	10	15	15	0	45	85	Alta	2026-05-20
TRI-051	UT-051	0	5	15	0	0	40	60	Média	2026-05-20
TRI-052	UT-052	0	10	16	0	0	50	76	Alta	2026-05-20
TRI-053	UT-053	5	10	13	10	10	30	78	Alta	2026-05-20
TRI-054	UT-054	0	10	15	0	0	45	70	Média	2026-05-20
TRI-055	UT-055	0	5	15	20	0	45	85	Alta	2026-05-20
TRI-056	UT-056	5	15	6	10	0	40	76	Alta	2026-05-20
TRI-057	UT-057	10	5	6	0	10	50	81	Alta	2026-05-20
TRI-058	UT-058	0	5	5	10	0	40	60	Média	2026-05-20
TRI-059	UT-059	0	10	20	20	0	40	90	Urgente	2026-05-20
TRI-060	UT-060	5	10	17	0	0	55	87	Alta	2026-05-20
TRI-061	UT-061	0	15	20	10	0	50	95	Urgente	2026-05-20
TRI-062	UT-062	5	5	17	10	10	35	82	Alta	2026-05-20
TRI-063	UT-063	0	15	13	15	0	35	78	Alta	2026-05-20
TRI-064	UT-064	0	10	5	0	0	30	45	Baixa	2026-05-20
TRI-065	UT-065	0	5	6	0	10	40	61	Média	2026-05-20
TRI-066	UT-066	5	5	20	10	0	40	80	Alta	2026-05-20
TRI-067	UT-067	10	15	15	0	10	35	85	Alta	2026-05-20
TRI-068	UT-068	0	10	6	10	0	30	56	Baixa	2026-05-20
TRI-069	UT-069	5	5	15	20	0	60	105	Urgente	2026-05-20
TRI-070	UT-070	5	10	13	20	10	35	93	Urgente	2026-05-20
TRI-071	UT-071	0	5	6	20	0	40	71	Média	2026-05-20
TRI-072	UT-072	0	5	16	15	0	40	76	Alta	2026-05-20
TRI-073	UT-073	0	10	15	20	0	35	80	Alta	2026-05-20
TRI-074	UT-074	5	5	6	10	0	35	61	Média	2026-05-20
Nice label TRI-075 for UT-075:
TRI-075	UT-075	10	10	20	15	0	45	100	Urgente	2026-05-20
TRI-076	UT-076	5	15	17	0	0	35	72	Média	2026-05-20
TRI-077	UT-077	0	5	5	20	10	20	60	Média	2026-05-20
TRI-078	UT-078	5	10	5	10	0	45	75	Alta	2026-05-20
TRI-079	UT-079	5	5	6	15	0	45	76	Alta	2026-05-20
TRI-080	UT-080	5	5	13	0	10	35	68	Média	2026-05-20`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Triagem...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);
  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 11) {
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }

    if (parts.length < 11) {
      console.error(`✗ Erro ao processar linha: "${line}". Esperadas pelo menos 11 colunas, obtidas ${parts.length}.`);
      continue;
    }

    const idTriagem = parts[0];
    const idUtente = parts[1];
    const idadePontos = parseInt(parts[2], 10);
    const gravidadePontos = parseInt(parts[3], 10);
    const patologiaPontos = parseInt(parts[4], 10);
    const mobilidadePontos = parseInt(parts[5], 10);
    const internamentosPontos = parseInt(parts[6], 10);
    const sinaisVitaisPontos = parseInt(parts[7], 10);
    const scoreTotal = parseInt(parts[8], 10);
    const prioridadeFinal = parts[9];
    const ultimaAtualizacao = parts[10];

    const docId = `tr-${idTriagem.toLowerCase()}`;
    const docRef = doc(db, 'Triagem', docId);

    const data = {
      id: docId,
      ID_Triagem: idTriagem,
      ID_Utente: idUtente,
      Idade_Pontos: idadePontos,
      Gravidade_Pontos: gravidadePontos,
      Patologia_Pontos: patologiaPontos,
      Mobilidade_Pontos: mobilidadePontos,
      Internamentos_Pontos: internamentosPontos,
      SinaisVitais_Pontos: sinaisVitaisPontos,
      Score_Total: scoreTotal,
      Prioridade_Final: prioridadeFinal,
      Última_Atualização: ultimaAtualizacao
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar triagem ${idTriagem}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} registos de triagem carregados no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
