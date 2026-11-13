type StatusConfig = Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }>;

export const statusConfig: StatusConfig = {
  // Clientes
  ativo: { label: 'Ativo', variant: 'success' },
  inativo: { label: 'Inativo', variant: 'default' },
  suspenso: { label: 'Suspenso', variant: 'warning' },
  cancelado: { label: 'Cancelado', variant: 'error' },

  // Interessados
  novo: { label: 'Novo', variant: 'primary' },
  contatado: { label: 'Contatado', variant: 'info' },
  teste: { label: 'Em Teste', variant: 'warning' },
  negociando: { label: 'Negociando', variant: 'info' },
  convertido: { label: 'Convertido', variant: 'success' },
  perdido: { label: 'Perdido', variant: 'error' },

  // Assinaturas
  em_teste: { label: 'Em Teste', variant: 'warning' },
  ativa: { label: 'Ativa', variant: 'success' },
  vencida: { label: 'Vencida', variant: 'error' },

  // Pagamentos
  pago: { label: 'Pago', variant: 'success' },
  pendente: { label: 'Pendente', variant: 'warning' },
  vencido: { label: 'Vencido', variant: 'error' },

  // Tickets
  aberto: { label: 'Aberto', variant: 'primary' },
  em_andamento: { label: 'Em Andamento', variant: 'info' },
  resolvido: { label: 'Resolvido', variant: 'success' },
  fechado: { label: 'Fechado', variant: 'default' },

  // Campanhas
  rascunho: { label: 'Rascunho', variant: 'default' },
  ativa_campanha: { label: 'Ativa', variant: 'success' },
  pausada: { label: 'Pausada', variant: 'warning' },
  concluida: { label: 'Concluída', variant: 'info' },
};

export const prioridadeConfig: StatusConfig = {
  baixa: { label: 'Baixa', variant: 'default' },
  normal: { label: 'Normal', variant: 'info' },
  alta: { label: 'Alta', variant: 'warning' },
  urgente: { label: 'Urgente', variant: 'error' },
};

export const categoriaTicketConfig: Record<string, string> = {
  tecnico: 'Técnico',
  financeiro: 'Financeiro',
  comercial: 'Comercial',
  duvida: 'Dúvida',
  outro: 'Outro',
};

export const metodoPagamentoConfig: Record<string, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
  boleto: 'Boleto',
};

export const periodoConfig: Record<string, string> = {
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

export const tipoServidorConfig: Record<string, string> = {
  iptv: 'IPTV',
  streaming: 'Streaming',
  vod: 'VOD',
  outro: 'Outro',
};

export const tipoCampanhaConfig: Record<string, string> = {
  redes_sociais: 'Redes Sociais',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  radio: 'Rádio',
  outdoor: 'Outdoor',
  promocao: 'Promoção',
};

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getStatusConfig(status: string) {
  const key = status === 'ativa' ? 'ativa' : status;
  return statusConfig[key] || statusConfig[status] || { label: status, variant: 'default' as const };
}
