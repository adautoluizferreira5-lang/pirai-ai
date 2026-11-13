export type Cliente = {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  status: 'ativo' | 'inativo' | 'suspenso' | 'cancelado';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Interessado = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  origem: string | null;
  interesse: string | null;
  status: 'novo' | 'contatado' | 'teste' | 'negociando' | 'convertido' | 'perdido';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Plano = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  periodo: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  recursos: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type Assinatura = {
  id: string;
  cliente_id: string | null;
  plano_id: string | null;
  data_inicio: string;
  data_vencimento: string | null;
  status: 'ativa' | 'vencida' | 'suspensa' | 'cancelada' | 'em_teste';
  dispositivo: string | null;
  aplicativo: string | null;
  created_at: string;
  updated_at: string;
  cliente?: Cliente | null;
  plano?: Plano | null;
};

export type Servidor = {
  id: string;
  nome: string;
  host: string | null;
  porta: string | null;
  painel_url: string | null;
  tipo: 'iptv' | 'streaming' | 'vod' | 'outro' | null;
  custo_mensal: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Aplicativo = {
  id: string;
  nome: string;
  plataforma: string | null;
  versao: string | null;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type Pagamento = {
  id: string;
  cliente_id: string | null;
  assinatura_id: string | null;
  valor: number;
  data_pagamento: string | null;
  data_vencimento: string | null;
  metodo: 'pix' | 'cartao' | 'dinheiro' | 'transferencia' | 'boleto' | null;
  status: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  observacoes: string | null;
  created_at: string;
  cliente?: Cliente | null;
};

export type Ticket = {
  id: string;
  cliente_id: string | null;
  assunto: string;
  descricao: string | null;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  categoria: 'tecnico' | 'financeiro' | 'comercial' | 'duvida' | 'outro' | null;
  responsavel: string | null;
  resolucao: string | null;
  created_at: string;
  updated_at: string;
  cliente?: Cliente | null;
};

export type Campanha = {
  id: string;
  nome: string;
  tipo: 'redes_sociais' | 'whatsapp' | 'email' | 'radio' | 'outdoor' | 'promocao' | null;
  publico: string | null;
  conteudo: string | null;
  status: 'rascunho' | 'ativa' | 'pausada' | 'concluida';
  data_inicio: string | null;
  data_fim: string | null;
  resultados: string | null;
  created_at: string;
  updated_at: string;
};

export type MensagemIA = {
  id: string;
  modulo: string;
  pergunta: string;
  resposta: string;
  created_at: string;
};

export type Configuracao = {
  id: string;
  chave: string;
  valor: string | null;
  descricao: string | null;
  updated_at: string;
};

export type Relatorio = {
  id: string;
  tipo: string;
  titulo: string;
  conteudo: string | null;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  created_at: string;
};
