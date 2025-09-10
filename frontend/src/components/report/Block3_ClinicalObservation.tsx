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
};

const Block3_ClinicalObservation: React.FC<BlockProps> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange(name as keyof ReportData['clinical_observation'], value);
  };

  return (
    <div className="form-block">
      <div className="form-group">
        <label htmlFor="verbal_communication">Comunicação (verbal/não verbal)</label>
        <textarea
          id="verbal_communication"
          name="verbal_communication"
          value={data.clinical_observation.verbal_communication}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="social_interaction">Interação social</label>
        <textarea
          id="social_interaction"
          name="social_interaction"
          value={data.clinical_observation.social_interaction}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="repetitive_behaviors">Comportamentos repetitivos/restritos</label>
        <textarea
          id="repetitive_behaviors"
          name="repetitive_behaviors"
          value={data.clinical_observation.repetitive_behaviors}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="sensory_sensitivities">Hipers ou hipossensibilidades sensoriais</label>
        <textarea
          id="sensory_sensitivities"
          name="sensory_sensitivities"
          value={data.clinical_observation.sensory_sensitivities}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="file_upload_observation">Upload de vídeo de observação clínica</label>
        <input type="file" id="file_upload_observation" accept="video/*" />
        {/* TODO: Implementar lógica de upload para o Supabase Storage */}
      </div>
    </div>
  );
};

export default Block3_ClinicalObservation;
