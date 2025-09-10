-- Schema do Sistema de Geração de Laudos de Autismo
-- Versão: 1.0
-- Compatível com PostgreSQL 14+

-- =============================================================================
-- EXTENSÕES E CONFIGURAÇÕES INICIAIS
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- ENUMS E TIPOS CUSTOMIZADOS
-- =============================================================================

-- Tipos de usuário no sistema
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'MEDICO',
    'PSICOLOGO',
    'NEUROLOGISTA',
    'PSIQUIATRA',
    'PEDIATRA',
    'MULTIPROFISSIONAL'
);

-- Status do laudo
CREATE TYPE report_status AS ENUM (
    'RASCUNHO',
    'EM_ANDAMENTO',
    'AGUARDANDO_REVISAO',
    'CONCLUIDO',
    'ASSINADO',
    'CANCELADO'
);

-- Tipos de arquivo permitidos
CREATE TYPE file_type AS ENUM (
    'PDF',
    'IMAGE',
    'VIDEO',
    'DOCUMENT'
);

-- Gênero/Sexo
CREATE TYPE gender_type AS ENUM (
    'MASCULINO',
    'FEMININO',
    'OUTRO',
    'NAO_INFORMADO'
);

-- Nível de suporte DSM-5
CREATE TYPE support_level AS ENUM (
    'NIVEL_1',  -- Exige apoio
    'NIVEL_2',  -- Exige apoio substancial
    'NIVEL_3'   -- Exige apoio muito substancial
);

-- Validade do laudo
CREATE TYPE report_validity AS ENUM (
    'SEIS_MESES',
    'DOZE_MESES',
    'INDEFINIDO'
);

-- Critérios DSM-5 para TEA
CREATE TYPE dsm5_criteria AS ENUM (
    'A1', 'A2', 'A3',  -- Déficits na comunicação social
    'B1', 'B2', 'B3', 'B4'  -- Padrões restritos e repetitivos
);

-- =============================================================================
-- TABELAS PRINCIPAIS
-- =============================================================================

