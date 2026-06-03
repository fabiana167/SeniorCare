import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Ler configuração do Firebase
const firebaseConfig = JSON.parse(readFileSync(resolve('./firebase-applet-config.json'), 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dataset de Ocorrências fornecido pelo utilizador (80 registos)
const RAW_DATA = `OCO-001	UT-001	Dor	2026/05/09 14:14:00	2026/05/09 14:14:45	Média	Ocorrência registada pela equipa.	Ana Almeida	Sim	Não
OCO-002	UT-002	Falta de ar	2026/05/12 14:14:00	2026/05/12 14:15:10	Alta	Ocorrência registada pela equipa.	Helena Oliveira	Sim	Não
OCO-003	UT-003	Hipoglicemia	2026/04/25 14:14:00	2026/04/25 14:14:30	Alta	Ocorrência registada pela equipa.	Carlos Ferreira	Sim	Não
OCO-004	UT-004	Dor	2026/04/28 14:14:00	2026/04/28 14:16:05	Alta	Ocorrência registada pela equipa.	Ana Santos	Sim	Não
OCO-005	UT-005	Febre	2026/05/02 14:14:00	2026/05/02 14:14:55	Média	Ocorrência registada pela equipa.	Ricardo Pereira	Sim	Sim
OCO-006	UT-006	Dor	2026/05/16 14:14:00	2026/05/16 14:14:20	Alta	Ocorrência registada pela equipa.	António Pereira	Sim	Sim
OCO-007	UT-007	Falta de ar	2026/05/15 14:14:00	2026/05/15 14:15:40	Média	Ocorrência registada pela equipa.	Luís Santos	Não	Não
OCO-008	UT-008	Febre	2026/04/26 14:14:00	2026/04/26 14:14:50	Média	Ocorrência registada pela equipa.	João Oliveira	Não	Não
OCO-009	UT-009	Hipoglicemia	2026/05/06 14:14:00	2026/05/06 14:16:10	Baixa	Ocorrência registada pela equipa.	Rita Silva	Não	Não
OCO-010	UT-010	Dor	2026/05/06 14:14:00	2026/05/06 14:14:35	Alta	Ocorrência registada pela equipa.	Catarina Pereira	Sim	Sim
OCO-011	UT-011	Febre	2026/05/07 14:14:00	2026/05/07 14:15:25	Alta	Ocorrência registada pela equipa.	Bruno Martins	Sim	Não
OCO-012	UT-012	Hipoglicemia	2026/04/25 14:14:00	2026/04/25 14:14:15	Média	Ocorrência registada pela equipa.	Helena Ferreira	Não	Não
OCO-013	UT-013	Queda	2026/05/08 14:14:00	2026/05/08 14:15:50	Alta	Ocorrência registada pela equipa.	Carlos Almeida	Sim	Sim
OCO-014	UT-014	Dor	2026/05/02 14:14:00	2026/05/02 14:14:40	Baixa	Ocorrência registada pela equipa.	Helena Costa	Não	Não
OCO-015	UT-015	Dor	2026/05/16 14:14:00	2026/05/16 14:15:30	Baixa	Ocorrência registada pela equipa.	Bruno Oliveira	Não	Não
OCO-016	UT-016	Dor	2026/04/27 14:14:00	2026/04/27 14:14:55	Alta	Ocorrência registada pela equipa.	António Almeida	Sim	Sim
OCO-017	UT-017	Hipoglicemia	2026/05/14 14:14:00	2026/05/14 14:16:00	Alta	Ocorrência registada pela equipa.	Ana Almeida	Sim	Não
OCO-018	UT-018	Hipoglicemia	2026/05/02 14:14:00	2026/05/02 14:14:25	Baixa	Ocorrência registada pela equipa.	Paula Sousa	Não	Não
OCO-019	UT-019	Dor	2026/05/07 14:14:00	2026/05/07 14:14:50	Alta	Ocorrência registada pela equipa.	Bruno Ferreira	Sim	Não
OCO-020	UT-020	Falta de ar	2026/04/28 14:14:00	2026/04/28 14:15:15	Baixa	Ocorrência registada pela equipa.	António Pereira	Sim	Sim
OCO-021	UT-021	Febre	2026/04/29 14:14:00	2026/04/29 14:14:35	Baixa	Ocorrência registada pela equipa.	Carlos Pereira	Não	Não
OCO-022	UT-022	Falta de ar	2026/04/21 14:14:00	2026/04/21 14:15:00	Alta	Ocorrência registada pela equipa.	Miguel Rodrigues	Sim	Sim
OCO-023	UT-023	Falta de ar	2026/05/19 14:14:00	2026/05/19 14:14:20	Baixa	Ocorrência registada pela equipa.	João Costa	Não	Não
OCO-024	UT-024	Queda	2026/05/18 14:14:00	2026/05/18 14:15:45	Média	Ocorrência registada pela equipa.	Fernanda Rodrigues	Sim	Sim
OCO-025	UT-025	Febre	2026/05/02 14:14:00	2026/05/02 14:14:30	Baixa	Ocorrência registada pela equipa.	Sofia Martins	Não	Não
OCO-026	UT-026	Febre	2026/05/08 14:14:00	2026/05/08 14:14:55	Média	Ocorrência registada pela equipa.	Rita Oliveira	Não	Não
OCO-027	UT-027	Febre	2026/05/03 14:14:00	2026/05/03 14:16:10	Alta	Ocorrência registada pela equipa.	Helena Almeida	Não	Não
OCO-028	UT-028	Febre	2026/05/14 14:14:00	2026/05/14 14:14:40	Alta	Ocorrência registada pela equipa.	António Costa	Sim	Sim
OCO-029	UT-029	Falta de ar	2026/04/29 14:14:00	2026/04/29 14:15:20	Baixa	Ocorrência registada pela equipa.	Ana Almeida	Sim	Não
OCO-030	UT-030	Febre	2026/05/12 14:14:00	2026/05/12 14:14:50	Baixa	Ocorrência registada pela equipa.	Ana Oliveira	Sim	Não
OCO-031	UT-031	Hipoglicemia	2026/05/17 14:14:00	2026/05/17 14:15:35	Baixa	Ocorrência registada pela equipa.	Catarina Martins	Não	Não
OCO-032	UT-032	Dor	2026/04/29 14:14:00	2026/04/29 14:14:10	Alta	Ocorrência registada pela equipa.	Bruno Martins	Sim	Sim
OCO-033	UT-033	Febre	2026/04/24 14:14:00	2026/04/24 14:14:25	Baixa	Ocorrência registada pela equipa.	Maria Costa	Sim	Não
OCO-034	UT-034	Febre	2026/04/27 14:14:00	2026/04/27 14:15:10	Média	Ocorrência registada pela equipa.	Bruno Costa	Não	Não
OCO-035	UT-035	Dor	2026/05/13 14:14:00	2026/05/13 14:14:45	Alta	Ocorrência registada pela equipa.	Luís Martins	Sim	Sim
OCO-036	UT-036	Dor	2026/05/05 14:14:00	2026/05/05 14:15:00	Alta	Ocorrência registada pela equipa.	Luís Martins	Sim	Sim
OCO-037	UT-037	Dor	2026/05/12 14:14:00	2026/05/12 14:14:20	Alta	Ocorrência registada pela equipa.	Sofia Almeida	Sim	Não
OCO-038	UT-038	Queda	2026/05/17 14:14:00	2026/05/17 14:15:55	Média	Ocorrência registada pela equipa.	Carlos Silva	Não	Não
OCO-039	UT-039	Falta de ar	2026/05/05 14:14:00	2026/05/05 14:14:35	Baixa	Ocorrência registada pela equipa.	Carlos Ferreira	Sim	Não
OCO-040	UT-040	Falta de ar	2026/05/13 14:14:00	2026/05/13 14:14:50	Alta	Ocorrência registada pela equipa.	Miguel Silva	Não	Não
OCO-041	UT-041	Falta de ar	2026/04/26 14:14:00	2026/04/26 14:15:10	Alta	Ocorrência registada pela equipa.	Luís Ferreira	Sim	Sim
OCO-042	UT-042	Dor	2026/05/11 14:14:00	2026/05/11 14:14:30	Baixa	Ocorrência registada pela equipa.	José Silva	Sim	Não
OCO-043	UT-043	Hipoglicemia	2026/04/30 14:14:00	2026/04/30 14:15:20	Baixa	Ocorrência registada pela equipa.	Rita Costa	Sim	Não
OCO-044	UT-044	Queda	2026/05/06 14:14:00	2026/05/06 14:14:40	Média	Ocorrência registada pela equipa.	Catarina Silva	Sim	Não
OCO-045	UT-045	Queda	2026/05/12 14:14:00	2026/05/12 14:15:10	Alta	Ocorrência registada pela equipa.	Helena Pereira	Sim	Sim
OCO-046	UT-046	Febre	2026/05/07 14:14:00	2026/05/07 14:14:25	Baixa	Ocorrência registada pela equipa.	Sofia Rodrigues	Não	Não
OCO-047	UT-047	Hipoglicemia	2026/05/06 14:14:00	2026/05/06 14:15:35	Baixa	Ocorrência registada pela equipa.	Paula Rodrigues	Sim	Não
OCO-048	UT-048	Queda	2026/05/19 14:14:00	2026/05/19 14:14:50	Alta	Ocorrência registada pela equipa.	João Silva	Sim	Sim
OCO-049	UT-049	Febre	2026/05/13 14:14:00	2026/05/13 14:15:00	Alta	Ocorrência registada pela equipa.	João Santos	Sim	Sim
OCO-050	UT-050	Hipoglicemia	2026/04/24 14:14:00	2026/04/24 14:14:15	Baixa	Ocorrência registada pela equipa.	Ana Costa	Sim	Não
OCO-051	UT-051	Hipoglicemia	2026/05/06 14:14:00	2026/05/06 14:14:55	Média	Ocorrência registada pela equipa.	Maria Oliveira	Não	Não
OCO-052	UT-052	Dor	2026/04/24 14:14:00	2026/04/24 14:15:25	Média	Ocorrência registada pela equipa.	António Martins	Sim	Não
OCO-053	UT-053	Queda	2026/05/16 14:14:00	2026/05/16 14:14:40	Alta	Ocorrência registada pela equipa.	Ricardo Santos	Sim	Sim
OCO-054	UT-054	Febre	2026/05/08 14:14:00	2026/05/08 14:15:05	Média	Ocorrência registada pela equipa.	Helena Ferreira	Sim	Não
OCO-055	UT-055	Queda	2026/05/04 14:14:00	2026/05/04 14:14:30	Baixa	Ocorrência registada pela equipa.	Fernanda Almeida	Sim	Não
OCO-056	UT-056	Febre	2026/04/24 14:14:00	2026/04/24 14:14:50	Alta	Ocorrência registada pela equipa.	Luís Sousa	Não	Não
OCO-057	UT-057	Queda	2026/04/22 14:14:00	2026/04/22 14:15:10	Alta	Ocorrência registada pela equipa.	Sofia Pereira	Sim	Sim
OCO-058	UT-058	Queda	2026/05/19 14:14:00	2026/05/19 14:14:35	Baixa	Ocorrência registada pela equipa.	Paula Ferreira	Não	Não
OCO-059	UT-059	Queda	2026/05/12 14:14:00	2026/05/12 14:14:20	Alta	Ocorrência registada pela equipa.	Luís Pereira	Não	Não
OCO-060	UT-060	Febre	2026/05/11 14:14:00	2026/05/11 14:15:45	Baixa	Ocorrência registada pela equipa.	Maria Almeida	Não	Não
OCO-061	UT-061	Falta de ar	2026/05/08 14:14:00	2026/05/08 14:14:55	Baixa	Ocorrência registada pela equipa.	Rita Ferreira	Não	Não
OCO-062	UT-062	Falta de ar	2026/04/24 14:14:00	2026/04/24 14:14:10	Média	Ocorrência registada pela equipa.	Luís Santos	Sim	Sim
OCO-063	UT-063	Dor	2026/04/27 14:14:00	2026/04/27 14:15:30	Alta	Ocorrência registada pela equipa.	Ricardo Costa	Não	Não
OCO-064	UT-064	Queda	2026/04/23 14:14:00	2026/04/23 14:14:40	Baixa	Ocorrência registada pela equipa.	Fernanda Santos	Sim	Não
OCO-065	UT-065	Febre	2026/04/29 14:14:00	2026/04/29 14:15:05	Alta	Ocorrência registada pela equipa.	José Oliveira	Sim	Sim
OCO-066	UT-066	Febre	2026/05/04 14:14:00	2026/05/04 14:14:25	Baixa	Ocorrência registada pela equipa.	Helena Costa	Sim	Não
OCO-067	UT-067	Falta de ar	2026/05/07 14:14:00	2026/05/07 14:15:10	Alta	Ocorrência registada pela equipa.	Sofia Ferreira	Sim	Sim
OCO-068	UT-068	Queda	2026/05/17 14:14:00	2026/05/17 14:14:45	Média	Ocorrência registada pela equipa.	Ricardo Ferreira	Sim	Não
OCO-069	UT-069	Dor	2026/05/04 14:14:00	2026/05/04 14:15:20	Alta	Ocorrência registada pela equipa.	João Costa	Não	Não
OCO-070	UT-070	Febre	2026/04/23 14:14:00	2026/04/23 14:14:30	Alta	Ocorrência registada pela equipa.	Miguel Martins	Sim	Sim
OCO-071	UT-071	Hipoglicemia	2026/04/21 14:14:00	2026/04/21 14:15:15	Média	Ocorrência registada pela equipa.	Helena Martins	Sim	Não
OCO-072	UT-072	Dor	2026/04/30 14:14:00	2026/04/30 14:14:50	Média	Ocorrência registada pela equipa.	Maria Ferreira	Sim	Não
OCO-073	UT-073	Dor	2026/05/17 14:14:00	2026/05/17 14:15:00	Média	Ocorrência registada pela equipa.	António Oliveira	Não	Não
OCO-074	UT-074	Falta de ar	2026/05/10 14:14:00	2026/05/10 14:14:35	Média	Ocorrência registada pela equipa.	José Oliveira	Sim	Não
OCO-075	UT-075	Queda	2026/04/21 14:14:00	2026/04/21 14:14:20	Média	Ocorrência registada pela equipa.	Rita Pereira	Sim	Não
OCO-076	UT-076	Queda	2026/04/27 14:14:00	2026/04/27 14:15:25	Baixa	Ocorrência registada pela equipa.	Miguel Ferreira	Não	Não
OCO-077	UT-077	Falta de ar	2026/05/17 14:14:00	2026/05/17 14:14:55	Alta	Ocorrência registada pela equipa.	Paula Costa	Sim	Sim
OCO-078	UT-078	Dor	2026/04/25 14:14:00	2026/04/25 14:15:10	Média	Ocorrência registada pela equipa.	Helena Rodrigues	Sim	Não
OCO-079	UT-079	Dor	2026/04/24 14:14:00	2026/04/24 14:14:40	Alta	Ocorrência registada pela equipa.	José Sousa	Não	Não
OCO-080	UT-080	Queda	2026/05/11 14:14:00	2026/05/11 14:15:05	Alta	Ocorrência registada pela equipa.	Bruno Costa	Sim	Sim`;

async function main() {
  console.log('Iniciando o carregamento dos dados de Ocorrências...');
  console.log(`Projeto ID: ${firebaseConfig.projectId}`);

  const lines = RAW_DATA.trim().split('\n');
  console.log(`Total de linhas detetadas no dataset: ${lines.length}`);
  let successCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    let parts = line.split('\t').map(p => p.trim());
    if (parts.length < 10) {
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }

    if (parts.length < 10) {
      console.error(`✗ Erro ao processar linha: "${line}". Esperadas pelo menos 10 colunas, obtidas ${parts.length}.`);
      continue;
    }

    const idOcorrencia = parts[0];
    const idUtente = parts[1];
    const tipoOcorrencia = parts[2];
    const dataHora = parts[3];
    const dataHoraRegisto = parts[4];
    const gravidade = parts[5];
    const descricao = parts[6];
    const familiarResponsavel = parts[7];
    
    // Conversor inteligente para booleano
    const encaminhamentoHospitalStr = parts[8].toLowerCase();
    const encaminhamentoHospital = encaminhamentoHospitalStr === 'sim' || encaminhamentoHospitalStr === 'true' || encaminhamentoHospitalStr === '1' || encaminhamentoHospitalStr === 's';
    
    const internamentoStr = parts[9].toLowerCase();
    const internamento = internamentoStr === 'sim' || internamentoStr === 'true' || internamentoStr === '1' || internamentoStr === 's';
    
    // Algoritmo clínico de pontuação de internamento (se Internamento for Sim, calcula pontos baseados na gravidade)
    let internamentoPontos = 0;
    if (internamento) {
      if (gravidade === 'Alta') internamentoPontos = 40;
      else if (gravidade === 'Média') internamentoPontos = 30;
      else internamentoPontos = 20;
    }

    const docId = `oc-${idOcorrencia}`;
    const docRef = doc(db, 'Ocorrências', docId);

    const data = {
      id: docId,
      ID_Ocorrencia: idOcorrencia,
      ID_Utente: idUtente,
      Tipo_Ocorrencia: tipoOcorrencia,
      Data_Hora: dataHora,
      Data_Hora_Registo: dataHoraRegisto,
      Gravidade: gravidade,
      Descrição: descricao,
      Familiar_Responsável: familiarResponsavel,
      Encaminhamento_Hospital: encaminhamentoHospital,
      Internamento: internamento,
      Internamento_Pontos: internamentoPontos
    };

    try {
      await setDoc(docRef, data);
      successCount++;
    } catch (e: any) {
      console.error(`✗ Erro ao carregar ocorrência ${idOcorrencia}:`, e.message);
    }
  }

  console.log(`\n✓ Processo concluído! ${successCount}/${lines.length} ocorrências carregadas no Firebase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
