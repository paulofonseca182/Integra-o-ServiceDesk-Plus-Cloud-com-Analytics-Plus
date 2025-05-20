require('dotenv').config();

// Configurações de autenticação Zoho
const zohoAuthConfig = {
  baseUrl: 'https://accounts.zoho.com/oauth/v2/token',
  clientId: process.env.ZOHO_CLIENT_ID || '1000.RW6KYZSDY7E5L4SPAV5HWI0PUIXJBA',
  clientSecret: process.env.ZOHO_CLIENT_SECRET || '2e25e3b4610ad7ddcf8fe20255a4269236333ec21c',
  redirectUri: process.env.ZOHO_REDIRECT_URI || 'https://paulo182.sdpondemand.manageengine.com/',
  // SUBSTITUA O VALOR ABAIXO PELO NOVO CÓDIGO DE AUTORIZAÇÃO OBTIDO COM OS ESCOPOS AMPLIADOS
  code: process.env.ZOHO_AUTH_CODE || '1000.9f536fb5bf91ede9cb1b1e197bfe61f1.0118a3eb0cd8ae82f61655303adebb5b',
  // Refresh token obtido da nova autenticação
  refreshToken: process.env.ZOHO_REFRESH_TOKEN || '1000.c09585aad9d55bee8cc1d61aaa2a4640.b35f805b2dd665a62fd8550fcbe460d9',
  // Caminho para armazenar o token
  tokenFilePath: './data/auth_token.json'
};

// Configurações para ServiceDesk Plus Cloud
const serviceDeskConfig = {
  baseUrl: process.env.SERVICEDESK_BASE_URL || 'https://paulo182.sdpondemand.manageengine.com',
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