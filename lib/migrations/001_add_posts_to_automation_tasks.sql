-- Migração: Adicionar coluna posts à tabela automation_tasks
-- Execute no Supabase SQL Editor se as tarefas não estiverem sendo criadas
-- ou se os posts não aparecerem ao expandir uma tarefa.

ALTER TABLE automation_tasks ADD COLUMN IF NOT EXISTS posts JSONB;
