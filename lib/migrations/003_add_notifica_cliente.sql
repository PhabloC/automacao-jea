ALTER TABLE relatorios_clientes
ADD COLUMN IF NOT EXISTS notifica_cliente BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN relatorios_clientes.notifica_cliente IS 'Habilita notificação do cliente no webhook.';
