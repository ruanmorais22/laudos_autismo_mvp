import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

import Block2_History from '../components/report/Block2_History';
import Block3_ClinicalObservation from '../components/report/Block3_ClinicalObservation';
import Block4_AppliedInstruments from '../components/report/Block4_AppliedInstruments';
import type { Instrument } from '../components/report/Block4_AppliedInstruments';
import Block5_DiagnosticCriteria from '../components/report/Block5_DiagnosticCriteria';

type Patient = {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  created_at: string;
  created_by: string;
};

type ReportBlockProps = {
  title: string;
  children: React.ReactNode;
  isCompleted: boolean;
  stepNumber: number;
  description?: string;
};

const ReportBlock: React.FC<ReportBlockProps> = ({ title, children, isCompleted, stepNumber, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`report-block ${isCompleted ? 'completed' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="report-block-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="block-header-left">
          <div className={`step-indicator ${isCompleted ? 'completed' : ''}`}>
            {isCompleted ? '✓' : stepNumber}
          </div>
          <div className="block-title-section">
            <h3>{title}</h3>
            {description && <p className="block-description">{description}</p>}
          </div>
        </div>
        <div className="block-header-right">
          <span className={`completion-status ${isCompleted ? 'completed' : 'pending'}`}>
            {isCompleted ? 'Completo' : 'Pendente'}
          </span>
          <div className={`expand-icon ${isOpen ? 'rotated' : ''}`}>
            ⌄
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="report-block-content">
          {children}
        </div>
      )}
    </div>
  );
};

const StickyProgressBar: React.FC<{ progress: number; isVisible: boolean }> = ({ progress, isVisible }) => {
  return (
    <div className={`sticky-progress-bar ${isVisible ? 'visible' : ''}`}>
      <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
    </div>
  );
};

const ReportPage: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Efeito para detectar a rolagem da página
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Buscar dados do paciente
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setError('ID do paciente não fornecido');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setPatient(data);
        }
      } catch (err) {
        setError('Erro ao carregar dados do paciente');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

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
    applied_instruments: [] as Instrument[],
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
  });

  // Função para calcular idade
  const calculateAge = (dateOfBirth: string): string => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} anos`;
    }
    return `${age} anos`;
  };

  // Função para verificar se um bloco está completo
  const isBlockCompleted = (blockName: string): boolean => {
    switch (blockName) {
      case 'history':
        return Object.values(reportData.history).some(value => value.trim() !== '');
      case 'clinical_observation':
        return Object.values(reportData.clinical_observation).some(value => value.trim() !== '');
      case 'applied_instruments':
        return reportData.applied_instruments.length > 0;
      case 'diagnostic_criteria':
        const { diagnostic_criteria } = reportData;
        const hasCheckedCriteria = Object.entries(diagnostic_criteria)
          .filter(([key]) => key.startsWith('dsm5_'))
          .some(([, value]) => value === true);
        return hasCheckedCriteria || diagnostic_criteria.differential_diagnosis.trim() !== '' || diagnostic_criteria.comorbidities.trim() !== '';
      default:
        return false;
    }
  };

  // Calcular progresso geral
  const blocksToCheck = ['history', 'clinical_observation', 'applied_instruments', 'diagnostic_criteria'];
  const completedBlocks = blocksToCheck.filter(block => isBlockCompleted(block)).length;
  const totalBlocks = blocksToCheck.length; // Total de blocos que contam para o progresso
  const progressPercentage = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  // Handler para atualizar os dados do Bloco 2
  const handleHistoryChange = (field: keyof typeof reportData.history, value: string) => {
    setReportData(prevData => ({
      ...prevData,
      history: {
        ...prevData.history,
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const handleInstrumentsChange = (field: 'applied_instruments', value: Instrument[]) => {
    setReportData(prevData => ({
      ...prevData,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Estado para armazenar o ID do relatório atual
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  // Carregar dados do laudo se já existirem
  useEffect(() => {
    const loadReportData = async () => {
      if (!patient) return;

      try {
        // Buscar relatório principal
        const { data: reportData, error: reportError } = await supabase
          .from('reports')
          .select('*')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (reportError) {
          console.error('Erro ao carregar relatório:', reportError);
          return;
        }

        if (reportData && reportData.length > 0) {
          const report = reportData[0];
          setCurrentReportId(report.id);

          // Carregar dados do histórico
          const { data: historyData } = await supabase
            .from('report_history')
            .select('*')
            .eq('report_id', report.id)
            .single();

          // Carregar observações clínicas
          const { data: observationData } = await supabase
            .from('clinical_observations')
            .select('*')
            .eq('report_id', report.id)
            .single();

          // Carregar critérios diagnósticos
          const { data: criteriaData } = await supabase
            .from('diagnostic_criteria')
            .select('*')
            .eq('report_id', report.id);

          // Carregar diagnósticos diferenciais
          const { data: differentialData } = await supabase
            .from('differential_diagnoses')
            .select('*')
            .eq('report_id', report.id);

          // Carregar instrumentos aplicados
          const { data: instrumentsData } = await supabase
            .from('applied_instruments')
            .select('*')
            .eq('report_id', report.id);

          // Preparar critérios DSM-5
          const criteriaMap: { [key: string]: boolean } = {};
          if (criteriaData) {
            criteriaData.forEach((item: any) => {
              criteriaMap[`dsm5_${item.criterion}`] = item.is_met;
            });
          }

          // Preparar diagnósticos diferenciais
          const differentials = differentialData?.filter((d: any) => d.diagnosis_type === 'DIFFERENTIAL') || [];
          const comorbidities = differentialData?.filter((d: any) => d.diagnosis_type === 'COMORBIDITY') || [];

          setReportData({
            history: {
              pregnancy_complications: historyData?.pregnancy_complications || '',
              developmental_milestones: historyData?.developmental_milestones || '',
              medical_history: historyData?.relevant_medical_history || '',
              family_history: historyData?.family_history || '',
            },
            clinical_observation: {
              verbal_communication: observationData?.verbal_communication || '',
              nonverbal_communication: observationData?.nonverbal_communication || '',
              social_interaction: observationData?.social_interaction || '',
              repetitive_behaviors: observationData?.repetitive_behaviors || '',
              sensory_sensitivities: observationData?.sensory_hypersensitivity || '',
            },
            applied_instruments: instrumentsData || [],
            diagnostic_criteria: {
              dsm5_A1: criteriaMap['dsm5_A1'] || false,
              dsm5_A2: criteriaMap['dsm5_A2'] || false,
              dsm5_A3: criteriaMap['dsm5_A3'] || false,
              dsm5_B1: criteriaMap['dsm5_B1'] || false,
              dsm5_B2: criteriaMap['dsm5_B2'] || false,
              dsm5_B3: criteriaMap['dsm5_B3'] || false,
              dsm5_B4: criteriaMap['dsm5_B4'] || false,
              differential_diagnosis: differentials.map((d: any) => d.condition_name).join(', '),
              comorbidities: comorbidities.map((c: any) => c.condition_name).join(', '),
            },
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados do laudo:', err);
      }
    };

    loadReportData();
  }, [patient]);

  // Função para salvar rascunho
  const handleSaveDraft = async () => {
    if (!patient) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Erro: Usuário não autenticado');
        setIsSaving(false);
        return;
      }

      let reportId = currentReportId;

      // 1. Criar ou atualizar o relatório principal
      if (!reportId) {
        const { data: newReport, error: reportError } = await supabase
          .from('reports')
          .insert([{
            patient_id: patient.id,
            professional_id: user.id,
            title: `Laudo TEA - ${patient.full_name}`,
            status: 'RASCUNHO',
          }])
          .select()
          .single();

        if (reportError) throw reportError;
        reportId = newReport.id;
        setCurrentReportId(reportId);
      }

      // 2. Salvar dados do histórico
      const historyData = {
        report_id: reportId,
        pregnancy_complications: reportData.history.pregnancy_complications,
        developmental_milestones: reportData.history.developmental_milestones,
        relevant_medical_history: reportData.history.medical_history,
        family_history: reportData.history.family_history,
        updated_at: new Date().toISOString(),
      };

      const { error: historyError } = await supabase
        .from('report_history')
        .upsert(historyData, { onConflict: 'report_id' });

      if (historyError) throw historyError;

      // Garantir que reportId não é nulo para as próximas operações
      if (!reportId) throw new Error("ID do relatório não está disponível após a criação.");

      // 3. Salvar observações clínicas
      const observationData = {
        report_id: reportId,
        verbal_communication: reportData.clinical_observation.verbal_communication,
        nonverbal_communication: reportData.clinical_observation.nonverbal_communication,
        social_interaction: reportData.clinical_observation.social_interaction,
        repetitive_behaviors: reportData.clinical_observation.repetitive_behaviors,
        sensory_hypersensitivity: reportData.clinical_observation.sensory_sensitivities,
        updated_at: new Date().toISOString(),
      };

      const { error: observationError } = await supabase
        .from('clinical_observations')
        .upsert(observationData, { onConflict: 'report_id' });

      if (observationError) throw observationError;

      // 4. Salvar critérios diagnósticos
      // Primeiro, deletar critérios existentes
      await supabase
        .from('diagnostic_criteria')
        .delete()
        .eq('report_id', reportId);

      // Inserir novos critérios marcados
      const criteriaToInsert: { report_id: string; criterion: string; is_met: boolean }[] = [];
      Object.entries(reportData.diagnostic_criteria).forEach(([key, value]) => {
        if (key.startsWith('dsm5_') && value === true) {
          const criterion = key.replace('dsm5_', '');
          criteriaToInsert.push({
            report_id: reportId,
            criterion: criterion,
            is_met: true,
          });
        }
      });

      if (criteriaToInsert.length > 0) {
        const { error: criteriaError } = await supabase
          .from('diagnostic_criteria')
          .insert(criteriaToInsert);

        if (criteriaError) throw criteriaError;
      }

      // 5. Salvar diagnósticos diferenciais e comorbidades
      // Deletar existentes
      await supabase
        .from('differential_diagnoses')
        .delete()
        .eq('report_id', reportId);

      // Inserir novos
      const diagnosesToInsert: { report_id: string; diagnosis_type: string; condition_name: string }[] = [];
      
      if (reportData.diagnostic_criteria.differential_diagnosis.trim()) {
        const differentials = reportData.diagnostic_criteria.differential_diagnosis
          .split(',')
          .map(d => d.trim())
          .filter(d => d.length > 0);
        
        differentials.forEach(condition => {
          diagnosesToInsert.push({
            report_id: reportId,
            diagnosis_type: 'DIFFERENTIAL',
            condition_name: condition,
          });
        });
      }

      if (reportData.diagnostic_criteria.comorbidities.trim()) {
        const comorbidities = reportData.diagnostic_criteria.comorbidities
          .split(',')
          .map(c => c.trim())
          .filter(c => c.length > 0);
        
        comorbidities.forEach(condition => {
          diagnosesToInsert.push({
            report_id: reportId,
            diagnosis_type: 'COMORBIDITY',
            condition_name: condition,
          });
        });
      }

      if (diagnosesToInsert.length > 0) {
        const { error: diagnosesError } = await supabase
          .from('differential_diagnoses')
          .insert(diagnosesToInsert);

        if (diagnosesError) throw diagnosesError;
      }

      // 6. Salvar instrumentos aplicados
      // Deletar existentes
      await supabase
        .from('applied_instruments')
        .delete()
        .eq('report_id', reportId);
      
      // Inserir novos
      const instrumentsToInsert = reportData.applied_instruments.map(({ id, ...rest }) => ({
        ...rest,
        report_id: reportId,
      }));

      if (instrumentsToInsert.length > 0) {
        const { error: instrumentsError } = await supabase
          .from('applied_instruments')
          .insert(instrumentsToInsert);
        
        if (instrumentsError) throw instrumentsError;
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      alert('Rascunho salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para gerar preview
  const handleGeneratePreview = () => {
    if (!patient) {
      alert('Erro: Dados do paciente não encontrados.');
      return;
    }
    // Passa os dados via state do router para a página de preview
    navigate('/report/preview', { state: { patient, reportData } });
  };

  // Função para gerar e enviar o laudo final
  const handleGenerateReport = async () => {
    if (!patient) {
      alert('Erro: Dados do paciente não encontrados.');
      return;
    }

    if (progressPercentage < 80) {
      alert('Complete pelo menos 80% do formulário para gerar o laudo final.');
      return;
    }

    const confirmation = window.confirm('Tem certeza que deseja gerar e enviar o laudo final?');
    if (!confirmation) {
      return;
    }

    setIsSaving(true);
    try {
      const finalReportPayload = {
        patient_details: patient,
        report_data: reportData,
        generated_at: new Date().toISOString(),
      };

      const response = await fetch('https://n8n.minhalara.com.br/webhook/tea_laudos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalReportPayload),
      });

      if (!response.ok) {
        throw new Error(`Erro na comunicação com o servidor: ${response.statusText}`);
      }

      // TODO: Marcar o laudo como 'CONCLUIDO' no banco de dados.

      alert('Laudo gerado e enviado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar laudo:', err);
      alert(`Ocorreu um erro ao enviar o laudo: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Carregando dados do paciente...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Erro ao carregar paciente</h3>
          <p>{error}</p>
          <button onClick={() => window.history.back()} className="secondary">
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Paciente não encontrado</h3>
          <p>O paciente com ID {patientId} não foi encontrado no sistema.</p>
          <button onClick={() => window.history.back()} className="secondary">
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <StickyProgressBar progress={progressPercentage} isVisible={isScrolled} />
      <div className="report-header">
        <div className="patient-info-card">
          <div className="patient-avatar">👤</div>
          <div className="patient-details">
            <h1>{patient.full_name}</h1>
            <div className="patient-meta">
              <span>Idade: {calculateAge(patient.date_of_birth)}</span>
              <span>•</span>
              <span>Gênero: {patient.gender === 'NAO_INFORMADO' ? 'Não informado' : 
                patient.gender === 'MASCULINO' ? 'Masculino' : 
                patient.gender === 'FEMININO' ? 'Feminino' : 'Outro'}</span>
              <span>•</span>
              <span>ID: {patient.id}</span>
            </div>
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-info">
            <h3>Progresso do Laudo</h3>
            <div className="progress-right">
              <span className="progress-text">{progressPercentage}% Completo</span>
              {lastSaved && (
                <div className="save-status">
                  <span className={hasUnsavedChanges ? 'unsaved' : 'saved'}>
                    {hasUnsavedChanges ? '⚠️ Alterações não salvas' : '✅ Salvo'}
                  </span>
                  <small>
                    Último salvamento: {lastSaved.toLocaleTimeString('pt-BR')}
                  </small>
                </div>
              )}
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-details">
            {completedBlocks} de {totalBlocks} seções completas
          </div>
        </div>
      </div>

      <div className="report-content">
        <div className="report-blocks">
          <ReportBlock 
            title="Identificação do Paciente" 
            stepNumber={1}
            isCompleted={true}
            description="Dados pessoais e informações básicas do paciente"
          >
            <div className="patient-identification">
              <div className="info-grid">
                <div className="info-item">
                  <label>Nome Completo:</label>
                  <span>{patient.full_name}</span>
                </div>
                <div className="info-item">
                  <label>Data de Nascimento:</label>
                  <span>{new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="info-item">
                  <label>Idade:</label>
                  <span>{calculateAge(patient.date_of_birth)}</span>
                </div>
                <div className="info-item">
                  <label>Gênero:</label>
                  <span>{patient.gender === 'NAO_INFORMADO' ? 'Não informado' : 
                    patient.gender === 'MASCULINO' ? 'Masculino' : 
                    patient.gender === 'FEMININO' ? 'Feminino' : 'Outro'}</span>
                </div>
                <div className="info-item">
                  <label>Data de Cadastro:</label>
                  <span>{new Date(patient.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </ReportBlock>

          <ReportBlock 
            title="Histórico e Anamnese" 
            stepNumber={2}
            isCompleted={isBlockCompleted('history')}
            description="Histórico médico, desenvolvimento e antecedentes familiares"
          >
            <Block2_History data={reportData} onDataChange={handleHistoryChange} />
          </ReportBlock>

          <ReportBlock 
            title="Observação Clínica" 
            stepNumber={3}
            isCompleted={isBlockCompleted('clinical_observation')}
            description="Avaliação comportamental e observações clínicas"
          >
            <Block3_ClinicalObservation data={reportData} onDataChange={handleClinicalObservationChange} />
          </ReportBlock>

          <ReportBlock 
            title="Instrumentos Aplicados" 
            stepNumber={4}
            isCompleted={reportData.applied_instruments.length > 0}
            description="Escalas e testes utilizados na avaliação"
          >
            <Block4_AppliedInstruments data={reportData} onDataChange={handleInstrumentsChange} />
          </ReportBlock>

          <ReportBlock 
            title="Critérios Diagnósticos" 
            stepNumber={5}
            isCompleted={isBlockCompleted('diagnostic_criteria')}
            description="Critérios DSM-5 e conclusões diagnósticas"
          >
            <Block5_DiagnosticCriteria data={reportData} onDataChange={handleDiagnosticCriteriaChange} />
          </ReportBlock>
        </div>

        <div className="report-actions">
          <div className="action-buttons">
            <button 
              className="btn-save" 
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Salvando...
                </>
              ) : (
                <>
                  💾 Salvar Rascunho
                </>
              )}
            </button>
            
            <button 
              className="btn-preview secondary" 
              onClick={handleGeneratePreview}
              disabled={progressPercentage < 60}
            >
              👁️ Visualizar Preview
            </button>
            
            <button 
              className="btn-generate success" 
              disabled={progressPercentage < 80 || isSaving}
              onClick={handleGenerateReport}
            >
              📄 Gerar Laudo Final
            </button>
          </div>
          
          <div className="action-info">
            <p className="help-text">
              💡 Dica: Complete pelo menos 80% do formulário para gerar o laudo final
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
