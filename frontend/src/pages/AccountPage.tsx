import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redireciona para a home após o logout
  };

  if (loading) {
    return <div>Carregando informações da conta...</div>;
  }

  if (!user) {
    return <div>Você não está logado.</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Minha Conta</h1>
        <p>Gerencie suas informações e preferências</p>
      </div>
      
      <div className="card">
        <h2>Informações do Usuário</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="info-item">
            <label>ID do Usuário:</label>
            <span>{user.id}</span>
          </div>
          <div className="info-item">
            <label>Último Login:</label>
            <span>{new Date(user.last_sign_in_at || '').toLocaleString('pt-BR')}</span>
          </div>
          {/* Exibir metadados se existirem */}
          {user.user_metadata && (
            <>
              <div className="info-item">
                <label>Nome Completo:</label>
                <span>{user.user_metadata.full_name}</span>
              </div>
              <div className="info-item">
                <label>Função:</label>
                <span>{user.user_metadata.role}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="page-actions">
        <button onClick={handleLogout} className="btn-danger">
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
