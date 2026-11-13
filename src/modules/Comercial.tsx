import { useState, useEffect, useCallback } from 'react';
import { Handshake, Plus, Phone, Mail, Search, Users, Tag, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Interessado, Plano } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, getStatusConfig } from '@/lib/utils';

type Tab = 'leads' | 'planos';

export function Comercial() {
  const [tab, setTab] = useState<Tab>('leads');
  const [interessados, setInteressados] = useState<Interessado[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'lead' | 'plano'>('lead');

  const [leadForm, setLeadForm] = useState({
    nome: '', telefone: '', email: '', origem: '', interesse: '', status: 'novo', observacoes: '',
  });
  const [planoForm, setPlanoForm] = useState({
    nome: '', descricao: '', preco: '', periodo: 'mensal', recursos: '', ativo: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [leadsRes, planosRes] = await Promise.all([
      supabase.from('interessados').select('*').order('created_at', { ascending: false }),
      supabase.from('planos').select('*').order('created_at', { ascending: false }),
    ]);
    if (leadsRes.data) setInteressados(leadsRes.data as Interessado[]);
    if (planosRes.data) setPlanos(planosRes.data as Plano[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredLeads = interessados.filter((l) =>
    l.nome.toLowerCase().includes(search.toLowerCase()) ||
    (l.telefone || '').includes(search)
  );

  async function saveLead() {
    if (!leadForm.nome.trim()) return;
    await supabase.from('interessados').insert(leadForm);
    setLeadForm({ nome: '', telefone: '', email: '', origem: '', interesse: '', status: 'novo', observacoes: '' });
    setModalOpen(false);
    loadData();
  }

  async function savePlano() {
    if (!planoForm.nome.trim()) return;
    await supabase.from('planos').insert({
      ...planoForm,
      preco: parseFloat(planoForm.preco) || 0,
    });
    setPlanoForm({ nome: '', descricao: '', preco: '', periodo: 'mensal', recursos: '', ativo: true });
    setModalOpen(false);
    loadData();
  }

  async function updateLeadStatus(id: string, status: string) {
    await supabase.from('interessados').update({ status }).eq('id', id);
    loadData();
  }

  const leadStats = {
    total: interessados.length,
    novos: interessados.filter((l) => l.status === 'novo').length,
    negociando: interessados.filter((l) => l.status === 'negociando').length,
    convertidos: interessados.filter((l) => l.status === 'convertido').length,
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
            <Handshake size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900">Comercial</h2>
            <p className="text-sm text-dark-500">Leads, planos e negociações</p>
          </div>
        </div>
        <Button
          onClick={() => { setModalType(tab === 'leads' ? 'lead' : 'plano'); setModalOpen(true); }}
        >
          <Plus size={18} />
          {tab === 'leads' ? 'Novo Interessado' : 'Novo Plano'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-dark-400"><Users size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{leadStats.total}</p>
          <p className="text-xs text-dark-500">Total de leads</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-primary-500"><UserPlus size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{leadStats.novos}</p>
          <p className="text-xs text-dark-500">Novos</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-accent-500"><Handshake size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{leadStats.negociando}</p>
          <p className="text-xs text-dark-500">Negociando</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-success-500"><Tag size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{leadStats.convertidos}</p>
          <p className="text-xs text-dark-500">Convertidos</p>
        </Card>
      </div>

      <div className="flex gap-1 rounded-lg bg-dark-100 p-1">
        <button
          onClick={() => setTab('leads')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${tab === 'leads' ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}
        >
          Interessados
        </button>
        <button
          onClick={() => setTab('planos')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${tab === 'planos' ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}
        >
          Planos
        </button>
      </div>

      {tab === 'leads' ? (
        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-dark-200 p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou telefone..."
                className="w-full rounded-lg border border-dark-300 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-dark-400">Carregando...</div>
            ) : filteredLeads.length === 0 ? (
              <EmptyState
                icon={<Handshake size={28} />}
                title="Nenhum interessado cadastrado"
                description="Cadastre leads para acompanhar negociações"
                action={<Button size="sm" onClick={() => { setModalType('lead'); setModalOpen(true); }}><Plus size={16} />Cadastrar</Button>}
              />
            ) : (
              <div className="divide-y divide-dark-100">
                {filteredLeads.map((lead) => {
                  const sc = getStatusConfig(lead.status);
                  return (
                    <div key={lead.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-dark-50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-dark-900 truncate">{lead.nome}</p>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-dark-500">
                          {lead.telefone && (
                            <span className="flex items-center gap-1"><Phone size={12} />{lead.telefone}</span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1"><Mail size={12} />{lead.email}</span>
                          )}
                          {lead.interesse && <span>{lead.interesse}</span>}
                        </div>
                      </div>
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="ml-3 rounded-lg border border-dark-300 px-2 py-1 text-xs outline-none focus:border-primary-500"
                      >
                        <option value="novo">Novo</option>
                        <option value="contatado">Contatado</option>
                        <option value="teste">Em Teste</option>
                        <option value="negociando">Negociando</option>
                        <option value="convertido">Convertido</option>
                        <option value="perdido">Perdido</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {planos.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Tag size={28} />}
                title="Nenhum plano cadastrado"
                description="Cadastre planos para apresentar aos interessados"
                action={<Button size="sm" onClick={() => { setModalType('plano'); setModalOpen(true); }}><Plus size={16} />Cadastrar</Button>}
              />
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {planos.map((plano) => (
                <Card key={plano.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-dark-900">{plano.nome}</h3>
                      <p className="text-xs text-dark-500 capitalize">{plano.periodo}</p>
                    </div>
                    <Badge variant={plano.ativo ? 'success' : 'default'}>
                      {plano.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-primary-600">
                    {formatCurrency(plano.preco)}
                    <span className="text-sm font-normal text-dark-400">/{plano.periodo === 'mensal' ? 'mês' : plano.periodo}</span>
                  </p>
                  {plano.descricao && (
                    <p className="mt-2 text-sm text-dark-600">{plano.descricao}</p>
                  )}
                  {plano.recursos && (
                    <p className="mt-2 text-xs text-dark-400">{plano.recursos}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'lead' ? 'Cadastrar Interessado' : 'Cadastrar Plano'}
        size="md"
      >
        {modalType === 'lead' ? (
          <div className="space-y-4">
            <Input label="Nome *" value={leadForm.nome} onChange={(e) => setLeadForm({ ...leadForm, nome: e.target.value })} placeholder="Nome do interessado" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Telefone" value={leadForm.telefone} onChange={(e) => setLeadForm({ ...leadForm, telefone: e.target.value })} placeholder="(00) 0000-0000" />
              <Input label="E-mail" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Origem" value={leadForm.origem} onChange={(e) => setLeadForm({ ...leadForm, origem: e.target.value })} placeholder="WhatsApp, Instagram..." />
              <Input label="Interesse" value={leadForm.interesse} onChange={(e) => setLeadForm({ ...leadForm, interesse: e.target.value })} placeholder="Plano de interesse" />
            </div>
            <Select
              label="Status"
              value={leadForm.status}
              onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
              options={[
                { value: 'novo', label: 'Novo' },
                { value: 'contatado', label: 'Contatado' },
                { value: 'teste', label: 'Em Teste' },
                { value: 'negociando', label: 'Negociando' },
                { value: 'convertido', label: 'Convertido' },
                { value: 'perdido', label: 'Perdido' },
              ]}
            />
            <Textarea label="Observações" rows={3} value={leadForm.observacoes} onChange={(e) => setLeadForm({ ...leadForm, observacoes: e.target.value })} placeholder="Notas sobre o interessado" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveLead}>Salvar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Nome do Plano *" value={planoForm.nome} onChange={(e) => setPlanoForm({ ...planoForm, nome: e.target.value })} placeholder="Ex: Plano Premium" />
            <Textarea label="Descrição" rows={2} value={planoForm.descricao} onChange={(e) => setPlanoForm({ ...planoForm, descricao: e.target.value })} placeholder="Descrição do plano" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Preço (R$) *" type="number" value={planoForm.preco} onChange={(e) => setPlanoForm({ ...planoForm, preco: e.target.value })} placeholder="0.00" />
              <Select
                label="Período"
                value={planoForm.periodo}
                onChange={(e) => setPlanoForm({ ...planoForm, periodo: e.target.value })}
                options={[
                  { value: 'mensal', label: 'Mensal' },
                  { value: 'trimestral', label: 'Trimestral' },
                  { value: 'semestral', label: 'Semestral' },
                  { value: 'anual', label: 'Anual' },
                ]}
              />
            </div>
            <Textarea label="Recursos" rows={3} value={planoForm.recursos} onChange={(e) => setPlanoForm({ ...planoForm, recursos: e.target.value })} placeholder="Lista de recursos inclusos" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={savePlano}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
