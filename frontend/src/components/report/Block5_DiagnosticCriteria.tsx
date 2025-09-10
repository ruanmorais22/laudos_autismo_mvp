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

  // Contar critérios preenchidos
  const criteriaAChecked = Object.entries(data.diagnostic_criteria)
    .filter(([key]) => key.startsWith('dsm5_A'))
    .filter(([, value]) => value === true).length;
  
  const criteriaBChecked = Object.entries(data.diagnostic_criteria)
    .filter(([key]) => key.startsWith('dsm5_B'))
    .filter(([, value]) => value === true).length;

  const isValidDiagnosis = criteriaAChecked >= 2 && criteriaBChecked >= 2;

  return (
    <div className="form-block">
      <div className="diagnostic-header">
        <h4>🔍 Critérios Diagnósticos DSM-5 para TEA</h4>
        <div className="criteria-status">
          <div className={`criteria-counter ${criteriaAChecked >= 2 ? 'valid' : 'pending'}`}>
            Critério A: {criteriaAChecked}/3 (mín. 2)
          </div>
          <div className={`criteria-counter ${criteriaBChecked >= 2 ? 'valid' : 'pending'}`}>
            Critério B: {criteriaBChecked}/4 (mín. 2)
          </div>
          <div className={`diagnosis-status ${isValidDiagnosis ? 'valid' : 'pending'}`}>
            {isValidDiagnosis ? '✅ Critérios atendidos' : '⚠️ Critérios insuficientes'}
          </div>
        </div>
      </div>
      
      <div className="criteria-section">
        <h5>📊 A. Déficits persistentes na comunicação social e na interação social</h5>
        <p className="criteria-instruction">Marque <strong>todas</strong> as características presentes (mínimo 2):</p>
        {Object.entries(dsm5Criteria.A).map(([key, value]) => (
          <div className="form-group-checkbox" key={key}>
            <input
              type="checkbox"
              id={key}
              name={`dsm5_${key}`}
              checked={Boolean(data.diagnostic_criteria[`dsm5_${key}` as keyof typeof data.diagnostic_criteria])}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={key}>
              <strong>{key}:</strong> {value}
            </label>
          </div>
        ))}
      </div>

      <div className="criteria-section">
        <h5>🎯 B. Padrões restritos e repetitivos de comportamento, interesses ou atividades</h5>
        <p className="criteria-instruction">Marque <strong>todas</strong> as características presentes (mínimo 2):</p>
        {Object.entries(dsm5Criteria.B).map(([key, value]) => (
          <div className="form-group-checkbox" key={key}>
            <input
              type="checkbox"
              id={key}
              name={`dsm5_${key}`}
              checked={Boolean(data.diagnostic_criteria[`dsm5_${key}` as keyof typeof data.diagnostic_criteria])}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={key}>
              <strong>{key}:</strong> {value}
            </label>
          </div>
        ))}
      </div>

      <div className="diagnostic-conclusions">
        <div className="form-group">
          <label htmlFor="differential_diagnosis">
            🔬 Diagnóstico Diferencial
          </label>
          <textarea
            id="differential_diagnosis"
            name="differential_diagnosis"
            value={data.diagnostic_criteria.differential_diagnosis}
            onChange={handleTextAreaChange}
            placeholder="Liste outras condições consideradas e descarte justificado (ex: deficiência intelectual, transtorno da linguagem, TDAH, etc.)"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="comorbidities">
            🏥 Comorbidades e Condições Associadas
          </label>
          <textarea
            id="comorbidities"
            name="comorbidities"
            value={data.diagnostic_criteria.comorbidities}
            onChange={handleTextAreaChange}
            placeholder="Descreva condições comórbidas identificadas (ex: deficiência intelectual, epilepsia, TDAH, transtornos de ansiedade, etc.)"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default Block5_DiagnosticCriteria;
