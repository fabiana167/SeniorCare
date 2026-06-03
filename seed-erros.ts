import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Erros fornecido pelo utilizador (20 registos)
const RAW_DATA = `ER-001\tUT-001\t2024/01/10\tDose incorreta\tAlta\tAntes
ER-002\tUT-002\t2024/01/15\tAtraso na medicação\tMédia\tAntes
ER-003\tUT-003\t2024/02/01\tMedicamento errado\tAlta\tAntes
ER-004\tUT-004\t2024/02/10\tOmissão de dose\tAlta\tAntes
ER-005\tUT-005\t2024/02/20\tDuplicação de dose\tMédia\tAntes
ER-006\tUT-006\t2024/03/05\tDose incorreta\tAlta\tAntes
ER-007\tUT-007\t2024/03/18\tAtraso na medicação\tMédia\tAntes
ER-008\tUT-008\t2024/04/02\tMedicamento errado\tAlta\tAntes
ER-009\tUT-009\t2024/04/15\tOmissão de dose\tAlta\tAntes
ER-010\tUT-010\t2024/04/28\tDuplicação de dose\tMédia\tAntes
ER-011\tUT-011\t2025/02/05\tAtraso na medicação\tBaixa\tAntes
ER-012\tUT-012\t2025/02/18\tDose incorreta\tMédia\tAntes
ER-013\tUT-013\t2025/03/02\tOmissão de dose\tMédia\tDepois
ER-014\tUT-014\t2025/03/15\tAtraso na medicação\tBaixa\tDepois
ER-015\tUT-015\t2025/03/28\tDose incorreta\tMédia\tDepois
ER-016\tUT-016\t2025/04/10\tAtraso na medicação\tBaixa\tDepois
ER-017\tUT-017\t2025/04/22\tMedicamento errado\tMédia\tDepois
ER-018\tUT-018\t2025/05/03\tOmissão de dose\tMédia\tDepois
ER-019\tUT-019\t2025/05/14\tAtraso na medicação\tBaixa\tDepois
ER-020\tUT-020\t2025/05/20\tDose incorreta\tMédia\tDepois`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Erros...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);
  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 6) {
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }

    if (parts.length < 6) {
      console.error(`✗ Erro ao processar linha: "${line}". Esperadas pelo menos 6 colunas, obtidas ${parts.length}.`);
      continue;
    }

    const idErro = parts[0];
    const idUtente = parts[1];
    const dataErro = parts[2];
    const tipoErro = parts[3];
    const gravidade = parts[4];
    const periodo = parts[5];

    const docId = `err-${idErro.toLowerCase()}`;
    const docRef = doc(db, 'Erros', docId);

    const data = {
      id: docId,
      ID_Erro: idErro,
      ID_Utente: idUtente,
      Data_Erro: dataErro,
      Tipo_Erro: tipoErro,
      Gravidade: gravidade,
      'Período': periodo
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar erro ${idErro}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} erros carregados no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
