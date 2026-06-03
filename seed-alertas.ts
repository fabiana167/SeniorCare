import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Alertas fornecido pelo utilizador (80 registos)
const RAW_DATA = `ALE-001	UT-001\tSinais Vitais\tBaixa\t2026-05-18 15:19\t2026-05-18 15:24\tResolvido
ALE-002	UT-002\tSinais Vitais\tMédia\t2026-05-18 20:26\t2026-05-18 20:38\tResolvido
ALE-003\tUT-003\tQueda\tAlta\t2026-05-18 21:21\t2026-05-18 21:27\tPendente
ALE-004\tUT-004\tQueda\tMédia\t2026-05-19 00:25\t2026-05-19 00:32\tAtivo
ALE-005\tUT-005\tQueda\tBaixa\t2026-05-20 08:23\t2026-05-20 08:31\tAtivo
ALE-006\tUT-006\tSinais Vitais\tMédia\t2026-05-18 19:31\t2026-05-18 19:39\tPendente
ALE-007\tUT-007\tQueda\tUrgente\t2026-05-19 20:18\t2026-05-19 20:25\tAtivo
ALE-008\tUT-008\tMedicação\tMédia\t2026-05-19 08:29\t2026-05-19 08:36\tResolvido
ALE-009\tUT-009\tSinais Vitais\tUrgente\t2026-05-18 17:20\t2026-05-18 17:25\tResolvido
ALE-010\tUT-010\tMedicação\tMédia\t2026-05-18 17:27\t2026-05-18 17:33\tPendente
ALE-011\tUT-011\tMedicação\tUrgente\t2026-05-19 13:19\t2026-05-19 13:27\tPendente
ALE-012\tUT-012\tQueda\tBaixa\t2026-05-20 12:34\t2026-05-20 12:41\tAtivo
ALE-013\tUT-013\tSinais Vitais\tUrgente\t2026-05-18 16:22\t2026-05-18 16:30\tAtivo
ALE-014\tUT-014\tSinais Vitais\tAlta\t2026-05-19 07:28\t2026-05-19 07:34\tPendente
ALE-015\tUT-015\tQueda\tBaixa\t2026-05-19 12:24\t2026-05-19 12:29\tResolvido
ALE-016\tUT-016\tSinais Vitais\tMédia\t2026-05-19 10:31\t2026-05-19 10:38\tAtivo
ALE-017\tUT-017\tMedicação\tAlta\t2026-05-19 11:20\t2026-05-19 11:29\tPendente
ALE-018\tUT-018\tSinais Vitais\tUrgente\t2026-05-19 07:18\t2026-05-19 07:24\tResolvido
ALE-019\tUT-019\tConsulta\tBaixa\t2026-05-18 15:24\t2026-05-18 15:31\tAtivo
ALE-020\tUT-020\tMedicação\tUrgente\t2026-05-18 21:19\t2026-05-18 21:28\tResolvido
ALE-021\tUT-021\tMedicação\tBaixa\t2026-05-19 19:33\t2026-05-19 19:41\tResolvido
ALE-022\tUT-022\tQueda\tMédia\t2026-05-20 11:24\t2026-05-20 11:33\tAtivo
ALE-023\tUT-023\tMedicação\tAlta\t2026-05-20 04:30\t2026-05-20 04:41\tPendente
ALE-024\tUT-024\tQueda\tMédia\t2026-05-19 20:22\t2026-05-19 20:30\tPendente
ALE-025\tUT-025\tSinais Vitais\tBaixa\t2026-05-19 01:33\t2026-05-19 01:41\tPendente
ALE-026\tUT-026\tQueda\tAlta\t2026-05-19 09:19\t2026-05-19 09:28\tPendente
ALE-027\tUT-027\tConsulta\tUrgente\t2026-05-18 16:25\t2026-05-18 16:33\tPendente
ALE-028\tUT-028\tSinais Vitais\tMédia\t2026-05-19 09:18\t2026-05-19 09:27\tAtivo
ALE-029\tUT-029\tSinais Vitais\tUrgente\t2026-05-19 11:29\t2026-05-19 11:38\tResolvido
ALE-030\tUT-030\tMedicação\tUrgente\t2026-05-20 04:24\t2026-05-20 04:33\tAtivo
ALE-031\tUT-031\tQueda\tUrgente\t2026-05-20 10:20\t2026-05-20 10:28\tResolvido
ALE-032\tUT-032\tMedicação\tAlta\t2026-05-19 10:29\t2026-05-19 10:36\tAtivo
ALE-033\tUT-033\tSinais Vitais\tUrgente\t2026-05-19 03:20\t2026-05-19 03:29\tResolvido
ALE-034\tUT-034\tQueda\tUrgente\t2026-05-19 14:18\t2026-05-19 14:27\tPendente
ALE-035\tUT-035\tQueda\tAlta\t2026-05-18 19:22\t2026-05-18 19:31\tResolvido
ALE-036\tUT-036\tSinais Vitais\tMédia\t2026-05-20 03:28\t2026-05-20 03:36\tResolvido
ALE-037\tUT-037\tConsulta\tUrgente\t2026-05-20 00:27\t2026-05-20 00:34\tResolvido
ALE-038\tUT-038\tSinais Vitais\tBaixa\t2026-05-20 07:22\t2026-05-20 07:29\tResolvido
ALE-039\tUT-039\tConsulta\tAlta\t2026-05-19 07:20\t2026-05-19 07:27\tAtivo
ALE-040\tUT-040\tSinais Vitais\tAlta\t2026-05-18 22:23\t2026-05-18 22:31\tResolvido
ALE-041\tUT-041\tSinais Vitais\tUrgente\t2026-05-20 07:21\t2026-05-20 07:27\tPendente
ALE-042\tUT-042\tSinais Vitais\tMédia\t2026-05-20 02:26\t2026-05-20 02:33\tPendente
ALE-043\tUT-043\tMedicação\tMédia\t2026-05-18 18:31\t2026-05-18 18:39\tPendente
ALE-044\tUT-044\tMedicação\tUrgente\t2026-05-19 14:21\t2026-05-19 14:27\tResolvido
ALE-045\tUT-045\tMedicação\tAlta\t2026-05-19 01:20\t2026-05-19 01:27\tPendente
ALE-046\tUT-046\tQueda\tAlta\t2026-05-19 13:23\t2026-05-19 13:31\tPendente
ALE-047\tUT-047\tMedicação\tAlta\t2026-05-19 23:21\t2026-05-19 23:29\tResolvido
ALE-048\tUT-048\tMedicação\tBaixa\t2026-05-20 07:27\t2026-05-20 07:35\tPendente
ALE-049\tUT-049\tQueda\tMédia\t2026-05-19 00:36\t2026-05-19 00:43\tAtivo
ALE-050\tUT-050\tQueda\tBaixa\t2026-05-20 13:21\t2026-05-20 13:29\tResolvido
ALE-051\tUT-051\tMedicação\tAlta\t2026-05-20 13:19\t2026-05-20 13:25\tResolvido
ALE-052\tUT-052\tConsulta\tUrgente\t2026-05-20 09:21\t2026-05-20 09:28\tResolvido
ALE-053\tUT-053\tQueda\tUrgente\t2026-05-18 15:26\t2026-05-18 15:33\tPendente
ALE-054\tUT-054\tConsulta\tBaixa\t2026-05-19 15:20\t2026-05-19 15:27\tResolvido
ALE-055\tUT-055\tConsulta\tMédia\t2026-05-20 08:18\t2026-05-20 08:24\tPendente
ALE-056\tUT-056\tSinais Vitais\tAlta\t2026-05-18 23:33\t2026-05-18 23:41\tPendente
ALE-057\tUT-057\tConsulta\tAlta\t2026-05-19 17:24\t2026-05-19 17:31\tResolvido
ALE-058\tUT-058\tQueda\tUrgente\t2026-05-18 17:22\t2026-05-18 17:30\tAtivo
ALE-059\tUT-059\tQueda\tMédia\t2026-05-19 06:24\t2026-05-19 06:31\tResolvido
ALE-060\tUT-060\tSinais Vitais\tUrgente\t2026-05-18 15:33\t2026-05-18 15:40\tAtivo
ALE-061\tUT-061\tMedicação\tBaixa\t2026-05-20 11:22\t2026-05-20 11:28\tAtivo
ALE-062\tUT-062\tConsulta\tBaixa\t2026-05-19 23:25\t2026-05-19 23:33\tPendente
ALE-063\tUT-063\tMedicação\tBaixa\t2026-05-20 03:30\t2026-05-20 03:38\tResolvido
ALE-064\tUT-064\tQueda\tMédia\t2026-05-18 20:24\t2026-05-18 20:32\tResolvido
ALE-065\tUT-065\tConsulta\tAlta\t2026-05-20 02:28\t2026-05-20 02:36\tAtivo
ALE-066\tUT-066\tMedicação\tMédia\t2026-05-19 16:26\t2026-05-19 16:33\tPendente
ALE-067\tUT-067\tSinais Vitais\tBaixa\t2026-05-19 22:25\t2026-05-19 22:31\tResolvido
ALE-068\tUT-068\tQueda\tUrgente\t2026-05-18 20:27\t2026-05-18 20:34\tAtivo
ALE-069\tUT-069\tConsulta\tBaixa\t2026-05-19 21:23\t2026-05-19 21:29\tResolvido
ALE-070\tUT-070\tSinais Vitais\tAlta\t2026-05-19 04:31\t2026-05-19 04:39\tResolvido
ALE-071\tUT-071\tSinais Vitais\tUrgente\t2026-05-19 17:25\t2026-05-19 17:32\tResolvido
ALE-072\tUT-072\tSinais Vitais\tBaixa\t2026-05-19 13:22\t2026-05-19 13:29\tAtivo
ALE-073\tUT-073\tQueda\tUrgente\t2026-05-18 19:28\t2026-05-18 19:35\tResolvido
ALE-074\tUT-074\tSinais Vitais\tUrgente\t2026-05-20 10:21\t2026-05-20 10:27\tAtivo
ALE-075\tUT-075\tConsulta\tAlta\t2026-05-20 03:27\t2026-05-20 03:34\tAtivo
ALE-076\tUT-076\tMedicação\tBaixa\t2026-05-19 18:23\t2026-05-19 18:31\tResolvido
ALE-077\tUT-077\tMedicação\tBaixa\t2026-05-19 19:25\t2026-05-19 19:32\tResolvido
ALE-078\tUT-078\tSinais Vitais\tAlta\t2026-05-20 13:22\t2026-05-20 13:28\tPendente
ALE-079\tUT-079\tQueda\tUrgente\t2026-05-19 11:28\t2026-05-19 11:33\tAtivo
ALE-080\tUT-080\tConsulta\tBaixa\t2026-05-18 21:25\t2026-05-18 21:31\tPendente`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Alertas...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);
  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 7) {
      // Regex fallback if tab separation got parsed differently
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }

    if (parts.length < 7) {
      console.error(`✗ Erro ao processar linha: "${line}". Esperadas 7 colunas, obtidas ${parts.length}.`);
      continue;
    }

    const idAlerta = parts[0];
    const idUtente = parts[1];
    const tipoAlerta = parts[2];
    const prioridade = parts[3];
    const dataHora = parts[4];
    const dataIntervencao = parts[5];
    const estado = parts[6];

    const docId = `al-${idAlerta.toLowerCase()}`;
    // Usamos a coleção 'alertas'
    const docRef = doc(db, 'alertas', docId);

    const data = {
      id: docId,
      ID_Alerta: idAlerta,
      ID_Utente: idUtente,
      Tipo_Alerta: tipoAlerta,
      Prioridade: prioridade,
      Data_Hora: dataHora,
      Data_Intervenção: dataIntervencao,
      Estado: estado
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar alerta ${idAlerta}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} Alertas carregados no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
