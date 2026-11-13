import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Plus, Search, Users, Server, AppWindow, Phone, Mail, Tv,
  Monitor, Smartphone, Globe,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Cliente, Servidor, Aplicativo, Assinatura, Plano } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, getStatusConfig, tipoServidorConfig } from '@/lib/utils';

type Tab = 'clientes' | 'servidores' | 'aplicativos' | 'assinaturas';

export function Administracao() {
  const [tab, setTab] = useState<Tab>('clientes');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [aplicativos, setAplicativos] = useState<Aplicativo[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [clienteForm, setClienteForm] = useState({
    nome: '', cpf: '', telefone: '', email: '', endereco: '', status: 'ativo', observacoes: '',
  });
  const [servidorForm, setServidorForm] = useState({
    nome: '', host: '', porta: '', painel_url: '', tipo: 'iptv', custo_mensal: '', status: 'ativo', observacoes: '',
  });
  const [appForm, setAppForm] = useState({
    nome: '', plataforma: '', versao: '', descricao: '', ativo: true,
  });
  const [assinaturaForm, setAssinaturaForm] = useState({
    cliente_id: '', plano_id: '', data_inicio: '', data_vencimento: '', status: 'ativa', dispositivo: '', aplicativo: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [cRes, sRes, aRes, assRes, pRes] = await Promise.all([
      supabase.from('clientes').select('*').order('created_at', { ascending: false }),
      supabase.from('servidores').select('*').order('created_at', { ascending: false }),
      supabase.from('aplicativos').select('*').order('created_at', { ascending: false }),
      supabase.from('assinaturas').select('*, cliente:clientes(*), plano:planos(*)').order('created_at', { ascending: false }),
      supabase.from('planos').select('*').order('nome', { ascending: true }),
    ]);
    if (cRes.data) setClientes(cRes.data as Cliente[]);
    if (sRes.data) setServidores(sRes.data as Servidor[]);
    if (aRes.data) setAplicativos(aRes.data as Aplicativo[]);
    if (assRes.data) setAssinaturas(assRes.data as Assinatura[]);
    if (pRes.data) setPlanos(pRes.data as Plano[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredClientes = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.telefone || '').includes(search)
  );

  async function saveCliente() {
    if (!clienteForm.nome.trim()) return;
    await supabase.from('clientes').insert(clienteForm);
    setClienteForm({ nome: '', cpf: '', telefone: '', email: '', endereco: '', status: 'ativo', observacoes: '' });
    setModalOpen(false);
    loadData();
  }

  async function saveServidor() {
    if (!servidorForm.nome.trim()) return;
    await supabase.from('servidores').insert({
      ...servidorForm,
      custo_mensal: parseFloat(servidorForm.custo_mensal) || 0,
    });
    setServidorForm({ nome: '', host: '', porta: '', painel_url: '', tipo: 'iptv', custo_mensal: '', status: 'ativo', observacoes: '' });
    setModalOpen(false);
    loadData();
  }

  async function saveApp() {
    if (!appForm.nome.trim()) return;
    await supabase.from('aplicativos').insert(appForm);
    setAppForm({ nome: '', plataforma: '', versao: '', descricao: '', ativo: true });
    setModalOpen(false);
    loadData();
  }

  async function saveAssinatura() {
    if (!assinaturaForm.cliente_id) return;
    await supabase.from('assinaturas').insert({
      ...assinaturaForm,
      data_inicio: assinaturaForm.data_inicio || new Date().toISOString().split('T')[0],
    });
    setAssinaturaForm({ cliente_id: '', plano_id: '', data_inicio: '', data_vencimento: '', status: 'ativa', dispositivo: '', aplicativo: '' });
    setModalOpen(false);
    loadData();
  }

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'clientes', label: 'Clientes', icon: Users },
    { key: 'assinaturas', label: 'Assinaturas', icon: Tv },
    { key: 'servidores', label: 'Servidores', icon: Server },
    { key: 'aplicativos', label: 'Aplicativos', icon: AppWindow },
  ];

  function openModal() {
    if (tab === 'clientes') setClienteForm({ nome: '', cpf: '', telefone: '', email: '', endereco: '', status: 'ativo', observacoes: '' });
    if (tab === 'servidores') setServidorForm({ nome: '', host: '', porta: '', painel_url: '', tipo: 'iptv', custo_mensal: '', status: 'ativo', observacoes: '' });
    if (tab === 'aplicativos') setAppForm({ nome: '', plataforma: '', versao: '', descricao: '', ativo: true });
    if (tab === 'assinaturas') setAssinaturaForm({ cliente_id: '', plano_id: '', data_inicio: '', data_vencimento: '', status: 'ativa', dispositivo: '', aplicativo: '' });
    setModalOpen(true);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
            <Settings size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900">Administração</h2>
            <p className="text-sm text-dark-500">Clientes, servidores, aplicativos e assinaturas</p>
          </div>
        </div>
        <Button onClick={openModal}>
          <Plus size={18} />
          {tab === 'clientes' ? 'Novo Cliente' : tab === 'servidores' ? 'Novo Servidor' : tab === 'aplicativos' ? 'Novo App' : 'Nova Assinatura'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-primary-500"><Users size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{clientes.length}</p>
          <p className="text-xs text-dark-500">Clientes</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-accent-500"><Tv size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{assinaturas.length}</p>
          <p className="text-xs text-dark-500">Assinaturas</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-success-500"><Server size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{servidores.length}</p>
          <p className="text-xs text-dark-500">Servidores</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-warning-500"><AppWindow size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{aplicativos.length}</p>
          <p className="text-xs text-dark-500">Aplicativos</p>
        </Card>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-dark-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); }}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md py-2 text-sm font-medium transition-all ${tab === t.key ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'clientes' && (
        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-dark-200 p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-lg border border-dark-300 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-dark-400">Carregando...</div>
            ) : filteredClientes.length === 0 ? (
              <EmptyState icon={<Users size={28} />} title="Nenhum cliente cadastrado" description="Cadastre clientes para gerenciar assinaturas" action={<Button size="sm" onClick={openModal}><Plus size={16} />Cadastrar</Button>} />
            ) : (
              <div className="divide-y divide-dark-100">
                {filteredClientes.map((c) => {
                  const sc = getStatusConfig(c.status);
                  return (
                    <div key={c.id} className="px-4 py-3 transition-colors hover:bg-dark-50">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-dark-900 truncate">{c.nome}</p>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-dark-500">
                            {c.telefone && <span className="flex items-center gap-1"><Phone size={12} />{c.telefone}</span>}
                            {c.email && <span className="flex items-center gap-1"><Mail size={12} />{c.email}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {tab === 'servidores' && (
        <div className="flex-1 overflow-y-auto">
          {servidores.length === 0 ? (
            <Card><EmptyState icon={<Server size={28} />} title="Nenhum servidor cadastrado" description="Cadastre servidores e painéis de IPTV" action={<Button size="sm" onClick={openModal}><Plus size={16} />Cadastrar</Button>} /></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {servidores.map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-100">
                        <Server size={18} className="text-dark-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900">{s.nome}</p>
                        <p className="text-xs text-dark-500">{s.tipo ? tipoServidorConfig[s.tipo] : '-'}</p>
                      </div>
                    </div>
                    <Badge variant={s.status === 'ativo' ? 'success' : s.status === 'manutencao' ? 'warning' : 'default'}>
                      {s.status === 'ativo' ? 'Ativo' : s.status === 'manutencao' ? 'Manutenção' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-dark-500">
                    {s.host && <p className="flex items-center gap-1"><Globe size={12} />{s.host}{s.porta && `:${s.porta}`}</p>}
                    {s.painel_url && <p className="flex items-center gap-1"><Monitor size={12} />{s.painel_url}</p>}
                    <p className="font-medium text-dark-600">Custo: {formatCurrency(s.custo_mensal)}/mês</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'aplicativos' && (
        <div className="flex-1 overflow-y-auto">
          {aplicativos.length === 0 ? (
            <Card><EmptyState icon={<AppWindow size={28} />} title="Nenhum aplicativo cadastrado" description="Cadastre aplicativos utilizados pelos clientes" action={<Button size="sm" onClick={openModal}><Plus size={16} />Cadastrar</Button>} /></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {aplicativos.map((a) => (
                <Card key={a.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-100">
                      <Smartphone size={20} className="text-dark-500" />
                    </div>
                    <Badge variant={a.ativo ? 'success' : 'default'}>{a.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                  <p className="mt-3 font-semibold text-dark-900">{a.nome}</p>
                  <div className="mt-1 text-xs text-dark-500">
                    {a.plataforma && <p>{a.plataforma}</p>}
                    {a.versao && <p>Versão: {a.versao}</p>}
                  </div>
                  {a.descricao && <p className="mt-2 text-xs text-dark-400">{a.descricao}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'assinaturas' && (
        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {assinaturas.length === 0 ? (
              <EmptyState icon={<Tv size={28} />} title="Nenhuma assinatura cadastrada" description="Vincule clientes a planos" action={<Button size="sm" onClick={openModal}><Plus size={16} />Cadastrar</Button>} />
            ) : (
              <div className="divide-y divide-dark-100">
                {assinaturas.map((a) => {
                  const sc = getStatusConfig(a.status);
                  return (
                    <div key={a.id} className="px-4 py-3 transition-colors hover:bg-dark-50">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-dark-900 truncate">{a.cliente?.nome || 'Cliente não encontrado'}</p>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-dark-500">
                            {a.plano && <span>{a.plano.nome} — {formatCurrency(a.plano.preco)}</span>}
                            <span>•</span>
                            <span>Início: {formatDate(a.data_inicio)}</span>
                            {a.data_vencimento && <><span>•</span><span>Vence: {formatDate(a.data_vencimento)}</span></>}
                            {a.dispositivo && <><span>•</span><span>{a.dispositivo}</span></>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          tab === 'clientes' ? 'Novo Cliente' :
          tab === 'servidores' ? 'Novo Servidor' :
          tab === 'aplicativos' ? 'Novo Aplicativo' : 'Nova Assinatura'
        }
        size="md"
      >
        {tab === 'clientes' && (
          <div className="space-y-4">
            <Input label="Nome *" value={clienteForm.nome} onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })} placeholder="Nome do cliente" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="CPF" value={clienteForm.cpf} onChange={(e) => setClienteForm({ ...clienteForm, cpf: e.target.value })} placeholder="000.000.000-00" />
              <Input label="Telefone" value={clienteForm.telefone} onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })} placeholder="(00) 0000-0000" />
            </div>
            <Input label="E-mail" value={clienteForm.email} onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })} placeholder="email@exemplo.com" />
            <Input label="Endereço" value={clienteForm.endereco} onChange={(e) => setClienteForm({ ...clienteForm, endereco: e.target.value })} placeholder="Endereço completo" />
            <Select label="Status" value={clienteForm.status} onChange={(e) => setClienteForm({ ...clienteForm, status: e.target.value })}
              options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' },
                { value: 'suspenso', label: 'Suspenso' },
                { value: 'cancelado', label: 'Cancelado' },
              ]}
            />
            <Textarea label="Observações" rows={2} value={clienteForm.observacoes} onChange={(e) => setClienteForm({ ...clienteForm, observacoes: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveCliente}>Salvar</Button>
            </div>
          </div>
        )}

        {tab === 'servidores' && (
          <div className="space-y-4">
            <Input label="Nome *" value={servidorForm.nome} onChange={(e) => setServidorForm({ ...servidorForm, nome: e.target.value })} placeholder="Nome do servidor" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Host" value={servidorForm.host} onChange={(e) => setServidorForm({ ...servidorForm, host: e.target.value })} placeholder="exemplo.com" />
              <Input label="Porta" value={servidorForm.porta} onChange={(e) => setServidorForm({ ...servidorForm, porta: e.target.value })} placeholder="8080" />
            </div>
            <Input label="URL do Painel" value={servidorForm.painel_url} onChange={(e) => setServidorForm({ ...servidorForm, painel_url: e.target.value })} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Tipo" value={servidorForm.tipo} onChange={(e) => setServidorForm({ ...servidorForm, tipo: e.target.value })}
                options={[
                  { value: 'iptv', label: 'IPTV' },
                  { value: 'streaming', label: 'Streaming' },
                  { value: 'vod', label: 'VOD' },
                  { value: 'outro', label: 'Outro' },
                ]}
              />
              <Input label="Custo Mensal (R$)" type="number" value={servidorForm.custo_mensal} onChange={(e) => setServidorForm({ ...servidorForm, custo_mensal: e.target.value })} placeholder="0.00" />
            </div>
            <Select label="Status" value={servidorForm.status} onChange={(e) => setServidorForm({ ...servidorForm, status: e.target.value })}
              options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' },
                { value: 'manutencao', label: 'Manutenção' },
              ]}
            />
            <Textarea label="Observações" rows={2} value={servidorForm.observacoes} onChange={(e) => setServidorForm({ ...servidorForm, observacoes: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveServidor}>Salvar</Button>
            </div>
          </div>
        )}

        {tab === 'aplicativos' && (
          <div className="space-y-4">
            <Input label="Nome *" value={appForm.nome} onChange={(e) => setAppForm({ ...appForm, nome: e.target.value })} placeholder="Nome do aplicativo" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Plataforma" value={appForm.plataforma} onChange={(e) => setAppForm({ ...appForm, plataforma: e.target.value })} placeholder="Android, iOS, TV..." />
              <Input label="Versão" value={appForm.versao} onChange={(e) => setAppForm({ ...appForm, versao: e.target.value })} placeholder="1.0.0" />
            </div>
            <Textarea label="Descrição" rows={2} value={appForm.descricao} onChange={(e) => setAppForm({ ...appForm, descricao: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveApp}>Salvar</Button>
            </div>
          </div>
        )}

        {tab === 'assinaturas' && (
          <div className="space-y-4">
            <Select label="Cliente *" value={assinaturaForm.cliente_id} onChange={(e) => setAssinaturaForm({ ...assinaturaForm, cliente_id: e.target.value })}
              options={[{ value: '', label: 'Selecione...' }, ...clientes.map((c) => ({ value: c.id, label: c.nome }))]}
            />
            <Select label="Plano" value={assinaturaForm.plano_id} onChange={(e) => setAssinaturaForm({ ...assinaturaForm, plano_id: e.target.value })}
              options={[{ value: '', label: 'Selecione...' }, ...planos.map((p) => ({ value: p.id, label: `${p.nome} — ${formatCurrency(p.preco)}` }))]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Data de Início" type="date" value={assinaturaForm.data_inicio} onChange={(e) => setAssinaturaForm({ ...assinaturaForm, data_inicio: e.target.value })} />
              <Input label="Data de Vencimento" type="date" value={assinaturaForm.data_vencimento} onChange={(e) => setAssinaturaForm({ ...assinaturaForm, data_vencimento: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Dispositivo" value={assinaturaForm.dispositivo} onChange={(e) => setAssinaturaForm({ ...assinaturaForm, dispositivo: e.target.value })} placeholder="Smart TV, Box TV..." />
              <Input label="Aplicativo" value={assinaturaForm.aplicativo} onChange={(e) => setAssinaturaForm({ ...assinaturaForm, aplicativo: e.target.value })} placeholder="App utilizado" />
            </div>
            <Select label="Status" value={assinaturaForm.status} onChange={(e) => setAssinaturaForm({ ...assinaturaForm, status: e.target.value })}
              options={[
                { value: 'ativa', label: 'Ativa' },
                { value: 'em_teste', label: 'Em Teste' },
                { value: 'vencida', label: 'Vencida' },
                { value: 'suspensa', label: 'Suspensa' },
                { value: 'cancelada', label: 'Cancelada' },
              ]}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveAssinatura}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
