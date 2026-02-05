// Tipos para clientes (n8n pode retornar email e telefone)
export interface Client {
  id: string;
  name: string;
  email?: string;
  telefone?: string;
}

// Clientes padrão
const DEFAULT_CLIENTS: Client[] = [
  { id: "1", name: "Amorim" },
  { id: "2", name: "Bioconverter" },
  { id: "3", name: "Clínica Scoppo" },
  { id: "4", name: "Desintec" },
  { id: "5", name: "Impacta" },
  { id: "6", name: "J&A" },
  { id: "7", name: "Júpiter" },
];

// Chave do localStorage
const STORAGE_KEY = "calendario_clients";

// Função para obter clientes do localStorage ou valores padrão
export function getClients(): Client[] {
  if (typeof window === "undefined") {
    return DEFAULT_CLIENTS;
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Se houver erro ao parsear, retorna os valores padrão
      return DEFAULT_CLIENTS;
    }
  }

  // Se não houver nada no localStorage, inicializa com os valores padrão
  setClients(DEFAULT_CLIENTS);
  return DEFAULT_CLIENTS;
}

// Função para salvar clientes no localStorage
export function setClients(clients: Client[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

// Função para adicionar um cliente
export function addClient(name: string): Client {
  const clients = getClients();
  const maxId = clients.reduce((max, client) => {
    const idNum = parseInt(client.id, 10);
    return idNum > max ? idNum : max;
  }, 0);

  const newClient: Client = {
    id: String(maxId + 1),
    name: name.trim(),
  };

  const updatedClients = [...clients, newClient];
  setClients(updatedClients);
  return newClient;
}

// Função para remover um cliente
export function removeClient(clientId: string): void {
  const clients = getClients();
  const updatedClients = clients.filter((client) => client.id !== clientId);
  setClients(updatedClients);
}

// Função para verificar se um nome de cliente já existe
export function clientNameExists(name: string): boolean {
  const clients = getClients();
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
export async function loadClientsFromWebhook(): Promise<Client[]> {
  try {
    const webhookClients = await fetchClientsFromWebhook();

    if (webhookClients.length > 0) {
      // Atualiza os clientes no localStorage
      setClients(webhookClients);
      return webhookClients;
    }

    // Se não retornou clientes, retorna os que já estão salvos
    return getClients();
  } catch (error) {
    console.error("Erro ao carregar clientes do webhook:", error);
    // Em caso de erro, retorna os clientes salvos localmente
    return getClients();
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

// Função para editar um cliente no webhook n8n
export async function updateClientInWebhook(
  clientId: string,
  clientName: string
): Promise<Client | null> {
  try {
    const idNumber = parseInt(clientId, 10);
    if (isNaN(idNumber) || idNumber <= 0) {
      throw new Error(`ID inválido para edição: ${clientId}`);
    }

    const response = await fetch("/api/clients/editar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idNumber,
        clientes: clientName.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erro ao editar cliente: ${response.status}`
      );
    }

    const data = await response.json();
    if (data.client) {
      return data.client;
    }
    return {
      id: clientId,
      name: clientName.trim(),
    };
  } catch (error) {
    console.error("Erro ao editar cliente no webhook:", error);
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
