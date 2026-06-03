import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { INITIAL_MEDICATIONS } from './src/data';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('Iniciando o carregamento dos dados de Medicação...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);
  console.log(`Carregando ${INITIAL_MEDICATIONS.length} prescrições médicas...`);

  let successCount = 0;

  for (const med of INITIAL_MEDICATIONS) {
    const medDocRef = doc(db, 'Medicação', med.id);
    const data = {
      id: med.id,
      ID_Utente: med.ID_Utente,
      Medicamento: med.Medicamento,
      ID_Medicamento: med.ID_Medicamento,
      Dosagem: med.Dosagem,
      Horário: med.Horário,
      Frequência_dia: med.Frequência_dia,
      Médico_Prescitor: med.Médico_Prescitor,
      Data_Início: med.Data_Início,
      Data_Fim: med.Data_Fim
    };

    await setDoc(medDocRef, data)
      .then(() => {
        successCount++;
        if (successCount % 10 === 0 || successCount === INITIAL_MEDICATIONS.length) {
          console.log(`✓ ${successCount}/${INITIAL_MEDICATIONS.length} prescrições inseridas com sucesso.`);
        }
      })
      .catch((e) => {
        console.error(`✗ Erro ao mapear prescrição ${med.id}:`, e.message);
      });
  }

  console.log('\nProcesso de semeadura finalizado com sucesso!');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
