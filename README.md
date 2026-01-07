# Painel de Automações J&A

Painel web para gerenciamento e execução de automações integradas com n8n. Permite executar e monitorar automações para SharePoint e ClickUp através de uma interface moderna e intuitiva.

## 🚀 Funcionalidades

- **Gerenciamento de Automações**: Visualize e gerencie múltiplas automações em um único painel
- **Execução de Automações**: Execute automações para SharePoint e ClickUp com formulários específicos
- **Estatísticas em Tempo Real**: Acompanhe execuções, taxas de sucesso e erros
- **Interface Moderna**: Design responsivo com suporte a modo escuro
- **Integração com n8n**: Conecta-se aos webhooks do n8n para execução de workflows

## 🛠️ Tecnologias

- **Next.js 16.1.1** - Framework React para produção
- **React 19.2.3** - Biblioteca para construção de interfaces
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **n8n** - Plataforma de automação de workflows

## 📋 Pré-requisitos

- Node.js 18+
- npm, yarn, pnpm ou bun

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd automacao-jea
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

## 🚀 Executando o Projeto

Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para ver o resultado.

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter ESLint

## 🏗️ Estrutura do Projeto

```
automacao-jea/
├── app/                    # Rotas e páginas do Next.js
│   ├── api/               # API routes
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── automation-card/   # Card de automação
│   ├── automation-page/   # Página de detalhes da automação
│   ├── clickup-form/      # Formulário do ClickUp
│   ├── sharepoint-form/   # Formulário do SharePoint
│   ├── header/            # Cabeçalho da aplicação
│   └── tabs/              # Componente de abas
├── lib/                   # Utilitários e configurações
│   ├── config.ts          # Configurações (webhooks n8n)
│   ├── constants.ts       # Constantes
│   └── mockData.ts        # Dados mockados
├── svg/                   # Componentes de ícones SVG
└── public/                # Arquivos estáticos
```

## 🔌 Integração com n8n

O projeto se integra com n8n através de webhooks e API para buscar estatísticas de execuções.

### Configuração

1. **Crie um arquivo `.env.local` na raiz do projeto** com as seguintes variáveis:

```env
# URL base do servidor n8n
NEXT_PUBLIC_N8N_BASE_URL=https://workflow.jeamarketing.com.br

# API Key do n8n (obtenha no painel do n8n em Settings > API)
N8N_API_KEY=sua_api_key_aqui

# IDs dos workflows no n8n (encontre na URL ou configurações do workflow)
# Exemplo: https://workflow.jeamarketing.com.br/workflow/8RLhEbhZzjBf6S1Y
N8N_WORKFLOW_ID_SHAREPOINT=8RLhEbhZzjBf6S1Y
N8N_WORKFLOW_ID_CLICKUP=workflow_id_clickup
```

2. **Webhooks**: As URLs dos webhooks são configuradas em `lib/config.ts`:

```typescript
export const N8N_WEBHOOKS = {
  sharepoint:
    "https://gateway.jeamarketing.com.br/webhook/create-folder-sharepoint",
  clickup: "", // Configure quando o webhook estiver pronto
} as const;
```

### Como encontrar o Workflow ID no n8n

1. Acesse o workflow no painel do n8n
2. O ID pode ser encontrado:
   - Na URL do workflow: `https://n8n.example.com/workflow/{WORKFLOW_ID}`
   - Nas configurações do workflow
   - Na API do n8n listando workflows

### Estatísticas em Tempo Real

O sistema busca automaticamente do n8n:

- **Total de execuções**: Número total de vezes que o workflow foi executado
- **Execuções bem-sucedidas**: Execuções que finalizaram sem erros
- **Execuções com erro**: Execuções que falharam
- **Última execução**: Data e hora da última execução
- **Status**: Estado atual da automação (ativa, inativa ou erro)

As estatísticas são atualizadas:

- Ao carregar a página
- Após cada execução de automação

## 📱 Automações Disponíveis

### SharePoint

- Criação automática de pastas com estrutura organizada
- Configuração de permissões de acesso
- Suporte a seleção de cliente e mês

### ClickUp

- Criação automática de tarefas
- Organização de projetos
- Atribuição de responsáveis

## 🎨 Interface

A interface oferece:

- **Modo Escuro**: Suporte completo a tema claro/escuro
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Notificações**: Feedback visual para execuções bem-sucedidas ou com erro
- **Estatísticas**: Visualização de métricas de execução em tempo real

## 📝 Licença

Este projeto é privado.

## 👥 Desenvolvido por

JEA Marketing
