import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Bem-vindo ao seu painel de controle.</p>
      
      <div className="dashboard-actions">
        <Link to="/patients" className="btn-primary">
          Ver Meus Pacientes
        </Link>
        {/* Adicionar mais links e widgets aqui no futuro */}
      </div>
    </div>
  );
};

export default DashboardPage;
