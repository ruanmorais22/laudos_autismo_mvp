import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientsPage from './pages/PatientsPage';
import ReportPage from './pages/ReportPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <h1>AutismoCare</h1>
                <span className="tagline">Sistema de Laudos Especializados</span>
              </div>
              <nav className="nav">
                <Link to="/" className="nav-link">
                  <span>🏠</span>
                  Início
                </Link>
                <Link to="/patients" className="nav-link">
                  <span>👥</span>
                  Pacientes
                </Link>
                <Link to="/login" className="nav-link">
                  <span>🔐</span>
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  <span>📝</span>
                  Cadastro
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/report/:patientId" element={<ReportPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 AutismoCare - Sistema especializado em laudos de TEA</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

const HomePage = () => (
  <div className="home-page">
    <div className="hero-section">
      <div className="hero-content">
        <h1>Sistema de Laudos de TEA</h1>
        <p className="hero-description">
          Plataforma profissional para geração de laudos especializados em 
          Transtorno do Espectro Autista (TEA), desenvolvida para profissionais da saúde.
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
      <h2>Funcionalidades</h2>
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
