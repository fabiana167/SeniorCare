import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Consultas fornecido pelo utilizador (80 registos)
const RAW_DATA = `CON-001\tUT-001\tDr. Pereira\tOrtopedia\tLombalgia crónica\t2026-04-26\t2026-09-24
CON-002\tUT-002\tDr. Silva\tNeurologia\tEnxaqueca refratária\t2026-02-28\t2026-09-29
CON-003\tUT-003\tDr. Santos\tOrtopedia\tOsteoartrose do joelho\t2026-04-09\t2026-10-13
CON-004\tUT-004\tDr. Martins\tEndocrinologia\tDiabetes Mellitus Tipo 2\t2026-04-19\t2026-08-21
CON-005\tUT-005\tDr. Rodrigues\tNeurologia\tDoença de Parkinson\t2026-01-21\t2026-08-21
CON-006\tUT-006\tDr. Almeida\tEndocrinologia\tHipotiroidismo primário\t2025-12-12\t2026-07-09
CON-007\tUT-007\tDr. Almeida\tNeurologia\tSíndrome do Túnel Cárpico\t2026-03-28\t2026-08-25
CON-008\tUT-008\tDr. Pereira\tOrtopedia\tRotura de ligamentos cruzados\t2025-11-21\t2026-07-16
CON-009\tUT-009\tDr. Almeida\tOrtopedia\tTendinite do ombro\t2026-03-04\t2026-10-26
CON-010\tUT-010\tDr. Rodrigues\tMedicina Geral\tCheck-up geral\t2026-03-18\t2026-07-26
CON-011\tUT-011\tDr. Pereira\tCardiologia\tHipertensão arterial\t2026-02-04\t2026-09-11
CON-012\tUT-012\tDr. Rodrigues\tOrtopedia\tFascite plantar\t2026-01-19\t2026-06-23
CON-013\tUT-013\tDr. Costa\tCardiologia\tInsuficiência cardíaca\t2026-05-16\t2026-10-04
CON-014\tUT-014\tDr. Martins\tMedicina Geral\tInfeção respiratória superior\t2026-04-26\t2026-09-02
CON-015\tUT-015\tDr. Martins\tMedicina Geral\tRenovação de receituário\t2026-02-21\t2026-08-05
CON-016\tUT-016\tDr. Oliveira\tCardiologia\tFibrilhação auricular\t2026-03-07\t2026-08-30
CON-017\tUT-017\tDr. Martins\tCardiologia\tDislipidemia severa\t2026-02-19\t2026-10-01
CON-018\tUT-018\tDr. Santos\tNeurologia\tCrise convulsiva\t2026-01-21\t2026-07-19
CON-019\tUT-019\tDr. Martins\tCardiologia\tCardiopatia isquémica\t2026-01-11\t2026-09-11
CON-020\tUT-020\tDr. Ferreira\tCardiologia\tSopro cardíaco\t2025-12-12\t2026-08-19
CON-021\tUT-021\tDr. Ferreira\tCardiologia\tArritmia cardíaca\t2026-03-01\t2026-10-09
CON-022\tUT-022\tDr. Almeida\tNeurologia\tDoença de Alzheimer\t2025-12-08\t2026-10-15
CON-023\tUT-023\tDr. Pereira\tNeurologia\tSequelas de AVC\t2026-05-02\t2026-11-07
CON-024\tUT-024\tDr. Rodrigues\tCardiologia\tSíncope recorrente\t2026-01-26\t2026-07-07
CON-025\tUT-025\tDr. Santos\tMedicina Geral\tRastreio oncológico\t2025-11-30\t2026-10-05
CON-026\tUT-026\tDr. Almeida\tEndocrinologia\tNódulo da tiroide\t2026-05-06\t2026-07-28
CON-027\tUT-027\tDr. Santos\tMedicina Geral\tVigilância de hipertensão\t2026-01-28\t2026-06-23
CON-028\tUT-028\tDr. Santos\tNeurologia\tEsclerose múltipla\t2026-01-21\t2026-11-10
CON-029\tUT-029\tDr. Pereira\tMedicina Geral\tCrise de ansiedade\t2026-01-05\t2026-10-30
CON-030\tUT-030\tDr. Santos\tOrtopedia\tEntorse do tornozelo\t2026-01-10\t2026-11-04
CON-031\tUT-031\tDr. Martins\tEndocrinologia\tSíndrome do ovário poliquístico\t2026-01-28\t2026-07-12
CON-032\tUT-032\tDr. Santos\tCardiologia\tAngina de peito estável\t2025-12-18\t2026-11-03
CON-033\tUT-033\tDr. Martins\tCardiologia\tMiocardiopatia hipertrófica\t2026-03-29\t2026-06-30
CON-034\tUT-034\tDr. Martins\tCardiologia\tAvaliação pré-operatória\t2025-12-13\t2026-10-08
CON-035\tUT-035\tDr. Martins\tNeurologia\tPolineuropatia diabética\t2026-04-15\t2026-07-07
CON-036\tUT-036\tDr. Ferreira\tEndocrinologia\tObesidade grau II\t2026-04-16\t2026-10-07
CON-037\tUT-037\tDr. Oliveira\tMedicina Geral\tAnemia ferropénica\t2025-11-24\t2026-07-04
CON-038\tUT-038\tDr. Pereira\tNeurologia\tVertigem posicional paroxística benigna\t2026-05-07\t2026-07-01
CON-039\tUT-039\tDr. Costa\tEndocrinologia\tHiperparatiroidismo\t2026-04-08\t2026-09-27
CON-040\tUT-040\tDr. Martins\tEndocrinologia\tOsteoporose pós-menopausa\t2026-02-28\t2026-08-02
CON-041\tUT-041\tDr. Pereira\tCardiologia\tPericardite aguda\t2025-12-07\t2026-08-17
CON-042\tUT-042\tDr. Costa\tNeurologia\tNevralgia do trigémio\t2025-12-05\t2026-08-23
CON-043\tUT-043\tDr. Ferreira\tMedicina Geral\tInfeção urinária\t2026-01-23\t2026-09-22
CON-044\tUT-044\tDr. Sousa\tCardiologia\tEstenose aórtica\t2026-01-19\t2026-06-27
CON-045\tUT-045\tDr. Rodrigues\tMedicina Geral\tLombalgia aguda\t2026-01-01\t2026-08-13
CON-046\tUT-046\tDr. Pereira\tOrtopedia\tEpicondilite lateral\t2026-01-24\t2026-09-21
CON-047\tUT-047\tDr. Ferreira\tCardiologia\tInsuficiência da válvula mitral\t2025-12-29\t2026-11-15
CON-048\tUT-048\tDr. Silva\tCardiologia\tPalpitações cardíacas\t2026-01-02\t2026-08-31
CON-049\tUT-049\tDr. Oliveira\tCardiologia\tCardiopatia hipertensiva\t2025-11-25\t2026-08-29
CON-050\tUT-050\tDr. Santos\tOrtopedia\tEscoliose idiopática\t2026-02-11\t2026-07-28
CON-051\tUT-051\tDr. Santos\tOrtopedia\tHérnia discal lombar\t2026-03-17\t2026-10-23
CON-052\tUT-052\tDr. Rodrigues\tMedicina Geral\tDermatite atópica\t2025-12-08\t2026-09-04
CON-053\tUT-053\tDr. Costa\tOrtopedia\tBursite trocantérica\t2026-01-23\t2026-08-10
CON-054\tUT-054\tDr. Martins\tCardiologia\tMiocardite viral\t2025-11-29\t2026-10-22
CON-055\tUT-055\tDr. Rodrigues\tEndocrinologia\tHipertiroidismo\t2026-02-04\t2026-10-22
CON-056\tUT-056\tDr. Almeida\tMedicina Geral\tApoio à cessação tabágica\t2025-12-13\t2026-07-24
CON-057\tUT-057\tDr. Martins\tOrtopedia\tSíndrome de colisão do ombro\t2026-01-03\t2026-09-28
CON-058\tUT-058\tDr. Santos\tNeurologia\tCefaleia de tensão\t2026-01-07\t2026-10-10
CON-059\tUT-059\tDr. Silva\tOrtopedia\tLesão do menisco\t2026-01-07\t2026-10-27
CON-060\tUT-060\tDr. Santos\tEndocrinologia\tHiperprolactinemia\t2026-04-10\t2026-11-03
CON-061\tUT-061\tDr. Almeida\tNeurologia\tParalisia facial de Bell\t2026-04-09\t2026-08-23
CON-062\tUT-062\tDr. Martins\tOrtopedia\tRizartrose\t2026-03-30\t2026-11-05
CON-063\tUT-063\tDr. Costa\tMedicina Geral\tDispepsia funcional\t2026-03-21\t2026-07-08
CON-064\tUT-064\tDr. Pereira\tMedicina Geral\tAsma brônquica\t2025-11-25\t2026-07-10
CON-065\tUT-065\tDr. Rodrigues\tOrtopedia\tCervicalgia mecânica\t2025-12-31\t2026-10-21
CON-066\tUT-066\tDr. Silva\tNeurologia\tInsónia crónica\t2026-05-14\t2026-10-31
CON-067\tUT-067\tDr. Ferreira\tEndocrinologia\tInsuficiência suprarrenal\t2025-12-14\t2026-08-14
CON-068\tUT-068\tDr. Rodrigues\tNeurologia\tNeuropatia compressiva cubital\t2025-12-30\t2026-07-12
CON-069\tUT-069\tDr. Santos\tEndocrinologia\tDiabetes gestacional\t2026-04-02\t2026-09-21
CON-070\tUT-070\tDr. Almeida\tOrtopedia\tEsporão do calcâneo\t2026-05-02\t2026-07-11
CON-071\tUT-071\tDr. Costa\tOrtopedia\tTendinite de Aquiles\t2026-03-09\t2026-10-22
CON-072\tUT-072\tDr. Martins\tEndocrinologia\tSíndrome de Cushing\t2026-02-20\t2026-07-30
CON-073\tUT-073\tDr. Costa\tOrtopedia\tDedo em gatilho\t2025-12-03\t2026-09-03
CON-074\tUT-074\tDr. Martins\tCardiologia\tDisfunção endotelial\t2026-01-19\t2026-08-07
CON-075\tUT-075\tDr. Silva\tCardiologia\tDoença arterial periférica\t2026-03-23\t2026-09-15
CON-076\tUT-076\tDr. Martins\tMedicina Geral\tVacinação do viajante\t2025-12-30\t2026-08-22
CON-077\tUT-077\tDr. Oliveira\tNeurologia\tDisautonomia\t2026-03-05\t2026-08-25
CON-078\tUT-078\tDr. Ferreira\tMedicina Geral\tGastroenterite aguda\t2026-04-21\t2026-10-02
CON-079\tUT-079\tDr. Santos\tMedicina Geral\tRinite alérgica\t2026-02-28\t2026-07-19
CON-080\tUT-080\tDr. Pereira\tCardiologia\tAneurisma da aorta abdominal\t2026-03-25\t2026-10-14`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Consultas...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);
  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 7) {
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }

    if (parts.length < 7) {
      console.error(`✗ Erro ao processar linha: "${line}". Esperadas pelo menos 7 colunas, obtidas ${parts.length}.`);
      continue;
    }

    const idConsulta = parts[0];
    const idUtente = parts[1];
    const medico = parts[2];
    const especialidade = parts[3];
    const diagnostico = parts[4];
    const dataConsulta = parts[5];
    const proximaConsulta = parts[6];

    const docId = `con-${idConsulta}`;
    const docRef = doc(db, 'Consultas', docId);

    const data = {
      id: docId,
      ID_Consulta: idConsulta,
      ID_Utente: idUtente,
      Médico: medico,
      Especialidade: especialidade,
      Diagnóstico: diagnostico,
      Data_Consulta: dataConsulta,
      Próxima_Consulta: proximaConsulta
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar consulta ${idConsulta}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} consultas carregadas no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
