// URLs dos webhooks do n8n
export const N8N_WEBHOOKS = {
  sharepoint:
    "https://gateway.jeamarketing.com.br/webhook/create-folder-sharepoint",
  clickup: "https://gateway.jeamarketing.com.br/webhook/create-folder-clickup",
  calendario: "https://gateway.jeamarketing.com.br/webhook/create-calendar-tasks",
} as const;

// Configurações da API do n8n para buscar estatísticas
export const N8N_CONFIG = {
  baseUrl:
    process.env.NEXT_PUBLIC_N8N_BASE_URL ||
    "https://workflow.jeamarketing.com.br",
  // API Key do n8n (deve ser configurada como variável de ambiente)
  apiKey: process.env.N8N_API_KEY || "",
  // Mapeamento de automações para workflow IDs do n8n
  workflowIds: {
    sharepoint: process.env.N8N_WORKFLOW_ID_SHAREPOINT || "8RLhEbhZzjBf6S1Y",
    clickup: process.env.N8N_WORKFLOW_ID_CLICKUP || "",
    calendario: process.env.N8N_WORKFLOW_ID_CALENDARIO || "",
  },
} as const;
