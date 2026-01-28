-- =====================================================
-- SCHEMA PARA CONTROLE DE PERMISSÕES DE USUÁRIOS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Criar enum para os tipos de role
CREATE TYPE user_role AS ENUM ('admin', 'editor');

-- Criar tabela de roles de usuários
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Criar índice para busca por user_id
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_email ON user_roles(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam sua própria role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que admins vejam todas as roles
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para permitir que admins insiram novas roles
CREATE POLICY "Admins can insert roles" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para permitir que admins atualizem roles
CREATE POLICY "Admins can update roles" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para permitir que admins deletem roles
CREATE POLICY "Admins can delete roles" ON user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA DE TAREFAS CRIADAS PELAS AUTOMAÇÕES (ex.: calendário)
-- Admins visualizam na página "Tarefas" as criadas por todos os usuários
-- =====================================================

CREATE TABLE IF NOT EXISTS automation_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id TEXT NOT NULL,
  automation_name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  month_id TEXT,
  month_name TEXT,
  posts_count INTEGER,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_avatar TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_automation_tasks_created_at ON automation_tasks(created_at DESC);
CREATE INDEX idx_automation_tasks_user_id ON automation_tasks(user_id);

-- RLS (Row Level Security) – políticas aplicam-se a acesso direto ao Supabase.
-- A API usa service role e aplica regras de negócio (admin, hasPermission) nas rotas.

ALTER TABLE automation_tasks ENABLE ROW LEVEL SECURITY;

-- Ninguém acessa diretamente via client; a API é o único ponto de entrada.
CREATE POLICY "No direct access to automation_tasks" ON automation_tasks
  FOR ALL USING (false);

-- =====================================================
-- IMPORTANTE: Após criar a tabela, insira o primeiro admin manualmente
-- Substitua 'SEU_USER_ID' pelo ID do usuário que será o primeiro admin
-- =====================================================
-- INSERT INTO user_roles (user_id, email, full_name, role)
-- VALUES ('SEU_USER_ID', 'seu@email.com', 'Seu Nome', 'admin');
