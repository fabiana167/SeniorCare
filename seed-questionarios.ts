import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Questionários fornecido pelo utilizador (80 registos)
const RAW_DATA = `RS-001	FAM-001	5
RS-002	FAM-002	4
RS-003	FAM-003	5
RS-004	FAM-004	3
RS-005	FAM-005	4
RS-006	FAM-006	5
RS-007	FAM-007	4
RS-008	FAM-008	5
RS-009	FAM-009	3
RS-010	FAM-010	4
RS-011	FAM-011	5
RS-012	FAM-012	4
RS-013	FAM-013	5
RS-014	FAM-014	3
RS-015	FAM-015	4
RS-016	FAM-016	5
RS-017	FAM-017	4
RS-018	FAM-018	3
RS-019	FAM-019	5
RS-020	FAM-020	4
RS-021	FAM-021	5
RS-022	FAM-022	4
RS-023	FAM-023	3
RS-024	FAM-024	5
RS-025	FAM-025	4
RS-026	FAM-026	5
RS-027	FAM-027	3
RS-028	FAM-028	4
RS-029	FAM-029	5
RS-030	FAM-030	4
RS-031	FAM-031	5
RS-032	FAM-032	3
RS-033	FAM-033	4
RS-034	FAM-034	5
RS-035	FAM-035	4
RS-036	FAM-036	3
RS-037	FAM-037	5
RS-038	FAM-038	4
RS-039	FAM-039	5
RS-040	FAM-040	3
RS-041	FAM-041	4
RS-042	FAM-042	5
RS-043	FAM-043	4
RS-044	FAM-044	3
RS-045	FAM-045	5
RS-046	FAM-046	4
RS-047	FAM-047	5
RS-048	FAM-048	3
RS-049	FAM-049	4
RS-050	FAM-050	5
RS-051	FAM-051	4
RS-052	FAM-052	5
RS-053	FAM-053	3
RS-054	FAM-054	4
RS-055	FAM-055	5
RS-056	FAM-056	4
RS-057	FAM-057	3
RS-058	FAM-058	5
RS-059	FAM-059	4
RS-060	FAM-060	5
RS-061	FAM-061	3
RS-062	FAM-062	4
RS-063	FAM-063	5
RS-064	FAM-064	4
RS-065	FAM-065	3
RS-066	FAM-066	5
RS-067	FAM-067	4
RS-068	FAM-068	5
RS-069	FAM-069	3
RS-070	FAM-070	4
RS-071	FAM-071	5
RS-072	FAM-072	4
RS-073	FAM-073	3
RS-074	FAM-074	5
RS-075	FAM-075	4
RS-076	FAM-076	5
RS-077	FAM-077	3
RS-078	FAM-078	4
RS-079	FAM-079	5
RS-080	FAM-080	4`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Questionários...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);
  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 3) {
      parts = line.split(/\s+/).map(p => p.trim());
    }

    if (parts.length < 3) {
      console.error(`✗ Erro ao processar linha: "${line}". Esperadas pelo menos 3 colunas, obtidas ${parts.length}.`);
      continue;
    }

    const idResposta = parts[0];
    const idFamiliar = parts[1];
    const pontuacaoSatisfacao = parseInt(parts[2], 10);

    const docId = `res-${idResposta}`;
    const docRef = doc(db, 'Questionários', docId);

    const data = {
      id: docId,
      ID_Resposta: idResposta,
      ID_Familiar: idFamiliar,
      Pontuação_Satisfação: pontuacaoSatisfacao
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar resposta de questionário ${idResposta}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} respostas de questionários carregadas no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
