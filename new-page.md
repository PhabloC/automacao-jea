<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Malbs Clients</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary-blue': '#2563eb',
                    }
                }
            }
        }
    </script>
    <style>
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #2563eb;
        }
        
        input:checked + .slider:before {
            transform: translateX(20px);
        }
        
        input:disabled + .slider {
            background-color: #e5e7eb;
            cursor: not-allowed;
        }
        
        .dropdown {
            display: none;
        }
        
        .dropdown.show {
            display: block;
        }

        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            min-width: 300px;
            padding: 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease-in-out;
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast.success {
            background-color: #10b981;
        }

        .toast.error {
            background-color: #ef4444;
        }

        .toast .progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 0 0 8px 8px;
            animation: progress 3s linear;
        }

        @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
        }

        .modal {
            display: none;
        }

        .modal.show {
            display: flex;
        }

        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 8px;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .checkbox-item:hover {
            border-color: #2563eb;
        }

        .checkbox-item.selected {
            border-color: #2563eb;
            background-color: #dbeafe;
        }
    </style>

</head>
<body class="bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
    <img src="https://lh3.googleusercontent.com/d/1gDxf9LBiRNpSXbLG9IcPIp4H5lei1bNC?authuser=0" alt="Logo" class="h-8 object-contain">
