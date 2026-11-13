import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, TrendingUp, AlertTriangle, Lightbulb, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MensagemIA } from '@/types/database';

type Suggestion = {
  icon: typeof Brain;
  text: string;
  prompt: string;
};

const suggestions: Suggestion[] = [
  { icon: TrendingUp, text: 'Como estão as vendas?', prompt: 'Gere um relatório comercial' },
  { icon: AlertTriangle, text: 'Pagamentos vencidos', prompt: 'Quais pagamentos estão vencidos?' },
  { icon: Lightbulb, text: 'Oportunidades de melhoria', prompt: 'Gere um resumo geral da operação' },
  { icon: Brain, text: 'Tickets urgentes', prompt: 'Há tickets urgentes no atendimento?' },
];

type ChatMessage = {
  role: 'user' | 'ai' | 'error';
  content: string;
  timestamp: string;
};

type EdgeFunctionResponse = {
  resposta: string;
  intent: string;
  dados_consultados?: Record<string, number>;
  error?: string;
  detalhe?: string;
};

export function Diretoria() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<MensagemIA[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadHistory() {
    const { data } = await supabase
      .from('mensagens_ia')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setHistory(data as MensagemIA[]);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const conversationHistory = messages.map((m) => ({
      role: m.role === 'error' ? 'ai' : m.role,
      content: m.content,
    }));

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pirai-ai-engine`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          prompt: text,
          history: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro de conexão (${response.status})`);
      }

      const data: EdgeFunctionResponse = await response.json();

      if (data.error) {
        const errorMsg: ChatMessage = {
          role: 'error',
          content: `Não consegui processar sua solicitação: ${data.detalhe || data.error}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        const aiMsg: ChatMessage = {
          role: 'ai',
          content: data.resposta,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'error',
        content: 'Erro de conexão com o motor de inteligência. Verifique sua internet e tente novamente.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      loadHistory();
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-900">Diretoria — PIRAÍ AI</h2>
          <p className="text-sm text-dark-500">Assistente central com consultas em tempo real aos dados</p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col overflow-hidden rounded-xl border border-dark-200 bg-white lg:col-span-2">
          <div className="border-b border-dark-200 bg-dark-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse-glow" />
              <p className="text-sm font-semibold text-dark-700">Conversa com a PIRAÍ AI</p>
              <span className="ml-auto text-xs text-dark-400">Dados em tempo real</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
                  <Brain size={32} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-dark-800">Olá! Sou a PIRAÍ AI</p>
                  <p className="mt-1 text-sm text-dark-500">
                    Sua assistente executiva. Consulto dados reais de todos os módulos.
                  </p>
                  <p className="mt-2 text-xs text-dark-400">
                    Digite "ajuda" para ver tudo o que posso fazer.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : msg.role === 'error'
                        ? 'bg-error-50 border border-error-200 text-error-700'
                        : 'bg-dark-100 text-dark-700'
                    }`}
                  >
                    {msg.role === 'error' && (
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-error-600">
                        <WifiOff size={14} />
                        Erro
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-dark-100 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-dark-400 animate-pulse-glow" />
                      <div className="h-2 w-2 rounded-full bg-dark-400 animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
                      <div className="h-2 w-2 rounded-full bg-dark-400 animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-dark-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Digite sua solicitação..."
                className="flex-1 rounded-lg border border-dark-300 px-4 py-2.5 text-sm text-dark-900 outline-none transition-colors placeholder:text-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-dark-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-dark-700">Sugestões rápidas</h3>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.prompt)}
                  className="flex w-full items-center gap-3 rounded-lg border border-dark-200 px-3 py-2.5 text-left transition-all hover:border-primary-300 hover:bg-primary-50"
                >
                  <s.icon size={18} className="flex-shrink-0 text-primary-500" />
                  <span className="text-sm text-dark-600">{s.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-dark-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-dark-700">Histórico recente</h3>
            {history.length === 0 ? (
              <p className="py-6 text-center text-xs text-dark-400">
                Nenhuma conversa registrada ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="rounded-lg bg-dark-50 p-3">
                    <p className="truncate text-xs font-medium text-dark-600">{h.pergunta}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-dark-400">{h.resposta}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
