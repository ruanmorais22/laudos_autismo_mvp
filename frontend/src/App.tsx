import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientsPage from './pages/PatientsPage';
import ReportPage from './pages/ReportPage';
import ReportPreviewPage from './pages/ReportPreviewPage';
import PatientDetailPage from './pages/PatientDetailPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import './App.css';
import type { Session } from '@supabase/supabase-js';

import iconHome from './assets/icon-home.svg';
import iconPatients from './assets/icon-patients.svg';
import iconLogin from './assets/icon-login.svg';
import iconRegister from './assets/icon-register.svg';
import iconAccount from './assets/icon-account.svg';

const App: React.FC = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

const Layout: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src="/logo.png" alt="Blua Laudos Logo" />
              <span>Blua Laudos</span>
            </div>
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              &#9776;
            </button>
            <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
              <Link to={session ? "/dashboard" : "/"} className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <img src={iconHome} alt="Início" className="nav-icon" />
                Início
              </Link>
              {session && (
                <Link to="/patients" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <img src={iconPatients} alt="Pacientes" className="nav-icon" />
                  Pacientes
                </Link>
              )}
              {!session ? (
                <>
                  <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <img src={iconLogin} alt="Login" className="nav-icon" />
                    Login
                  </Link>
                  <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <img src={iconRegister} alt="Cadastro" className="nav-icon" />
                    Cadastro
                  </Link>
                </>
              ) : (
                <Link to="/account" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <img src={iconAccount} alt="Minha Conta" className="nav-icon" />
                  Minha Conta
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/patients/:patientId" element={<PatientDetailPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/report/:patientId" element={<ReportPage />} />
            <Route path="/report/preview" element={<ReportPreviewPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Blua Laudos - Sistema especializado em laudos de TEA</p>
        </div>
      </footer>
    </div>
  );
};

const HomePage = () => (
  <div className="home-page">
    <div className="hero-section">
      <div className="hero-content">
        <h1>Sistema de Laudos de TEA</h1>
        <p className="hero-description">
          Plataforma profissional para emissão de laudos especializados em Transtorno do Espectro Autista (TEA)
          criada para apoiar profissionais da saúde.
        </p>
        <div className="hero-actions">
          <Link to="/patients" className="btn-primary">
            Acessar Pacientes
          </Link>
          <Link to="/login" className="btn-secondary">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
    
    <div className="features-section">
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Gestão de Pacientes</h3>
          <p>Cadastro e organização completa dos dados dos pacientes</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📋</div>
          <h3>Laudos Especializados</h3>
          <p>Geração de laudos técnicos seguindo protocolos estabelecidos</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Segurança Total</h3>
          <p>Proteção completa dos dados médicos e informações sensíveis</p>
        </div>
      </div>
    </div>
  </div>
);

export default App;
