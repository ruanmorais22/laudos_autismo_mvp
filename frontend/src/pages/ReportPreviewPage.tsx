import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReportPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, reportData } = location.state || {};

  if (!patient || !reportData) {
    return (
      <div className="page-container">
        <p>Dados do laudo não encontrados. Por favor, volte e tente novamente.</p>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  // Função auxiliar para renderizar seções
  const renderSection = (title: string, data: Record<string, any>) => (
    <div className="preview-section">
      <h3>{title}</h3>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key.replace(/_/g, ' ')}:</strong> {value.toString()}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="page-container report-preview">
      <div className="page-header">
        <h1>Preview do Laudo</h1>
        <p>Paciente: {patient.full_name}</p>
      </div>

      <div className="card">
        {renderSection("Histórico", reportData.history)}
        {renderSection("Observação Clínica", reportData.clinical_observation)}
        
        <div className="preview-section">
          <h3>Instrumentos Aplicados</h3>
          {reportData.applied_instruments.map((inst: any, index: number) => (
            <div key={index} className="instrument-preview">
              <h4>Instrumento {index + 1}</h4>
              <p><strong>Nome:</strong> {inst.instrument_name}</p>
              <p><strong>Data:</strong> {inst.application_date}</p>
              <p><strong>Resultados:</strong> {inst.scores_results}</p>
            </div>
          ))}
        </div>

        {renderSection("Critérios Diagnósticos", reportData.diagnostic_criteria)}
      </div>

      <div className="page-actions">
        <button onClick={() => navigate(-1)} className="secondary">
          Voltar e Editar
        </button>
        <button className="success">
          Gerar PDF Final (TODO)
        </button>
      </div>
    </div>
  );
};

export default ReportPreviewPage;
