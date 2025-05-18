# Integração ServiceDesk Plus Cloud com Analytics Plus

## Visão Geral

Este projeto implementa uma integração entre o ServiceDesk Plus Cloud e o Analytics Plus da ManageEngine. A solução permite extrair dados do ServiceDesk Plus via API REST e processá-los para uso em análises avançadas.

## Funcionalidades Implementadas

1. **Autenticação OAuth 2.0 com o Zoho/ServiceDesk Plus**
2. **Extração de dados via API REST:**
   - Chamados (Tickets)
   - Técnicos (Technicians)
   - Departamentos (Departments)
   - Ativos (Assets)
3. **Armazenamento dos dados em formato JSON**
4. **Mecanismo de refresh token para autenticação contínua**
5. **Tratamento robusto de erros e permissões de acesso**

## Estrutura do Projeto

```
servicedesk-analytics-integration/
|
|-- package.json              # Dependências e scripts do projeto
|-- config.js                 # Configurações centralizadas das APIs
|-- serviceDeskApi.js         # Funções para interagir com a API do ServiceDesk Plus
|-- analyticsApi.js           # Funções para interagir com a API do Analytics Plus
|
|-- fetchServiceDeskData.js   # Script para coleta independente de dados
|-- pushToAnalytics.js        # Script para envio independente de dados
|-- index.js                  # Script principal com agendamento automático
|
|-- testeAuth.js              # Script para testar autenticação
|-- testeRefreshToken.js      # Script para testar refresh token
|-- testeTickets.js           # Script para testar busca de chamados
|-- testeNovaUrl.js           # Script para testar a URL específica
|-- testeTechnicians.js       # Script para testar busca de técnicos
|-- testeDepartments.js       # Script para testar busca de departamentos
|-- testeAssets.js            # Script para testar busca de ativos
|
|-- data/                     # Diretório para armazenamento dos dados
    |-- auth_token.json       # Token de autenticação salvo
    |-- tickets.json          # Dados de chamados extraídos
    |-- technicians.json      # Dados de técnicos extraídos
    |-- departments.json      # Dados de departamentos extraídos
    |-- assets.json           # Dados de ativos extraídos
    |-- *_full_response.json  # Respostas completas das APIs
    |-- sync_summary.json     # Resumo da última sincronização
```

## Passo a Passo da Implementação

### 1. Configuração Inicial

1. **Instalação das Dependências**
   ```
   npm install
   ```

   As principais dependências são:
   - axios: Para fazer requisições HTTP
   - dotenv: Para gerenciar variáveis de ambiente
   - node-cron: Para agendamento de tarefas

2. **Configuração das Credenciais**
   
   Todas as credenciais e endpoints estão configurados no arquivo `config.js`:
   - URL base do ServiceDesk Plus
   - Credenciais de autenticação Zoho OAuth
   - Endpoints das APIs

### 2. Processo de Autenticação OAuth 2.0

A autenticação com a API do ServiceDesk Plus Cloud é realizada em duas etapas:

1. **Autenticação Inicial (Authorization Code)**
   
   Primeiro, obtemos um token de acesso usando um código de autorização:
   ```javascript
   // Exemplo de requisição para obter o token inicial
   const params = new URLSearchParams();
   params.append('grant_type', 'authorization_code');
   params.append('client_id', zohoAuthConfig.clientId);
   params.append('client_secret', zohoAuthConfig.clientSecret);
   params.append('redirect_uri', zohoAuthConfig.redirectUri);
   params.append('code', zohoAuthConfig.code);
   
   const response = await client.post(zohoAuthConfig.baseUrl, params);
   ```

