import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';

// Placeholder para os componentes dos blocos que criaremos
// import Block2_History from '../components/report/Block2_History';
// import Block3_ClinicalObservation from '../components/report/Block3_ClinicalObservation';

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

  // TODO: Carregar dados do paciente e do laudo (se existir)
  // TODO: Criar um estado unificado para os dados do laudo

  return (
    <div className="report-container">
      <h1>Geração de Laudo</h1>
      <p>Paciente: {/* patient.name */} (ID: {/* patientId */})</p>

      <ReportBlock title="Bloco 1: Identificação do Paciente">
        <p>Conteúdo do Bloco 1 (Informações do paciente carregadas aqui)...</p>
      </ReportBlock>

      <ReportBlock title="Bloco 2: Histórico">
        {/* <Block2_History /> */}
        <p>Formulário do Histórico aqui...</p>
      </ReportBlock>

      <ReportBlock title="Bloco 3: Observação Clínica">
        {/* <Block3_ClinicalObservation /> */}
        <p>Formulário da Observação Clínica aqui...</p>
      </ReportBlock>
      
      {/* ... Outros blocos virão aqui ... */}

      <button>Salvar Rascunho</button>
      <button>Gerar Laudo (Preview)</button>
    </div>
  );
};

export default ReportPage;
