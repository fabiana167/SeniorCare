import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugUpload() {
  const docId = 'tr-tri-013';
  const docRef = doc(db, 'Triagem', docId);

  const data = {
    id: docId,
    ID_Triagem: 'TRI-013',
    ID_Utente: 'UT-013',
    Idade_Pontos: 5,
    Gravidade_Pontos: 15,
    Patologia_Pontos: 5,
    Mobilidade_Pontos: 15,
    Internamentos_Pontos: 10,
    SinaisVitais_Pontos: 45,
    Score_Total: 95,
    Prioridade_Final: 'Urgente',
    Última_Atualização: '2026-05-20'
  };

  console.log('Sending data:', data);
  try {
    await setDoc(docRef, data);
    console.log('Success!');
  } catch (e: any) {
    console.error('Error stack:', e);
  }
}

debugUpload().catch(console.error);
