import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Exames fornecido pelo utilizador (80 registos)
const RAW_DATA = `EXA-001\tUT-001\tRaio-X\tFratura no fémur\t2025-11-17\traiox10729.pdf
EXA-002\tUT-002\tECG\tArritmia cardíaca ligeira\t2026-04-16\tecg48392.pdf
EXA-003\tUT-003\tRaio-X\tInfiltração pulmonar\t2026-01-05\traiox28471.pdf
EXA-004\tUT-004\tAnálises\tLeucócitos elevados\t2026-04-17\tanalises91827.pdf
EXA-005\tUT-005\tRaio-X\tFratura na costela\t2025-10-05\traiox55713.pdf
EXA-006\tUT-006\tTAC\tHemorragia intracraniana\t2025-06-17\ttac77102.pdf
EXA-007\tUT-007\tTAC\tApendicite aguda\t2026-01-11\ttac44819.pdf
EXA-008\tUT-008\tTAC\tTrombo pulmonar\t2026-04-30\ttac66280.pdf
EXA-009\tUT-009\tECG\tTaquicardia\t2025-06-12\tecg19374.pdf
EXA-010\tUT-010\tRaio-X\tLuxação do ombro\t2026-03-26\traiox82015.pdf
EXA-011\tUT-011\tTAC\tEdema cerebral\t2025-10-19\ttac37481.pdf
EXA-012\tUT-012\tRaio-X\tFratura do rádio\t2025-11-21\traiox59126.pdf
EXA-013\tUT-013\tTAC\tPneumotórax\t2026-03-26\ttac20837.pdf
EXA-014\tUT-014\tAnálises\tAnemia moderada\t2025-10-24\tanalises74618.pdf
EXA-015\tUT-015\tRaio-X\tEscoliose lombar\t2026-01-10\traiox93502.pdf
EXA-016\tUT-016\tTAC\tAVC isquémico\t2026-04-13\ttac18465.pdf
EXA-017\tUT-017\tECG\tBradicardia\t2025-12-06\tecg67291.pdf
EXA-018\tUT-018\tAnálises\tProteína C reativa elevada\t2025-09-06\tanalises31957.pdf
EXA-019\tUT-019\tRaio-X\tFratura do tornozelo\t2025-10-06\traiox45028.pdf
EXA-020\tUT-020\tTAC\tLesão hepática\t2025-07-25\ttac78134.pdf
EXA-021\tUT-021\tRaio-X\tDerrame pleural\t2025-07-27\traiox26395.pdf
EXA-022\tUT-022\tECG\tFibrilhação auricular\t2025-06-21\tecg81472.pdf
EXA-023\tUT-023\tAnálises\tHiperglicemia\t2025-07-23\tanalises52916.pdf
EXA-024\tUT-024\tRaio-X\tFratura da clavícula\t2025-12-06\traiox19048.pdf
EXA-025\tUT-025\tRaio-X\tOsteoartrose avançada\t2025-12-23\traiox60731.pdf
EXA-026\tUT-026\tAnálises\tDéfice de ferro\t2025-07-07\tanalises88264.pdf
EXA-027\tUT-027\tTAC\tMassa pulmonar suspeita\t2026-04-10\ttac31580.pdf
EXA-028\tUT-028\tTAC\tHematoma subdural\t2025-06-05\ttac97024.pdf
EXA-029\tUT-029\tAnálises\tInsuficiência renal ligeira\t2025-11-14\tanalises46183.pdf
EXA-030\tUT-030\tRaio-X\tFratura no fémur\t2025-06-15\traiox72815.pdf
EXA-031\tUT-031\tAnálises\tArritmia cardíaca ligeira\t2025-10-01\tanalises15497.pdf
EXA-032\tUT-032\tRaio-X\tInfiltração pulmonar\t2025-06-30\traiox84620.pdf
EXA-033\tUT-033\tAnálises\tLeucócitos elevados\t2026-04-28\tanalises53741.pdf
EXA-034\tUT-034\tECG\tFratura na costela\t2025-06-26\tecg29184.pdf
EXA-035\tUT-035\tTAC\tHemorragia intracraniana\t2026-02-20\ttac60317.pdf
EXA-036\tUT-036\tRaio-X\tApendicite aguda\t2026-03-17\traiox97531.pdf
EXA-037\tUT-037\tAnálises\tTrombo pulmonar\t2025-10-06\tanalises41826.pdf
EXA-038\tUT-038\tECG\tTaquicardia\t2025-09-08\tecg76042.pdf
EXA-039\tUT-039\tECG\tLuxação do ombro\t2025-07-20\tecg18493.pdf
EXA-040\tUT-040\tTAC\tEdema cerebral\t2025-08-20\ttac52970.pdf
EXA-041\tUT-041\tRaio-X\tFratura do rádio\t2026-03-29\traiox31768.pdf
EXA-042\tUT-042\tAnálises\tPneumotórax\t2026-05-12\tanalises84592.pdf
EXA-043\tUT-043\tTAC\tAnemia moderada\t2025-05-25\ttac26041.pdf
EXA-044\tUT-044\tECG\tEscoliose lombar\t2025-10-22\tecg91854.pdf
EXA-045\tUT-045\tRaio-X\tAVC isquémico\t2026-03-09\traiox47182.pdf
EXA-046\tUT-046\tRaio-X\tBradicardia\t2025-08-18\traiox60249.pdf
EXA-047\tUT-047\tTAC\tProteína C reativa elevada\t2025-12-19\ttac75310.pdf
EXA-048\tUT-048\tRaio-X\tFratura do tornozelo\t2025-09-04\traiox18573.pdf
EXA-049\tUT-049\tRaio-X\tLesão hepática\t2026-02-17\traiox92461.pdf
EXA-050\tUT-050\tTAC\tDerrame pleural\t2025-12-08\ttac34892.pdf
EXA-051\tUT-051\tAnálises\tFibrilhação auricular\t2025-09-27\tanalises70618.pdf
EXA-052\tUT-052\tAnálises\tHiperglicemia\t2026-01-10\tanalises28149.pdf
EXA-053\tUT-053\tTAC\tFratura da clavícula\t2025-11-22\ttac86420.pdf
EXA-054\tUT-054\tECG\tOsteoartrose avançada\t2025-07-18\tecg53071.pdf
EXA-055\tUT-055\tTAC\tDéfice de ferro\t2025-05-21\ttac14792.pdf
EXA-056\tUT-056\tAnálises\tMassa pulmonar suspeita\t2026-02-03\tanalises69325.pdf
EXA-057\tUT-057\tAnálises\tHematoma subdural\t2025-10-12\tanalises47581.pdf
EXA-058\tUT-058\tRaio-X\tInsuficiência renal ligeira\t2026-05-15\traiox80214.pdf
EXA-059\tUT-059\tAnálises\tFratura no fémur\t2025-10-31\tanalises23968.pdf
EXA-060\tUT-060\tECG\tArritmia cardíaca ligeira\t2025-10-31\tecg61487.pdf
EXA-061\tUT-061\tRaio-X\tInfiltração pulmonar\t2025-07-30\traiox35029.pdf
EXA-062\tUT-062\tAnálises\tLeucócitos elevados\t2026-03-03\tanalises92048.pdf
EXA-063\tUT-063\tAnálises\tFratura na costela\t2026-03-11\tanalises18472.pdf
EXA-064\tUT-064\tECG\tHemorragia intracraniana\t2026-04-11\tecg57103.pdf
EXA-065\tUT-065\tECG\tApendicite aguda\t2025-08-03\tecg74268.pdf
EXA-066\tUT-066\tTAC\tTrombo pulmonar\t2026-05-19\ttac30581.pdf
EXA-067\tUT-067\tRaio-X\tTaquicardia\t2025-09-07\traiox61845.pdf
EXA-068\tUT-068\tECG\tLuxação do ombro\t2025-07-19\tecg29714.pdf
EXA-069\tUT-069\tTAC\tEdema cerebral\t2025-11-11\ttac85026.pdf
EXA-070\tUT-070\tTAC\tFratura do rádio\t2025-08-08\ttac48173.pdf
EXA-071\tUT-071\tRaio-X\tPneumotórax\t2026-01-23\traiox76492.pdf
EXA-072\tUT-072\tECG\tAnemia moderada\t2025-06-01\tecg13058.pdf
EXA-073\tUT-073\tAnálises\tEscoliose lombar\t2026-03-04\tanalises69380.pdf
EXA-074\tUT-074\tRaio-X\tAVC isquémico\t2025-06-05\traiox41857.pdf
EXA-075\tUT-075\tECG\tBradicardia\t2026-03-14\tecg27591.pdf
EXA-076\tUT-076\tTAC\tProteína C reativa elevada\t2025-05-25\ttac96284.pdf
EXA-077\tUT-077\tTAC\tFratura do tornozelo\t2026-04-24\ttac70315.pdf
EXA-078\tUT-078\tTAC\tLesão hepática\t2026-04-26\ttac58421.pdf
EXA-079\tUT-079\tTAC\tDerrame pleural\t2025-06-19\ttac14680.pdf
EXA-080\tUT-080\tAnálises\tFibrilhação auricular\t2025-11-27\tanalises83175.pdf`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Exames...');
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

    const idExame = parts[0];
    const idUtente = parts[1];
    const tipoExame = parts[2];
    const resultado = parts[3];
    const dataExame = parts[4];
    const pdfExame = parts[5];

    const docId = `ex-${idExame}`;
    const docRef = doc(db, 'Exames', docId);

    const data = {
      id: docId,
      ID_Exame: idExame,
      ID_Utente: idUtente,
      Tipo_Exame: tipoExame,
      Resultado: resultado,
      Data_Exame: dataExame,
      PDF_Exame: pdfExame
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar exame ${idExame}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} exames carregados no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
