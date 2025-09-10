import React from 'react';

type ReportData = {
  clinical_observation: {
    verbal_communication: string;
    nonverbal_communication: string;
    social_interaction: string;
    repetitive_behaviors: string;
    sensory_sensitivities: string;
  };
};

type BlockProps = {
  data: ReportData;
  onDataChange: (field: keyof ReportData['clinical_observation'], value: string) => void;
  onFilesChange: (block: string, files: FileList | null) => void;
  attachments: any[];
};

const Block3_ClinicalObservation: React.FC<BlockProps> = ({ data, onDataChange, onFilesChange, attachments }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange(name as keyof ReportData['clinical_observation'], value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesChange('clinical_observation', e.target.files);
  };

  return (
    <div className="form-block">
      <div className="clinical-observation-intro">
        <p className="observation-note">
          📝 <strong>Instruções:</strong> Descreva suas observações durante a avaliação clínica. 
          Seja específico e detalhado sobre os comportamentos observados.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="verbal_communication">
          💬 Comunicação Verbal e Não Verbal
        </label>
        <textarea
          id="verbal_communication"
          name="verbal_communication"
          value={data.clinical_observation.verbal_communication}
          onChange={handleChange}
          placeholder="Descreva: linguagem verbal (presença, qualidade, ecolalia), comunicação não verbal (gestos, expressões faciais, contato visual), pragmática da comunicação."
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="social_interaction">
          👥 Interação Social
        </label>
        <textarea
          id="social_interaction"
          name="social_interaction"
          value={data.clinical_observation.social_interaction}
          onChange={handleChange}
          placeholder="Observe: reciprocidade social, iniciativa para interação, capacidade de compartilhar interesse, resposta ao nome, imitação social, jogo simbólico."
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="repetitive_behaviors">
          🔄 Comportamentos Repetitivos e Interesses Restritos
        </label>
        <textarea
          id="repetitive_behaviors"
          name="repetitive_behaviors"
          value={data.clinical_observation.repetitive_behaviors}
          onChange={handleChange}
          placeholder="Descreva: estereotipias motoras, rituais, interesses obsessivos, uso repetitivo de objetos, resistência a mudanças, comportamentos autolesivos."
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="sensory_sensitivities">
          👂 Processamento Sensorial
        </label>
        <textarea
          id="sensory_sensitivities"
          name="sensory_sensitivities"
          value={data.clinical_observation.sensory_sensitivities}
          onChange={handleChange}
          placeholder="Observe reações a: sons, texturas, luz, movimento, dor, temperatura. Inclua tanto hiper quanto hiposensibilidades e comportamentos de busca sensorial."
          rows={4}
        />
      </div>
      
      {/* TEMPORARIAMENTE DESABILITADO - Upload de arquivos
      <div className="form-group">
        <label htmlFor="file_upload_observation">
          🎥 Registros de Observação Clínica
        </label>
        <input 
          type="file" 
          id="file_upload_observation" 
          accept="video/*,audio/*,.pdf,.doc,.docx"
          multiple
          title="Selecione vídeos, áudios ou documentos da observação clínica"
          onChange={handleFileChange}
        />
        <small className="file-help">
          💡 Formatos aceitos: Vídeos (MP4, MOV), Áudios (MP3, WAV), Documentos (PDF, DOC) - máx. 50MB por arquivo
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

export default Block3_ClinicalObservation;
