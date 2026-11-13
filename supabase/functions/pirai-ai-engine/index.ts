import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Intent =
  | "resumo_geral"
  | "pagamentos_vencidos"
  | "pagamentos_pendentes"
  | "relatorio_comercial"
  | "leads_status"
  | "tickets_abertos"
  | "tickets_urgentes"
  | "clientes_status"
  | "assinaturas_vencendo"
  | "servidores_status"
  | "planos_cadastrados"
  | "campanhas_ativas"
  | "receita_total"
  | "despesas_servidores"
  | "ajuda_sistema"
  | "sem_intencao";

function detectIntent(prompt: string): Intent {
  const p = prompt.toLowerCase();

  if (p.includes("resumo") || p.includes("panorama") || p.includes("visão geral") || p.includes("visao geral") || p.includes("general")) return "resumo_geral";
  if ((p.includes("pagamento") || p.includes("fatura") || p.includes("cobrança")) && (p.includes("vencid") || p.includes("atras"))) return "pagamentos_vencidos";
  if (p.includes("pagamento") && (p.includes("pendent") || p.includes("aguard"))) return "pagamentos_pendentes";
  if (p.includes("relatório") || p.includes("relatorio") || p.includes("desempenho") || p.includes("vendas") || p.includes("comercial")) return "relatorio_comercial";
  if (p.includes("lead") || p.includes("interessado") || (p.includes("novo") && p.includes("contato"))) return "leads_status";
  if ((p.includes("ticket") || p.includes("atendimento") || p.includes("suporte") || p.includes("chamado")) && (p.includes("aberto") || p.includes("pendente") || p.includes("andamento"))) return "tickets_abertos";
  if (p.includes("ticket") && (p.includes("urgente") || p.includes("emergência") || p.includes("emergencia"))) return "tickets_urgentes";
  if (p.includes("cliente") && (p.includes("status") || p.includes("quantos") || p.includes("quantas") || p.includes("ativo"))) return "clientes_status";
  if (p.includes("assinatura") || (p.includes("vencimento") && p.includes("assinatura"))) return "assinaturas_vencendo";
  if (p.includes("servidor") || p.includes("painel") || p.includes("iptv")) return "servidores_status";
  if (p.includes("plano") && (p.includes("cadastr") || p.includes("qual") || p.includes("valor") || p.includes("preço") || p.includes("preco"))) return "planos_cadastrados";
  if (p.includes("campanha") || p.includes("marketing") || p.includes("propaganda")) return "campanhas_ativas";
  if (p.includes("receita") || p.includes("faturamento") || p.includes("total recebido") || p.includes("ganho")) return "receita_total";
  if (p.includes("despesa") || p.includes("custo") || p.includes("gasto")) return "despesas_servidores";
  if (p.includes("ajuda") || p.includes("como funciona") || p.includes("o que você faz") || p.includes("o que voce faz") || p.includes("help")) return "ajuda_sistema";

  return "sem_intencao";
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | null): string {
  if (!date) return "sem data";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "data inválida";
  return d.toLocaleDateString("pt-BR");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const prompt: string = (body?.prompt || "").trim();
    const conversationHistory: Array<{ role: string; content: string }> = body?.history || [];

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt vazio. Envie uma pergunta válida." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const intent = detectIntent(prompt);

    const [
      clientesRes, interessadosRes, planosRes, assinaturasRes,
      servidoresRes, aplicativosRes, pagamentosRes, ticketsRes, campanhasRes,
    ] = await Promise.all([
      supabase.from("clientes").select("*"),
      supabase.from("interessados").select("*"),
      supabase.from("planos").select("*"),
      supabase.from("assinaturas").select("*, cliente:clientes(nome), plano:planos(nome, preco)"),
      supabase.from("servidores").select("*"),
      supabase.from("aplicativos").select("*"),
      supabase.from("pagamentos").select("*, cliente:clientes(nome)"),
      supabase.from("tickets").select("*, cliente:clientes(nome)"),
      supabase.from("campanhas").select("*"),
    ]);

    const clientes = clientesRes.data || [];
    const interessados = interessadosRes.data || [];
    const planos = planosRes.data || [];
    const assinaturas = assinaturasRes.data || [];
    const servidores = servidoresRes.data || [];
    const aplicativos = aplicativosRes.data || [];
    const pagamentos = pagamentosRes.data || [];
    const tickets = ticketsRes.data || [];
    const campanhas = campanhasRes.data || [];

    const hoje = new Date();
    const dataHoje = hoje.toISOString().split("T")[0];

    const clientesAtivos = clientes.filter((c: any) => c.status === "ativo");
    const clientesSuspensos = clientes.filter((c: any) => c.status === "suspenso");
    const leadsNovos = interessados.filter((i: any) => i.status === "novo");
    const leadsNegociando = interessados.filter((i: any) => i.status === "negociando");
    const leadsConvertidos = interessados.filter((i: any) => i.status === "convertido");
    const leadsPerdidos = interessados.filter((i: any) => i.status === "perdido");
    const ticketsAbertos = tickets.filter((t: any) => t.status === "aberto");
    const ticketsAndamento = tickets.filter((t: any) => t.status === "em_andamento");
    const ticketsUrgentes = tickets.filter((t: any) => t.prioridade === "urgente" && (t.status === "aberto" || t.status === "em_andamento"));
    const pagamentosPagos = pagamentos.filter((p: any) => p.status === "pago");
    const pagamentosPendentes = pagamentos.filter((p: any) => p.status === "pendente");
    const pagamentosVencidos = pagamentos.filter((p: any) => p.status === "vencido");
    const assinaturasVencendo = assinaturas.filter((a: any) => {
      if (!a.data_vencimento) return false;
      const venc = new Date(a.data_vencimento);
      const diff = (venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7 && a.status === "ativa";
    });
    const campanhasAtivas = campanhas.filter((c: any) => c.status === "ativa");
    const servidoresAtivos = servidores.filter((s: any) => s.status === "ativo");
    const servidoresManutencao = servidores.filter((s: any) => s.status === "manutencao");

    const receitaTotal = pagamentosPagos.reduce((sum: number, p: any) => sum + Number(p.valor), 0);
    const pendenteTotal = pagamentosPendentes.reduce((sum: number, p: any) => sum + Number(p.valor), 0);
    const vencidoTotal = pagamentosVencidos.reduce((sum: number, p: any) => sum + Number(p.valor), 0);
    const custoServidores = servidores.reduce((sum: number, s: any) => sum + Number(s.custo_mensal), 0);

    let resposta = "";

    switch (intent) {
      case "resumo_geral": {
        const linhas: string[] = [];
        linhas.push("RESUMO OPERACIONAL — PIRAI CONECT TV");
        linhas.push(`Data: ${formatDate(dataHoje)}`);
        linhas.push("");
        linhas.push("CLIENTES:");
        linhas.push(`- Total cadastrados: ${clientes.length}`);
        linhas.push(`- Ativos: ${clientesAtivos.length}`);
        linhas.push(clientesSuspensos.length > 0 ? `- Suspensos: ${clientesSuspensos.length} (atenção necessária)` : "- Suspensos: 0");
        linhas.push("");
        linhas.push("COMERCIAL:");
        linhas.push(`- Leads no funil: ${interessados.length}`);
        linhas.push(`- Novos aguardando contato: ${leadsNovos.length}`);
        linhas.push(`- Em negociação: ${leadsNegociando.length}`);
        linhas.push(`- Convertidos: ${leadsConvertidos.length}`);
        linhas.push(leadsNovos.length > 0 ? `  ⚠ ${leadsNovos.length} lead(s) novo(s) sem primeiro contato!` : "");
        linhas.push("");
        linhas.push("FINANCEIRO:");
        linhas.push(`- Receita recebida: ${formatCurrency(receitaTotal)}`);
        linhas.push(`- Pendente: ${formatCurrency(pendenteTotal)}`);
        linhas.push(vencidoTotal > 0 ? `- Vencido: ${formatCurrency(vencidoTotal)} (${pagamentosVencidos.length} pagamento(s))` : "- Vencido: R$ 0,00");
        linhas.push("");
        linhas.push("ATENDIMENTO:");
        linhas.push(`- Tickets abertos: ${ticketsAbertos.length}`);
        linhas.push(`- Em andamento: ${ticketsAndamento.length}`);
        linhas.push(ticketsUrgentes.length > 0 ? `- ⚠ Urgentes: ${ticketsUrgentes.length}` : "- Urgentes: 0");
        linhas.push("");
        linhas.push("INFRAESTRUTURA:");
        linhas.push(`- Servidores ativos: ${servidoresAtivos.length}`);
        linhas.push(servidoresManutencao.length > 0 ? `- ⚠ Em manutenção: ${servidoresManutencao.length}` : "- Em manutenção: 0");
        linhas.push(`- Custo mensal servidores: ${formatCurrency(custoServidores)}`);
        linhas.push("");
        linhas.push("MARKETING:");
        linhas.push(`- Campanhas ativas: ${campanhasAtivas.length}`);
        if (assinaturasVencendo.length > 0) {
          linhas.push("");
          linhas.push(`⚠ AÇÃO RECOMENDADA: ${assinaturasVencendo.length} assinatura(s) vencem nos próximos 7 dias.`);
        }
        if (leadsNovos.length > 0) {
          linhas.push(`⚠ AÇÃO RECOMENDADA: ${leadsNovos.length} lead(s) novo(s) aguardando primeiro contato.`);
        }
        if (vencidoTotal > 0) {
          linhas.push(`⚠ AÇÃO RECOMENDADA: ${pagamentosVencidos.length} pagamento(s) vencido(s) somando ${formatCurrency(vencidoTotal)}.`);
        }
        resposta = linhas.filter((l) => l !== "").join("\n");
        break;
      }

      case "pagamentos_vencidos": {
        if (pagamentosVencidos.length === 0) {
          resposta = "Não há pagamentos vencidos no momento. Todos os pagamentos estão em dia.";
        } else {
          const linhas: string[] = [];
          linhas.push(`PAGAMENTOS VENCIDOS — ${pagamentosVencidos.length} registro(s)`);
          linhas.push(`Valor total: ${formatCurrency(vencidoTotal)}`);
          linhas.push("");
          pagamentosVencidos.forEach((p: any, idx: number) => {
            linhas.push(`${idx + 1}. ${p.cliente?.nome || "Cliente não identificado"}`);
            linhas.push(`   Valor: ${formatCurrency(Number(p.valor))} | Vencimento: ${formatDate(p.data_vencimento)} | Método: ${p.metodo || "não informado"}`);
          });
          linhas.push("");
          linhas.push("Recomendação: entre em contato com os clientes para regularização. Priorize os vencimentos mais antigos.");
          resposta = linhas.join("\n");
        }
        break;
      }

      case "pagamentos_pendentes": {
        if (pagamentosPendentes.length === 0) {
          resposta = "Não há pagamentos pendentes no momento.";
        } else {
          const linhas: string[] = [];
          linhas.push(`PAGAMENTOS PENDENTES — ${pagamentosPendentes.length} registro(s)`);
          linhas.push(`Valor total: ${formatCurrency(pendenteTotal)}`);
          linhas.push("");
          pagamentosPendentes.forEach((p: any, idx: number) => {
            linhas.push(`${idx + 1}. ${p.cliente?.nome || "Cliente não identificado"}`);
            linhas.push(`   Valor: ${formatCurrency(Number(p.valor))} | Vencimento: ${formatDate(p.data_vencimento)}`);
          });
          resposta = linhas.join("\n");
        }
        break;
      }

      case "relatorio_comercial": {
        const taxaConversao = interessados.length > 0
          ? ((leadsConvertidos.length / interessados.length) * 100).toFixed(1)
          : "0";
        const linhas: string[] = [];
        linhas.push("RELATÓRIO COMERCIAL");
        linhas.push("");
        linhas.push("FUNIL DE VENDAS:");
        linhas.push(`- Total de leads: ${interessados.length}`);
        linhas.push(`- Novos: ${leadsNovos.length}`);
        linhas.push(`- Contatados: ${interessados.filter((i: any) => i.status === "contatado").length}`);
        linhas.push(`- Em teste: ${interessados.filter((i: any) => i.status === "teste").length}`);
        linhas.push(`- Negociando: ${leadsNegociando.length}`);
        linhas.push(`- Convertidos: ${leadsConvertidos.length}`);
        linhas.push(`- Perdidos: ${leadsPerdidos.length}`);
        linhas.push(`- Taxa de conversão: ${taxaConversao}%`);
        linhas.push("");
        linhas.push("PLANOS CADASTRADOS:");
        if (planos.length === 0) {
          linhas.push("- Nenhum plano cadastrado.");
        } else {
          planos.forEach((pl: any) => {
            linhas.push(`- ${pl.nome}: ${formatCurrency(Number(pl.preco))}/${pl.periodo} ${pl.ativo ? "(ativo)" : "(inativo)"}`);
          });
        }
        linhas.push("");
        linhas.push("ASSINATURAS:");
        linhas.push(`- Total: ${assinaturas.length}`);
        linhas.push(`- Ativas: ${assinaturas.filter((a: any) => a.status === "ativa").length}`);
        linhas.push(`- Em teste: ${assinaturas.filter((a: any) => a.status === "em_teste").length}`);
        if (leadsNovos.length > 0) {
          linhas.push("");
          linhas.push(`⚠ ${leadsNovos.length} lead(s) novo(s) sem primeiro contato. Resposta rápida aumenta a conversão.`);
        }
        resposta = linhas.join("\n");
        break;
      }

      case "leads_status": {
        const linhas: string[] = [];
        linhas.push("STATUS DOS LEADS (INTERESSADOS):");
        linhas.push("");
        linhas.push(`Total: ${interessados.length}`);
        linhas.push(`- Novos: ${leadsNovos.length}`);
        linhas.push(`- Em teste: ${interessados.filter((i: any) => i.status === "teste").length}`);
        linhas.push(`- Negociando: ${leadsNegociando.length}`);
        linhas.push(`- Convertidos: ${leadsConvertidos.length}`);
        linhas.push(`- Perdidos: ${leadsPerdidos.length}`);
        if (leadsNovos.length > 0) {
          linhas.push("");
          linhas.push("LEADS NOVOS AGUARDANDO CONTATO:");
          leadsNovos.forEach((l: any, idx: number) => {
            linhas.push(`${idx + 1}. ${l.nome}${l.telefone ? ` — ${l.telefone}` : ""}${l.origem ? ` (origem: ${l.origem})` : ""}`);
          });
        }
        resposta = linhas.join("\n");
        break;
      }

      case "tickets_abertos": {
        const ticketsPendentes = [...ticketsAbertos, ...ticketsAndamento];
        if (ticketsPendentes.length === 0) {
          resposta = "Não há tickets abertos ou em andamento no momento. Todos os atendimentos foram resolvidos.";
        } else {
          const linhas: string[] = [];
          linhas.push(`TICKETS DE ATENDIMENTO — ${ticketsPendentes.length} pendente(s)`);
          linhas.push(`Abertos: ${ticketsAbertos.length} | Em andamento: ${ticketsAndamento.length}`);
          linhas.push("");
          ticketsPendentes.forEach((t: any, idx: number) => {
            linhas.push(`${idx + 1}. ${t.assunto}`);
            linhas.push(`   Cliente: ${t.cliente?.nome || "não vinculado"} | Prioridade: ${t.prioridade} | Categoria: ${t.categoria || "não definida"}`);
            if (t.responsavel) linhas.push(`   Responsável: ${t.responsavel}`);
          });
          resposta = linhas.join("\n");
        }
        break;
      }

      case "tickets_urgentes": {
        if (ticketsUrgentes.length === 0) {
          resposta = "Não há tickets urgentes no momento. Tudo sob controle.";
        } else {
          const linhas: string[] = [];
          linhas.push(`⚠ TICKETS URGENTES — ${ticketsUrgentes.length} registro(s)`);
          linhas.push("");
          ticketsUrgentes.forEach((t: any, idx: number) => {
            linhas.push(`${idx + 1}. ${t.assunto}`);
            linhas.push(`   Cliente: ${t.cliente?.nome || "não vinculado"} | Status: ${t.status}`);
            if (t.descricao) linhas.push(`   Descrição: ${t.descricao}`);
            if (t.responsavel) linhas.push(`   Responsável: ${t.responsavel}`);
          });
          linhas.push("");
          linhas.push("Recomendação: priorize a resolução destes tickets urgentes imediatamente.");
          resposta = linhas.join("\n");
        }
        break;
      }

      case "clientes_status": {
        const linhas: string[] = [];
        linhas.push("STATUS DOS CLIENTES:");
        linhas.push("");
        linhas.push(`Total cadastrados: ${clientes.length}`);
        linhas.push(`- Ativos: ${clientesAtivos.length}`);
        linhas.push(`- Inativos: ${clientes.filter((c: any) => c.status === "inativo").length}`);
        linhas.push(`- Suspensos: ${clientesSuspensos.length}`);
        linhas.push(`- Cancelados: ${clientes.filter((c: any) => c.status === "cancelado").length}`);
        if (clientesSuspensos.length > 0) {
          linhas.push("");
          linhas.push("CLIENTES SUSPENSOS:");
          clientesSuspensos.forEach((c: any, idx: number) => {
            linhas.push(`${idx + 1}. ${c.nome}${c.telefone ? ` — ${c.telefone}` : ""}`);
          });
        }
        resposta = linhas.join("\n");
        break;
      }

      case "assinaturas_vencendo": {
        if (assinaturasVencendo.length === 0) {
          resposta = "Não há assinaturas vencendo nos próximos 7 dias.";
        } else {
          const linhas: string[] = [];
          linhas.push(`ASSINATURAS VENCENDO NOS PRÓXIMOS 7 DIAS — ${assinaturasVencendo.length}`);
          linhas.push("");
          assinaturasVencendo.forEach((a: any, idx: number) => {
            linhas.push(`${idx + 1}. ${a.cliente?.nome || "Cliente não identificado"}`);
            linhas.push(`   Plano: ${a.plano?.nome || "não vinculado"} | Vencimento: ${formatDate(a.data_vencimento)}`);
            if (a.dispositivo) linhas.push(`   Dispositivo: ${a.dispositivo}`);
          });
          linhas.push("");
          linhas.push("Recomendação: entre em contato antecipadamente para renovar antes do vencimento.");
          resposta = linhas.join("\n");
        }
        break;
      }

      case "servidores_status": {
        const linhas: string[] = [];
        linhas.push("STATUS DOS SERVIDORES:");
        linhas.push("");
        linhas.push(`Total: ${servidores.length}`);
        linhas.push(`- Ativos: ${servidoresAtivos.length}`);
        linhas.push(`- Inativos: ${servidores.filter((s: any) => s.status === "inativo").length}`);
        linhas.push(`- Em manutenção: ${servidoresManutencao.length}`);
        linhas.push(`- Custo mensal total: ${formatCurrency(custoServidores)}`);
        if (servidoresManutencao.length > 0) {
          linhas.push("");
          linhas.push("⚠ SERVIDORES EM MANUTENÇÃO:");
          servidoresManutencao.forEach((s: any, idx: number) => {
            linhas.push(`${idx + 1}. ${s.nome}${s.host ? ` — ${s.host}` : ""}`);
          });
        }
        if (aplicativos.length > 0) {
          linhas.push("");
          linhas.push(`APLICATIVOS CADASTRADOS: ${aplicativos.length}`);
          aplicativos.forEach((a: any) => {
            linhas.push(`- ${a.nome}${a.plataforma ? ` (${a.plataforma})` : ""} ${a.ativo ? "✓" : "✗"}`);
          });
        }
        resposta = linhas.join("\n");
        break;
      }

      case "planos_cadastrados": {
        if (planos.length === 0) {
          resposta = "Nenhum plano cadastrado no momento. Acesse o módulo Comercial para cadastrar planos e definir preços.";
        } else {
          const linhas: string[] = [];
          linhas.push("PLANOS CADASTRADOS:");
          linhas.push("");
          planos.forEach((pl: any, idx: number) => {
            linhas.push(`${idx + 1}. ${pl.nome} — ${formatCurrency(Number(pl.preco))}/${pl.periodo}`);
            if (pl.descricao) linhas.push(`   ${pl.descricao}`);
            if (pl.recursos) linhas.push(`   Recursos: ${pl.recursos}`);
            linhas.push(`   Status: ${pl.ativo ? "Ativo" : "Inativo"}`);
          });
          resposta = linhas.join("\n");
        }
        break;
      }

      case "campanhas_ativas": {
        const linhas: string[] = [];
        linhas.push("CAMPANHAS DE MARKETING:");
        linhas.push("");
        linhas.push(`Total: ${campanhas.length}`);
        linhas.push(`- Ativas: ${campanhasAtivas.length}`);
        linhas.push(`- Rascunho: ${campanhas.filter((c: any) => c.status === "rascunho").length}`);
        linhas.push(`- Pausadas: ${campanhas.filter((c: any) => c.status === "pausada").length}`);
        linhas.push(`- Concluídas: ${campanhas.filter((c: any) => c.status === "concluida").length}`);
        if (campanhasAtivas.length > 0) {
          linhas.push("");
          linhas.push("CAMPANHAS ATIVAS:");
          campanhasAtivas.forEach((c: any, idx: number) => {
            linhas.push(`${idx + 1}. ${c.nome} (tipo: ${c.tipo || "não definido"})`);
            if (c.data_inicio) linhas.push(`   Período: ${formatDate(c.data_inicio)} a ${formatDate(c.data_fim)}`);
          });
        }
        resposta = linhas.join("\n");
        break;
      }

      case "receita_total": {
        const linhas: string[] = [];
        linhas.push("RELATÓRIO FINANCEIRO — RECEITA:");
        linhas.push("");
        linhas.push(`Receita recebida: ${formatCurrency(receitaTotal)} (${pagamentosPagos.length} pagamento(s))`);
        linhas.push(`Pendente: ${formatCurrency(pendenteTotal)} (${pagamentosPendentes.length} pagamento(s))`);
        linhas.push(`Vencido: ${formatCurrency(vencidoTotal)} (${pagamentosVencidos.length} pagamento(s))`);
        linhas.push("");
        const receitaPotencial = receitaTotal + pendenteTotal;
        linhas.push(`Receita potencial (recebido + pendente): ${formatCurrency(receitaPotencial)}`);
        linhas.push(`Custo mensal servidores: ${formatCurrency(custoServidores)}`);
        if (receitaTotal > 0 && custoServidores > 0) {
          const margem = receitaTotal - custoServidores;
          linhas.push(`Margem (receita - custo servidores): ${formatCurrency(margem)}`);
        }
        resposta = linhas.join("\n");
        break;
      }

      case "despesas_servidores": {
        const linhas: string[] = [];
        linhas.push("DESPESAS — SERVIDORES:");
        linhas.push("");
        linhas.push(`Custo mensal total: ${formatCurrency(custoServidores)}`);
        linhas.push("");
        servidores.forEach((s: any, idx: number) => {
          linhas.push(`${idx + 1}. ${s.nome} — ${formatCurrency(Number(s.custo_mensal))}/mês (${s.status})`);
        });
        if (servidores.length === 0) {
          linhas.push("Nenhum servidor cadastrado.");
        }
        resposta = linhas.join("\n");
        break;
      }

      case "ajuda_sistema": {
        const linhas: string[] = [];
        linhas.push("PIRAÍ AI — ASSISTENTE DE GESTÃO");
        linhas.push("");
        linhas.push("Posso ajudar você consultando dados reais de todos os módulos:");
        linhas.push("");
        linhas.push("DIRETORIA: Gero resumos gerais e identifico oportunidades de melhoria.");
        linhas.push("- Ex: \"Gere um resumo geral\", \"Panorama de hoje\"");
        linhas.push("");
        linhas.push("COMERCIAL: Consulto leads, planos e conversões.");
        linhas.push("- Ex: \"Relatório comercial\", \"Quais leads são novos?\", \"Quais planos temos?\"");
        linhas.push("");
        linhas.push("ATENDIMENTO: Verifico tickets abertos e urgentes.");
        linhas.push("- Ex: \"Tickets abertos\", \"Tickets urgentes\"");
        linhas.push("");
        linhas.push("FINANCEIRO: Analiso receita, pagamentos pendentes e vencidos.");
        linhas.push("- Ex: \"Pagamentos vencidos\", \"Qual a receita total?\", \"Despesas com servidores\"");
        linhas.push("");
        linhas.push("ADMINISTRAÇÃO: Consulto clientes, assinaturas e servidores.");
        linhas.push("- Ex: \"Status dos clientes\", \"Assinaturas vencendo\", \"Status dos servidores\"");
        linhas.push("");
        linhas.push("MARKETING: Verifico campanhas ativas.");
        linhas.push("- Ex: \"Campanhas ativas\", \"Status do marketing\"");
        linhas.push("");
        linhas.push("Todas as respostas são baseadas em dados reais do sistema. Não invento informações.");
        resposta = linhas.join("\n");
        break;
      }

      case "sem_intencao":
      default: {
        if (conversationHistory.length > 0) {
          const lastUserMsg = [...conversationHistory].reverse().find((m) => m.role === "user");
          if (lastUserMsg) {
            const prevIntent = detectIntent(lastUserMsg.content);
            if (prevIntent !== "sem_intencao") {
              resposta = `Não encontrei dados correspondentes à sua pergunta sobre "${prompt}". `;
              resposta += `Sua pergunta anterior era sobre um tema que identifiquei. `;
              resposta += `Tente reformular ou pergunte sobre: clientes, leads, pagamentos, tickets, servidores, planos, campanhas ou receita. `;
              resposta += `Digite \"ajuda\" para ver todos os comandos disponíveis.`;
              break;
            }
          }
        }
        resposta = `Não identifiquei uma intenção clara em sua pergunta. `;
        resposta += `Posso consultar dados reais sobre: clientes, leads/interessados, pagamentos, tickets de atendimento, assinaturas, servidores, planos, campanhas e receita. `;
        resposta += `Digite \"ajuda\" para ver tudo o que posso fazer, ou \"resumo geral\" para um panorama completo.`;
        break;
      }
    }

    await supabase.from("mensagens_ia").insert({
      modulo: "diretoria",
      pergunta: prompt,
      resposta,
    });

    return new Response(
      JSON.stringify({
        resposta,
        intent,
        dados_consultados: {
          clientes: clientes.length,
          interessados: interessados.length,
          planos: planos.length,
          assinaturas: assinaturas.length,
          servidores: servidores.length,
          aplicativos: aplicativos.length,
          pagamentos: pagamentos.length,
          tickets: tickets.length,
          campanhas: campanhas.length,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro interno ao processar a solicitação.",
        detalhe: err.message || "Erro desconhecido",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