-- Tabela de usuários (profissionais)
-- A tabela de usuários é gerenciada pelo Supabase Auth.
-- Podemos adicionar colunas extras à tabela auth.users usando o Supabase.
-- Esta é uma representação do que teríamos, mas a criação é feita de forma diferente.
-- Para adicionar 'full_name' e 'role', usamos as 'user_metadata' no signUp.
-- Para dados mais estruturados, criamos uma tabela 'profiles' vinculada.

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    role user_role,
    specialty VARCHAR(255),
    professional_registry VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    phone VARCHAR(20),
    profile_picture_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Tabela de pacientes
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    cpf VARCHAR(11), -- Opcional, apenas números
    responsible_name VARCHAR(255),
    responsible_cpf VARCHAR(11),
    phone VARCHAR(20),
    email VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(8),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de laudos
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    status report_status DEFAULT 'RASCUNHO',
    referral_reason TEXT,
    
    -- Dados calculados/gerados pela IA
    suggested_diagnosis TEXT,
    suggested_support_level support_level,
    ai_generated_narrative TEXT,
    ai_confidence_score DECIMAL(3,2), -- 0.00 a 1.00
    
    -- Metadados do laudo
    validity_period report_validity DEFAULT 'DOZE_MESES',
    issue_date DATE,
    expiration_date DATE,
    
    -- Controle de versões
    version_number INTEGER DEFAULT 1,
    parent_report_id UUID REFERENCES reports(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- BLOCOS DO FORMULÁRIO (DADOS ESTRUTURADOS)
-- =============================================================================

-- Bloco 2: Histórico
CREATE TABLE report_history (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    pregnancy_complications TEXT,
    delivery_complications TEXT,
    developmental_milestones TEXT,
    speech_development TEXT,
    motor_development TEXT,
    social_development TEXT,
    relevant_medical_history TEXT,
    family_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bloco 3: Observação Clínica
CREATE TABLE clinical_observations (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    verbal_communication TEXT,
    nonverbal_communication TEXT,
    social_interaction TEXT,
    repetitive_behaviors TEXT,
    restricted_interests TEXT,
    sensory_hypersensitivity TEXT,
    sensory_hyposensitivity TEXT,
    additional_observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bloco 4: Instrumentos/Testes Aplicados
CREATE TABLE applied_instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Mantemos ID aqui pois um laudo pode ter vários instrumentos
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    instrument_name VARCHAR(255) NOT NULL, -- ADOS-2, M-CHAT, Vineland, etc.
    application_date DATE,
    scores_results TEXT,
    interpretation TEXT,
    administered_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bloco 5: Critérios Diagnósticos
CREATE TABLE diagnostic_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    criteria_type VARCHAR(10) DEFAULT 'DSM5', -- DSM5 ou CID11
    criterion dsm5_criteria NOT NULL,
    is_met BOOLEAN NOT NULL DEFAULT false,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hipóteses diferenciais e comorbidades
CREATE TABLE differential_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    diagnosis_type VARCHAR(20) NOT NULL, -- 'DIFFERENTIAL' ou 'COMORBIDITY'
    condition_name VARCHAR(255) NOT NULL,
    description TEXT,
    ruling_out_rationale TEXT, -- Para diferenciais
    severity_level VARCHAR(50), -- Para comorbidades
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bloco 6: Funcionalidade e Impacto
CREATE TABLE functionality_assessment (
    report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    daily_routine TEXT,
    feeding_habits TEXT,
    sleep_patterns TEXT,
    hygiene_autonomy TEXT,
    academic_functioning TEXT,
    school_performance TEXT,
    family_relationships TEXT,
    peer_relationships TEXT,
    adaptive_behavior_score INTEGER,
    independence_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bloco 7: Intervenções Prévias
CREATE TABLE previous_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Um laudo pode ter várias intervenções
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    intervention_type VARCHAR(100) NOT NULL, -- ABA, Fonoaudiologia, TO, etc.
    professional_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    frequency VARCHAR(100), -- "2x por semana", etc.
    response_to_intervention TEXT,
    current_status VARCHAR(50), -- 'ATIVA', 'FINALIZADA', 'INTERROMPIDA'
    medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- RECOMENDAÇÕES E PRESCRIÇÕES
-- =============================================================================

-- Base de terapias baseadas em evidência
CREATE TABLE evidence_based_therapies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    acronym VARCHAR(20),
    description TEXT,
    scientific_evidence TEXT,
    target_age_min INTEGER,
    target_age_max INTEGER,
    target_symptoms TEXT[],
    effectiveness_level VARCHAR(20), -- 'ALTA', 'MODERADA', 'BAIXA'
    bibliographic_references TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recomendações terapêuticas específicas para cada laudo
CREATE TABLE therapeutic_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    therapy_id UUID REFERENCES evidence_based_therapies(id),
    custom_therapy_name VARCHAR(255), -- Para terapias não catalogadas
    frequency_per_week INTEGER,
    session_duration INTEGER, -- em minutos
    execution_location VARCHAR(100), -- 'CLINICA', 'ESCOLA', 'DOMICILIO'
    priority_level INTEGER, -- 1 = alta, 2 = média, 3 = baixa
    justification TEXT,
    additional_observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- GESTÃO DE ARQUIVOS
-- =============================================================================

-- Tabela para todos os arquivos anexados
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    block_reference VARCHAR(50), -- 'HISTORY', 'CLINICAL_OBS', 'INSTRUMENTS', etc.
    file_name VARCHAR(255) NOT NULL,
    file_type file_type NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    upload_status VARCHAR(20) DEFAULT 'PENDING',
    is_processed BOOLEAN DEFAULT false,
    extracted_text TEXT, -- Para OCR/análise de conteúdo
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- LEGISLAÇÃO E CONFORMIDADE
-- =============================================================================

-- Base de legislações aplicáveis
CREATE TABLE legal_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_number VARCHAR(50) NOT NULL,
    law_name VARCHAR(255) NOT NULL,
    description TEXT,
    full_text TEXT,
    effective_date DATE,
    category VARCHAR(100), -- 'FEDERAL', 'ESTADUAL', 'MUNICIPAL', 'NORMATIVA'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Legislações aplicadas em cada laudo
CREATE TABLE report_legal_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    legal_reference_id UUID NOT NULL REFERENCES legal_references(id),
    is_included BOOLEAN DEFAULT true,
    custom_text TEXT, -- Para adaptações específicas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- DADOS INICIAIS (SEEDS)
-- =============================================================================

-- Inserir terapias baseadas em evidência mais comuns
INSERT INTO evidence_based_therapies (name, acronym, description, target_age_min, target_age_max, effectiveness_level) VALUES
('Análise do Comportamento Aplicada', 'ABA', 'Intervenção comportamental estruturada baseada em princípios científicos do comportamento', 2, 99, 'ALTA'),
('Early Start Denver Model', 'ESDM', 'Modelo de intervenção precoce para crianças pequenas com TEA', 1, 4, 'ALTA'),
('Terapia Cognitivo-Comportamental', 'TCC', 'Abordagem psicoterapêutica para desenvolver estratégias de enfrentamento', 6, 99, 'MODERADA'),
('Integração Sensorial (Ayres)', 'IS', 'Terapia ocupacional focada no processamento sensorial', 2, 18, 'MODERADA'),
('Comunicação Alternativa Aumentativa', 'CAA', 'Sistemas de comunicação para indivíduos não-verbais', 2, 99, 'ALTA'),
('Musicoterapia', 'MT', 'Uso terapêutico da música para desenvolver habilidades sociais e comunicativas', 2, 99, 'MODERADA'),
('Psicopedagogia', 'PP', 'Intervenção educacional especializada para dificuldades de aprendizagem', 4, 18, 'MODERADA');

-- Inserir legislações mais importantes
INSERT INTO legal_references (law_number, law_name, description, effective_date, category) VALUES
('Lei 12.764/2012', 'Lei Berenice Piana', 'Institui a Política Nacional de Proteção dos Direitos da Pessoa com Transtorno do Espectro Autista', '2012-12-27', 'FEDERAL'),
('Decreto 8.368/2014', 'Regulamentação da Lei 12.764/2012', 'Regulamenta a Lei nº 12.764, de 27 de dezembro de 2012', '2014-12-02', 'FEDERAL'),
('Lei 13.977/2020', 'Carteira de Identificação da Pessoa com TEA', 'Altera a Lei nº 12.764, para instituir a Carteira de Identificação', '2020-01-08', 'FEDERAL'),
('Nota Técnica MEC 24/2013', 'Orientação aos Sistemas de Ensino', 'Orientação aos Sistemas de Ensino para a implementação da Lei nº 12.764/2012', '2013-04-21', 'NORMATIVA');

-- =============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE applied_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE differential_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE functionality_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE previous_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapeutic_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela 'patients'
CREATE POLICY "Usuários podem ver e gerenciar apenas seus próprios pacientes."
ON patients FOR ALL
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Políticas para a tabela 'reports'
CREATE POLICY "Usuários podem ver e gerenciar apenas seus próprios laudos."
ON reports FOR ALL
USING (auth.uid() = professional_id)
WITH CHECK (auth.uid() = professional_id);

-- Políticas para as tabelas de dados do laudo (exemplo para report_history)
-- Esta política assume que o acesso é determinado pela propriedade do laudo principal.
CREATE POLICY "Usuários podem acessar dados de histórico apenas de seus próprios laudos."
ON report_history FOR ALL
USING (
  (SELECT professional_id FROM reports WHERE id = report_id) = auth.uid()
);

-- Repetir política semelhante para outras tabelas de dados de laudo
CREATE POLICY "Usuários podem acessar observações clínicas apenas de seus próprios laudos."
ON clinical_observations FOR ALL USING ((SELECT professional_id FROM reports WHERE id = report_id) = auth.uid());

CREATE POLICY "Usuários podem acessar instrumentos aplicados apenas de seus próprios laudos."
ON applied_instruments FOR ALL USING ((SELECT professional_id FROM reports WHERE id = report_id) = auth.uid());

CREATE POLICY "Usuários podem acessar critérios diagnósticos apenas de seus próprios laudos."
ON diagnostic_criteria FOR ALL USING ((SELECT professional_id FROM reports WHERE id = report_id) = auth.uid());

CREATE POLICY "Usuários podem acessar diagnósticos diferenciais apenas de seus próprios laudos."
ON differential_diagnoses FOR ALL USING ((SELECT professional_id FROM reports WHERE id = report_id) = auth.uid());

CREATE POLICY "Usuários podem acessar avaliações de funcionalidade apenas de seus próprios laudos."
ON functionality_assessment FOR ALL USING ((SELECT professional_id FROM reports WHERE id = report_id) = auth.uid());

CREATE POLICY "Usuários podem acessar intervenções prévias apenas de seus próprios laudos."
ON previous_interventions FOR ALL USING ((SELECT professional_id FROM reports WHERE id = report_id) = auth.uid());

CREATE POLICY "Usuários podem acessar recomendações terapêuticas apenas de seus próprios laudos."
ON therapeutic_recommendations FOR ALL USING ((SELECT professional_id FROM reports WHERE id = report_id) = auth.uid());

CREATE POLICY "Usuários podem gerenciar anexos apenas de seus próprios laudos."
ON attachments FOR ALL
USING ( (SELECT professional_id FROM reports WHERE id = report_id) = auth.uid() )
WITH CHECK ( (SELECT professional_id FROM reports WHERE id = report_id) = auth.uid() );

-- =============================================================================
-- FUNÇÕES E TRIGGERS PARA SINCRONIZAÇÃO DE DADOS
-- =============================================================================

-- Função para criar um perfil para um novo usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, specialty, professional_registry, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::user_role,
    new.raw_user_meta_data->>'specialty',
    new.raw_user_meta_data->>'professional_registry',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

-- Trigger para chamar a função quando um novo usuário é criado
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- POLÍTICAS DE SEGURANÇA DO STORAGE
-- =============================================================================

-- Criar o bucket se ele não existir (o usuário precisa fazer isso manualmente ou nós podemos adicionar a lógica)
-- Por enquanto, vamos assumir que o bucket 'report_attachments' existe.

-- Política para permitir que usuários vejam os arquivos em seus laudos
CREATE POLICY "Qualquer pessoa pode ver os anexos."
ON storage.objects FOR SELECT
USING ( bucket_id = 'report_attachments' );

-- Política para permitir que usuários autenticados insiram anexos
-- A política restringe o upload para a pasta do próprio usuário (user.id)
CREATE POLICY "Usuários autenticados podem inserir anexos em sua própria pasta."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'report_attachments' AND auth.uid() = (storage.foldername(name))[1]::uuid );
