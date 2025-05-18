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

// Função para renovar o token usando refresh_token
async function refreshToken(refreshToken) {
  try {
    const client = getApiClient();
    
    // URL específica para renovação do token conforme fornecido
    const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${zohoAuthConfig.clientId}&client_secret=${zohoAuthConfig.clientSecret}&grant_type=refresh_token`;
    
    console.log('Renovando token com refresh_token...');
    console.log('URL:', url);
    
    // Requisição para obter o novo token
    const response = await client.post(url);
    
    console.log('Status da resposta:', response.status);
    console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.access_token) {
      console.log('Token renovado com sucesso!');
      
      // Preserva o refresh_token se não vier na resposta
      if (!response.data.refresh_token && refreshToken) {
        response.data.refresh_token = refreshToken;
      }
      
      // Salva o novo token
      await saveToken(response.data);
      
      return response.data;
    } else {
      throw new Error('Resposta inválida ao renovar token');
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error.message);
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Função para autenticar na API do ServiceDesk Plus
async function authenticate() {
  try {
    // Verificar se já temos um token salvo
    const savedToken = await readToken();
    
    if (savedToken && savedToken.refresh_token) {
      console.log('Token salvo encontrado. Tentando renovar com refresh_token...');
      return await refreshToken(savedToken.refresh_token);
    }
    
    // Se não tiver token salvo ou refresh_token, faz autenticação com código
    console.log('Realizando autenticação inicial com código de autorização...');
    
    const client = getApiClient();
    
    // Dados para autenticação
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', zohoAuthConfig.clientId);
    params.append('client_secret', zohoAuthConfig.clientSecret);
    params.append('redirect_uri', zohoAuthConfig.redirectUri);
    params.append('code', zohoAuthConfig.code);
    
    console.log('Enviando requisição para:', zohoAuthConfig.baseUrl);
    console.log('Parâmetros:', params.toString());
    
    // Requisição para obter o token
    const response = await client.post(zohoAuthConfig.baseUrl, params);
    
    console.log('Status da resposta:', response.status);
    console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.access_token) {
      console.log('Token de acesso obtido com sucesso!');
      
      // Salva o token para uso futuro
      await saveToken(response.data);
      
      return response.data;
    } else {
      console.log('Resposta sem access_token:', response.data);
      throw new Error('Resposta inválida da API de autenticação');
    }
  } catch (error) {
    console.error('Erro ao autenticar:', error.message);
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }
    throw error;
  }
}

// Função para obter um cliente autenticado
async function getAuthenticatedClient() {
  const tokenData = await authenticate();
  
  return axios.create({
    headers: {
      'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

// Função utilitária para fazer requisições GET à API
async function fetchDataFromAPI(endpoint, fileName, dataKey) {
  try {
    // Obter o token de acesso
    const tokenData = await authenticate();
    
    // URL completa
    const url = `https://paulo182.sdpondemand.manageengine.com/app/itdesk/api/v3/${endpoint}`;
    
    console.log(`Buscando dados de ${endpoint}:`, url);
    console.log('Utilizando access_token:', tokenData.access_token.substring(0, 10) + '...');
    
    // Configurar o cliente com o token de acesso
    const client = axios.create({
      headers: {
        'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    try {
      // Fazer a requisição GET
      const response = await client.get(url);
      
      console.log('Status da resposta:', response.status);
      
      // Verificar se a resposta contém os dados esperados
      if (response.data && response.data[dataKey]) {
        console.log(`Encontrados ${response.data[dataKey].length} ${dataKey}`);
        
        // Salvar os dados em arquivos JSON
        await saveDataToFile(response.data[dataKey], fileName);
        
        // Salvar a resposta completa para análise
        await saveDataToFile(response.data, `${fileName.split('.')[0]}_full_response.json`);
        
        return response.data[dataKey];
      } else if (response.data && response.data.response_status && response.data.response_status[0].status === 'success') {
        // Alguns endpoints podem retornar uma estrutura diferente
        console.log('Resposta bem-sucedida, mas sem a estrutura esperada. Salvando a resposta completa.');
        
        // Salvar a resposta completa para análise
        await saveDataToFile(response.data, `${fileName.split('.')[0]}_full_response.json`);
        
        // Criar um array vazio para manter compatibilidade
        await saveDataToFile([], fileName);
        
        return [];
      } else {
        console.log('Estrutura da resposta:', JSON.stringify(response.data, null, 2));
        throw new Error(`Resposta inválida ou estrutura diferente do esperado para ${endpoint}`);
      }
    } catch (requestError) {
      if (requestError.response) {
        // Se o erro for 401 (Unauthorized), é provável que o escopo do token não permita esse acesso
        if (requestError.response.status === 401) {
          console.error(`Acesso não autorizado ao endpoint ${endpoint}. Verifique as permissões do seu token.`);
          console.error('Esta funcionalidade pode exigir um escopo diferente ou não estar disponível na sua conta.');
          
          // Criar um arquivo vazio para manter compatibilidade
          await saveDataToFile([], fileName);
          
          // Retornar um array vazio
          return [];
        }
        
        throw requestError;
      } else {
        throw requestError;
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar dados de ${endpoint}:`, error.message);
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }
    throw error;
  }
}

// Função para buscar chamados (versão anterior)
async function fetchTicketsOld() {
  try {
    const client = await getAuthenticatedClient();
    const endpoint = `${serviceDeskConfig.baseUrl}${serviceDeskConfig.endpoints.tickets}`;
    
    console.log('Buscando chamados de:', endpoint);
    
    const response = await client.get(endpoint);
    
    if (response.data && response.data.requests) {
      console.log(`Encontrados ${response.data.requests.length} chamados`);
      await saveDataToFile(response.data.requests, 'tickets.json');
      return response.data.requests;
    } else {
      console.log('Resposta sem dados de chamados:', response.data);
      throw new Error('Resposta inválida da API de chamados');
    }
  } catch (error) {
    console.error('Erro ao buscar chamados:', error.message);
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Função para buscar chamados (nova versão com URL específica)
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

// Função para salvar os dados em arquivos JSON
async function saveDataToFile(data, fileName) {
  try {
    const filePath = path.join(syncConfig.dataPath, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Dados salvos com sucesso em ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar dados em ${fileName}:`, error.message);
    throw error;
  }
}

module.exports = {
  authenticate,
  fetchTickets,
  fetchTicketsOld,
  fetchTechnicians,
  fetchDepartments,
  fetchAssets,
  saveDataToFile,
  getAuthenticatedClient
}; 