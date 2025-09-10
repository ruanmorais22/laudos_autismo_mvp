import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

type Profile = {
  specialty: string;
  professional_registry: string;
  phone: string;
};

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = single row not found
          console.error("Erro ao buscar perfil:", error);
        } else {
          setProfile(profileData || { specialty: '', professional_registry: '', phone: '' });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id, // Garante que estamos atualizando ou inserindo para o usuário correto
      specialty: profile.specialty,
      professional_registry: profile.professional_registry,
      phone: profile.phone,
      // full_name e role são gerenciados pelo trigger e auth metadata
    }, { onConflict: 'id' });

    if (error) {
      alert(`Erro ao atualizar perfil: ${error.message}`);
    } else {
      alert('Perfil atualizado com sucesso!');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

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
        <h2>Informações do Perfil</h2>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" value={user.user_metadata.full_name || ''} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="specialty">Especialidade</label>
            <input type="text" id="specialty" name="specialty" value={profile?.specialty || ''} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label htmlFor="professional_registry">Registro Profissional (CRM, CRP, etc.)</label>
            <input type="text" id="professional_registry" name="professional_registry" value={profile?.professional_registry || ''} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">WhatsApp com DDD</label>
            <input type="tel" id="phone" name="phone" value={profile?.phone || ''} onChange={handleProfileChange} />
          </div>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
        </form>
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
