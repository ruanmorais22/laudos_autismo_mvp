import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import PatientForm from '../components/PatientForm';

// Definindo um tipo para os dados do paciente para segurança de tipo
type Patient = {
  id: string;
  full_name: string;
  date_of_birth: string;
  created_at: string;
};

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, date_of_birth, created_at');

    if (error) {
      setError(error.message);
      console.error('Erro ao buscar pacientes:', error);
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchPatients(); // Recarrega a lista de pacientes
  };

  if (loading) {
    return <div>Carregando pacientes...</div>;
  }

  if (error) {
    return <div>Erro ao carregar pacientes: {error}</div>;
  }

  return (
    <div>
      <h1>Meus Pacientes</h1>

      {showForm ? (
        <>
          <PatientForm onSuccess={handleFormSuccess} />
          <button onClick={() => setShowForm(false)}>Cancelar</button>
        </>
      ) : (
        <>
          <button onClick={() => setShowForm(true)}>
            Adicionar Novo Paciente
          </button>
          
          {patients.length === 0 ? (
            <p>Nenhum paciente encontrado.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome Completo</th>
                  <th>Data de Nascimento</th>
                  <th>Data de Criação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.full_name}</td>
                    <td>{new Date(patient.date_of_birth).toLocaleDateString()}</td>
                    <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => alert(`TODO: Editar paciente ${patient.id}`)}>Editar</button>
                      <button onClick={() => alert(`TODO: Excluir paciente ${patient.id}`)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default PatientsPage;
