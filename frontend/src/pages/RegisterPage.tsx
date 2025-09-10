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
    <div>
      <h1>Cadastro de Profissional</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName">Nome Completo:</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Função:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="MEDICO">Médico(a)</option>
            <option value="PSICOLOGO">Psicólogo(a)</option>
            <option value="NEUROLOGISTA">Neurologista</option>
            <option value="PSIQUIATRA">Psiquiatra</option>
            <option value="PEDIATRA">Pediatra</option>
            <option value="MULTIPROFISSIONAL">Equipe Multiprofissional</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterPage;
