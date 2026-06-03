import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { INITIAL_RESIDENTS, INITIAL_OCCURRENCES, INITIAL_MEDICATIONS } from './src/data';

// Copiado localmente para evitar importação do frontend que inclui arquivo .png (incompatível com o runner ESM Node)
const AVAILABLE_LARES = [
  { id: 'lar-belavista', name: 'SeniorCare Bela Vista' },
  { id: 'lar-jardimflores', name: 'SeniorCare Jardim das Flores' },
  { id: 'lar-pinhal', name: 'SeniorCare Pinhal de Coimbra' },
  { id: 'lar-montesol', name: 'SeniorCare Monte do Sol' }
];

// Ler configuração do Firebase de forma robusta
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('Iniciando a sincronização com o Firebase...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  for (const lar of AVAILABLE_LARES) {
    console.log(`\nSemeando Lar: ${lar.name} (${lar.id})...`);
    
    // 1. Criar/atualizar documento do Lar
    const larDocRef = doc(db, 'lares', lar.id);
    await setDoc(larDocRef, { id: lar.id, name: lar.name })
      .then(() => console.log(`✓ Lar ${lar.name} criado/atualizado.`))
      .catch(e => console.error(`✗ Erro ao criar Lar:`, e));

    // 2. Semear residentes
    console.log(`Enviando ${INITIAL_RESIDENTS.length} residentes...`);
    let resSuccess = 0;
    for (const res of INITIAL_RESIDENTS) {
      const resRef = doc(db, 'lares', lar.id, 'residents', res.id);
      await setDoc(resRef, res)
        .then(() => resSuccess++)
        .catch(e => console.error(`✗ Erro no residente ${res.id}:`, e));
    }
    console.log(`✓ ${resSuccess}/${INITIAL_RESIDENTS.length} residentes semeados.`);

    // 3. Semear ocorrências
    console.log(`Enviando ${INITIAL_OCCURRENCES.length} ocorrências...`);
    let occSuccess = 0;
    for (const occ of INITIAL_OCCURRENCES) {
      const occRef = doc(db, 'lares', lar.id, 'occurrences', occ.id);
      await setDoc(occRef, occ)
        .then(() => occSuccess++)
        .catch(e => console.error(`✗ Erro na ocorrência ${occ.id}:`, e));
    }
    console.log(`✓ ${occSuccess}/${INITIAL_OCCURRENCES.length} ocorrências semeadas.`);

    // 4. Semear registros de medicação
    console.log(`Enviando ${INITIAL_MEDICATIONS.length} registros de medicação...`);
    let medSuccess = 0;
    for (const med of INITIAL_MEDICATIONS) {
      const medRef = doc(db, 'lares', lar.id, 'medication_records', med.id);
      await setDoc(medRef, med)
        .then(() => medSuccess++)
        .catch(e => console.error(`✗ Erro no registro de medicação ${med.id}:`, e));
    }
    console.log(`✓ ${medSuccess}/${INITIAL_MEDICATIONS.length} registros de medicação semeados.`);
  }

  console.log('\nSincronização concluída com sucesso!');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal na sincronização:', err);
  process.exit(1);
});
