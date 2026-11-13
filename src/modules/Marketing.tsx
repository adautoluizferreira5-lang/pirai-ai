import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Calendar, Share2, TrendingUp, MessageSquare, Mail, Radio } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Campanha } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, getStatusConfig, tipoCampanhaConfig } from '@/lib/utils';

const tipoIcon: Record<string, typeof Megaphone> = {
  redes_sociais: Share2,
  whatsapp: MessageSquare,
  email: Mail,
  radio: Radio,
  outdoor: Megaphone,
  promocao: TrendingUp,
};

export function Marketing() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailCampanha, setDetailCampanha] = useState<Campanha | null>(null);
  const [generatedText, setGeneratedText] = useState('');

  const [form, setForm] = useState({
    nome: '', tipo: 'redes_sociais', publico: '', conteudo: '', status: 'rascunho',
    data_inicio: '', data_fim: '',
  });

  const [geradorForm, setGeradorForm] = useState({
    produto: '', publico: '', tom: 'profissional',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('campanhas').select('*').order('created_at', { ascending: false });
    if (data) setCampanhas(data as Campanha[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveCampanha() {
    if (!form.nome.trim()) return;
    await supabase.from('campanhas').insert({
      ...form,
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
    });
    setForm({ nome: '', tipo: 'redes_sociais', publico: '', conteudo: '', status: 'rascunho', data_inicio: '', data_fim: '' });
    setModalOpen(false);
    loadData();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('campanhas').update({ status }).eq('id', id);
    loadData();
  }

  function gerarTexto() {
    const { produto, publico, tom } = geradorForm;
    if (!produto.trim()) return;

    const textos: Record<string, string> = {
      profissional: `${produto}\n\nOfereça o melhor em entretenimento para sua família! ${publico ? `Direcionado para ${publico}.` : ''}\n\nA Piraí Conect TV traz qualidade, estabilidade e suporte dedicado para você nunca ficar sem sinal.\n\nFale conosco e faça um teste!`,
      amigavel: `Olá! Tem ${produto} na Piraí Conect TV! 📺\n\n${publico ? `Feito especialmente para ${publico}.` : ''}\n\nEntretenimento de qualidade, com o melhor suporte da região. Não fique de fora!\n\nChama a gente e testa grátis!`,
      promocional: `PROMOÇÃO ESPECIAL! ${produto} com condição única!\n\n${publico ? `Para ${publico}:` : 'Para você:'} a melhor experiência em entretenimento com des especial!\n\nPiraí Conect TV — qualidade que você merece. Aproveite!\n\nVagas limitadas. Fale agora!`,
    };

    setGeneratedText(textos[tom] || textos.profissional);
  }

  const stats = {
    total: campanhas.length,
    ativas: campanhas.filter((c) => c.status === 'ativa').length,
    rascunhos: campanhas.filter((c) => c.status === 'rascunho').length,
    concluidas: campanhas.filter((c) => c.status === 'concluida').length,
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
            <Megaphone size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900">Marketing</h2>
            <p className="text-sm text-dark-500">Campanhas, conteúdos e estratégias</p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} />Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-primary-500"><Megaphone size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.total}</p>
          <p className="text-xs text-dark-500">Total</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-success-500"><TrendingUp size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.ativas}</p>
          <p className="text-xs text-dark-500">Ativas</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-dark-400"><MessageSquare size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.rascunhos}</p>
          <p className="text-xs text-dark-500">Rascunhos</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-accent-500"><Calendar size={16} /></div>
          <p className="mt-2 text-2xl font-bold text-dark-900">{stats.concluidas}</p>
          <p className="text-xs text-dark-500">Concluídas</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Share2 size={18} className="text-primary-500" />
          <h3 className="text-sm font-semibold text-dark-700">Gerador de Textos Publicitários</h3>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Input label="Produto/Serviço" value={geradorForm.produto} onChange={(e) => setGeradorForm({ ...geradorForm, produto: e.target.value })} placeholder="Ex: Plano Premium IPTV" />
          <Input label="Público-alvo" value={geradorForm.publico} onChange={(e) => setGeradorForm({ ...geradorForm, publico: e.target.value })} placeholder="Ex: famílias da região" />
          <Select label="Tom" value={geradorForm.tom} onChange={(e) => setGeradorForm({ ...geradorForm, tom: e.target.value })}
            options={[
              { value: 'profissional', label: 'Profissional' },
              { value: 'amigavel', label: 'Amigável' },
              { value: 'promocional', label: 'Promocional' },
            ]}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={gerarTexto} disabled={!geradorForm.produto.trim()}>
            <Megaphone size={16} />Gerar Texto
          </Button>
        </div>
        {generatedText && (
          <div className="mt-3 rounded-lg border border-dark-200 bg-dark-50 p-4">
            <p className="mb-2 text-xs font-semibold text-dark-500">Texto gerado:</p>
            <p className="whitespace-pre-wrap text-sm text-dark-700">{generatedText}</p>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                navigator.clipboard?.writeText(generatedText);
              }}>
                Copiar
              </Button>
              <Button size="sm" onClick={() => {
                setForm({ ...form, conteudo: generatedText });
                setGeneratedText('');
                setModalOpen(true);
              }}>
                Usar em Campanha
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-10 text-center text-sm text-dark-400">Carregando...</div>
        ) : campanhas.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Megaphone size={28} />}
              title="Nenhuma campanha criada"
              description="Crie campanhas para promover seus serviços"
              action={<Button size="sm" onClick={() => setModalOpen(true)}><Plus size={16} />Criar</Button>}
            />
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campanhas.map((c) => {
              const sc = getStatusConfig(c.status === 'ativa' ? 'ativa_campanha' : c.status);
              const Icon = (c.tipo && tipoIcon[c.tipo]) || Megaphone;
              return (
                <Card key={c.id} className="cursor-pointer p-4" onClick={() => setDetailCampanha(c)}>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-100">
                      <Icon size={20} className="text-dark-500" />
                    </div>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold text-dark-900">{c.nome}</h3>
                  <p className="text-xs text-dark-500">{c.tipo ? tipoCampanhaConfig[c.tipo] : '-'}</p>
                  {c.conteudo && <p className="mt-2 line-clamp-2 text-xs text-dark-400">{c.conteudo}</p>}
                  <div className="mt-3 flex items-center gap-2 text-xs text-dark-400">
                    <Calendar size={12} />
                    {c.data_inicio ? formatDate(c.data_inicio) : 'Sem data'} — {c.data_fim ? formatDate(c.data_fim) : '...'}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Campanha" size="md">
        <div className="space-y-4">
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome da campanha" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              options={[
                { value: 'redes_sociais', label: 'Redes Sociais' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email', label: 'E-mail' },
                { value: 'radio', label: 'Rádio' },
                { value: 'outdoor', label: 'Outdoor' },
                { value: 'promocao', label: 'Promoção' },
              ]}
            />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'rascunho', label: 'Rascunho' },
                { value: 'ativa', label: 'Ativa' },
                { value: 'pausada', label: 'Pausada' },
                { value: 'concluida', label: 'Concluída' },
              ]}
            />
          </div>
          <Input label="Público-alvo" value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} placeholder="Ex: famílias, jovens..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data de Início" type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} />
            <Input label="Data de Fim" type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} />
          </div>
          <Textarea label="Conteúdo" rows={4} value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} placeholder="Texto publicitário da campanha" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveCampanha}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!detailCampanha}
        onClose={() => setDetailCampanha(null)}
        title={detailCampanha?.nome || ''}
        size="lg"
      >
        {detailCampanha && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{detailCampanha.tipo ? tipoCampanhaConfig[detailCampanha.tipo] : '-'}</Badge>
              <Badge variant={getStatusConfig(detailCampanha.status === 'ativa' ? 'ativa_campanha' : detailCampanha.status).variant}>
                {getStatusConfig(detailCampanha.status === 'ativa' ? 'ativa_campanha' : detailCampanha.status).label}
              </Badge>
            </div>

            {detailCampanha.publico && (
              <div className="text-sm">
                <span className="text-dark-500">Público-alvo: </span>
                <span className="font-medium text-dark-700">{detailCampanha.publico}</span>
              </div>
            )}

            <div className="rounded-lg bg-dark-50 p-4 text-sm text-dark-600">
              <p className="font-medium text-dark-700">Conteúdo</p>
              <p className="mt-1 whitespace-pre-wrap">{detailCampanha.conteudo || 'Sem conteúdo'}</p>
            </div>

            {(detailCampanha.data_inicio || detailCampanha.data_fim) && (
              <div className="text-sm text-dark-500">
                Período: {formatDate(detailCampanha.data_inicio)} — {formatDate(detailCampanha.data_fim)}
              </div>
            )}

            {detailCampanha.status !== 'concluida' && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-dark-200 pt-4">
                {detailCampanha.status !== 'ativa' && (
                  <Button size="sm" variant="success" onClick={() => { updateStatus(detailCampanha.id, 'ativa'); setDetailCampanha(null); }}>
                    Ativar Campanha
                  </Button>
                )}
                {detailCampanha.status === 'ativa' && (
                  <Button size="sm" variant="outline" onClick={() => { updateStatus(detailCampanha.id, 'pausada'); setDetailCampanha(null); }}>
                    Pausar
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => { updateStatus(detailCampanha.id, 'concluida'); setDetailCampanha(null); }}>
                  Concluir
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
