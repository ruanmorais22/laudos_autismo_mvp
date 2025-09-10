import React from 'react';

// No futuro, os tipos virão de um arquivo central
type ReportData = {
  history: {
    pregnancy_complications: string;
    developmental_milestones: string;
    medical_history: string;
    family_history: string;
  };
};

type BlockProps = {
  data: ReportData;
  onDataChange: (field: keyof ReportData['history'], value: string) => void;
  onFilesChange: (block: string, files: FileList | null) => void;
  attachments: any[];
};

const Block2_History: React.FC<BlockProps> = ({ data, onDataChange, onFilesChange, attachments }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange(name as keyof ReportData['history'], value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesChange('history', e.target.files);
  };

  return (
    <div className="form-block">
      <div className="form-group">
        <label htmlFor="pregnancy_complications">
          🤰 Gestação e Parto
        </label>
        <textarea
          id="pregnancy_complications"
          name="pregnancy_complications"
          value={data.history.pregnancy_complications}
          onChange={handleChange}
          placeholder="Descreva complicações durante a gestação, parto prematuro, peso ao nascer, uso de medicamentos, etc."
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="developmental_milestones">
          👶 Marcos do Desenvolvimento
        </label>
        <textarea
          id="developmental_milestones"
          name="developmental_milestones"
          value={data.history.developmental_milestones}
          onChange={handleChange}
          placeholder="Descreva o desenvolvimento da fala, marcha, socialização, controle esfincteriano, marcos motores, etc."
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="medical_history">
          🏥 Histórico Médico Relevante
        </label>
        <textarea
          id="medical_history"
          name="medical_history"
          value={data.history.medical_history}
          onChange={handleChange}
          placeholder="Inclua hospitalizações, cirurgias, medicamentos em uso, alergias, convulsões, problemas auditivos/visuais, etc."
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="family_history">
          👨‍👩‍👧‍👦 Antecedentes Familiares
        </label>
        <textarea
          id="family_history"
          name="family_history"
          value={data.history.family_history}
          onChange={handleChange}
          placeholder="Histórico de TEA, deficiência intelectual, transtornos psiquiátricos ou outros transtornos do neurodesenvolvimento na família."
          rows={4}
        />
      </div>
      
      {/* TEMPORARIAMENTE DESABILITADO - Upload de arquivos
      <div className="form-group">
        <label htmlFor="file_upload_history">
          📁 Documentos Médicos Anteriores
        </label>
        <input 
          type="file" 
          id="file_upload_history" 
          multiple 
          accept=".pdf,.doc,.docx,.jpg,.png"
          title="Selecione relatórios médicos, exames ou documentos relevantes"
          onChange={handleFileChange}
        />
        <small className="file-help">
          💡 Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB por arquivo)
        </small>
        {attachments && attachments.length > 0 && (
          <div className="attachments-list">
            <strong>Anexos salvos:</strong>
            <ul>
              {attachments.map(file => (
                <li key={file.id}>
                  <a href={`https://gqqajzezmpjzmcamfzzo.supabase.co/storage/v1/object/public/report_attachments/${file.storage_path}`} target="_blank" rel="noopener noreferrer">
                    {file.file_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      */}
    </div>
  );
};

export default Block2_History;
