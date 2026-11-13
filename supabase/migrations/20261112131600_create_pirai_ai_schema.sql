/*
# PIRAÍ AI — Schema Completo

Cria a base de dados completa da PIRAÍ AI, o cérebro digital da PIRAÍ CONECT TV.
Single-tenant, sem login. RLS com policies abertas para anon + authenticated.

Tabelas: clientes, interessados, planos, assinaturas, servidores, aplicativos,
pagamentos, tickets, campanhas, mensagens_ia, configuracoes, relatorios.
*/

CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text,
  telefone text,
  email text,
  endereco text,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso', 'cancelado')),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON clientes TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_clientes" ON clientes;
CREATE POLICY "anon_select_clientes" ON clientes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_clientes" ON clientes;
CREATE POLICY "anon_insert_clientes" ON clientes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_clientes" ON clientes;
CREATE POLICY "anon_update_clientes" ON clientes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_clientes" ON clientes;
CREATE POLICY "anon_delete_clientes" ON clientes FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS interessados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  email text,
  origem text,
  interesse text,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'teste', 'negociando', 'convertido', 'perdido')),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interessados ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON interessados TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_interessados" ON interessados;
CREATE POLICY "anon_select_interessados" ON interessados FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_interessados" ON interessados;
CREATE POLICY "anon_insert_interessados" ON interessados FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_interessados" ON interessados;
CREATE POLICY "anon_update_interessados" ON interessados FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_interessados" ON interessados;
CREATE POLICY "anon_delete_interessados" ON interessados FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  preco numeric(10,2) NOT NULL DEFAULT 0,
  periodo text NOT NULL DEFAULT 'mensal' CHECK (periodo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  recursos text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON planos TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_planos" ON planos;
CREATE POLICY "anon_select_planos" ON planos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_planos" ON planos;
CREATE POLICY "anon_insert_planos" ON planos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_planos" ON planos;
CREATE POLICY "anon_update_planos" ON planos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_planos" ON planos;
CREATE POLICY "anon_delete_planos" ON planos FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  plano_id uuid REFERENCES planos(id) ON DELETE SET NULL,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento date,
  status text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'vencida', 'suspensa', 'cancelada', 'em_teste')),
  dispositivo text,
  aplicativo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON assinaturas TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_assinaturas" ON assinaturas;
CREATE POLICY "anon_select_assinaturas" ON assinaturas FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_assinaturas" ON assinaturas;
CREATE POLICY "anon_insert_assinaturas" ON assinaturas FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_assinaturas" ON assinaturas;
CREATE POLICY "anon_update_assinaturas" ON assinaturas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_assinaturas" ON assinaturas;
CREATE POLICY "anon_delete_assinaturas" ON assinaturas FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS servidores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  host text,
  porta text,
  painel_url text,
  tipo text CHECK (tipo IN ('iptv', 'streaming', 'vod', 'outro')),
  custo_mensal numeric(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'manutencao')),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE servidores ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON servidores TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_servidores" ON servidores;
CREATE POLICY "anon_select_servidores" ON servidores FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_servidores" ON servidores;
CREATE POLICY "anon_insert_servidores" ON servidores FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_servidores" ON servidores;
CREATE POLICY "anon_update_servidores" ON servidores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_servidores" ON servidores;
CREATE POLICY "anon_delete_servidores" ON servidores FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS aplicativos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  plataforma text,
  versao text,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE aplicativos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON aplicativos TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_aplicativos" ON aplicativos;
CREATE POLICY "anon_select_aplicativos" ON aplicativos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_aplicativos" ON aplicativos;
CREATE POLICY "anon_insert_aplicativos" ON aplicativos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_aplicativos" ON aplicativos;
CREATE POLICY "anon_update_aplicativos" ON aplicativos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_aplicativos" ON aplicativos;
CREATE POLICY "anon_delete_aplicativos" ON aplicativos FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  assinatura_id uuid REFERENCES assinaturas(id) ON DELETE SET NULL,
  valor numeric(10,2) NOT NULL DEFAULT 0,
  data_pagamento date,
  data_vencimento date,
  metodo text CHECK (metodo IN ('pix', 'cartao', 'dinheiro', 'transferencia', 'boleto')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'vencido', 'cancelado')),
  observacoes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON pagamentos TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_pagamentos" ON pagamentos;