2. **Renovação de Token (Refresh Token)**
   
   Depois, usamos o refresh token para renovar o token de acesso sem precisar de uma nova autorização:
   ```javascript
   // Exemplo de requisição para renovar o token
   const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${zohoAuthConfig.clientId}&client_secret=${zohoAuthConfig.clientSecret}&grant_type=refresh_token`;
   
   const response = await client.post(url);
   ```

3. **Armazenamento de Token**
   
   Os tokens são salvos em um arquivo JSON (`data/auth_token.json`) para uso posterior:
   ```javascript
   // Salvar token em arquivo
   await fs.promises.writeFile(
     zohoAuthConfig.tokenFilePath,
     JSON.stringify(tokenData, null, 2)
   );
   ```

### 3. Extração de Dados da API

1. **Busca de Dados**
   
   Implementamos uma função utilitária `fetchDataFromAPI` que busca dados de qualquer endpoint:
   ```javascript
   async function fetchDataFromAPI(endpoint, fileName, dataKey) {
     // Obter token de acesso
     // Configurar cliente com o token
     // Fazer requisição GET
     // Processar e salvar resposta
   }
   ```

2. **Endpoints Disponíveis**
   
   Implementamos funções específicas para cada tipo de dado:
   ```javascript
   // Função para buscar chamados
   async function fetchTickets() {
     return fetchDataFromAPI('requests', 'tickets.json', 'requests');
   }
   
   // Função para buscar técnicos
   async function fetchTechnicians() {
     return fetchDataFromAPI('technicians', 'technicians.json', 'technicians');
   }
   
   // Função para buscar departamentos
   async function fetchDepartments() {
     return fetchDataFromAPI('departments', 'departments.json', 'departments');
   }
   
   // Função para buscar ativos
   async function fetchAssets() {
     return fetchDataFromAPI('assets', 'assets.json', 'assets');
   }
   ```

3. **Tratamento de Erros de Permissão**
   
   Adicionamos um tratamento específico para erros de autorização (401), criando arquivos vazios para manter a compatibilidade:
   ```javascript
   // Se o erro for 401 (Unauthorized)
   if (requestError.response.status === 401) {
     console.error(`Acesso não autorizado ao endpoint ${endpoint}`);
     await saveDataToFile([], fileName);
     return [];
   }
   ```

4. **Busca Completa de Dados**
   
   O script principal `fetchServiceDeskData.js` foi atualizado para buscar todos os tipos de dados:
   ```javascript
   // Buscar os diferentes tipos de dados
   const tickets = await tryFetchData(serviceDeskApi.fetchTickets, 'chamados');
   const technicians = await tryFetchData(serviceDeskApi.fetchTechnicians, 'técnicos');
   const departments = await tryFetchData(serviceDeskApi.fetchDepartments, 'departamentos');
   const assets = await tryFetchData(serviceDeskApi.fetchAssets, 'ativos');
   ```

### 4. Scripts para Testes

Foram criados diversos scripts para testar cada funcionalidade:

1. **testeAuth.js**: Testa o processo de autenticação e exibe os tokens obtidos
2. **testeRefreshToken.js**: Testa a renovação de token usando refresh token
3. **testeTickets.js**: Testa a busca de chamados
4. **testeTechnicians.js**: Testa a busca de técnicos
5. **testeDepartments.js**: Testa a busca de departamentos
6. **testeAssets.js**: Testa a busca de ativos

## Como Executar

### Pré-requisitos

- Node.js instalado (versão 12 ou superior)
- Acesso ao ServiceDesk Plus Cloud
- Credenciais OAuth do Zoho configuradas

### Configuração de Ambiente

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure suas credenciais em `config.js` ou crie um arquivo `.env` com as variáveis necessárias

### Execução dos Scripts

Para testar a autenticação:
```
node testeAuth.js
```

Para testar o refresh token:
```
node testeRefreshToken.js
```

Para testar a busca de chamados:
```
node testeTickets.js
```

Para testar a busca de técnicos:
```
node testeTechnicians.js
```

Para executar a coleta completa de dados:
```
node fetchServiceDeskData.js
```

## Fluxo da Aplicação

1. **Autenticação**
   - Verifica se já existe um token salvo
   - Se existir, tenta renovar com refresh token
   - Se não existir ou falhar, usa o código de autorização
   - Salva o novo token para uso futuro

2. **Extração de Dados**
   - Obtém o token de acesso atualizado
   - Busca dados de cada endpoint com tratamento independente de erros
   - Processa e salva os dados obtidos em arquivos JSON
   - Gera um resumo da sincronização

3. **Uso dos Dados**
   - Os dados salvos podem ser utilizados para análise ou enviados para outras plataformas
   - O resumo da sincronização fornece estatísticas sobre os dados coletados

## Nota sobre Permissões de API

Este projeto tenta acessar diferentes endpoints da API do ServiceDesk Plus Cloud. Entretanto, o acesso a alguns endpoints pode ser restrito devido a:

1. **Limitações de Escopo**: O token OAuth pode não ter permissões suficientes
2. **Plano de Assinatura**: Alguns endpoints podem estar disponíveis apenas em planos específicos
3. **Configuração da Conta**: O administrador pode ter restringido o acesso a certas APIs

Nosso código trata esses casos de forma elegante, permitindo que a sincronização continue mesmo quando alguns endpoints não estão acessíveis.

## Próximos Passos

1. **Ampliar Escopos de Acesso**: Solicitar permissões adicionais para acessar mais endpoints
2. **Desenvolver a Integração com o Analytics Plus**: Enviar dados para dashboards
3. **Implementar o Agendamento Automático de Sincronização**: Usar node-cron para sincronizações periódicas
4. **Adicionar Mais Campos e Filtros**: Personalizar as requisições para obter dados específicos

## Troubleshooting

### Problemas comuns:

1. **Erro "invalid_code"**
   - Causa: O código de autorização já foi usado ou expirou
   - Solução: Obter um novo código de autorização ou usar refresh token

2. **Erro de autorização (401)**
   - Causa: Token expirado, inválido ou sem permissões suficientes
   - Solução: Verificar os escopos do token ou solicitar permissões adicionais

3. **Erro na estrutura de dados**
   - Causa: Mudança na API do ServiceDesk Plus
   - Solução: Verificar a documentação da API e atualizar o código

## Recursos Adicionais

- [Documentação da API do ServiceDesk Plus Cloud](https://www.manageengine.com/products/service-desk/sdpod-v3-api/)
- [Documentação do OAuth do Zoho](https://www.zoho.com/accounts/protocol/oauth/)
