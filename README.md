# Integração ServiceDesk Plus Cloud com Analytics Plus

## Visão Geral

Este projeto desenvolve uma solução para conectar duas ferramentas da ManageEngine: o ServiceDesk Plus Cloud (sistema de gerenciamento de chamados de TI) e o Analytics Plus (plataforma de análise de dados e criação de dashboards). A integração permite extrair informações de chamados, técnicos, departamentos e ativos do ServiceDesk Plus, processá-las e disponibilizá-las no Analytics Plus para a criação de painéis analíticos e relatórios visuais.

Em termos simples, este sistema funciona como uma "ponte" que transporta dados de uma ferramenta para outra, permitindo transformar informações operacionais de suporte técnico em painéis visuais para tomada de decisão.

## Para que serve esta solução?

Imagine que sua empresa utiliza o ServiceDesk Plus para gerenciar os chamados de suporte técnico. Com o tempo, acumula-se uma grande quantidade de dados sobre problemas reportados, tempo de resolução, técnicos responsáveis e muito mais. Porém, analisar esses dados diretamente no ServiceDesk Plus pode ser limitado.

Esta integração permite:
- Ver tendências de chamados em gráficos interativos
- Identificar gargalos no atendimento
- Acompanhar o desempenho dos técnicos
- Criar painéis personalizados para diferentes públicos (gerentes, técnicos, clientes)
- Tomar decisões baseadas em dados concretos

## Como funciona (explicação não-técnica)

O sistema funciona em três etapas principais:

1. **Coleta de dados**: O sistema se conecta ao ServiceDesk Plus usando credenciais seguras (como uma chave de acesso especial) e coleta informações sobre chamados, técnicos e outros elementos.

2. **Processamento e armazenamento**: Os dados coletados são organizados, filtrados e salvos temporariamente em arquivos especiais (JSON) que funcionam como "contêineres" de informação.

3. **Envio para o Analytics Plus**: Os dados processados são enviados para o Analytics Plus, onde podem ser utilizados para criar gráficos, tabelas e painéis interativos.

## Passo a Passo da Implementação (Detalhado)

### 1. Preparação do Ambiente

Antes de começar a desenvolver a integração, preparamos o ambiente com todas as ferramentas necessárias:

1. **Instalação do Node.js**: Uma plataforma que permite executar o código JavaScript fora de um navegador.

2. **Criação da estrutura de pastas**: Organizamos o projeto em pastas lógicas para facilitar a manutenção.

3. **Instalação de bibliotecas de apoio**:
   - **axios**: Uma ferramenta para fazer solicitações à internet (como enviar e receber dados de APIs)
   - **dotenv**: Para gerenciar informações sensíveis como senhas e chaves
   - **node-cron**: Para programar tarefas para execução automática em horários específicos

### 2. Configuração das Credenciais de Acesso

Para acessar o ServiceDesk Plus Cloud, precisamos de credenciais especiais. Este processo é semelhante a obter uma "chave especial" para entrar em um sistema protegido:

1. **Criação de conta no ServiceDesk Plus Cloud**: Registramos uma conta para testes.

2. **Obtenção de credenciais OAuth**: O OAuth é um protocolo de segurança que permite que um aplicativo acesse dados em outro sem precisar compartilhar senhas. Precisamos de:
   - Client ID: Um identificador único da nossa aplicação
   - Client Secret: Uma senha secreta para nossa aplicação
   - Código de Autorização: Um código temporário para iniciar o processo de autorização

3. **Configuração no arquivo config.js**: Armazenamos essas credenciais em um arquivo central de configuração.

### 3. Desenvolvimento do Sistema de Autenticação

A autenticação é como um porteiro que controla quem pode entrar no sistema. Implementamos um sistema robusto que:

1. **Autenticação inicial**: Usando o código de autorização, obtemos um par de tokens:
   - Access Token: Permite acesso temporário aos dados (geralmente válido por 1 hora)
   - Refresh Token: Permite obter novos access tokens sem precisar reiniciar todo o processo

2. **Renovação automática de tokens**: Quando o access token expira, o sistema usa automaticamente o refresh token para obter um novo, sem interrupção.

3. **Armazenamento seguro**: Os tokens são armazenados em arquivos locais para uso contínuo.

Este sistema de autenticação é crucial porque garante acesso contínuo e seguro aos dados, sem exigir intervenção manual a cada hora.

### 4. Extração de Dados do ServiceDesk Plus

Com a autenticação funcionando, implementamos a coleta de dados:

1. **Identificação dos endpoints**: "Endpoints" são como portas específicas para diferentes tipos de dados. Identificamos os seguintes:
   - `/requests`: Para acessar dados de chamados
   - `/technicians`: Para informações sobre técnicos
   - `/departments`: Para estrutura organizacional
   - `/assets`: Para inventário de equipamentos e software

2. **Criação de funções específicas**: Desenvolvemos funções dedicadas para cada tipo de dado, permitindo coleta independente.

3. **Tratamento de permissões**: Um desafio encontrado foi a limitação de acesso a alguns endpoints. Nossa solução:
   - Verificar quais endpoints estão acessíveis
   - Capturar e tratar erros de permissão (código 401)
   - Criar arquivos vazios para endpoints inacessíveis, permitindo que o sistema continue funcionando

4. **Salvamento dos dados**: Todos os dados coletados são salvos em arquivos JSON na pasta `data/`:
   - `tickets.json`: Contém todos os chamados
   - `technicians.json`: Lista de técnicos (quando acessível)
   - `departments.json`: Estrutura de departamentos (quando acessível)
   - `assets.json`: Inventário de ativos (quando acessível)

### 5. Scripts de Teste

Para garantir que cada parte do sistema funcione corretamente, criamos diversos scripts de teste:

