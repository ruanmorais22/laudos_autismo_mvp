import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';

import Block2_History from '../components/report/Block2_History';
import Block3_ClinicalObservation from '../components/report/Block3_ClinicalObservation';
import Block5_DiagnosticCriteria from '../components/report/Block5_DiagnosticCriteria';

type ReportBlockProps = {
  title: string;
  children: React.ReactNode;
};

const ReportBlock: React.FC<ReportBlockProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="report-block">
      <div className="report-block-header" onClick={() => setIsOpen(!isOpen)}>
        <h2>{title}</h2>
        <span>{isOpen ? 'Fechar' : 'Abrir'}</span>
      </div>
      {isOpen && <div className="report-block-content">{children}</div>}
    </div>
  );
};


const ReportPage: React.FC = () => {
  // const { patientId } = useParams(); // Para pegar o ID do paciente da URL no futuro

  // Estado unificado para todos os dados do laudo
  const [reportData, setReportData] = useState({
    history: {
      pregnancy_complications: '',
      developmental_milestones: '',
      medical_history: '',
      family_history: '',
    },
    clinical_observation: {
      verbal_communication: '',
      nonverbal_communication: '',
      social_interaction: '',
      repetitive_behaviors: '',
      sensory_sensitivities: '',
    },
    diagnostic_criteria: {
      dsm5_A1: false,
      dsm5_A2: false,
      dsm5_A3: false,
      dsm5_B1: false,
      dsm5_B2: false,
      dsm5_B3: false,
      dsm5_B4: false,
      differential_diagnosis: '',
      comorbidities: '',
    },
    // ... outros blocos virão aqui
  });

  // Handler para atualizar os dados do Bloco 2
  const handleHistoryChange = (field: keyof typeof reportData.history, value: string) => {
    setReportData(prevData => ({
      ...prevData,
      history: {
        ...prevData.history,
        [field]: value,
      },
    }));
  };

  // Handler para atualizar os dados do Bloco 3
  const handleClinicalObservationChange = (field: keyof typeof reportData.clinical_observation, value: string) => {
    setReportData(prevData => ({
      ...prevData,
      clinical_observation: {
        ...prevData.clinical_observation,
        [field]: value,
      },
    }));
  };

  // Handler para atualizar os dados do Bloco 5
  const handleDiagnosticCriteriaChange = (field: keyof typeof reportData.diagnostic_criteria, value: string | boolean) => {
    setReportData(prevData => ({
      ...prevData,
      diagnostic_criteria: {
        ...prevData.diagnostic_criteria,
        [field]: value,
      },
    }));
  };

  return (
    <div className="report-container">
      <h1>Geração de Laudo</h1>
      <p>Paciente: {/* patient.name */} (ID: {/* patientId */})</p>

      <ReportBlock title="Bloco 1: Identificação do Paciente">
        <p>Conteúdo do Bloco 1 (Informações do paciente carregadas aqui)...</p>
      </ReportBlock>

      <ReportBlock title="Bloco 2: Histórico">
        <Block2_History data={reportData} onDataChange={handleHistoryChange} />
      </ReportBlock>

      <ReportBlock title="Bloco 3: Observação Clínica">
        <Block3_ClinicalObservation data={reportData} onDataChange={handleClinicalObservationChange} />
      </ReportBlock>

      <ReportBlock title="Bloco 4: Instrumentos Aplicados">
        <p>Formulário dos Instrumentos Aplicados aqui...</p>
      </ReportBlock>

      <ReportBlock title="Bloco 5: Diagnóstico & Critérios">
        <Block5_DiagnosticCriteria data={reportData} onDataChange={handleDiagnosticCriteriaChange} />
      </ReportBlock>
      
      {/* ... Outros blocos virão aqui ... */}

      <button>Salvar Rascunho</button>
      <button>Gerar Laudo (Preview)</button>
    </div>
  );
};

export default ReportPage;
