import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Carregando pacientes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Erro ao carregar pacientes</h3>
          <p>{error}</p>
          <button onClick={fetchPatients} className="secondary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gerenciar Pacientes</h1>
        <p>Visualize e gerencie os dados dos seus pacientes</p>
      </div>

      {showForm ? (
        <div className="form-container">
          <PatientForm onSuccess={handleFormSuccess} />
          <div className="form-actions">
            <button 
              onClick={() => setShowForm(false)}
              className="outline"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="page-actions">
            <button 
              onClick={() => setShowForm(true)}
              className="success"
            >
              ➕ Adicionar Novo Paciente
            </button>
          </div>
          
          {patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Nenhum paciente encontrado</h3>
              <p>Comece adicionando seu primeiro paciente ao sistema.</p>
            </div>
          ) : (
            <div className="patients-table-container">
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Nome Completo</th>
                    <th>Data de Nascimento</th>
                    <th>Data de Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="patient-name">{patient.full_name}</td>
                      <td>{new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}</td>
                      <td>{new Date(patient.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="actions">
                        <Link to={`/report/${patient.id}`}>
                          <button className="action-btn primary">
                            📋 Novo Laudo
                          </button>
                        </Link>
                        <button 
                          className="action-btn secondary"
                          onClick={() => alert(`TODO: Editar paciente ${patient.id}`)}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="action-btn danger"
                          onClick={() => alert(`TODO: Excluir paciente ${patient.id}`)}
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientsPage;
