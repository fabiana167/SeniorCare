import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { INITIAL_RESIDENTS } from './src/data';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('Iniciando o carregamento dos dados dos Utentes...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);
  console.log(`Carregando ${INITIAL_RESIDENTS.length} registros...`);

  let successCount = 0;

  for (const res of INITIAL_RESIDENTS) {
    const utenteDocRef = doc(db, 'Utentes', res.id);
    const data = {
      id: res.id,
      ID_Utente: res.id,
      Nome: res.name,
      Data_Nascimento: res.birthDate,
      Idade: res.age,
      Sexo: res.gender,
      Quarto: res.room,
      Mobilidade: res.mobility,
      Estado_Geral: res.generalState,
      Familiar_Responsável: res.responsibleFamily,
      Contacto_Familiar: res.familyContact,
      Peso: res.weight,
      Tipo_sanguineo: res.bloodType,
      Alergias: res.allergies,
      Idade_Pontos: res.agePoints,
      Mobilidade_Pontos: res.mobilityPoints
    };

    await setDoc(utenteDocRef, data)
      .then(() => {
        successCount++;
        if (successCount % 10 === 0 || successCount === INITIAL_RESIDENTS.length) {
          console.log(`✓ ${successCount}/${INITIAL_RESIDENTS.length} utentes inseridos com sucesso.`);
        }
      })
      .catch((e) => {
        console.error(`✗ Erro ao mapear utente ${res.id}:`, e.message);
      });
  }

  console.log('\nProcesso de semeadura finalizado com sucesso!');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
