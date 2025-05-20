const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { zohoAuthConfig, serviceDeskConfig, syncConfig } = require('./config');

// Função para configurar o cliente Axios
function getApiClient() {
  return axios.create({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    }
  });
}

// Função para salvar o token em um arquivo
async function saveToken(tokenData) {
  try {
    await fs.promises.writeFile(
      zohoAuthConfig.tokenFilePath,
      JSON.stringify(tokenData, null, 2)
    );
    console.log('Token salvo com sucesso em:', zohoAuthConfig.tokenFilePath);
    return true;
  } catch (error) {
    console.error('Erro ao salvar o token:', error.message);
    return false;
  }
}

// Função para autenticar na API do ServiceDesk Plus
async function authenticate() {
  try {
    const savedToken = await readToken();
    
    if (savedToken && savedToken.refresh_token) {
      return await refreshToken(savedToken.refresh_token);
    }
    
    const client = getApiClient();
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', zohoAuthConfig.clientId);
    params.append('client_secret', zohoAuthConfig.clientSecret);
    params.append('redirect_uri', zohoAuthConfig.redirectUri);
    params.append('code', zohoAuthConfig.code);
    
    const response = await client.post(zohoAuthConfig.baseUrl, params);
    
    if (response.data && response.data.access_token) {
      await saveToken(response.data);
      return response.data;
    } else {
      throw new Error('Resposta inválida da API de autenticação');
    }
  } catch (error) {
    console.error('Erro ao autenticar:', error.message);
    throw error;
  }
}

// Função para renovar o token usando refresh_token
async function refreshToken(refreshToken) {
  try {
    const client = getApiClient();
    const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${zohoAuthConfig.clientId}&client_secret=${zohoAuthConfig.clientSecret}&grant_type=refresh_token`;
    
    console.log('Renovando token com refresh_token...');
    
    const response = await client.post(url);
    
    if (response.data && response.data.access_token) {
      console.log('Token renovado com sucesso!');
      
      if (!response.data.refresh_token && refreshToken) {
        response.data.refresh_token = refreshToken;
      }
      
      await saveToken(response.data);
      return response.data;
    } else {
      throw new Error('Resposta inválida ao renovar token');
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error.message);
    throw error;
  }
}

// Função para ler o token do arquivo
async function readToken() {
  try {
    if (fs.existsSync(zohoAuthConfig.tokenFilePath)) {
      const tokenData = await fs.promises.readFile(
        zohoAuthConfig.tokenFilePath,
        'utf8'
      );
      return JSON.parse(tokenData);
    }
    return null;
  } catch (error) {
    console.error('Erro ao ler o token:', error.message);
    return null;
  }
}

// Função para buscar dados da API do ServiceDesk
async function fetchDataFromAPI(endpoint, dataKey) {
  try {
    const tokenData = await authenticate();
    const url = `https://paulo182.sdpondemand.manageengine.com/app/itdesk/api/v3/${endpoint}`;
    
    const client = axios.create({
      headers: {
        'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const response = await client.get(url);
    
    if (response.data && response.data[dataKey]) {
      console.log(`Encontrados ${response.data[dataKey].length} ${dataKey}`);
      return response.data[dataKey];
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Erro ao buscar dados de ${endpoint}:`, error.message);
    throw error;
  }
}

// Função principal para buscar e enviar chamados
async function fetchTickets() {
  try {
    const ticketsData = await fetchDataFromAPI('requests', 'requests');
    
    const ticketsFormatados = ticketsData.map(ticket => ({
      "ticket_id": ticket.id || "",
      "subject": ticket.subject || "",
      "status": ticket.status?.name || "",
      "applicant": ticket.requester?.name  || "",
      "department": ticket.requester?.department?.name || "",
      "technician": ticket.technician?.first_name + " " + ticket.technician?.last_name || "",
      "created_time": ticket.created_time?.display_value || "",
      "status_in_progress": ticket.status?.in_progress || false
    }));

    await sendTicketsToAnalytics(ticketsFormatados);
    
    return ticketsFormatados;
  } catch (error) {
    console.error('Erro ao processar e enviar tickets:', error.message);
    throw error;
  }
}

// Função para enviar dados para o Analytics Plus
async function sendTicketsToAnalytics(tickets) {
  try {
    const analyticsUrl = 'https://analyticsplus.manageengine.com/stream/107196000000007268/rows';
    const secret = '68116f2bca6e72f1e5a97dcca533ca6dd9e06fe24861c31493d9eac8b';
    
    console.log('Enviando dados para o Analytics Plus...');
    
    const client = axios.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const response = await client.post(`${analyticsUrl}?SECRET=${secret}`, tickets);
    
    if (response.status === 200 || response.status === 201) {
      console.log('Dados enviados com sucesso para o Analytics Plus!');
      return true;
    } else {
      throw new Error(`Erro ao enviar dados. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao enviar dados para o Analytics Plus:', error.message);
    throw error;
  }
}

module.exports = {
  fetchTickets
}; 