# Integração ServiceDesk Plus Cloud com Analytics Plus

Este script faz a conexão entre o ServiceDesk Plus Cloud e o Analytics Plus, copiando automaticamente as informações dos chamados (tickets) de um sistema para o outro.

## 📑 Índice
- [Para que serve?](#-para-que-serve)
- [O que você precisa ter instalado?](#-o-que-você-precisa-ter-instalado)
- [Como instalar?](#-como-instalar)
- [Configuração](#️-configuração)
- [Como usar?](#-como-usar)
- [Como saber se está funcionando?](#-como-saber-se-está-funcionando)
- [Se algo der errado](#-se-algo-der-errado)
- [Segurança](#-segurança)
- [Detalhamento Técnico do Projeto](#-detalhamento-técnico-do-projeto)
- [Recursos Adicionais](#-recursos-adicionais)

## 🤔 Para que serve?

Precisa ver relatórios dos seus chamados do ServiceDesk Plus no Analytics Plus? Este script faz exatamente isso:
1. Busca todos os chamados do ServiceDesk Plus
2. Organiza as informações importantes de cada chamado:
   - Número do chamado
   - Assunto
   - Status (Aberto, Em andamento, Resolvido, etc.)
   - Nome do solicitante
   - Departamento do solicitante
   - Nome do técnico responsável
   - Data de criação
   - Se está em andamento ou não
3. Envia essas informações para o Analytics Plus
4. Repete esse processo automaticamente a cada 3 minutos (se você quiser)

## 📋 O que você precisa ter instalado?

1. Node.js
   - Para verificar se já está instalado:
     1. Abra o "Prompt de Comando" (CMD) ou "PowerShell"
     2. Digite: `node --version`
     3. Se aparecer algo como "v14.0.0" (ou número maior), já está instalado
     4. Se der erro, baixe e instale do site: https://nodejs.org/
     5. Escolha a versão "LTS" (mais estável)

2. NPM 
   - Para verificar se está instalado:
     1. No mesmo prompt de comando
     2. Digite: `npm --version`
     3. Se aparecer um número de versão, está tudo certo

## 💻 Como instalar?

1. Baixe este projeto para seu computador
2. Abra o prompt de comando (CMD ou PowerShell)
3. Navegue até a pasta onde você baixou o projeto
   - Use o comando `cd` para navegar
   - Exemplo: `cd C:\Projetos\Integracao-ServiceDesk-Analytics`
4. Digite o comando:
   ```
   npm install
   ```
   - Este comando vai instalar tudo que o script precisa
   - Aguarde até finalizar

## ⚙️ Configuração

O script precisa saber como acessar seus sistemas. As configurações ficam no arquivo `config.js`:

1. Configurações do ServiceDesk Plus:
   - `clientId`: Seu ID de cliente
   - `clientSecret`: Sua chave secreta
   - `code`: Código de autorização
   - `redirectUri`: URL de redirecionamento

2. Configurações do Analytics Plus:
   - analyticsUrl: Url workspace e tabela (fornecida ao criar tabela)
   - secret: codigo fornecido junto da url

## 🚀 Como usar?

Você tem duas opções para rodar o script:

1. **Execução única** (roda uma vez e para):
   ```
   node integration.js
   ```
   Use quando quiser atualizar os dados apenas uma vez

2. **Execução automática** (atualiza a cada 3 minutos):
   ```
   node integration.js --periodic
   ```
   Use quando quiser manter os dados sempre atualizados

## 🔍 Como saber se está funcionando?

1. No prompt de comando, você verá mensagens como:
   - "Iniciando integração..."
   - "Encontrados X chamados"
   - "Dados enviados com sucesso!"

2. No Analytics Plus:
   - Os dados dos chamados aparecerão atualizados
   - Você poderá criar relatórios e dashboards

## ❌ Se algo der errado

Se aparecer algum erro:

1. Verifique se:
   - Seu computador está conectado à internet
   - As configurações no `config.js` estão corretas
   - O ServiceDesk Plus está funcionando
   - O Analytics Plus está funcionando

2. Mensagens comuns de erro:
   - "Erro de autenticação": Verifique as configurações de acesso
   - "Erro ao buscar dados": Problema de conexão com ServiceDesk Plus
   - "Erro ao enviar dados": Problema de conexão com Analytics Plus

## 🔒 Segurança

- O script salva um arquivo `auth_token.json` com informações de login
- Este arquivo é necessário e seguro
- Não compartilhe este arquivo com ninguém
- Não apague este arquivo (o script cria um novo se necessário)

## 🔧 Detalhamento Técnico do Projeto

### 📁 Arquivos do Projeto

O projeto possui 4 arquivos principais:

1. `config.js`: Guarda todas as configurações
2. `cleanupFiles.js`: Ajuda a manter os arquivos organizados
3. `serviceDeskApi.js`: Contém todas as funções de integração
4. `integration.js`: Arquivo principal que você executa

### ⚙️ Como Funciona (Passo a Passo)

#### 1. Arquivo `config.js`
Guarda todas as configurações importantes:

1. Configurações do Zoho Auth:
   - URLs de autenticação
   - IDs e chaves do cliente
   - Onde salvar o token

2. Configurações do ServiceDesk:
   - URL base do sistema
   - Endpoints da API

3. Configurações do Analytics Plus:
   - URL para envio dos dados
   - Chave secreta

#### 2. Arquivo `cleanupFiles.js`
Mantém o projeto organizado:
- Remove arquivos temporários
- Mantém apenas os arquivos necessários
- Garante que o diretório de dados existe

#### 3. Arquivo `serviceDeskApi.js`
Este é o coração do projeto. Vamos entender cada função:

##### Funções de Autenticação:
1. `getApiClient()`
   - Cria um cliente HTTP com as configurações básicas
   - Define os tipos de conteúdo aceitos

2. `saveToken()`
   - Salva o token no arquivo `auth_token.json`
   - Guarda informações como:
     * Token de acesso
     * Quando ele expira
     * Token de renovação

3. `authenticate()`
   - Verifica se já existe um token salvo
   - Se existir e estiver válido, usa ele
   - Se não existir ou estiver expirado, pede um novo
   - Salva o token para uso futuro

4. `refreshToken()`
   - Renova um token que está para expirar
   - Salva o novo token

5. `readToken()`
   - Lê o token salvo no arquivo
   - Verifica se ele existe
   - Retorna as informações do token

##### Funções de Busca e Envio de Dados:
1. `fetchDataFromAPI()`
   - Conecta no ServiceDesk Plus
   - Usa o token de autenticação
   - Busca os dados solicitados
   - Retorna os dados encontrados

2. `fetchTickets()`
   - Busca todos os chamados
   - Formata cada chamado coletando:
     * ID do chamado
     * Assunto
     * Status
     * Nome do solicitante
     * Departamento
     * Nome do técnico
     * Data de criação
     * Se está em andamento
   - Envia para o Analytics Plus

3. `sendTicketsToAnalytics()`
   - Recebe os chamados formatados
   - Conecta no Analytics Plus
   - Envia os dados usando a URL e chave secreta
   - Confirma se o envio deu certo

#### 4. Arquivo `integration.js`
Este é o arquivo que você executa. Ele tem duas funções principais:
- `runIntegration()`: Executa a integração uma única vez
- `runPeriodicIntegration()`: Executa a integração a cada 3 minutos

### 🔄 Fluxo de Execução

Quando você executa o script, o processo segue este fluxo:

1. **Início da Execução** (`integration.js`)
   - O script verifica se foi executado em modo periódico (--periodic) ou único
   - Inicia o processo de integração mostrando data e hora

2. **Autenticação** (`serviceDeskApi.js`)
   - Verifica se existe um token de acesso salvo
   - Se existir e estiver válido, usa ele
   - Se não existir ou estiver expirado:
     * Solicita um novo token usando as credenciais
     * Salva o novo token para usos futuros

3. **Busca de Chamados** (`serviceDeskApi.js`)
   - Conecta na API do ServiceDesk Plus usando o token
   - Busca a lista completa de chamados
   - Para cada chamado, coleta:
     * Identificação (ID)
     * Detalhes do problema (assunto)
     * Estado atual (status)
     * Informações do solicitante
     * Dados do departamento
     * Técnico responsável
     * Data de abertura

4. **Processamento dos Dados**
   - Formata os dados dos chamados
   - Remove campos desnecessários
   - Padroniza o formato das informações
   - Trata campos vazios ou nulos

5. **Envio para Analytics Plus**
   - Estabelece conexão segura com Analytics Plus
   - Envia os dados formatados
   - Confirma o recebimento dos dados
   - Registra o sucesso ou falha da operação

6. **Finalização**
   - Exibe resumo da operação
   - Mostra quantidade de chamados processados
   - Se estiver em modo periódico:
     * Aguarda 3 minutos
     * Reinicia todo o processo do passo 1

7. **Tratamento de Erros**
   - Em caso de falhas:
     * Exibe mensagens detalhadas do erro
     * Tenta reconectar em caso de problemas de rede
     * Renova o token se estiver expirado

### 🔐 Segurança

O projeto usa várias camadas de segurança:
1. Tokens de autenticação seguros
2. Renovação automática de tokens
3. HTTPS para todas as conexões
4. Chaves secretas para o Analytics Plus
5. Armazenamento seguro de credenciais

### 📊 Dados Processados

Cada chamado é transformado neste formato:
```json
{
  "ticket_id": "123456",
  "subject": "Problema com impressora",
  "status": "Em andamento",
  "applicant": "João Silva",
  "department": "TI",
  "technician": "Maria Técnica",
  "created_time": "2024-01-20 14:30",
  "status_in_progress": true
}
```

## 📚 Recursos Adicionais

Para um entendimento mais profundo das APIs e serviços utilizados, consulte:

1. **ServiceDesk Plus Cloud**
   - [Documentação Oficial da API](https://www.manageengine.com/products/service-desk/sdp-v3-api/)
   - Inclui detalhes sobre:
     * Endpoints disponíveis
     * Formatos de requisição
     * Códigos de resposta
     * Exemplos de uso

2. **Analytics Plus**
   - [Documentação do Analytics Plus](https://www.manageengine.com/analytics-plus/help/)
   - Informações sobre:
     * Importação de dados
     * Criação de relatórios
     * Dashboards personalizados
     * Integrações disponíveis

3. **Zoho OAuth**
   - [Guia do OAuth do Zoho](https://www.zoho.com/accounts/protocol/oauth/)
   - Explica:
     * Processo de autenticação
     * Geração de tokens
     * Renovação de tokens
     * Boas práticas de segurança

Estes recursos são especialmente úteis quando você precisar:
- Entender melhor como a integração funciona
- Resolver problemas específicos
- Expandir as funcionalidades do script
- Implementar novas integrações

