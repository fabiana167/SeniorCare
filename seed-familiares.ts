import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Familiares fornecido pelo utilizador (80 registos)
const RAW_DATA = `FAM-001	UT-001	Daniel Ferreira	Irmão(ã)	966629388	daniel.ferreira@gmail.com
FAM-002	UT-002	Teresa Santos	Cônjuge	970855700	teresa.santos@gmail.com
FAM-003	UT-003\tBeatriz Martins\tCônjuge\t994214382\tbeatriz.martins@gmail.com
FAM-004\tUT-004\tBeatriz Oliveira\tIrmão(ã)\t975228535\tbeatriz.oliveira@gmail.com
FAM-005\tUT-005\tTiago Sousa\tFilho(a)\t922660194\ttiago.sousa@gmail.com
FAM-006\tUT-006\tPedro Santos\tIrmão(ã)\t917849494\tpedro.santos@gmail.com
FAM-007\tUT-007\tPedro Pereira\tFilho(a)\t942787299\tpedro.pereira@gmail.com
FAM-008\tUT-008\tMariana Martins\tNeto(a)\t958942697\tmariana.martins@gmail.com
FAM-009\tUT-009\tAndré Pereira\tNeto(a)\t924549543\tandré.pereira@gmail.com
FAM-010\tUT-010\tBeatriz Almeida\tNeto(a)\t978608612\tbeatriz.almeida@gmail.com
FAM-011\tUT-011\tAndré Oliveira\tFilho(a)\t944788100\tandré.oliveira@gmail.com
FAM-012\tUT-012\tInês Almeida\tCônjuge\t972732043\tinês.almeida@gmail.com
FAM-013\tUT-013\tNuno Martins\tNeto(a)\t913446499\tnuno.martins@gmail.com
FAM-014\tUT-014\tTeresa Ferreira\tCônjuge\t913852048\tteresa.ferreira@gmail.com
FAM-015\tUT-015\tBeatriz Sousa\tNeto(a)\t989133014\tbeatriz.sousa@gmail.com
FAM-016\tUT-016\tInês Almeida\tCônjuge\t967556566\tinês.almeida@gmail.com
FAM-017\tUT-017\tAndré Sousa\tFilho(a)\t915350023\tandré.sousa@gmail.com
FAM-018\tUT-018\tBeatriz Martins\tIrmão(ã)\t958557203\tbeatriz.martins@gmail.com
FAM-019\tUT-019\tPaula Oliveira\tFilho(a)\t969934576\tpaula.oliveira@gmail.com
FAM-020\tUT-020\tTiago Silva\tCônjuge\t922130508\ttiago.silva@gmail.com
FAM-021\tUT-021\tAndré Pereira\tIrmão(ã)\t961185849\tandré.pereira@gmail.com
FAM-022\tUT-022\tTeresa Costa\tNeto(a)\t984801233\tteresa.costa@gmail.com
FAM-023\tUT-023\tNuno Santos\tCônjuge\t939161443\tnuno.santos@gmail.com
FAM-024\tUT-024\tMariana Santos\tCônjuge\t980610004\tmariana.santos@gmail.com
FAM-025\tUT-025\tNuno Santos\tIrmão(ã)\t963516659\tnuno.santos@gmail.com
FAM-026\tUT-026\tDaniel Rodrigues\tFilho(a)\t955610493\tdaniel.rodrigues@gmail.com
FAM-027\tUT-027\tNuno Silva\tIrmão(ã)\t917352710\tnuno.silva@gmail.com
FAM-028\tUT-028\tPedro Ferreira\tIrmão(ã)\t939738898\tpedro.ferreira@gmail.com
FAM-029\tUT-029\tPaula Silva\tIrmão(ã)\t989736043\tpaula.silva@gmail.com
FAM-030\tUT-030\tPedro Santos\tIrmão(ã)\t985017250\tpedro.santos@gmail.com
FAM-031\tUT-031\tNuno Almeida\tIrmão(ã)\t947818761\tnuno.almeida@gmail.com
FAM-032\tUT-032\tInês Oliveira\tCônjuge\t992590645\tinês.oliveira@gmail.com
FAM-033\tUT-033\tAndré Sousa\tIrmão(ã)\t919067690\tandré.sousa@gmail.com
FAM-034\tUT-034\tNuno Rodrigues\tFilho(a)\t979696025\tnuno.rodrigues@gmail.com
FAM-035\tUT-035\tTeresa Almeida\tNeto(a)\t920319387\tteresa.almeida@gmail.com
FAM-036\tUT-036\tBeatriz Ferreira\tCônjuge\t984040798\tbeatriz.ferreira@gmail.com
FAM-037\tUT-037\tTiago Almeida\tNeto(a)\t915529005\ttiago.almeida@gmail.com
FAM-038\tUT-038\tBeatriz Pereira\tNeto(a)\t948951595\tbeatriz.pereira@gmail.com
FAM-039\tUT-039\tPedro Santos\tIrmão(ã)\t922976369\tpedro.santos@gmail.com
FAM-040\tUT-040\tBeatriz Silva\tIrmão(ã)\t986849080\tbeatriz.silva@gmail.com
FAM-041\tUT-041\tTeresa Santos\tNeto(a)\t948983895\tteresa.santos@gmail.com
FAM-042\tUT-042\tAndré Santos\tIrmão(ã)\t963283709\tandré.santos@gmail.com
FAM-043\tUT-043\tTeresa Rodrigues\tNeto(a)\t950526484\tteresa.rodrigues@gmail.com
FAM-044\tUT-044\tPedro Ferreira\tCônjuge\t970858653\tpedro.ferreira@gmail.com
FAM-045\tUT-045\tNuno Santos\tIrmão(ã)\t943220503\tnuno.santos@gmail.com
FAM-046\tUT-046\tPaula Almeida\tCônjuge\t964795619\tpaula.almeida@gmail.com
FAM-047\tUT-047\tBeatriz Sousa\tCônjuge\t942122457\tbeatriz.sousa@gmail.com
FAM-048\tUT-048\tNuno Martins\tNeto(a)\t965350347\tnuno.martins@gmail.com
FAM-049\tUT-049\tTiago Costa\tIrmão(ã)\t964395532\ttiago.costa@gmail.com
FAM-050\tUT-050\tMariana Silva\tIrmão(ã)\t991224373\tmariana.silva@gmail.com
FAM-051\tUT-051\tTeresa Ferreira\tFilho(a)\t965540647\tteresa.ferreira@gmail.com
FAM-052\tUT-052\tMariana Sousa\tCônjuge\t987293208\tmariana.sousa@gmail.com
FAM-053\tUT-053\tTiago Rodrigues\tNeto(a)\t911415698\ttiago.rodrigues@gmail.com
FAM-054\tUT-054\tPedro Costa\tNeto(a)\t935016429\tpedro.costa@gmail.com
FAM-055\tUT-055\tTeresa Sousa\tNeto(a)\t961500679\tteresa.sousa@gmail.com
FAM-056\tUT-056\tTeresa Oliveira\tFilho(a)\t915584869\tteresa.oliveira@gmail.com
FAM-057\tUT-057\tPaula Sousa\tCônjuge\t962707402\tpaula.sousa@gmail.com
FAM-058\tUT-058\tBeatriz Santos\tIrmão(ã)\t997241147\tbeatriz.santos@gmail.com
FAM-059\tUT-059\tBeatriz Sousa\tIrmão(ã)\t994299475\tbeatriz.sousa@gmail.com
FAM-060\tUT-060\tPedro Santos\tFilho(a)\t919064068\tpedro.santos@gmail.com
FAM-061\tUT-061\tTeresa Pereira\tFilho(a)\t959911470\tteresa.pereira@gmail.com
FAM-062\tUT-062\tBeatriz Santos\tFilho(a)\t977382794\tbeatriz.santos@gmail.com
FAM-063\tUT-063\tDaniel Almeida\tFilho(a)\t971533194\tdaniel.almeida@gmail.com
FAM-064\tUT-064\tNuno Sousa\tFilho(a)\t943315361\tnuno.sousa@gmail.com
FAM-065\tUT-065\tPaula Almeida\tIrmão(ã)\t947561442\tpaula.almeida@gmail.com
FAM-066\tUT-066\tMariana Sousa\tIrmão(ã)\t933315234\tmariana.sousa@gmail.com
FAM-067\tUT-067\tPaula Pereira\tCônjuge\t931139813\tpaula.pereira@gmail.com
FAM-068\tUT-068\tTiago Costa\tNeto(a)\t965568711\ttiago.costa@gmail.com
FAM-069\tUT-069\tPedro Pereira\tCônjuge\t910512117\tpedro.pereira@gmail.com
FAM-070\tUT-070\tInês Sousa\tNeto(a)\t950111251\tinês.sousa@gmail.com
FAM-071\tUT-071\tTiago Silva\tCônjuge\t986775659\ttiago.silva@gmail.com
FAM-072\tUT-072\tPaula Martins\tFilho(a)\t935872271\tpaula.martins@gmail.com
FAM-073\tUT-073\tNuno Martins\tCônjuge\t966882385\tnuno.martins@gmail.com
FAM-074\tUT-074\tMariana Ferreira\tNeto(a)\t923100061\tmariana.ferreira@gmail.com
FAM-075\tUT-075\tPaula Silva\tFilho(a)\t932629881\tpaula.silva@gmail.com
FAM-076\tUT-076\tPedro Sousa\tCônjuge\t938345472\tpedro.sousa@gmail.com
FAM-077\tUT-077\tBeatriz Costa\tFilho(a)\t964996550\tbeatriz.costa@gmail.com
FAM-078\tUT-078\tAndré Ferreira\tFilho(a)\t971275585\tandré.ferreira@gmail.com
FAM-079\tUT-079\tAndré Sousa\tFilho(a)\t972986894\tandré.sousa@gmail.com
FAM-080\tUT-080\tPedro Silva\tFilho(a)\t970737878\tpedro.silva@gmail.com`;

async function main() {
  console.log('Iniciando o carregamento dos dados exatos de Familiares...');
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

    const idFamiliar = parts[0];
    const idUtente = parts[1];
    const nome = parts[2];
    const parentesco = parts[3];
    const telefone = parts[4];
    const email = parts[5];

    const docId = `fam-${idFamiliar}`;
    const docRef = doc(db, 'Familiares', docId);

    const data = {
      id: docId,
      ID_Familiar: idFamiliar,
      ID_Utente: idUtente,
      Nome: nome,
      Parentesco: parentesco,
      Telefone: telefone,
      Email: email
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar familiar ${idFamiliar}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} familiares carregados no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
