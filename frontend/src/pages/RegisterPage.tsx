import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEDICO'); // Valor padrão
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    if (error) {
      setMessage(`Erro no registro: ${error.message}`);
    } else {
      setMessage('Registro realizado com sucesso! Verifique seu email para confirmação.');
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cadastro de Profissional</h1>
        <p>Registre-se para acessar o sistema AutismoCare</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Nome Completo:</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Digite seu nome completo"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email profissional"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite uma senha segura"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Área de Atuação:</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="MEDICO">Médico(a)</option>
              <option value="PSICOLOGO">Psicólogo(a)</option>
              <option value="NEUROLOGISTA">Neurologista</option>
              <option value="PSIQUIATRA">Psiquiatra</option>
              <option value="PEDIATRA">Pediatra</option>
              <option value="MULTIPROFISSIONAL">Equipe Multiprofissional</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading} className="w-full success">
            {loading ? 'Cadastrando...' : 'Cadastrar Profissional'}
          </button>
        </form>
        
        {message && (
          <div className={`alert ${message.includes('Erro') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
