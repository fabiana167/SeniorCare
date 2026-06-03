import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PATOLOGIAS_DATA = [
  { ID_Patologia: "PAT-001", ID_Utente: "UT-001", Patologia: "Diabetes", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2021-03-16", Gravidade_Pontos: 5, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-002", ID_Utente: "UT-002", Patologia: "Asma", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2018-02-21", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-003", ID_Utente: "UT-003", Patologia: "Alzheimer", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2012-09-25", Gravidade_Pontos: 15, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-004", ID_Utente: "UT-004", Patologia: "Hipertensão", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2023-03-26", Gravidade_Pontos: 15, Patologia_Pontos: 13 },
  { ID_Patologia: "PAT-005", ID_Utente: "UT-005", Patologia: "Hipertensão", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2018-03-01", Gravidade_Pontos: 15, Patologia_Pontos: 13 },
  { ID_Patologia: "PAT-006", ID_Utente: "UT-006", Patologia: "Diabetes", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2024-10-29", Gravidade_Pontos: 15, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-007", ID_Utente: "UT-007", Patologia: "Asma", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2016-04-13", Gravidade_Pontos: 10, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-008", ID_Utente: "UT-008", Patologia: "Diabetes", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2020-07-06", Gravidade_Pontos: 10, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-009", ID_Utente: "UT-009", Patologia: "Insuficiência Cardíaca", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2016-04-28", Gravidade_Pontos: 10, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-010", ID_Utente: "UT-010", Patologia: "Depressão", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2024-03-17", Gravidade_Pontos: 15, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-011", ID_Utente: "UT-011", Patologia: "Parkinson", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2014-06-02", Gravidade_Pontos: 15, Patologia_Pontos: 16 },
  { ID_Patologia: "PAT-012", ID_Utente: "UT-012", Patologia: "Alzheimer", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2017-04-10", Gravidade_Pontos: 15, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-013", ID_Utente: "UT-013", Patologia: "Artrite", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2017-03-19", Gravidade_Pontos: 15, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-014", ID_Utente: "UT-014", Patologia: "Depressão", Gravidade: "Moderada", Cronica: false, Data_Diagnostico: "2015-03-05", Gravidade_Pontos: 10, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-015", ID_Utente: "UT-015", Patologia: "Artrite", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2019-06-20", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-016", ID_Utente: "UT-016", Patologia: "Artrite", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2023-11-20", Gravidade_Pontos: 15, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-017", ID_Utente: "UT-017", Patologia: "Insuficiência Cardíaca", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2020-06-29", Gravidade_Pontos: 15, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-018", ID_Utente: "UT-018", Patologia: "Depressão", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2024-12-14", Gravidade_Pontos: 15, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-019", ID_Utente: "UT-019", Patologia: "Depressão", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2013-09-24", Gravidade_Pontos: 10, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-020", ID_Utente: "UT-020", Patologia: "Insuficiência Cardíaca", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2016-02-28", Gravidade_Pontos: 5, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-021", ID_Utente: "UT-021", Patologia: "Asma", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2019-06-28", Gravidade_Pontos: 15, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-022", ID_Utente: "UT-022", Patologia: "Asma", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2025-10-18", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-023", ID_Utente: "UT-023", Patologia: "Depressão", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2017-12-22", Gravidade_Pontos: 10, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-024", ID_Utente: "UT-024", Patologia: "Hipertensão", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2015-06-06", Gravidade_Pontos: 15, Patologia_Pontos: 13 },
  { ID_Patologia: "PAT-025", ID_Utente: "UT-025", Patologia: "Insuficiência Cardíaca", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2019-02-06", Gravidade_Pontos: 15, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-026", ID_Utente: "UT-026", Patologia: "Asma", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2022-11-24", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-027", ID_Utente: "UT-027", Patologia: "Diabetes", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2021-05-16", Gravidade_Pontos: 5, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-028", ID_Utente: "UT-028", Patologia: "Asma", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2014-08-30", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-029", ID_Utente: "UT-029", Patologia: "Insuficiência Cardíaca", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2016-01-09", Gravidade_Pontos: 10, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-030", ID_Utente: "UT-030", Patologia: "Insuficiência Cardíaca", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2023-03-31", Gravidade_Pontos: 15, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-031", ID_Utente: "UT-031", Patologia: "Insuficiência Cardíaca", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2022-06-23", Gravidade_Pontos: 15, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-032", ID_Utente: "UT-032", Patologia: "Diabetes", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2020-05-15", Gravidade_Pontos: 5, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-033", ID_Utente: "UT-033", Patologia: "Asma", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2013-01-22", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-034", ID_Utente: "UT-034", Patologia: "Artrite", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2024-05-04", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-035", ID_Utente: "UT-035", Patologia: "Alzheimer", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2017-03-08", Gravidade_Pontos: 15, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-036", ID_Utente: "UT-036", Patologia: "Alzheimer", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2024-08-20", Gravidade_Pontos: 15, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-037", ID_Utente: "UT-037", Patologia: "Diabetes", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2013-03-05", Gravidade_Pontos: 5, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-038", ID_Utente: "UT-038", Patologia: "Insuficiência Cardíaca", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2020-07-17", Gravidade_Pontos: 15, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-039", ID_Utente: "UT-039", Patologia: "Insuficiência Cardíaca", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2013-08-07", Gravidade_Pontos: 10, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-040", ID_Utente: "UT-040", Patologia: "Hipertensão", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2016-03-21", Gravidade_Pontos: 5, Patologia_Pontos: 13 },
  { ID_Patologia: "PAT-041", ID_Utente: "UT-041", Patologia: "Diabetes", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2018-05-05", Gravidade_Pontos: 10, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-042", ID_Utente: "UT-042", Patologia: "Depressão", Gravidade: "Leve", Cronica: false, Data_Diagnostico: "2025-04-09", Gravidade_Pontos: 5, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-043", ID_Utente: "UT-043", Patologia: "Diabetes", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2020-10-23", Gravidade_Pontos: 10, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-044", ID_Utente: "UT-044", Patologia: "Alzheimer", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2015-11-12", Gravidade_Pontos: 15, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-045", ID_Utente: "UT-045", Patologia: "Depressão", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2019-12-05", Gravidade_Pontos: 10, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-046", ID_Utente: "UT-046", Patologia: "Alzheimer", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2021-12-26", Gravidade_Pontos: 10, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-047", ID_Utente: "UT-047", Patologia: "Asma", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2015-08-27", Gravidade_Pontos: 10, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-048", ID_Utente: "UT-048", Patologia: "Alzheimer", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2024-08-02", Gravidade_Pontos: 15, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-049", ID_Utente: "UT-049", Patologia: "Insuficiência Cardíaca", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2024-11-07", Gravidade_Pontos: 10, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-050", ID_Utente: "UT-050", Patologia: "Insuficiência Cardíaca", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2019-12-24", Gravidade_Pontos: 10, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-051", ID_Utente: "UT-051", Patologia: "Insuficiência Cardíaca", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2013-04-13", Gravidade_Pontos: 5, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-052", ID_Utente: "UT-052", Patologia: "Parkinson", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2019-10-28", Gravidade_Pontos: 10, Patologia_Pontos: 16 },
  { ID_Patologia: "PAT-053", ID_Utente: "UT-053", Patologia: "Hipertensão", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2014-08-28", Gravidade_Pontos: 10, Patologia_Pontos: 13 },
  { ID_Patologia: "PAT-054", ID_Utente: "UT-054", Patologia: "Insuficiência Cardíaca", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2021-09-07", Gravidade_Pontos: 10, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-055", ID_Utente: "UT-055", Patologia: "Insuficiência Cardíaca", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2014-01-21", Gravidade_Pontos: 5, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-056", ID_Utente: "UT-056", Patologia: "Depressão", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2016-07-29", Gravidade_Pontos: 15, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-057", ID_Utente: "UT-057", Patologia: "Depressão", Gravidade: "Leve", Cronica: false, Data_Diagnostico: "2016-10-26", Gravidade_Pontos: 5, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-058", ID_Utente: "UT-058", Patologia: "Artrite", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2024-01-07", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-059", ID_Utente: "UT-059", Patologia: "Alzheimer", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2021-03-28", Gravidade_Pontos: 10, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-060", ID_Utente: "UT-060", Patologia: "Diabetes", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2025-03-20", Gravidade_Pontos: 10, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-061", ID_Utente: "UT-061", Patologia: "Alzheimer", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2023-06-18", Gravidade_Pontos: 15, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-062", ID_Utente: "UT-062", Patologia: "Diabetes", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2014-07-17", Gravidade_Pontos: 5, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-063", ID_Utente: "UT-063", Patologia: "Hipertensão", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2014-10-10", Gravidade_Pontos: 15, Patologia_Pontos: 13 },
  { ID_Patologia: "PAT-064", ID_Utente: "UT-064", Patologia: "Asma", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2019-05-29", Gravidade_Pontos: 10, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-065", ID_Utente: "UT-065", Patologia: "Depressão", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2020-08-06", Gravidade_Pontos: 5, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-066", ID_Utente: "UT-066", Patologia: "Alzheimer", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2018-01-23", Gravidade_Pontos: 5, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-067", ID_Utente: "UT-067", Patologia: "Insuficiência Cardíaca", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2018-12-29", Gravidade_Pontos: 15, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-068", ID_Utente: "UT-068", Patologia: "Depressão", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2013-11-11", Gravidade_Pontos: 10, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-069", ID_Utente: "UT-069", Patologia: "Insuficiência Cardíaca", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2015-05-04", Gravidade_Pontos: 5, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-070", ID_Utente: "UT-070", Patologia: "Hipertensão", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2014-11-06", Gravidade_Pontos: 10, Patologia_Pontos: 13 },
  { ID_Patologia: "PAT-071", ID_Utente: "UT-071", Patologia: "Depressão", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2019-12-07", Gravidade_Pontos: 5, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-072", ID_Utente: "UT-072", Patologia: "Parkinson", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2025-05-15", Gravidade_Pontos: 5, Patologia_Pontos: 16 },
  { ID_Patologia: "PAT-073", ID_Utente: "UT-073", Patologia: "Insuficiência Cardíaca", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2020-06-16", Gravidade_Pontos: 10, Patologia_Pontos: 15 },
  { ID_Patologia: "PAT-074", ID_Utente: "UT-074", Patologia: "Depressão", Gravidade: "Leve", Cronica: false, Data_Diagnostico: "2013-07-28", Gravidade_Pontos: 5, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-075", ID_Utente: "UT-075", Patologia: "Alzheimer", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2023-03-17", Gravidade_Pontos: 10, Patologia_Pontos: 20 },
  { ID_Patologia: "PAT-076", ID_Utente: "UT-076", Patologia: "Diabetes", Gravidade: "Grave", Cronica: true, Data_Diagnostico: "2023-05-08", Gravidade_Pontos: 15, Patologia_Pontos: 17 },
  { ID_Patologia: "PAT-077", ID_Utente: "UT-077", Patologia: "Artrite", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2013-10-25", Gravidade_Pontos: 5, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-078", ID_Utente: "UT-078", Patologia: "Artrite", Gravidade: "Moderada", Cronica: true, Data_Diagnostico: "2016-08-26", Gravidade_Pontos: 10, Patologia_Pontos: 5 },
  { ID_Patologia: "PAT-079", ID_Utente: "UT-079", Patologia: "Depressão", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2015-01-31", Gravidade_Pontos: 5, Patologia_Pontos: 6 },
  { ID_Patologia: "PAT-080", ID_Utente: "UT-080", Patologia: "Hipertensão", Gravidade: "Leve", Cronica: true, Data_Diagnostico: "2026-01-23", Gravidade_Pontos: 5, Patologia_Pontos: 13 }
];

async function main() {
  console.log('Iniciando o carregamento dos dados reais das Patologias...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);
  console.log(`Carregando ${PATOLOGIAS_DATA.length} registros clínicos...`);

  let successCount = 0;

  for (const pat of PATOLOGIAS_DATA) {
    const patDocRef = doc(db, 'Patologias', pat.ID_Patologia);
    const data = {
      id: pat.ID_Patologia,
      ID_Patologia: pat.ID_Patologia,
      ID_Utente: pat.ID_Utente,
      Patologia: pat.Patologia,
      Gravidade: pat.Gravidade,
      Crónica: pat.Cronica,
      Data_Diagnóstico: pat.Data_Diagnostico,
      Gravidade_Pontos: pat.Gravidade_Pontos,
      Patologia_Pontos: pat.Patologia_Pontos
    };

    await setDoc(patDocRef, data)
      .then(() => {
        successCount++;
        if (successCount % 10 === 0 || successCount === PATOLOGIAS_DATA.length) {
          console.log(`✓ ${successCount}/${PATOLOGIAS_DATA.length} registros inseridos com sucesso.`);
        }
      })
      .catch(e => {
        console.error(`✗ Erro ao mapear ${pat.ID_Patologia} (${pat.Patologia}):`, e.message);
      });
  }

  console.log(`\nSincronização concluída! Total de ${successCount} registros carregados na coleção Patologias.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