1. **testeAuth.js**: Verifica se a autenticação inicial funciona corretamente
2. **testeRefreshToken.js**: Testa o processo de renovação de tokens
3. **testeTickets.js**: Verifica a coleta de dados de chamados
4. **testeTechnicians.js**: Testa o acesso a dados de técnicos
5. **testeDepartments.js**: Verifica o acesso a departamentos
6. **testeAssets.js**: Testa a coleta de dados de ativos

Estes scripts são ferramentas importantes para identificar e corrigir problemas específicos sem precisar executar todo o sistema.

### 6. Descoberta de Limitações e Soluções

Durante a implementação, descobrimos uma limitação importante: o acesso via API está restrito apenas a chamados (tickets), sem permissão para acessar outros tipos de dados como técnicos e departamentos.

Para contornar esta limitação, implementamos as seguintes soluções:

1. **Tratamento elegante de erros**: O sistema detecta quando um endpoint não está acessível e cria arquivos vazios para manter a consistência.

2. **Escopo expandido para tickets**: Utilizamos o escopo `SDPOnDemand.requests.ALL` que oferece acesso completo aos dados de chamados.

3. **Extração de informações adicionais dos tickets**: Muitas informações sobre técnicos e departamentos estão contidas nos próprios chamados, permitindo criar conjuntos de dados secundários.

### 7. Preparação para Integração com Analytics Plus

Com os dados do ServiceDesk Plus coletados com sucesso, preparamos a integração com o Analytics Plus:

1. **Estruturação dos arquivos**:
   - `analyticsApi.js`: Contém funções para interagir com a API do Analytics Plus
   - `pushToAnalytics.js`: Script para enviar os dados coletados

2. **Definição do esquema de dados**: Mapeamos como os dados do ServiceDesk Plus serão estruturados no Analytics Plus.

3. **Planejamento dos dashboards**: Definimos três painéis principais para criação:
   - Dashboard de Volume de Chamados
   - Dashboard de Performance de Atendimento
   - Dashboard de Análise de Tendências

## Desafios Enfrentados e Soluções

### 1. Limitação de Escopos de API

**Desafio**: Descobrimos que o acesso à API do ServiceDesk Plus Cloud é limitado apenas a chamados, sem acesso a técnicos, departamentos e ativos.

**Solução**: 
- Foco nos dados de chamados que são acessíveis
- Extração de informações sobre técnicos e departamentos a partir dos próprios chamados
- Sistema projetado para continuar funcionando mesmo com acesso parcial

### 2. Limites de Requisições (Rate Limiting)

**Desafio**: O Zoho/ServiceDesk Plus limita o número de requisições que podem ser feitas em um curto período de tempo.

**Solução**:
- Implementação de mecanismos para detectar limites de taxa (mensagens "too many requests")
- Planejamento para adicionar espera automática entre requisições
- Estratégia de backoff exponencial (aumentar progressivamente o tempo de espera entre tentativas)

### 3. Renovação de Tokens

**Desafio**: Os tokens de acesso expiram após uma hora, exigindo renovação constante.

**Solução**:
- Sistema automatizado de refresh token
- Armazenamento do refresh token para uso contínuo
- Renovação transparente de access tokens sem interrupção do serviço

## Como Executar o Sistema

Para pessoas não técnicas, o sistema pode ser executado seguindo estes passos simples:

1. **Configuração inicial** (uma única vez):
   - Verifique se o Node.js está instalado no computador
   - Abra um terminal ou prompt de comando
   - Navegue até a pasta do projeto
   - Execute `npm install` para instalar as dependências

2. **Coleta de dados do ServiceDesk Plus**:
   - Execute `node fetchServiceDeskData.js`
   - O sistema irá se autenticar e coletar os dados disponíveis
   - Os arquivos resultantes serão salvos na pasta `data/`

3. **Envio para o Analytics Plus** (quando implementado):
   - Execute `node pushToAnalytics.js`
   - Os dados serão enviados para o Analytics Plus para visualização

4. **Execução automática** (quando configurado):
   - Execute `node index.js`
   - O sistema irá coletar e enviar dados automaticamente nos horários programados

## Próximas Etapas

O projeto está em desenvolvimento contínuo, com as seguintes etapas planejadas:

1. **Implementação completa da integração com Analytics Plus**:
   - Autenticação com o Analytics Plus
   - Criação de fontes de dados
   - Envio automatizado de informações

2. **Criação de dashboards**:
   - Dashboard de Volume de Chamados
   - Dashboard de Performance de Atendimento
   - Dashboard de Análise de Tendências

3. **Automatização do processo completo**:
   - Agendamento de sincronização periódica
   - Notificações de sucesso/falha
   - Monitoramento do processo

4. **Documentação abrangente**:
   - Manual do usuário
   - Guia de troubleshooting
   - Exemplos de uso

## Conclusão

Esta integração entre ServiceDesk Plus Cloud e Analytics Plus demonstra como dados operacionais de suporte técnico podem ser transformados em informações estratégicas através de painéis analíticos. Apesar dos desafios enfrentados com limitações de API, o sistema foi projetado para ser robusto e flexível, adaptando-se às restrições encontradas.

O projeto oferece uma base sólida para análise de dados de chamados de TI, permitindo que gestores tomem decisões baseadas em dados concretos sobre a operação de suporte técnico.

## Recursos Adicionais

- [Documentação da API do ServiceDesk Plus Cloud](https://www.manageengine.com/products/service-desk/sdpod-v3-api/)
- [Documentação do Analytics Plus](https://www.manageengine.com/analytics-plus/help/api/)
- [Guia do OAuth do Zoho](https://www.zoho.com/accounts/protocol/oauth/)
