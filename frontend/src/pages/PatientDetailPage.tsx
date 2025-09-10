import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

type Patient = {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
};

type Report = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) {
        setError('ID do paciente não fornecido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Buscar dados do paciente
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);

        // Buscar laudos do paciente
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('id, title, status, created_at')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;
        setReports(reportsData || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!patient) return <div>Paciente não encontrado.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{patient.full_name}</h1>
        <p>Detalhes e histórico de laudos</p>
      </div>

      <div className="card">
        <h2>Informações do Paciente</h2>
        <p><strong>Data de Nascimento:</strong> {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}</p>
        <p><strong>Gênero:</strong> {patient.gender}</p>
      </div>

      <div className="card">
        <h2>Histórico de Laudos</h2>
        <Link to={`/report/${patient.id}`}>
          <button className="success">Criar Novo Laudo para este Paciente</button>
        </Link>
        {reports.length > 0 ? (
          <table className="patients-table">
            <thead>
              <tr>
                <th>Título do Laudo</th>
                <th>Status</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td>{report.status}</td>
                  <td>{new Date(report.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <Link to={`/report/${patient.id}?reportId=${report.id}`}>
                      <button className="action-btn secondary">Visualizar/Editar</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum laudo encontrado para este paciente.</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetailPage;
