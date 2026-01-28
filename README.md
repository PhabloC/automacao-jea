# Painel de Automações JEA

Painel web para execução de automações integradas ao **n8n**, com autenticação, controle de permissões e gestão de clientes. Permite que usuários autorizados executem a automação **Calendário** (criação de tarefas de posts por cliente e mês); administradores visualizam todas as tarefas criadas e gerenciam permissões.

## Objetivo

Centralizar a execução de automações da JEA Marketing em uma única interface: usuários com permissão executam automações (como Calendário), gerenciam clientes e têm acesso ao dashboard; administradores, além disso, visualizam o histórico de tarefas criadas por todos os usuários e controlam quem tem acesso ao sistema.

## Funcionalidades

- **Autenticação**: Login com Google (Supabase Auth).
- **Controle de acesso**: Apenas usuários com permissão acessam dashboard, calendário e clientes; admins têm acesso adicional a Tarefas e Permissões.
- **Dashboard**: Ponto de entrada com lista de automações disponíveis.
- **Automação Calendário**: Criação de tarefas de posts no calendário via n8n, por cliente e mês, com estatísticas de execução.
- **Clientes**: Listagem, criação e exclusão de clientes (integração com webhook n8n).
- **Tarefas**: Histórico de tarefas criadas pelas automações, armazenado no Supabase; visível apenas para admins.
- **Permissões**: Gerenciamento de usuários (conceder/remover acesso, roles admin/editor) — apenas admins.

## Tecnologias

- **Next.js** – Framework React
- **React** – Interface
- **TypeScript** – Tipagem estática
- **Tailwind CSS** – Estilos
- **Supabase** – Auth (Google) e banco (permissões, tarefas)
- **n8n** – Automações (webhooks, workflows)

## Fluxo de permissões

- **Sem permissão** (`user_roles`): usuário logado vê apenas o dashboard com mensagem “Acesso pendente”; não acessa Calendário, Clientes nem Tarefas.
- **Com permissão** (editor ou admin): acessa Dashboard, Calendário e Clientes.
- **Admin**: além disso, acessa Tarefas e Permissões.

## Licença

Projeto privado.

## Desenvolvido por

Phablo Carvalho