</div>
            </div>
        </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-6">
        <!-- Search and Add Button -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div class="relative flex-1 max-w-md">
                <input
                    type="text"
                    id="search-input"
                    placeholder="Pesquise cliente pelo nome"
                    class="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
            </div>
            <button onclick="openModal('add')" class="bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Adicionar cliente
            </button>
        </div>

        <!-- Clients Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relatórios Meta</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Meta</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relatórios Google</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequência</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>

                        </tr>
                    </thead>
                    <tbody id="clients-table" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto mb-4"></div>
                                Carregando clientes...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal for Add/Edit Client -->
    <div id="client-modal" class="modal fixed inset-0 bg-gray-600 bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div class="flex justify-between items-center mb-6">
                <h2 id="modal-title" class="text-xl font-semibold text-gray-800">Adicionar Cliente</h2>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <form id="client-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input type="text" id="nome" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                        <input type="email" id="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <input type="tel" id="telefone" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Conta Anúncio Meta</label>
                        <input type="text" id="conta_anuncio_meta" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Conta Anúncio Google</label>
                        <input type="text" id="conta_anuncio_google" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Frequência * (selecione os dias da semana)</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item" data-day="1">
                            <span class="text-sm font-medium">Seg</span>
                        </div>
                        <div class="checkbox-item" data-day="2">
                            <span class="text-sm font-medium">Ter</span>
                        </div>
                        <div class="checkbox-item" data-day="3">
                            <span class="text-sm font-medium">Qua</span>
                        </div>
                        <div class="checkbox-item" data-day="4">
                            <span class="text-sm font-medium">Qui</span>
                        </div>
                        <div class="checkbox-item" data-day="5">
                            <span class="text-sm font-medium">Sex</span>
                        </div>
                        <div class="checkbox-item" data-day="6">
                            <span class="text-sm font-medium">Sáb</span>
                        </div>
                        <div class="checkbox-item" data-day="0">
                            <span class="text-sm font-medium">Dom</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Período do Relatório *</label>
                    <select id="quantidade_dias_relatorio" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-blue focus:border-primary-blue">
                        <option value="">Selecione...</option>
                        <option value="1">1 dia</option>
                        <option value="7">7 dias</option>
                        <option value="15">15 dias</option>
                        <option value="30">30 dias</option>
                    </select>
                </div>

                <div class="border-t pt-4">
                    <h3 class="text-lg font-medium text-gray-800 mb-4">Configurações de Relatórios</h3>

                    <div class="space-y-4">
                        <div>
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Relatórios Meta</h4>
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">Campanhas Meta</span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="campanha_meta" disabled>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">Saldo Meta</span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="saldo_meta" disabled>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Relatórios Google</h4>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">Campanhas Google</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="campanha_google" disabled>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-700">
                        <span id="submit-text">Salvar Cliente</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirm-modal" class="modal fixed inset-0 bg-gray-600 bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Confirmar Exclusão</h3>
                <p class="text-sm text-gray-600 mb-6">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
                <div class="flex justify-center space-x-3">
                    <button onclick="closeConfirmModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onclick="confirmDelete()" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Dropdown Menu -->
    <div id="dropdown-menu" class="fixed bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 dropdown">
        <button onclick="editClient()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Editar
        </button>
        <button onclick="configureClient()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Configuração
        </button>
        <button onclick="deleteClient()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Excluir
        </button>
    </div>

    <!-- Configuration Modal -->
    <div id="config-modal" class="modal fixed inset-0 bg-gray-600 bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-semibold text-gray-800">Configuração de Mensagens</h2>
                <button onclick="closeConfigModal()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Platform Selector -->
            <div class="mb-6">
                <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button id="meta-tab" onclick="switchPlatform('meta')" class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 bg-white text-primary-blue shadow-sm">
                        Meta (Facebook/Instagram)
                    </button>
                    <button id="google-tab" onclick="switchPlatform('google')" class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 text-gray-600 hover:text-gray-800">
                        Google Ads
                    </button>
                </div>
            </div>

            <!-- Meta Configuration -->
            <div id="meta-config" class="platform-config">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Tags Panel -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-medium text-gray-800 mb-4">Tags Disponíveis - Meta</h3>
                        <div class="space-y-2 max-h-80 overflow-y-auto">
                            <div class="grid grid-cols-1 gap-2">
                                <button onclick="insertTag('meta', '{total_investido}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{total_investido}</span>
                                    <span class="text-xs text-gray-500 block">Total investido</span>
                                </button>
                                <button onclick="insertTag('meta', '{impressoes}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{impressoes}</span>
                                    <span class="text-xs text-gray-500 block">Impressões</span>
                                </button>
                                <button onclick="insertTag('meta', '{alcance}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{alcance}</span>
                                    <span class="text-xs text-gray-500 block">Alcance</span>
                                </button>
                                <button onclick="insertTag('meta', '{ctr}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{ctr}</span>
                                    <span class="text-xs text-gray-500 block">CTR</span>
                                </button>
                                <button onclick="insertTag('meta', '{cpm}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{cpm}</span>
                                    <span class="text-xs text-gray-500 block">CPM</span>
                                </button>
                                <button onclick="insertTag('meta', '{clique_link}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{clique_link}</span>
                                    <span class="text-xs text-gray-500 block">Cliques no link</span>
                                </button>
                                <button onclick="insertTag('meta', '{cpc}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{cpc}</span>
                                    <span class="text-xs text-gray-500 block">CPC</span>
                                </button>
                                <button onclick="insertTag('meta', '{conversa_whatsapp}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{conversa_whatsapp}</span>
                                    <span class="text-xs text-gray-500 block">Conversas no WhatsApp</span>
                                </button>
                                <button onclick="insertTag('meta', '{custo_conversa}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{custo_conversa}</span>
                                    <span class="text-xs text-gray-500 block">Custo por Conversa no WhatsApp</span>
                                </button>
                                <button onclick="insertTag('meta', '{leads}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{leads}</span>
                                    <span class="text-xs text-gray-500 block">Leads</span>
                                </button>
                                <button onclick="insertTag('meta', '{custo_leads}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{custo_leads}</span>
                                    <span class="text-xs text-gray-500 block">Custo por Leads</span>
                                </button>
                                <button onclick="insertTag('meta', '{conversoes}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{conversoes}</span>
                                    <span class="text-xs text-gray-500 block">Conversões</span>
                                </button>
                                <button onclick="insertTag('meta', '{cpa}')" class="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span class="text-sm font-mono text-blue-600">{cpa}</span>
                                    <span class="text-xs text-gray-500 block">CPA</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Message Editor -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-medium text-gray-800">Mensagem para Meta</h3>
    <button
        onclick="copyTemplate('meta')"
        class="flex items-center px-3 py-1.5 text-sm text-primary-blue border border-primary-blue rounded-md hover:bg-blue-50 transition-colors"
    >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        Copiar Template
    </button>

