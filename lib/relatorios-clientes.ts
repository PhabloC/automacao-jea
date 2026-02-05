// Tipos para clientes de relatórios (automação Malbs / Relatórios)
export interface RelatorioCliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  conta_anuncio_meta: string | null;
  conta_anuncio_google: string | null;
  dias_envio: number[];
  quantidade_dias_relatorio: number;
  campanha_meta: boolean;
  saldo_meta: boolean;
  campanha_google: boolean;
  mensagem_meta: string | null;
  mensagem_google: string | null;
}

export type RelatorioClienteCreate = Omit<
  RelatorioCliente,
  "id" | "mensagem_meta" | "mensagem_google"
> & {
  mensagem_meta?: string | null;
  mensagem_google?: string | null;
};

export type RelatorioClienteUpdate = Partial<Omit<RelatorioCliente, "id">>;

const getHeaders = (accessToken?: string | null) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
};

export async function fetchRelatoriosClientes(
  accessToken?: string | null
): Promise<RelatorioCliente[]> {
  const response = await fetch("/api/relatorios-clientes", {
    method: "GET",
    headers: getHeaders(accessToken),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro ao listar clientes: ${response.status}`);
  }
  const data = await response.json();
  return data.clientes ?? [];
}

export async function createRelatorioCliente(
  payload: RelatorioClienteCreate,
  accessToken?: string | null
): Promise<RelatorioCliente> {
  const response = await fetch("/api/relatorios-clientes", {
    method: "POST",
    headers: getHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro ao criar cliente: ${response.status}`);
  }
  const data = await response.json();
  return data.cliente;
}

export async function updateRelatorioCliente(
  id: number,
  payload: RelatorioClienteUpdate,
  accessToken?: string | null
): Promise<RelatorioCliente> {
  const response = await fetch(`/api/relatorios-clientes/${id}`, {
    method: "PATCH",
    headers: getHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error || `Erro ao atualizar cliente: ${response.status}`
    );
  }
  const data = await response.json();
  return data.cliente;
}

export async function deleteRelatorioCliente(
  id: number,
  accessToken?: string | null
): Promise<void> {
  const response = await fetch(`/api/relatorios-clientes/${id}`, {
    method: "DELETE",
    headers: getHeaders(accessToken),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro ao excluir cliente: ${response.status}`);
  }
}

// Templates de mensagem para Meta e Google
export const MESSAGE_TEMPLATES = {
  meta: `💰 *Investimento Total:* {total_investido}
👥 *Alcance:* {alcance}
👁️ *Impressões:* {impressoes}
🖱️ *Cliques:* {clique_link}
🎯 *CPC médio:* {cpc}
📈 *CTR médio:* {ctr}
💸 *CPM médio:* {cpm}
📞 *Conversas no WhatsApp:* {conversa_whatsapp}
💬 *Custo por Conversa:* {custo_conversa}
📋 *Leads:* {leads}
💰 *Custo por Lead:* {custo_leads}
✅ *Conversões:* {conversoes}
🎯 *CPA:* {cpa}`,
  google: `💰 *Investimento Total:* {total_investido}

👁️ _Impressões:_ {impressoes}
🖱️ _Cliques:_ {cliques}
📈 _CTR médio:_ {ctr}
🎯 _CPC médio:_ {cpc}
✅ _Conversões:_ {conversoes}
💸 _CPA:_ {cpa}`,
} as const;

// Tags disponíveis para inserção nas mensagens
export const META_TAGS = [
  { tag: "{total_investido}", label: "Total investido" },
  { tag: "{impressoes}", label: "Impressões" },
  { tag: "{alcance}", label: "Alcance" },
  { tag: "{ctr}", label: "CTR" },
  { tag: "{cpm}", label: "CPM" },
  { tag: "{clique_link}", label: "Cliques no link" },
  { tag: "{cpc}", label: "CPC" },
  { tag: "{conversa_whatsapp}", label: "Conversas no WhatsApp" },
  { tag: "{custo_conversa}", label: "Custo por Conversa no WhatsApp" },
  { tag: "{leads}", label: "Leads" },
  { tag: "{custo_leads}", label: "Custo por Leads" },
  { tag: "{conversoes}", label: "Conversões" },
  { tag: "{cpa}", label: "CPA" },
] as const;

export const GOOGLE_TAGS = [
  { tag: "{total_investido}", label: "Total investido" },
  { tag: "{impressoes}", label: "Impressões" },
  { tag: "{cliques}", label: "Cliques" },
  { tag: "{ctr}", label: "CTR" },
  { tag: "{cpc}", label: "CPC" },
  { tag: "{conversoes}", label: "Conversões" },
  { tag: "{cpa}", label: "CPA" },
] as const;
