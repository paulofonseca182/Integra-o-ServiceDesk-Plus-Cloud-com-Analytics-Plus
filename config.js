require('dotenv').config();

// Configurações de autenticação Zoho
const zohoAuthConfig = {
  baseUrl: 'https://accounts.zoho.com/oauth/v2/token',
  clientId: process.env.ZOHO_CLIENT_ID || '',
  clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
  redirectUri: process.env.ZOHO_REDIRECT_URI || '',
  // SUBSTITUA O VALOR ABAIXO PELO NOVO CÓDIGO DE AUTORIZAÇÃO OBTIDO COM OS ESCOPOS AMPLIADOS
  code: process.env.ZOHO_AUTH_CODE || '',
  // Refresh token obtido da nova autenticação
  refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
  // Caminho para armazenar o token
  tokenFilePath: './data/auth_token.json'
};

// Configurações para ServiceDesk Plus Cloud
const serviceDeskConfig = {
  baseUrl: process.env.SERVICEDESK_BASE_URL || '',
  apiKey: process.env.SERVICEDESK_API_KEY,
  endpoints: {
    tickets: '/api/v3/requests',
  }
};

// Configurações para Analytics Plus
const analyticsConfig = {
  baseUrl: process.env.ANALYTICS_BASE_URL,
  clientId: process.env.ANALYTICS_CLIENT_ID,
  clientSecret: process.env.ANALYTICS_CLIENT_SECRET,
  endpoints: {
    authentication: '/oauth/token',
    dataSources: '/api/datasources',
    dataImport: '/api/import'
  }
};

// Configurações gerais da sincronização
const syncConfig = {
  cronExpression: process.env.SYNC_INTERVAL || '0 0 * * *', // Padrão: todos os dias à meia-noite
  dataPath: './data'
};

module.exports = {
  zohoAuthConfig,
  serviceDeskConfig,
  analyticsConfig,
  syncConfig
}; 