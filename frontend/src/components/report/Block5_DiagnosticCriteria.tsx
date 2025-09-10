import React from 'react';

type ReportData = {
  diagnostic_criteria: {
    dsm5_A1: boolean;
    dsm5_A2: boolean;
    dsm5_A3: boolean;
    dsm5_B1: boolean;
    dsm5_B2: boolean;
    dsm5_B3: boolean;
    dsm5_B4: boolean;
    differential_diagnosis: string;
    comorbidities: string;
  };
};

type BlockProps = {
  data: ReportData;
  onDataChange: (field: keyof ReportData['diagnostic_criteria'], value: string | boolean) => void;
};

const dsm5Criteria = {
  A: {
    A1: 'Déficits na reciprocidade socioemocional',
    A2: 'Déficits nos comportamentos comunicativos não verbais',
    A3: 'Déficits para desenvolver, manter e compreender relacionamentos',
  },
  B: {
    B1: 'Movimentos motores, uso de objetos ou fala estereotipados ou repetitivos',
    B2: 'Insistência nas mesmas coisas, adesão inflexível a rotinas ou padrões ritualizados',
    B3: 'Interesses fixos e altamente restritos que são anormais em intensidade ou foco',
    B4: 'Hiper ou hiporreatividade a estímulos sensoriais ou interesse incomum por aspectos sensoriais do ambiente',
  }
};

const Block5_DiagnosticCriteria: React.FC<BlockProps> = ({ data, onDataChange }) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onDataChange(name as keyof ReportData['diagnostic_criteria'], checked);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onDataChange(name as keyof ReportData['diagnostic_criteria'], value);
  };

  return (
    <div className="form-block">
      <h4>Critérios DSM-5 (Preencher pelo menos 2 de A e 2 de B)</h4>
      
      <h5>A. Déficits persistentes na comunicação social e na interação social</h5>
      {Object.entries(dsm5Criteria.A).map(([key, value]) => (
        <div className="form-group-checkbox" key={key}>
          <input
            type="checkbox"
            id={key}
            name={`dsm5_${key}`}
            checked={Boolean(data.diagnostic_criteria[`dsm5_${key}` as keyof typeof data.diagnostic_criteria])}
            onChange={handleCheckboxChange}
          />
          <label htmlFor={key}>{`${key}: ${value}`}</label>
        </div>
      ))}

      <h5>B. Padrões restritos e repetitivos de comportamento, interesses ou atividades</h5>
      {Object.entries(dsm5Criteria.B).map(([key, value]) => (
        <div className="form-group-checkbox" key={key}>
          <input
            type="checkbox"
            id={key}
            name={`dsm5_${key}`}
            checked={Boolean(data.diagnostic_criteria[`dsm5_${key}` as keyof typeof data.diagnostic_criteria])}
            onChange={handleCheckboxChange}
          />
          <label htmlFor={key}>{`${key}: ${value}`}</label>
        </div>
      ))}

      <div className="form-group">
        <label htmlFor="differential_diagnosis">Hipóteses diferenciais consideradas</label>
        <textarea
          id="differential_diagnosis"
          name="differential_diagnosis"
          value={data.diagnostic_criteria.differential_diagnosis}
          onChange={handleTextAreaChange}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="comorbidities">Comorbidades observadas</label>
        <textarea
          id="comorbidities"
          name="comorbidities"
          value={data.diagnostic_criteria.comorbidities}
          onChange={handleTextAreaChange}
          rows={4}
        />
      </div>
    </div>
  );
};

export default Block5_DiagnosticCriteria;
