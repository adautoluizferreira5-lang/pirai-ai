import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Search, TrendingUp, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Pagamento, Cliente } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, getStatusConfig, metodoPagamentoConfig } from '@/lib/utils';

export function Financeiro() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    cliente_id: '', valor: '', data_vencimento: '', metodo: 'pix', observacoes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      supabase.from('pagamentos').select('*, cliente:clientes(*)').order('created_at', { ascending: false }),
      supabase.from('clientes').select('*').order('nome', { ascending: true }),
    ]);
    if (pRes.data) setPagamentos(pRes.data as Pagamento[]);
    if (cRes.data) setClientes(cRes.data as Cliente[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = pagamentos.filter((p) => {
    const name = p.cliente?.nome || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    recebido: pagamentos.filter((p) => p.status === 'pago').reduce((sum, p) => sum + Number(p.valor), 0),
    pendente: pagamentos.filter((p) => p.status === 'pendente').reduce((sum, p) => sum + Number(p.valor), 0),
    vencido: pagamentos.filter((p) => p.status === 'vencido').reduce((sum, p) => sum + Number(p.valor), 0),
    totalVencidos: pagamentos.filter((p) => p.status === 'vencido').length,
  };

  async function savePagamento() {
    if (!form.cliente_id || !form.valor) return;
    await supabase.from('pagamentos').insert({
      cliente_id: form.cliente_id,
      valor: parseFloat(form.valor) || 0,
      data_vencimento: form.data_vencimento || null,
      metodo: form.metodo,
      observacoes: form.observacoes,
      status: 'pendente',
    });
    setForm({ cliente_id: '', valor: '', data_vencimento: '', metodo: 'pix', observacoes: '' });
    setModalOpen(false);
    loadData();
  }

  async function updateStatus(id: string, status: string) {
    const update: Record<string, unknown> = { status };
    if (status === 'pago') update.data_pagamento = new Date().toISOString().split('T')[0];
    await supabase.from('pagamentos').update(update).eq('id', id);
    loadData();
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900">Financeiro</h2>
            <p className="text-sm text-dark-500">Pagamentos, vencimentos e renovações</p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} />Registrar Pagamento
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-success-500"><TrendingUp size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{formatCurrency(stats.recebido)}</p>
          <p className="text-xs text-dark-500">Recebido</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-warning-500"><Wallet size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{formatCurrency(stats.pendente)}</p>
          <p className="text-xs text-dark-500">Pendente</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-error-500"><AlertTriangle size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{formatCurrency(stats.vencido)}</p>
          <p className="text-xs text-dark-500">Vencido</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-error-500"><AlertTriangle size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.totalVencidos}</p>
          <p className="text-xs text-dark-500">Pag. vencidos</p>
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
              placeholder="Buscar por cliente..."
              className="w-full rounded-lg border border-dark-300 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-dark-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
          >
            <option value="todos">Todos</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-sm text-dark-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<DollarSign size={28} />}
              title="Nenhum pagamento registrado"
              description="Registre pagamentos para acompanhar a receita"
              action={<Button size="sm" onClick={() => setModalOpen(true)}><Plus size={16} />Registrar</Button>}
            />
          ) : (
            <div className="divide-y divide-dark-100">
              {filtered.map((pag) => {
                const sc = getStatusConfig(pag.status);
                return (
                  <div key={pag.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-dark-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dark-900">{formatCurrency(pag.valor)}</p>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-dark-500">
                        {pag.cliente && <span>{pag.cliente.nome}</span>}
                        {pag.metodo && (
                          <>
                            <span>•</span>
                            <span>{metodoPagamentoConfig[pag.metodo]}</span>
                          </>
                        )}
                        {pag.data_vencimento && (
                          <>
                            <span>•</span>
                            <span>Vence: {formatDate(pag.data_vencimento)}</span>
                          </>
                        )}
                        {pag.data_pagamento && (
                          <>
                            <span>•</span>
                            <span className="text-success-600">Pago: {formatDate(pag.data_pagamento)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {pag.status !== 'pago' && pag.status !== 'cancelado' && (
                      <Button size="sm" variant="success" onClick={() => updateStatus(pag.id, 'pago')}>
                        <CheckCircle size={14} />Confirmar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Pagamento" size="md">
        <div className="space-y-4">
          <Select
            label="Cliente *"
            value={form.cliente_id}
            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
            options={[{ value: '', label: 'Selecione...' }, ...clientes.map((c) => ({ value: c.id, label: c.nome }))]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor (R$) *" type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0.00" />
            <Input label="Vencimento" type="date" value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} />
          </div>
          <Select
            label="Método de Pagamento"
            value={form.metodo}
            onChange={(e) => setForm({ ...form, metodo: e.target.value })}
            options={[
              { value: 'pix', label: 'Pix' },
              { value: 'cartao', label: 'Cartão' },
              { value: 'dinheiro', label: 'Dinheiro' },
              { value: 'transferencia', label: 'Transferência' },
              { value: 'boleto', label: 'Boleto' },
            ]}
          />
          <Textarea label="Observações" rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Notas sobre o pagamento" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={savePagamento}>Registrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
