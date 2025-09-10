import React, { useState, useEffect } from 'react';

export type Instrument = {
  id: string; // Para controle no React
  instrument_name: string;
  application_date: string;
  scores_results: string;
};

type ReportData = {
  applied_instruments: Instrument[];
};

type BlockProps = {
  data: ReportData;
  onDataChange: (field: keyof ReportData, value: Instrument[]) => void;
};

const Block4_AppliedInstruments: React.FC<BlockProps> = ({ data, onDataChange }) => {
  const [instruments, setInstruments] = useState<Instrument[]>(data.applied_instruments);

  useEffect(() => {
    onDataChange('applied_instruments', instruments);
  }, [instruments, onDataChange]);

  const handleAddInstrument = () => {
    setInstruments([
      ...instruments,
      { id: `temp-${Date.now()}`, instrument_name: '', application_date: '', scores_results: '' },
    ]);
  };

  const handleRemoveInstrument = (id: string) => {
    setInstruments(instruments.filter(inst => inst.id !== id));
  };

  const handleChange = (id: string, field: keyof Omit<Instrument, 'id'>, value: string) => {
    setInstruments(
      instruments.map(inst => (inst.id === id ? { ...inst, [field]: value } : inst))
    );
  };

  return (
    <div className="form-block">
      {instruments.map((instrument, index) => (
        <div key={instrument.id} className="instrument-entry">
          <h4>Instrumento {index + 1}</h4>
          <div className="form-group">
            <label htmlFor={`instrument_name_${instrument.id}`}>Nome do teste/escala</label>
            <input
              type="text"
              id={`instrument_name_${instrument.id}`}
              value={instrument.instrument_name}
              onChange={(e) => handleChange(instrument.id, 'instrument_name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`application_date_${instrument.id}`}>Data de aplicação</label>
            <input
              type="date"
              id={`application_date_${instrument.id}`}
              value={instrument.application_date}
              onChange={(e) => handleChange(instrument.id, 'application_date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`scores_results_${instrument.id}`}>Escore/resultados</label>
            <textarea
              id={`scores_results_${instrument.id}`}
              value={instrument.scores_results}
              onChange={(e) => handleChange(instrument.id, 'scores_results', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`file_upload_instrument_${instrument.id}`}>Upload de protocolos/testes</label>
            <input type="file" id={`file_upload_instrument_${instrument.id}`} />
          </div>
          <button type="button" className="btn-remove" onClick={() => handleRemoveInstrument(instrument.id)}>
            Remover Instrumento
          </button>
        </div>
      ))}
      <button type="button" className="btn-add" onClick={handleAddInstrument}>
        + Adicionar Instrumento
      </button>
    </div>
  );
};

export default Block4_AppliedInstruments;
