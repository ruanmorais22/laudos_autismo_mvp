import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

type Patient = {
  id: string;
  full_name: string;
  date_of_birth: string;
  created_at: string;
  gender?: string;
  cpf?: string;
  responsible_name?: string;
  responsible_cpf?: string;
  phone?: string;
  email?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
};

type PatientFormProps = {
  onSuccess: () => void;
  patientToEdit?: Patient | null;
};

const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, patientToEdit }) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('NAO_INFORMADO');
  const [cpf, setCpf] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleCpf, setResponsibleCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientToEdit) {
      setFullName(patientToEdit.full_name);
      setDateOfBirth(new Date(patientToEdit.date_of_birth).toISOString().split('T')[0]);
      setGender(patientToEdit.gender || 'NAO_INFORMADO');
      setCpf(patientToEdit.cpf || '');
      setResponsibleName(patientToEdit.responsible_name || '');
      setResponsibleCpf(patientToEdit.responsible_cpf || '');
      setPhone(patientToEdit.phone || '');
      setEmail(patientToEdit.email || '');
      setAddressStreet(patientToEdit.address_street || '');
      setAddressCity(patientToEdit.address_city || '');
      setAddressState(patientToEdit.address_state || '');
      setAddressZip(patientToEdit.address_zip || '');
    }
  }, [patientToEdit]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Simplesmente para obter o ID do usuário logado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Você precisa estar logado para adicionar um paciente.');
      setLoading(false);
      return;
    }

    const patientData = {
      full_name: fullName,
      date_of_birth: dateOfBirth,
      gender: gender,
      cpf: cpf || null,
      responsible_name: responsibleName || null,
      responsible_cpf: responsibleCpf || null,
      phone: phone || null,
      email: email || null,
      address_street: addressStreet || null,
      address_city: addressCity || null,
      address_state: addressState || null,
      address_zip: addressZip || null,
    };

    if (patientToEdit) {
      // Lógica de Atualização
      const { error: updateError } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patientToEdit.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        alert('Paciente atualizado com sucesso!');
        onSuccess();
      }
    } else {
      // Lógica de Inserção
      const { error: insertError } = await supabase.from('patients').insert({
        ...patientData,
        created_by: user.id,
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        alert('Paciente adicionado com sucesso!');
        onSuccess();
      }
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>{patientToEdit ? 'Editar Paciente' : 'Adicionar Novo Paciente'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Nome Completo:</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Digite o nome completo do paciente"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">Data de Nascimento:</label>
          <input
            type="date"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="gender">Gênero:</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="NAO_INFORMADO">Não Informado</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="cpf">CPF (Paciente)</label>
          <input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Apenas números" />
        </div>
        <hr className="section-divider" />
        <h3>Informações do Responsável</h3>
        <div className="form-group">
          <label htmlFor="responsibleName">Nome do Responsável</label>
          <input type="text" id="responsibleName" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="responsibleCpf">CPF do Responsável</label>
          <input type="text" id="responsibleCpf" value={responsibleCpf} onChange={(e) => setResponsibleCpf(e.target.value)} placeholder="Apenas números" />
        </div>
        <hr className="section-divider" />
        <h3>Contato e Endereço</h3>
        <div className="form-group">
          <label htmlFor="phone">Telefone</label>
          <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="addressStreet">Rua / Logradouro</label>
          <input type="text" id="addressStreet" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="addressCity">Cidade</label>
          <input type="text" id="addressCity" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="addressState">Estado (UF)</label>
          <input type="text" id="addressState" value={addressState} onChange={(e) => setAddressState(e.target.value)} maxLength={2} />
        </div>
        <div className="form-group">
          <label htmlFor="addressZip">CEP</label>
          <input type="text" id="addressZip" value={addressZip} onChange={(e) => setAddressZip(e.target.value)} placeholder="Apenas números" />
        </div>
        
        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full success">
          {loading ? 'Salvando...' : 'Salvar Paciente'}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
