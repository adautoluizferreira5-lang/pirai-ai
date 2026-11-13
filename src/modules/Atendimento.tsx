import { useState, useEffect, useCallback } from 'react';
import { Headphones, Plus, Search, AlertCircle, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Ticket, Cliente } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, getStatusConfig, prioridadeConfig, categoriaTicketConfig } from '@/lib/utils';

export function Atendimento() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);

  const [form, setForm] = useState({
    cliente_id: '', assunto: '', descricao: '', prioridade: 'normal', categoria: 'tecnico', responsavel: '',
  });
  const [resolucao, setResolucao] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [tRes, cRes] = await Promise.all([
      supabase.from('tickets').select('*, cliente:clientes(*)').order('created_at', { ascending: false }),
      supabase.from('clientes').select('*').order('nome', { ascending: true }),
    ]);
    if (tRes.data) setTickets(tRes.data as Ticket[]);
    if (cRes.data) setClientes(cRes.data as Cliente[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = tickets.filter((t) => {
    const matchesSearch = t.assunto.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    abertos: tickets.filter((t) => t.status === 'aberto').length,
    andamento: tickets.filter((t) => t.status === 'em_andamento').length,
    resolvidos: tickets.filter((t) => t.status === 'resolvido').length,
    urgentes: tickets.filter((t) => t.prioridade === 'urgente' && t.status !== 'fechado').length,
  };

  async function saveTicket() {
    if (!form.assunto.trim()) return;
    await supabase.from('tickets').insert(form);
    setForm({ cliente_id: '', assunto: '', descricao: '', prioridade: 'normal', categoria: 'tecnico', responsavel: '' });
    setModalOpen(false);
    loadData();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('tickets').update({ status }).eq('id', id);
    loadData();
    if (detailTicket?.id === id) setDetailTicket({ ...detailTicket, status: status as Ticket['status'] });
  }

  async function saveResolucao() {
    if (!detailTicket) return;
    await supabase.from('tickets').update({
      resolucao,
      status: 'resolvido',
    }).eq('id', detailTicket.id);
    setDetailTicket(null);
    setResolucao('');
    loadData();
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
            <Headphones size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900">Atendimento</h2>
            <p className="text-sm text-dark-500">Tickets de suporte e dúvidas</p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} />Novo Ticket
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-primary-500"><AlertCircle size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.abertos}</p>
          <p className="text-xs text-dark-500">Abertos</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-accent-500"><Clock size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.andamento}</p>
          <p className="text-xs text-dark-500">Em andamento</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-success-500"><CheckCircle size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.resolvidos}</p>
          <p className="text-xs text-dark-500">Resolvidos</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-error-500"><AlertCircle size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.urgentes}</p>
          <p className="text-xs text-dark-500">Urgentes</p>
        </Card>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-dark-200 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tickets..."
              className="w-full rounded-lg border border-dark-300 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-dark-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
          >
            <option value="todos">Todos</option>
            <option value="aberto">Abertos</option>
            <option value="em_andamento">Em andamento</option>
            <option value="resolvido">Resolvidos</option>
            <option value="fechado">Fechados</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-sm text-dark-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={28} />}
              title="Nenhum ticket encontrado"
              description="Crie tickets para acompanhar atendimentos"
              action={<Button size="sm" onClick={() => setModalOpen(true)}><Plus size={16} />Novo Ticket</Button>}
            />
          ) : (
            <div className="divide-y divide-dark-100">
              {filtered.map((ticket) => {
                const sc = getStatusConfig(ticket.status);
                const pc = prioridadeConfig[ticket.prioridade];
                return (
                  <div
                    key={ticket.id}
                    onClick={() => { setDetailTicket(ticket); setResolucao(ticket.resolucao || ''); }}
                    className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-dark-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-dark-900 truncate">{ticket.assunto}</p>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                        <Badge variant={pc.variant}>{pc.label}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-dark-500">
                        {ticket.cliente && <span>{ticket.cliente.nome}</span>}
                        {ticket.categoria && (
                          <>
                            <span>•</span>
                            <span>{categoriaTicketConfig[ticket.categoria]}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Ticket de Atendimento" size="md">
        <div className="space-y-4">
          <Select
            label="Cliente"
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            options={[{ value: '', label: 'Selecione...' }, ...clientes.map((c) => ({ value: c.id, label: c.nome }))]}
          />
          <Input label="Assunto *" value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} placeholder="Resumo do problema" />
          <Textarea label="Descrição" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Detalhes do atendimento" />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Prioridade"
              value={form.prioridade}
              onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
              options={[
                { value: 'baixa', label: 'Baixa' },
                { value: 'normal', label: 'Normal' },
                { value: 'alta', label: 'Alta' },
                { value: 'urgente', label: 'Urgente' },
              ]}
            />
            <Select
              label="Categoria"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              options={[
                { value: 'tecnico', label: 'Técnico' },
                { value: 'financeiro', label: 'Financeiro' },
                { value: 'comercial', label: 'Comercial' },
                { value: 'duvida', label: 'Dúvida' },
                { value: 'outro', label: 'Outro' },
              ]}
            />
          </div>
          <Input label="Responsável" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Quem está atendendo" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveTicket}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!detailTicket}
        onClose={() => setDetailTicket(null)}
        title={detailTicket?.assunto || ''}
        size="lg"
      >
        {detailTicket && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusConfig(detailTicket.status).variant}>
                {getStatusConfig(detailTicket.status).label}
              </Badge>
              <Badge variant={prioridadeConfig[detailTicket.prioridade].variant}>
                {prioridadeConfig[detailTicket.prioridade].label}
              </Badge>
              {detailTicket.categoria && (
                <Badge variant="info">{categoriaTicketConfig[detailTicket.categoria]}</Badge>
              )}
            </div>

            <div className="rounded-lg bg-dark-50 p-4 text-sm text-dark-600">
              <p className="font-medium text-dark-700">Descrição</p>
              <p className="mt-1">{detailTicket.descricao || 'Sem descrição'}</p>
            </div>

            {detailTicket.cliente && (
              <div className="rounded-lg bg-dark-50 p-4 text-sm">
                <p className="font-medium text-dark-700">Cliente</p>
                <p className="mt-1 text-dark-600">{detailTicket.cliente.nome}</p>
                {detailTicket.cliente.telefone && <p className="text-dark-500">{detailTicket.cliente.telefone}</p>}
              </div>
            )}

            {detailTicket.responsavel && (
              <div className="text-sm">
                <span className="text-dark-500">Responsável: </span>
                <span className="font-medium text-dark-700">{detailTicket.responsavel}</span>
              </div>
            )}

            {detailTicket.resolucao && (
              <div className="rounded-lg border border-success-200 bg-success-50 p-4 text-sm">
                <p className="font-medium text-success-700">Resolução</p>
                <p className="mt-1 text-success-600">{detailTicket.resolucao}</p>
              </div>
            )}

            {detailTicket.status !== 'resolvido' && detailTicket.status !== 'fechado' && (
              <div className="space-y-3 border-t border-dark-200 pt-4">
                <Textarea
                  label="Registrar resolução"
                  rows={3}
                  value={resolucao}
                  onChange={(e) => setResolucao(e.target.value)}
                  placeholder="Descreva como o problema foi resolvido..."
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateStatus(detailTicket.id, 'em_andamento')}>
                    Marcar em andamento
                  </Button>
                  <Button variant="success" size="sm" onClick={saveResolucao} disabled={!resolucao.trim()}>
                    <CheckCircle size={16} />Resolver
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
