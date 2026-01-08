// Tipos para clientes
export interface Client {
  id: string;
  name: string;
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

// Chaves do localStorage
const STORAGE_KEYS = {
  sharepoint: "sharepoint_clients",
  clickup: "clickup_clients",
} as const;

// Função para obter clientes do localStorage ou valores padrão
export function getClients(type: "sharepoint" | "clickup"): Client[] {
  if (typeof window === "undefined") {
    return type === "sharepoint" ? DEFAULT_SHAREPOINT_CLIENTS : DEFAULT_CLICKUP_CLIENTS;
  }

  const storageKey = STORAGE_KEYS[type];
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Se houver erro ao parsear, retorna os valores padrão
      return type === "sharepoint" ? DEFAULT_SHAREPOINT_CLIENTS : DEFAULT_CLICKUP_CLIENTS;
    }
  }

  // Se não houver nada no localStorage, inicializa com os valores padrão
  const defaultClients = type === "sharepoint" ? DEFAULT_SHAREPOINT_CLIENTS : DEFAULT_CLICKUP_CLIENTS;
  setClients(type, defaultClients);
  return defaultClients;
}

// Função para salvar clientes no localStorage
export function setClients(type: "sharepoint" | "clickup", clients: Client[]): void {
  if (typeof window === "undefined") return;
  
  const storageKey = STORAGE_KEYS[type];
  localStorage.setItem(storageKey, JSON.stringify(clients));
}

// Função para adicionar um cliente
export function addClient(type: "sharepoint" | "clickup", name: string): Client {
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
export function removeClient(type: "sharepoint" | "clickup", clientId: string): void {
  const clients = getClients(type);
  const updatedClients = clients.filter((client) => client.id !== clientId);
  setClients(type, updatedClients);
}

// Função para verificar se um nome de cliente já existe
export function clientNameExists(type: "sharepoint" | "clickup", name: string): boolean {
  const clients = getClients(type);
  return clients.some(
    (client) => client.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
}

