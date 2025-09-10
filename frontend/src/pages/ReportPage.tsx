import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  // TEMPORARIAMENTE DESABILITADO - Upload de arquivos
  // const [lastSaved, setLastSaved] = useState<Date | null>(null);
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // const [filesToUpload, setFilesToUpload] = useState<{ [key: string]: FileList | null }>({});
  // const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  // const sanitizeFileName = (name: string) => {
  //   const extension = name.split('.').pop();
  //   const baseName = name.substring(0, name.lastIndexOf('.'));
  //   return baseName
  //     .normalize("NFD")
  //     .replace(/[\u0300-\u036f]/g, "")
  //     .toLowerCase()
  //     .replace(/[^a-z0-9\s-]/g, '')
  //     .trim()
  //     .replace(/\s+/g, '-') + `.${extension}`;
  // };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setError('ID do paciente não fornecido');
        setLoading(false);
        return;
      }
      try {
        const { data, error: fetchError } = await supabase.from('patients').select('*').eq('id', patientId).single();
        if (fetchError) throw fetchError;
        setPatient(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  const [reportData, setReportData] = useState({
    history: { pregnancy_complications: '', developmental_milestones: '', medical_history: '', family_history: '' },
    clinical_observation: { verbal_communication: '', nonverbal_communication: '', social_interaction: '', repetitive_behaviors: '', sensory_sensitivities: '' },
    applied_instruments: [] as Instrument[],
    diagnostic_criteria: { dsm5_A1: false, dsm5_A2: false, dsm5_A3: false, dsm5_B1: false, dsm5_B2: false, dsm5_B3: false, dsm5_B4: false, differential_diagnosis: '', comorbidities: '' },
  });

  const calculateAge = (dateOfBirth: string): string => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return `${age} anos`;
  };

  const isBlockCompleted = useCallback((blockName: string): boolean => {
    switch (blockName) {
      case 'history': return Object.values(reportData.history).some(v => v.trim() !== '');
      case 'clinical_observation': return Object.values(reportData.clinical_observation).some(v => v.trim() !== '');
      case 'applied_instruments': return reportData.applied_instruments.length > 0;
      case 'diagnostic_criteria':
        const { diagnostic_criteria } = reportData;
        const hasChecks = Object.keys(diagnostic_criteria).some(k => k.startsWith('dsm5_') && diagnostic_criteria[k as keyof typeof diagnostic_criteria]);
        return hasChecks || !!diagnostic_criteria.differential_diagnosis.trim() || !!diagnostic_criteria.comorbidities.trim();
      default: return false;
    }
  }, [reportData]);

  const blocksToCheck = ['history', 'clinical_observation', 'applied_instruments', 'diagnostic_criteria'];
  const completedBlocks = blocksToCheck.filter(isBlockCompleted).length;
  const progressPercentage = (completedBlocks / blocksToCheck.length) * 100;

  const handleDataChange = (block: keyof typeof reportData, field: any, value: any) => {
    setReportData(prev => ({
      ...prev,
      [block]: {
        ...(prev[block] as any),
        [field]: value,
      },
    }));
    // setHasUnsavedChanges(true);
  };

  const handleInstrumentsChange = (_field: 'applied_instruments', value: Instrument[]) => {
    setReportData(prev => ({ ...prev, applied_instruments: value }));
    // setHasUnsavedChanges(true);
  };

  // TEMPORARIAMENTE DESABILITADO - Upload de arquivos
  // const handleFilesChange = (block: string, files: FileList | null, id?: string) => {
  //   const key = id ? `${block}-${id}` : block;
  //   setFilesToUpload(prev => ({ ...prev, [key]: files }));
  //   setHasUnsavedChanges(true);
  // };

  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  useEffect(() => {
    const loadReportData = async () => {
      if (!patient) return;
      const reportIdFromUrl = searchParams.get('reportId');
      if (!reportIdFromUrl) {
        // Lógica para resetar estado para um novo laudo
        setCurrentReportId(null);
        setReportData({
          history: { pregnancy_complications: '', developmental_milestones: '', medical_history: '', family_history: '' },
          clinical_observation: { verbal_communication: '', nonverbal_communication: '', social_interaction: '', repetitive_behaviors: '', sensory_sensitivities: '' },
          applied_instruments: [],
          diagnostic_criteria: { dsm5_A1: false, dsm5_A2: false, dsm5_A3: false, dsm5_B1: false, dsm5_B2: false, dsm5_B3: false, dsm5_B4: false, differential_diagnosis: '', comorbidities: '' },
        });
        // setExistingAttachments([]);
        return;
      }

      try {
        const { data: report, error: reportError } = await supabase.from('reports').select('*').eq('id', reportIdFromUrl).single();
        if (reportError) throw reportError;
        if (!report) return;

        setCurrentReportId(report.id);
        
        const [historyRes, obsRes, instrumentsRes, criteriaRes, diffRes] = await Promise.all([
          supabase.from('report_history').select('*').eq('report_id', report.id).single(),
          supabase.from('clinical_observations').select('*').eq('report_id', report.id).single(),
          supabase.from('applied_instruments').select('*').eq('report_id', report.id),
          supabase.from('diagnostic_criteria').select('*').eq('report_id', report.id),
          supabase.from('differential_diagnoses').select('*').eq('report_id', report.id),
          // supabase.from('attachments').select('*').eq('report_id', report.id)
        ]);

        const criteriaMap = (criteriaRes.data || []).reduce((acc, item) => ({ ...acc, [`dsm5_${item.criterion}`]: item.is_met }), {});
        const differentials = (diffRes.data || []).filter(d => d.diagnosis_type === 'DIFFERENTIAL').map(d => d.condition_name).join(', ');
        const comorbidities = (diffRes.data || []).filter(d => d.diagnosis_type === 'COMORBIDITY').map(d => d.condition_name).join(', ');

        setReportData({
          history: historyRes.data || {},
          clinical_observation: obsRes.data || {},
          applied_instruments: instrumentsRes.data || [],
          diagnostic_criteria: { ...criteriaMap, differential_diagnosis: differentials, comorbidities },
        });
        // setExistingAttachments(attachmentsRes.data || []);

      } catch (err) {
        console.error('Erro ao carregar dados do laudo:', err);
      }
    };
    loadReportData();
  }, [patient, searchParams]);

  const handleSaveDraft = async () => {
    if (!patient) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      let reportId = currentReportId;
      if (!reportId) {
        const { data: newReport, error } = await supabase.from('reports').insert({ patient_id: patient.id, professional_id: user.id, title: `Laudo TEA - ${patient.full_name}` }).select().single();
        if (error) throw error;
        reportId = newReport.id;
        setCurrentReportId(reportId);
      }

      if (!reportId) throw new Error("ID do relatório não disponível.");

      // Salvar dados textuais
      await Promise.all([
        supabase.from('report_history').upsert({ report_id: reportId, ...reportData.history }, { onConflict: 'report_id' }),
        supabase.from('clinical_observations').upsert({ report_id: reportId, ...reportData.clinical_observation }, { onConflict: 'report_id' }),
      ]);

      // Salvar dados que não são 1-para-1
      await supabase.from('applied_instruments').delete().eq('report_id', reportId);
      if (reportData.applied_instruments.length > 0) {
        const instrumentsToInsert = reportData.applied_instruments.map(({ id, ...rest }) => ({ ...rest, report_id: reportId }));
        await supabase.from('applied_instruments').insert(instrumentsToInsert);
      }
      
      // ... (lógica para salvar criteria e diagnoses)

      // TEMPORARIAMENTE DESABILITADO - Upload de arquivos
      // for (const key in filesToUpload) {
      //   const fileList = filesToUpload[key];
      //   if (fileList) {
      //     for (let i = 0; i < fileList.length; i++) {
      //       const file = fileList[i];
      //       const sanitizedName = sanitizeFileName(file.name);
      //       const filePath = `${user.id}/${reportId}/${key}/${sanitizedName}`;
      //       
      //       await supabase.storage.from('report_attachments').upload(filePath, file, { upsert: true });
      //       await supabase.from('attachments').insert({ report_id: reportId, block_reference: key, file_name: sanitizedName, storage_path: filePath, created_by: user.id });
      //     }
      //   }
      // }
      // setFilesToUpload({});
      
      // setLastSaved(new Date());
      // setHasUnsavedChanges(false);
      alert('Rascunho salvo com sucesso!');
    } catch (err: any) {
      alert(`Erro ao salvar rascunho: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePreview = () => {
    if (!patient) return;
    navigate('/report/preview', { state: { patient, reportData } });
  };

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
      // Obter dados do usuário/profissional
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar informações completas do profissional na tabela profiles
      const { data: professionalData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const finalReportPayload = {
        patient_details: patient,
        report_data: reportData,
        professional_details: {
          auth_user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            created_at: user.created_at,
            user_metadata: user.user_metadata,
          },
          profile: professionalData || {},
        },
        report_metadata: {
          report_id: currentReportId,
          generated_at: new Date().toISOString(),
          generated_by: user.id,
          application_version: '1.0.0',
        },
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

      // Marcar o laudo como 'CONCLUIDO' no banco de dados se houver currentReportId
      if (currentReportId) {
        await supabase
          .from('reports')
          .update({ status: 'CONCLUIDO', updated_at: new Date().toISOString() })
          .eq('id', currentReportId);
      }

      alert('Laudo gerado e enviado com sucesso!');
      navigate('/patients');
    } catch (err: any) {
      console.error('Erro ao gerar laudo:', err);
      alert(`Ocorreu um erro ao enviar o laudo: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!patient) return <div>Paciente não encontrado.</div>;

  return (
    <div className="report-page">
      <StickyProgressBar progress={progressPercentage} isVisible={isScrolled} />
      <div className="report-header">
        {/* ... (cabeçalho existente) */}
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

          <ReportBlock title="Histórico e Anamnese" stepNumber={2} isCompleted={isBlockCompleted('history')} description="Histórico médico, desenvolvimento e antecedentes familiares">
            <Block2_History data={reportData} onDataChange={(field, value) => handleDataChange('history', field, value)} />
          </ReportBlock>
          <ReportBlock title="Observação Clínica" stepNumber={3} isCompleted={isBlockCompleted('clinical_observation')} description="Avaliação comportamental e observações clínicas">
            <Block3_ClinicalObservation data={reportData} onDataChange={(field, value) => handleDataChange('clinical_observation', field, value)} />
          </ReportBlock>
          <ReportBlock title="Instrumentos Aplicados" stepNumber={4} isCompleted={isBlockCompleted('applied_instruments')} description="Escalas e testes utilizados na avaliação">
            <Block4_AppliedInstruments data={reportData} onDataChange={handleInstrumentsChange} />
          </ReportBlock>
          <ReportBlock title="Critérios Diagnósticos" stepNumber={5} isCompleted={isBlockCompleted('diagnostic_criteria')} description="Critérios DSM-5 e conclusões diagnósticas">
            <Block5_DiagnosticCriteria data={reportData} onDataChange={(field, value) => handleDataChange('diagnostic_criteria', field, value)} />
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

            <button 
              className="btn-cancel outline"
              onClick={() => navigate('/patients')}
              disabled={isSaving}
            >
              ❌ Cancelar
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
