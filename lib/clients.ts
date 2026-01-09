// Tipos para clientes
export interface Client {
  id: string;
  name: string;
}

// Tipo para resposta do webhook n8n
interface WebhookClientResponse {
  id: string;
  clientes: string;
}

// Clientes padrão para SharePoint
const DEFAULT_SHAREPOINT_CLIENTS: Client[] = [
  { id: "1", name: "Amorim" },
  { id: "2", name: "Bioconverter" },
  { id: "3", name: "Clínica Scoppo" },
  { id: "4", name: "Desintec" },
  { id: "5", name: "Impacta" },
  { id: "6", name: "J&A" },
  { id: "7", name: "Júpiter" },
];

// Clientes padrão para ClickUp
const DEFAULT_CLICKUP_CLIENTS: Client[] = [
  { id: "1", name: "Amorim Tennis" },
  { id: "2", name: "Bioconverter" },
  { id: "3", name: "Desintec" },
  { id: "4", name: "Impacta" },
  { id: "5", name: "Júpiter" },
  { id: "6", name: "Refrin" },
  { id: "7", name: "Clínica Scoppo" },
  { id: "8", name: "J&A" },
];

// URLs dos webhooks n8n
const N8N_WEBHOOK_URLS = {
  listar: "https://gateway.jeamarketing.com.br/webhook/listar-clientes",
  adicionar: "https://gateway.jeamarketing.com.br/webhook/adicionar-cliente",
  excluir: "https://gateway.jeamarketing.com.br/webhook/excluir-cliente",
} as const;

// Chaves do localStorage
const STORAGE_KEYS = {
  sharepoint: "sharepoint_clients",
  clickup: "clickup_clients",
} as const;

// Função para obter clientes do localStorage ou valores padrão
export function getClients(type: "sharepoint" | "clickup"): Client[] {
  if (typeof window === "undefined") {
    return type === "sharepoint"
      ? DEFAULT_SHAREPOINT_CLIENTS
      : DEFAULT_CLICKUP_CLIENTS;
  }

  const storageKey = STORAGE_KEYS[type];
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Se houver erro ao parsear, retorna os valores padrão
      return type === "sharepoint"
        ? DEFAULT_SHAREPOINT_CLIENTS
        : DEFAULT_CLICKUP_CLIENTS;
    }
  }

  // Se não houver nada no localStorage, inicializa com os valores padrão
  const defaultClients =
    type === "sharepoint"
      ? DEFAULT_SHAREPOINT_CLIENTS
      : DEFAULT_CLICKUP_CLIENTS;
  setClients(type, defaultClients);
  return defaultClients;
}

// Função para salvar clientes no localStorage
export function setClients(
  type: "sharepoint" | "clickup",
  clients: Client[]
): void {
  if (typeof window === "undefined") return;

  const storageKey = STORAGE_KEYS[type];
  localStorage.setItem(storageKey, JSON.stringify(clients));
}

// Função para adicionar um cliente
export function addClient(
  type: "sharepoint" | "clickup",
  name: string
): Client {
  const clients = getClients(type);
  const maxId = clients.reduce((max, client) => {
    const idNum = parseInt(client.id, 10);
    return idNum > max ? idNum : max;
  }, 0);

  const newClient: Client = {
    id: String(maxId + 1),
    name: name.trim(),
  };

  const updatedClients = [...clients, newClient];
  setClients(type, updatedClients);
  return newClient;
}

// Função para remover um cliente
export function removeClient(
  type: "sharepoint" | "clickup",
  clientId: string
): void {
  const clients = getClients(type);
  const updatedClients = clients.filter((client) => client.id !== clientId);
  setClients(type, updatedClients);
}

// Função para verificar se um nome de cliente já existe
export function clientNameExists(
  type: "sharepoint" | "clickup",
  name: string
): boolean {
  const clients = getClients(type);
  return clients.some(
    (client) => client.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
}

// Função para buscar clientes do webhook n8n
export async function fetchClientsFromWebhook(): Promise<Client[]> {
  try {
    // Usar rota de API do Next.js para evitar problemas de CORS
    const response = await fetch("/api/clients/listar", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar clientes: ${response.status}`);
    }

    const data = await response.json();

    // A API já processa os clientes, então retorna diretamente
    return data.clients || [];
  } catch (error) {
    console.error("Erro ao buscar clientes do webhook:", error);
    // Retorna array vazio em caso de erro, para não quebrar a aplicação
    return [];
  }
}

// Função para carregar e atualizar clientes do webhook
export async function loadClientsFromWebhook(
  type: "sharepoint" | "clickup"
): Promise<Client[]> {
  try {
    const webhookClients = await fetchClientsFromWebhook();

    if (webhookClients.length > 0) {
      // Atualiza os clientes no localStorage
      setClients(type, webhookClients);
      return webhookClients;
    }

    // Se não retornou clientes, retorna os que já estão salvos
    return getClients(type);
  } catch (error) {
    console.error(`Erro ao carregar clientes do webhook para ${type}:`, error);
    // Em caso de erro, retorna os clientes salvos localmente
    return getClients(type);
  }
}

// Função para criar um cliente no webhook n8n
// Retorna o cliente criado com o ID real do banco de dados
export async function createClientInWebhook(
  clientName: string
): Promise<Client | null> {
  try {
    // Usar rota de API do Next.js para evitar problemas de CORS
    const response = await fetch("/api/clients/adicionar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientes: clientName.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erro ao criar cliente: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Cliente adicionado - resposta completa:", data);

    // Retornar o cliente criado com ID real se disponível
    if (data.client) {
      console.log("Cliente criado com ID do banco:", data.client);
      return data.client;
    }

    // Se não retornou o cliente na resposta, retorna null
    // O sistema vai recarregar a lista depois
    return null;
  } catch (error) {
    console.error("Erro ao criar cliente no webhook:", error);
    throw error;
  }
}

// Função para deletar um cliente no webhook n8n
export async function deleteClientInWebhook(clientId: string): Promise<void> {
  try {
    // Validar que o ID é um número válido antes de enviar
    const idNumber = parseInt(clientId, 10);
    if (isNaN(idNumber) || idNumber <= 0) {
      throw new Error(`ID inválido para exclusão: ${clientId}`);
    }

    console.log(
      "Tentando excluir cliente com ID:",
      idNumber,
      "(string original:",
      clientId,
      ")"
    );

    // Usar rota de API do Next.js para evitar problemas de CORS
    const response = await fetch("/api/clients/excluir", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idNumber, // Enviar como número
      }),
    });

    if (!response.ok) {
      let errorMessage = `Erro ao deletar cliente: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage);
    }

    // Tentar parsear JSON, mas não falhar se a resposta estiver vazia
    let data = null;
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch {
      // Se não conseguir parsear, assume que foi sucesso (resposta vazia é OK)
      console.log("Resposta vazia ou não-JSON, assumindo sucesso");
    }
    console.log("Cliente excluído com sucesso:", data);
  } catch (error) {
    console.error("Erro ao deletar cliente no webhook:", error);
    throw error;
  }
}