</div>
                        <textarea 
                            id="meta-message"
                            rows="15"
                            placeholder="Digite sua mensagem aqui... Use as tags da esquerda para personalizar."
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
                        ></textarea>
                        <p class="text-xs text-gray-500 mt-2">Clique nas tags à esquerda para inseri-las na mensagem</p>
                    </div>
                </div>
            </div>

            <!-- Google Configuration -->
            <div id="google-config" class="platform-config hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Tags Panel -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-medium text-gray-800 mb-4">Tags Disponíveis - Google</h3>
                        <div class="space-y-2 max-h-80 overflow-y-auto">
                            <div class="grid grid-cols-1 gap-2">
                                <button onclick="insertTag('google', '{total_investido}')" class="text-left p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors">
                                    <span class="text-sm font-mono text-green-600">{total_investido}</span>
                                    <span class="text-xs text-gray-500 block">Total investido</span>
                                </button>
                                <button onclick="insertTag('google', '{impressoes}')" class="text-left p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors">
                                    <span class="text-sm font-mono text-green-600">{impressoes}</span>
                                    <span class="text-xs text-gray-500 block">Impressões</span>
                                </button>
                                <button onclick="insertTag('google', '{cliques}')" class="text-left p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors">
                                    <span class="text-sm font-mono text-green-600">{cliques}</span>
                                    <span class="text-xs text-gray-500 block">Cliques</span>
                                </button>
                                <button onclick="insertTag('google', '{ctr}')" class="text-left p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors">
                                    <span class="text-sm font-mono text-green-600">{ctr}</span>
                                    <span class="text-xs text-gray-500 block">CTR</span>
                                </button>
                                <button onclick="insertTag('google', '{cpc}')" class="text-left p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors">
                                    <span class="text-sm font-mono text-green-600">{cpc}</span>
                                    <span class="text-xs text-gray-500 block">CPC</span>
                                </button>
                                <button onclick="insertTag('google', '{conversoes}')" class="text-left p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors">
                                    <span class="text-sm font-mono text-green-600">{conversoes}</span>
                                    <span class="text-xs text-gray-500 block">Conversões</span>
                                </button>
                                <button onclick="insertTag('google', '{cpa}')" class="text-left p-2 bg-white rounded border hover:bg-green-50 hover:border-green-300 transition-colors">
                                    <span class="text-sm font-mono text-green-600">{cpa}</span>
                                    <span class="text-xs text-gray-500 block">CPA</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Message Editor -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-medium text-gray-800">Mensagem para Google</h3>
    <button
        onclick="copyTemplate('google')"
        class="flex items-center px-3 py-1.5 text-sm text-primary-blue border border-primary-blue rounded-md hover:bg-blue-50 transition-colors"
    >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        Copiar Template
    </button>

</div>
                        <textarea 
                            id="google-message"
                            rows="15"
                            placeholder="Digite sua mensagem aqui... Use as tags da esquerda para personalizar."
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
                        ></textarea>
                        <p class="text-xs text-gray-500 mt-2">Clique nas tags à esquerda para inseri-las na mensagem</p>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end mt-6 pt-4 border-t">
                <button onclick="saveMessages()" class="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Salvar Mensagens
                </button>
            </div>
        </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <div id="unsaved-modal" class="modal fixed inset-0 bg-gray-600 bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                    <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Alterações não salvas</h3>
                <p class="text-sm text-gray-600 mb-6">Você tem alterações não salvas. Deseja sair sem salvar?</p>
                <div class="flex justify-center space-x-3">
                    <button onclick="closeUnsavedModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onclick="discardChanges()" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Sair sem Salvar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // =================== CONFIGURAÇÕES DO SUPABASE ===================
        // SUBSTITUA ESSAS CREDENCIAIS PELAS SUAS DO SUPABASE
        const SUPABASE_URL = 'https://gekjbxqhjaawqvlbgjff.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdla2pieHFoamFhd3F2bGJnamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI1MTIsImV4cCI6MjA3OTgwODUxMn0.9Gb8n524ar3vVAWH9Fv5DzoEqvMzWDtxzg9Xbl6gMD4';

        // Verificar se o Supabase foi carregado corretamente
        let supabase = null;
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        // ================================================================

        // Declarar todas as variáveis globais primeiro
        let clients = [];
        let currentClient = null;
        let currentDropdownClient = null;
        let currentConfigClient = null;
        let selectedDays = [];
        let originalMessages = { meta: '', google: '' };
        let hasUnsavedChanges = false;

      // Template messages

