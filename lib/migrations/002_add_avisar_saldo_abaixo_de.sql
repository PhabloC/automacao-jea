-- Coluna para valor mínimo de saldo Meta: avisar quando saldo estiver abaixo (número em reais)
ALTER TABLE relatorios_clientes
ADD COLUMN IF NOT EXISTS avisar_saldo_abaixo_de numeric(12, 2) NULL;

COMMENT ON COLUMN relatorios_clientes.avisar_saldo_abaixo_de IS 'Valor em reais: avisar quando saldo Meta estiver abaixo deste valor.';
