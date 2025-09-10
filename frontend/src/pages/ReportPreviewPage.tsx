import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Mapa de tradução para as chaves dos dados
const translationMap: Record<string, string> = {
  full_name: 'Nome Completo',
  date_of_birth: 'Data de Nascimento',
  pregnancy_complications: 'Complicações na Gestação/Parto',
  developmental_milestones: 'Marcos do Desenvolvimento',
  medical_history: 'Histórico Médico Relevante',
  family_history: 'Antecedentes Familiares',
  verbal_communication: 'Comunicação Verbal/Não Verbal',
  social_interaction: 'Interação Social',
  repetitive_behaviors: 'Comportamentos Repetitivos/Restritos',
  sensory_sensitivities: 'Hipers ou Hipossensibilidades Sensoriais',
  dsm5_A1: 'A1: Déficits na reciprocidade socioemocional',
  dsm5_A2: 'A2: Déficits nos comportamentos comunicativos não verbais',
  dsm5_A3: 'A3: Déficits para desenvolver, manter e compreender relacionamentos',
  dsm5_B1: 'B1: Movimentos motores, uso de objetos ou fala estereotipados ou repetitivos',
  dsm5_B2: 'B2: Insistência nas mesmas coisas, adesão inflexível a rotinas ou padrões ritualizados',
  dsm5_B3: 'B3: Interesses fixos e altamente restritos que são anormais em intensidade ou foco',
  dsm5_B4: 'B4: Hiper ou hiporreatividade a estímulos sensoriais',
  differential_diagnosis: 'Hipóteses Diferenciais',
  comorbidities: 'Comorbidades',
};

const ReportPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, reportData } = location.state || {};
  const reportContentRef = React.useRef<HTMLDivElement>(null);

  if (!patient || !reportData) {
    return (
      <div className="page-container">
        <p>Dados do laudo não encontrados. Por favor, volte e tente novamente.</p>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  const handleGeneratePDF = () => {
    const input = reportContentRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`laudo-${patient.full_name}.pdf`);
      });
    }
  };

  const handleGenerateWithIA = async () => {
    // Lógica de envio para o n8n (reutilizada da ReportPage)
    const finalReportPayload = {
      patient_details: patient,
      report_data: reportData,
      generated_at: new Date().toISOString(),
    };

    try {
      const response = await fetch('https://n8n.minhalara.com.br/webhook/tea_laudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalReportPayload),
      });
      if (!response.ok) throw new Error('Falha ao enviar para o webhook.');
      alert('Laudo enviado para processamento com IA!');
    } catch (error) {
      alert('Erro ao enviar o laudo para a IA.');
      console.error(error);
    }
  };

  const renderSection = (title: string, data: Record<string, any>) => (
    <div className="preview-section">
      <h4>{title}</h4>
      {Object.entries(data).map(([key, value]) => {
        if (value === true) { // Para checkboxes
          return <p key={key}>✓ {translationMap[key] || key}</p>;
        }
        if (typeof value === 'string' && value.trim() !== '') {
          return <p key={key}><strong>{translationMap[key] || key}:</strong> {value}</p>;
        }
        return null;
      })}
    </div>
  );

  return (
    <div className="report-preview-container">
      <div className="report-preview-content" ref={reportContentRef}>
        <header className="preview-header">
          <img src="/logo.png" alt="Blua Logo" className="preview-logo" />
          <span className="preview-title">Laudo Médico</span>
        </header>
        <main className="preview-body">
          <h3>Identificação do Paciente</h3>
          <p><strong>Nome Completo:</strong> {patient.full_name}</p>
          <p><strong>Data de Nascimento:</strong> {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}</p>
          
          {renderSection("Histórico", reportData.history)}
          {renderSection("Observação Clínica", reportData.clinical_observation)}
          
          <div className="preview-section">
            <h4>Instrumentos Aplicados</h4>
            {reportData.applied_instruments.map((inst: any, index: number) => (
              <div key={index} className="instrument-preview">
                <p><strong>Instrumento {index + 1}:</strong> {inst.instrument_name}</p>
                <p><strong>Data:</strong> {inst.application_date}</p>
                <p><strong>Resultados:</strong> {inst.scores_results}</p>
              </div>
            ))}
          </div>

          {renderSection("Critérios Diagnósticos", reportData.diagnostic_criteria)}
        </main>
        <footer className="preview-footer">
          <span>(45) 3198-1010</span>
          <span>Av. Felipe Wandscheer, 2990 | Sala 09 – São Roque, Foz do Iguaçu – PR</span>
        </footer>
      </div>
      <div className="preview-actions">
        <button onClick={() => navigate(-1)} className="btn-secondary">Voltar e Editar</button>
        <button onClick={handleGeneratePDF} className="btn-primary">Gerar PDF</button>
        <button onClick={handleGenerateWithIA} className="btn-success">Gerar Laudo com IA</button>
      </div>
    </div>
  );
};

export default ReportPreviewPage;
