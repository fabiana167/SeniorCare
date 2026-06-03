import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Funcionários fornecido pelo utilizador (20 registos)
const RAW_DATA = `FUNC-001	Ana Ribeiro\tEnfermeiro/a\tCuidados de Saúde\t2022-01-15\t
FUNC-002	João Martins\tAuxiliar\tApoio ao Utente\t2021-09-10\t
FUNC-003	Carla Ferreira\tAuxiliar\tApoio ao Utente\t2023-03-22\t
FUNC-004\tMiguel Lopes\tEnfermeiro/a\tCuidados de Saúde\t2021-11-05\t
FUNC-005\tSofia Almeida\tAdministração\tAdministração\t2022-06-18\t
FUNC-006\tRicardo Santos\tTécnico de Reabilitação\tReabilitação\t2022-04-14\t
FUNC-007\tBeatriz Costa\tMédico/a\tDireção Clínica\t2020-08-30\t
FUNC-008\tTiago Correia\tEnfermeiro/a\tCuidados de Saúde\t2024-01-12\t
FUNC-009\tMariana Silva\tPsicologia\tApoio Psicossocial\t2023-02-07\t
FUNC-010\tPedro Rocha\tAuxiliar\tApoio ao Utente\t2021-12-19\t2025/12/15
FUNC-011\tInês Gomes\tNutricionista\tApoio Clínico\t2023-09-01\t
FUNC-012\tLuís Fonseca\tTécino Informatico\tSistemas de Informação\t2020-05-27\t
FUNC-013\tDaniela Pinto\tEnfermeiro/a\tCuidados de Saúde\t2024-02-10\t
FUNC-014\tAndré Carvalho\tMédico/a\tDireção Clínica\t2022-07-16\t
FUNC-015\tPatrícia Mendes\tReceção\tAtendimento\t2023-10-03\t
FUNC-016\tHugo Fernandes\tAuxiliar\tApoio ao Utente\t2022-05-11\t
FUNC-017\tCatarina Sousa\tEnfermeiro/a\tCuidados de Saúde\t2021-03-09\t
FUNC-018\tRafael Oliveira\tFisioterapeuta\tReabilitação\t2022-11-21\t
FUNC-019\tVera Matos\tAdministração\tAdministração\t2023-04-17\t
FUNC-020\tNuno Pereira\tAuxiliar\tApoio ao Utente\t2024-01-08`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Funcionários...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);
  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 5) {
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }

    if (parts.length < 5) {
      console.error(`✗ Erro ao processar linha: "${line}". Esperadas pelo menos 5 colunas, obtidas ${parts.length}.`);
      continue;
    }

    const idFuncionario = parts[0];
    const nome = parts[1];
    const cargo = parts[2];
    const departamento = parts[3];
    const dataEntrada = parts[4];
    const dataSaida = parts[5] || '';

    const docId = `func-${idFuncionario.toLowerCase()}`;
    const docRef = doc(db, 'Funcionários', docId);

    const data = {
      id: docId,
      ID_Funcionário: idFuncionario,
      Nome: nome,
      Cargo: cargo,
      Departamento: departamento,
      'Data de Entrada': dataEntrada,
      'Data de Saída': dataSaida
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar funcionário ${idFuncionario}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} funcionários carregados no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
