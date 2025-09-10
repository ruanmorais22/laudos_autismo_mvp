import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

type Patient = {
  id: string;
  full_name: string;
  date_of_birth: string;
  created_at: string;
};

type PatientFormProps = {
  onSuccess: () => void;
  patientToEdit?: Patient | null;
};

const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, patientToEdit }) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('NAO_INFORMADO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientToEdit) {
      setFullName(patientToEdit.full_name);
      setDateOfBirth(new Date(patientToEdit.date_of_birth).toISOString().split('T')[0]);
    }
  }, [patientToEdit]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Simplesmente para obter o ID do usuário logado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Você precisa estar logado para adicionar um paciente.');
      setLoading(false);
      return;
    }

    if (patientToEdit) {
      // Lógica de Atualização
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          full_name: fullName,
          date_of_birth: dateOfBirth,
          gender: gender,
        })
        .eq('id', patientToEdit.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        alert('Paciente atualizado com sucesso!');
        onSuccess();
      }
    } else {
      // Lógica de Inserção
      const { error: insertError } = await supabase.from('patients').insert({
        full_name: fullName,
        date_of_birth: dateOfBirth,
        gender: gender,
        created_by: user.id,
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        alert('Paciente adicionado com sucesso!');
        onSuccess();
      }
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>{patientToEdit ? 'Editar Paciente' : 'Adicionar Novo Paciente'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Nome Completo:</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Digite o nome completo do paciente"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dateOfBirth">Data de Nascimento:</label>
          <input
            type="date"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="gender">Gênero:</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="NAO_INFORMADO">Não Informado</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>
        
        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full success">
          {loading ? 'Salvando...' : 'Salvar Paciente'}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
