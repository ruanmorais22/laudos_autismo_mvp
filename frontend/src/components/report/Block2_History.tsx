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
};

const Block2_History: React.FC<BlockProps> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange(name as keyof ReportData['history'], value);
  };

  return (
    <div className="form-block">
      <div className="form-group">
        <label htmlFor="pregnancy_complications">Gestação/parto (complicações?)</label>
        <textarea
          id="pregnancy_complications"
          name="pregnancy_complications"
          value={data.history.pregnancy_complications}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="developmental_milestones">Marcos do desenvolvimento (fala, marcha, socialização)</label>
        <textarea
          id="developmental_milestones"
          name="developmental_milestones"
          value={data.history.developmental_milestones}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="medical_history">Histórico médico relevante</label>
        <textarea
          id="medical_history"
          name="medical_history"
          value={data.history.medical_history}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="family_history">Antecedentes familiares</label>
        <textarea
          id="family_history"
          name="family_history"
          value={data.history.family_history}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor="file_upload_history">Upload de relatórios médicos anteriores</label>
        <input type="file" id="file_upload_history" multiple />
        {/* TODO: Implementar lógica de upload para o Supabase Storage */}
      </div>
    </div>
  );
};

export default Block2_History;