CREATE POLICY "anon_select_pagamentos" ON pagamentos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pagamentos" ON pagamentos;
CREATE POLICY "anon_insert_pagamentos" ON pagamentos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pagamentos" ON pagamentos;
CREATE POLICY "anon_update_pagamentos" ON pagamentos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pagamentos" ON pagamentos;
CREATE POLICY "anon_delete_pagamentos" ON pagamentos FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  assunto text NOT NULL,
  descricao text,
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
  prioridade text NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  categoria text CHECK (categoria IN ('tecnico', 'financeiro', 'comercial', 'duvida', 'outro')),
  responsavel text,
  resolucao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_tickets" ON tickets;
CREATE POLICY "anon_select_tickets" ON tickets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tickets" ON tickets;
CREATE POLICY "anon_insert_tickets" ON tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tickets" ON tickets;
CREATE POLICY "anon_update_tickets" ON tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tickets" ON tickets;
CREATE POLICY "anon_delete_tickets" ON tickets FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text CHECK (tipo IN ('redes_sociais', 'whatsapp', 'email', 'radio', 'outdoor', 'promocao')),
  publico text,
  conteudo text,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativa', 'pausada', 'concluida')),
  data_inicio date,
  data_fim date,
  resultados text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON campanhas TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_campanhas" ON campanhas;
CREATE POLICY "anon_select_campanhas" ON campanhas FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_campanhas" ON campanhas;
CREATE POLICY "anon_insert_campanhas" ON campanhas FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_campanhas" ON campanhas;
CREATE POLICY "anon_update_campanhas" ON campanhas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_campanhas" ON campanhas;
CREATE POLICY "anon_delete_campanhas" ON campanhas FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS mensagens_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo text NOT NULL,
  pergunta text NOT NULL,
  resposta text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mensagens_ia ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON mensagens_ia TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_mensagens_ia" ON mensagens_ia;
CREATE POLICY "anon_select_mensagens_ia" ON mensagens_ia FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_mensagens_ia" ON mensagens_ia;
CREATE POLICY "anon_insert_mensagens_ia" ON mensagens_ia FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_mensagens_ia" ON mensagens_ia;
CREATE POLICY "anon_update_mensagens_ia" ON mensagens_ia FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_mensagens_ia" ON mensagens_ia;
CREATE POLICY "anon_delete_mensagens_ia" ON mensagens_ia FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  valor text,
  descricao text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON configuracoes TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_configuracoes" ON configuracoes;
CREATE POLICY "anon_select_configuracoes" ON configuracoes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_configuracoes" ON configuracoes;
CREATE POLICY "anon_insert_configuracoes" ON configuracoes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_configuracoes" ON configuracoes;
CREATE POLICY "anon_update_configuracoes" ON configuracoes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_configuracoes" ON configuracoes;
CREATE POLICY "anon_delete_configuracoes" ON configuracoes FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS relatorios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  titulo text NOT NULL,
  conteudo text,
  periodo_inicio date,
  periodo_fim date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON relatorios TO anon, authenticated;
DROP POLICY IF EXISTS "anon_select_relatorios" ON relatorios;
CREATE POLICY "anon_select_relatorios" ON relatorios FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_relatorios" ON relatorios;
CREATE POLICY "anon_insert_relatorios" ON relatorios FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_relatorios" ON relatorios;
CREATE POLICY "anon_update_relatorios" ON relatorios FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_relatorios" ON relatorios;
CREATE POLICY "anon_delete_relatorios" ON relatorios FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_interessados_status ON interessados(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_cliente ON assinaturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_cliente ON pagamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_cliente ON tickets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_status ON campanhas(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_ia_modulo ON mensagens_ia(modulo);

INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('empresa_nome', 'PIRAÍ CONECT TV', 'Nome da empresa'),
  ('empresa_missao', 'Oferecer a melhor experiencia em entretenimento digital para nossos clientes', 'Missao da empresa'),
  ('moeda', 'BRL', 'Moeda utilizada nos valores'),
  ('timezone', 'America/Sao_Paulo', 'Fuso horario')
ON CONFLICT (chave) DO NOTHING;