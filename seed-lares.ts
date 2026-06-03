import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MAPPINGS = [
  { ID_Utente: "UT-001", Lar: "Monte do Sol" },
  { ID_Utente: "UT-002", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-003", Lar: "Bela Vista" },
  { ID_Utente: "UT-004", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-005", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-006", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-007", Lar: "Monte do Sol" },
  { ID_Utente: "UT-008", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-009", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-010", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-011", Lar: "Bela Vista" },
  { ID_Utente: "UT-012", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-013", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-014", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-015", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-016", Lar: "Bela Vista" },
  { ID_Utente: "UT-017", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-018", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-019", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-020", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-021", Lar: "Monte do Sol" },
  { ID_Utente: "UT-022", Lar: "Monte do Sol" },
  { ID_Utente: "UT-023", Lar: "Monte do Sol" },
  { ID_Utente: "UT-024", Lar: "Bela Vista" },
  { ID_Utente: "UT-025", Lar: "Bela Vista" },
  { ID_Utente: "UT-026", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-027", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-028", Lar: "Monte do Sol" },
  { ID_Utente: "UT-029", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-030", Lar: "Monte do Sol" },
  { ID_Utente: "UT-031", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-032", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-033", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-034", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-035", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-036", Lar: "Monte do Sol" },
  { ID_Utente: "UT-037", Lar: "Bela Vista" },
  { ID_Utente: "UT-038", Lar: "Monte do Sol" },
  { ID_Utente: "UT-039", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-040", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-041", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-042", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-043", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-044", Lar: "Bela Vista" },
  { ID_Utente: "UT-045", Lar: "Bela Vista" },
  { ID_Utente: "UT-046", Lar: "Monte do Sol" },
  { ID_Utente: "UT-047", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-048", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-049", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-050", Lar: "Bela Vista" },
  { ID_Utente: "UT-051", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-052", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-053", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-054", Lar: "Bela Vista" },
  { ID_Utente: "UT-055", Lar: "Monte do Sol" },
  { ID_Utente: "UT-056", Lar: "Bela Vista" },
  { ID_Utente: "UT-057", Lar: "Bela Vista" },
  { ID_Utente: "UT-058", Lar: "Bela Vista" },
  { ID_Utente: "UT-059", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-060", Lar: "Monte do Sol" },
  { ID_Utente: "UT-061", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-062", Lar: "Monte do Sol" },
  { ID_Utente: "UT-063", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-064", Lar: "Bela Vista" },
  { ID_Utente: "UT-065", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-066", Lar: "Bela Vista" },
  { ID_Utente: "UT-067", Lar: "Bela Vista" },
  { ID_Utente: "UT-068", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-069", Lar: "Bela Vista" },
  { ID_Utente: "UT-070", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-071", Lar: "Bela Vista" },
  { ID_Utente: "UT-072", Lar: "Bela Vista" },
  { ID_Utente: "UT-073", Lar: "Bela Vista" },
  { ID_Utente: "UT-074", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-075", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-076", Lar: "Pinhal de Coimbra" },
  { ID_Utente: "UT-077", Lar: "Bela Vista" },
  { ID_Utente: "UT-078", Lar: "Jardim das Flores" },
  { ID_Utente: "UT-079", Lar: "Monte do Sol" },
  { ID_Utente: "UT-080", Lar: "Monte do Sol" }
];

async function main() {
  console.log('Iniciando o carregamento dos mapeamentos na tabela Lares...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);
  
  let successCount = 0;
  
  for (const mapping of MAPPINGS) {
    const mappingDocRef = doc(db, 'Lares', mapping.ID_Utente);
    const data = {
      id: mapping.ID_Utente,
      ID_Utente: mapping.ID_Utente,
      Lar: mapping.Lar
    };
    
    await setDoc(mappingDocRef, data)
      .then(() => {
        successCount++;
        if (successCount % 10 === 0 || successCount === MAPPINGS.length) {
          console.log(`✓ ${successCount}/${MAPPINGS.length} registros inseridos com sucesso.`);
        }
      })
      .catch((e) => {
        console.error(`✗ Erro ao mapear ${mapping.ID_Utente}:`, e.message);
      });
  }

  console.log('\nProcesso de semeadura finalizado com sucesso!');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