const templates = {
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
💸 _CPA:_ {cpa}`
};

        // Toast notifications
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        ${type === 'success'
                            ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
                            : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
                        }
                    </svg>
                    <span>${message}</span>
                </div>
                <div class="progress-bar"></div>
            `;

            document.body.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 100);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }

        // Load clients from Supabase
        async function loadClients() {
            try {
                if (!supabase) {
                    console.warn('Supabase não configurado. Usando dados de exemplo.');
                    // Dados de exemplo quando o Supabase não está configurado
                    clients = [
                        {
                            id: 1,
                            nome: "Adriana Reis",
                            email: "adriana@gmail.com",
                            telefone: "(35) 9 9733-3909",
                            conta_anuncio_meta: "123456789",
                            conta_anuncio_google: "987654321",
                            dias_envio: [1, 5],
                            quantidade_dias_relatorio: 7,
                            campanha_meta: true,
                            saldo_meta: true,
                            campanha_google: false
                        },
                        {
                            id: 2,
                            nome: "Carlos Silva",
                            email: "carlos.silva@email.com",
                            telefone: "(11) 9 8765-4321",
                            conta_anuncio_meta: "111222333",
                            conta_anuncio_google: null,
                            dias_envio: [1, 3, 5],
                            quantidade_dias_relatorio: 30,
                            campanha_meta: true,
                            saldo_meta: false,
                            campanha_google: false
                        }
                    ];
                    renderClients();
                    return;
                }

                const { data, error } = await supabase
                    .from('clientes')
                    .select('*')
                    .order('nome');

                if (error) throw error;

                clients = data || [];
                renderClients();
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                showToast('Erro ao carregar clientes', 'error');

                // Mostrar dados de exemplo em caso de erro
                clients = [];
                renderClients();
            }
        }

        // Render clients table
        function renderClients(clientsToRender = clients) {
            const tbody = document.getElementById('clients-table');

                            if (clientsToRender.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                            Nenhum cliente encontrado
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = '';

            clientsToRender.forEach((client) => {
                const diasEnvio = Array.isArray(client.dias_envio) ? client.dias_envio : [];
                const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                const diasTexto = diasEnvio.map(dia => diasSemana[dia]).join(', ');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${client.nome}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.telefone}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <label class="toggle-switch">
                            <input type="checkbox" ${client.campanha_meta ? 'checked' : ''}
                                   ${!client.conta_anuncio_meta ? 'disabled' : ''}
                                   onchange="toggleField(${client.id}, 'campanha_meta', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <label class="toggle-switch">
                            <input type="checkbox" ${client.saldo_meta ? 'checked' : ''}
                                   ${!client.conta_anuncio_meta ? 'disabled' : ''}
                                   onchange="toggleField(${client.id}, 'saldo_meta', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <label class="toggle-switch">
                            <input type="checkbox" ${client.campanha_google ? 'checked' : ''}
                                   ${!client.conta_anuncio_google ? 'disabled' : ''}
                                   onchange="toggleField(${client.id}, 'campanha_google', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${diasTexto}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.quantidade_dias_relatorio} dia${client.quantidade_dias_relatorio > 1 ? 's' : ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-gray-400 hover:text-gray-600" onclick="showDropdown(event, ${client.id})">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                            </svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        // Toggle boolean fields
        async function toggleField(clientId, field, value) {
            try {
                if (!supabase) {
                    // Simular operação quando Supabase não está configurado
                    const clientIndex = clients.findIndex(c => c.id === clientId);
                    if (clientIndex !== -1) {
                        clients[clientIndex][field] = value;
                    }
                    showToast(`${field.replace('_', ' ')} ${value ? 'ativado' : 'desativado'} com sucesso`);
                    return;
                }

                const { error } = await supabase
                    .from('clientes')
                    .update({ [field]: value })
                    .eq('id', clientId);

                if (error) throw error;

                // Update local data
                const clientIndex = clients.findIndex(c => c.id === clientId);
                if (clientIndex !== -1) {
                    clients[clientIndex][field] = value;
                }

                showToast(`${field.replace('_', ' ')} ${value ? 'ativado' : 'desativado'} com sucesso`);
            } catch (error) {
                console.error('Erro ao atualizar campo:', error);
                showToast('Erro ao atualizar configuração', 'error');
                // Revert checkbox state
                event.target.checked = !value;
            }
        }

        // Modal functions
        function openModal(mode, client = null) {
            currentClient = client;
            const modal = document.getElementById('client-modal');
            const title = document.getElementById('modal-title');
            const submitText = document.getElementById('submit-text');

            if (mode === 'add') {
                title.textContent = 'Adicionar Cliente';
                submitText.textContent = 'Salvar Cliente';
                resetForm();
            } else {
                title.textContent = 'Editar Cliente';
                submitText.textContent = 'Atualizar Cliente';
                fillForm(client);
            }

            modal.classList.add('show');
        }

        function closeModal() {
            document.getElementById('client-modal').classList.remove('show');
            resetForm();
        }

        function resetForm() {
            document.getElementById('client-form').reset();
            selectedDays = [];
            updateDaysDisplay();
            updateToggleStates();
        }

        function fillForm(client) {
            document.getElementById('nome').value = client.nome;
            document.getElementById('email').value = client.email;
            document.getElementById('telefone').value = client.telefone;
            document.getElementById('conta_anuncio_meta').value = client.conta_anuncio_meta || '';
            document.getElementById('conta_anuncio_google').value = client.conta_anuncio_google || '';
            document.getElementById('quantidade_dias_relatorio').value = client.quantidade_dias_relatorio;

            selectedDays = Array.isArray(client.dias_envio) ? [...client.dias_envio] : [];
            updateDaysDisplay();

            document.getElementById('campanha_meta').checked = client.campanha_meta;
            document.getElementById('saldo_meta').checked = client.saldo_meta;
            document.getElementById('campanha_google').checked = client.campanha_google;

            updateToggleStates();
        }

        // Days selection functions
        function updateDaysDisplay() {
            const dayItems = document.querySelectorAll('.checkbox-item');
            dayItems.forEach(item => {
                const day = parseInt(item.dataset.day);
                if (selectedDays.includes(day)) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        }

        function updateToggleStates() {
            const metaAccount = document.getElementById('conta_anuncio_meta').value;
            const googleAccount = document.getElementById('conta_anuncio_google').value;

            const campanhaMeta = document.getElementById('campanha_meta');
            const saldoMeta = document.getElementById('saldo_meta');
            const campanhaGoogle = document.getElementById('campanha_google');

            campanhaMeta.disabled = !metaAccount;
            saldoMeta.disabled = !metaAccount;
            campanhaGoogle.disabled = !googleAccount;

            if (!metaAccount) {
                campanhaMeta.checked = false;
                saldoMeta.checked = false;
            }

            if (!googleAccount) {
                campanhaGoogle.checked = false;
            }
        }

        // Form submission
        async function handleFormSubmit(event) {
            event.preventDefault();

            if (selectedDays.length === 0) {
                showToast('Selecione pelo menos um dia de envio', 'error');
                return;
            }

            const formData = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                conta_anuncio_meta: document.getElementById('conta_anuncio_meta').value || null,
                conta_anuncio_google: document.getElementById('conta_anuncio_google').value || null,
                dias_envio: selectedDays,
                quantidade_dias_relatorio: parseInt(document.getElementById('quantidade_dias_relatorio').value),
                campanha_meta: document.getElementById('campanha_meta').checked,
                saldo_meta: document.getElementById('saldo_meta').checked,
                campanha_google: document.getElementById('campanha_google').checked
            };

            try {
                if (!supabase) {
                    // Simular operação quando Supabase não está configurado
                    if (currentClient) {
                        const clientIndex = clients.findIndex(c => c.id === currentClient.id);
                        if (clientIndex !== -1) {
                            clients[clientIndex] = { ...clients[clientIndex], ...formData };
                        }
                        showToast('Cliente atualizado com sucesso');
                    } else {
                        const newClient = {
                            id: Math.max(...clients.map(c => c.id), 0) + 1,
                            ...formData
                        };
                        clients.push(newClient);
                        showToast('Cliente criado com sucesso');
                    }

                    closeModal();
                    renderClients();
                    return;
                }

                if (currentClient) {
                    // Update existing client
                    const { error } = await supabase
                        .from('clientes')
                        .update(formData)
                        .eq('id', currentClient.id);

                    if (error) throw error;

                    showToast('Cliente atualizado com sucesso');
                } else {
                    // Create new client
                    const { error } = await supabase
                        .from('clientes')
                        .insert([formData]);

                    if (error) throw error;

                    showToast('Cliente criado com sucesso');
                }

                closeModal();
                loadClients();
            } catch (error) {
                console.error('Erro ao salvar cliente:', error);
                showToast('Erro ao salvar cliente', 'error');
            }
        }

        // Dropdown functions
        function showDropdown(event, clientId) {
            const dropdown = document.getElementById('dropdown-menu');
            const rect = event.target.getBoundingClientRect();

            dropdown.style.left = (rect.left - 100) + 'px';
            dropdown.style.top = (rect.bottom + 5) + 'px';
            dropdown.classList.add('show');

            currentDropdownClient = clientId;

            setTimeout(() => {
                document.addEventListener('click', closeDropdown);
            }, 100);
        }

        function closeDropdown() {
            const dropdown = document.getElementById('dropdown-menu');
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }

        function editClient() {
            const client = clients.find(c => c.id === currentDropdownClient);
            if (client) {
                openModal('edit', client);
            }
            closeDropdown();
        }

        function deleteClient() {
            closeDropdown();
            document.getElementById('confirm-modal').classList.add('show');
        }

        function configureClient() {
            const client = clients.find(c => c.id === currentDropdownClient);
            if (client) {
                openConfigModal(client);
            }
            closeDropdown();
        }

        // Configuration Modal Functions
        function openConfigModal(client) {
            currentConfigClient = client;
            const modal = document.getElementById('config-modal');

            // Load existing messages
            document.getElementById('meta-message').value = client.mensagem_meta || '';
            document.getElementById('google-message').value = client.mensagem_google || '';

            // Store original messages for comparison
            originalMessages.meta = client.mensagem_meta || '';
            originalMessages.google = client.mensagem_google || '';

            // Reset unsaved changes flag
            hasUnsavedChanges = false;

            // Switch to meta tab by default
            switchPlatform('meta');

            modal.classList.add('show');

            // Add change listeners
            addMessageChangeListeners();
        }

        function closeConfigModal() {
            if (hasUnsavedChanges) {
                document.getElementById('unsaved-modal').classList.add('show');
                return;
            }

            document.getElementById('config-modal').classList.remove('show');
            currentConfigClient = null;
            hasUnsavedChanges = false;
        }

        function switchPlatform(platform) {
            // Update tabs
            const metaTab = document.getElementById('meta-tab');
            const googleTab = document.getElementById('google-tab');
            const metaConfig = document.getElementById('meta-config');
            const googleConfig = document.getElementById('google-config');

            if (platform === 'meta') {
                metaTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 bg-white text-primary-blue shadow-sm';
                googleTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 text-gray-600 hover:text-gray-800';
                metaConfig.classList.remove('hidden');
                googleConfig.classList.add('hidden');
            } else {
                googleTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 bg-white text-primary-blue shadow-sm';
                metaTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 text-gray-600 hover:text-gray-800';
                googleConfig.classList.remove('hidden');
                metaConfig.classList.add('hidden');
            }
        }

        function insertTag(platform, tag) {
            const textareaId = platform === 'meta' ? 'meta-message' : 'google-message';
            const textarea = document.getElementById(textareaId);

            // Get cursor position
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentValue = textarea.value;

            // Insert tag at cursor position
            const newValue = currentValue.substring(0, start) + tag + currentValue.substring(end);
            textarea.value = newValue;

            // Move cursor after inserted tag
            const newCursorPosition = start + tag.length;
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
            textarea.focus();

            // Mark as changed
            checkForChanges();
        }

        function addMessageChangeListeners() {
            const metaTextarea = document.getElementById('meta-message');
            const googleTextarea = document.getElementById('google-message');

            metaTextarea.addEventListener('input', checkForChanges);
            googleTextarea.addEventListener('input', checkForChanges);
        }

        function checkForChanges() {
            const currentMetaMessage = document.getElementById('meta-message').value;
            const currentGoogleMessage = document.getElementById('google-message').value;

            hasUnsavedChanges = (
                currentMetaMessage !== originalMessages.meta ||
                currentGoogleMessage !== originalMessages.google
            );
        }

        async function saveMessages() {
            if (!currentConfigClient) return;

            const metaMessage = document.getElementById('meta-message').value;
            const googleMessage = document.getElementById('google-message').value;

            try {
                if (!supabase) {
                    // Simular operação quando Supabase não está configurado
                    const clientIndex = clients.findIndex(c => c.id === currentConfigClient.id);
                    if (clientIndex !== -1) {
                        clients[clientIndex].mensagem_meta = metaMessage;
                        clients[clientIndex].mensagem_google = googleMessage;
                    }
                    showToast('Mensagens salvas com sucesso');
                    closeConfigModal();
                    return;
                }

                const { error } = await supabase
                    .from('clientes')
                    .update({
                        mensagem_meta: metaMessage,
                        mensagem_google: googleMessage
                    })
                    .eq('id', currentConfigClient.id);

                if (error) throw error;

                // Update local data
                const clientIndex = clients.findIndex(c => c.id === currentConfigClient.id);
                if (clientIndex !== -1) {
                    clients[clientIndex].mensagem_meta = metaMessage;
                    clients[clientIndex].mensagem_google = googleMessage;
                }

                // Update original messages
                originalMessages.meta = metaMessage;
                originalMessages.google = googleMessage;
                hasUnsavedChanges = false;

                showToast('Mensagens salvas com sucesso');
                closeConfigModal();
            } catch (error) {
                console.error('Erro ao salvar mensagens:', error);
                showToast('Erro ao salvar mensagens', 'error');
            }
        }


      // Template functions

function copyTemplate(platform) {
const textareaId = platform === 'meta' ? 'meta-message' : 'google-message';
const textarea = document.getElementById(textareaId);
const template = templates[platform];

    // Insert template directly
    textarea.value = template;

    // Mark as changed and focus textarea
    checkForChanges();
    textarea.focus();

    // Show success toast
    showToast('Template copiado com sucesso');

}

        // Unsaved changes modal functions
        function closeUnsavedModal() {
            document.getElementById('unsaved-modal').classList.remove('show');
        }

        function discardChanges() {
            hasUnsavedChanges = false;
            document.getElementById('unsaved-modal').classList.remove('show');
            document.getElementById('config-modal').classList.remove('show');
            currentConfigClient = null;
        }

        function closeConfirmModal() {
            document.getElementById('confirm-modal').classList.remove('show');
        }

        async function confirmDelete() {
            try {
                if (!supabase) {
                    // Simular operação quando Supabase não está configurado
                    clients = clients.filter(c => c.id !== currentDropdownClient);
                    showToast('Cliente excluído com sucesso');
                    closeConfirmModal();
                    renderClients();
                    return;
                }

                const { error } = await supabase
                    .from('clientes')
                    .delete()
                    .eq('id', currentDropdownClient);

                if (error) throw error;

                showToast('Cliente excluído com sucesso');
                closeConfirmModal();
                loadClients();
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                showToast('Erro ao excluir cliente', 'error');
            }
        }

        // Search functionality
        document.getElementById('search-input').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredClients = clients.filter(client =>
                client.nome.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm)
            );
            renderClients(filteredClients);
        });

        // Event listeners
        document.getElementById('client-form').addEventListener('submit', handleFormSubmit);

        // Days selection event listeners
        document.querySelectorAll('.checkbox-item').forEach(item => {
            item.addEventListener('click', function() {
                const day = parseInt(this.dataset.day);
                const index = selectedDays.indexOf(day);

                if (index > -1) {
                    selectedDays.splice(index, 1);
                } else {
                    selectedDays.push(day);
                }

                updateDaysDisplay();
            });
        });

        // Account inputs change listeners
        document.getElementById('conta_anuncio_meta').addEventListener('input', updateToggleStates);
        document.getElementById('conta_anuncio_google').addEventListener('input', updateToggleStates);

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            loadClients();
            updateToggleStates();
        });

        // Close modals when clicking outside
        document.addEventListener('click', function(e) {
            const clientModal = document.getElementById('client-modal');
            const confirmModal = document.getElementById('confirm-modal');
            const configModal = document.getElementById('config-modal');
            const unsavedModal = document.getElementById('unsaved-modal');

            if (e.target === clientModal) {
                closeModal();
            }

            if (e.target === confirmModal) {
                closeConfirmModal();
            }

            if (e.target === configModal) {
                closeConfigModal();
            }

            if (e.target === unsavedModal) {
                closeUnsavedModal();
            }
        });
    </script>

</body>
</html>
