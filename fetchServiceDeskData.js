#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { syncConfig } = require('./config');
const serviceDeskApi = require('./serviceDeskApi');

// Função para garantir que o diretório de dados existe
function ensureDataDirectory() {
  if (!fs.existsSync(syncConfig.dataPath)) {
    console.log(`Criando diretório de dados: ${syncConfig.dataPath}`);
    fs.mkdirSync(syncConfig.dataPath, { recursive: true });
  }
}

// Função para tentar buscar dados com tratamento de erros
async function tryFetchData(fetchFunction, dataType) {
  try {
    console.log(`\n=== Buscando dados de ${dataType} ===`);
    const data = await fetchFunction();
    console.log(`Obtidos ${data.length} ${dataType}\n`);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar dados de ${dataType}:`, error.message);
    console.log(`Ignorando dados de ${dataType} e continuando a sincronização...\n`);
    return [];
  }
}

// Função principal para buscar todos os dados
async function fetchAllData() {
  try {
    // Garantir que o diretório de dados existe
    ensureDataDirectory();
    
    // Autenticar na API
    console.log('Autenticando na API do ServiceDesk Plus...');
    const authData = await serviceDeskApi.authenticate();
    console.log('Autenticação bem-sucedida, token obtido:', authData.access_token.substring(0, 10) + '...');
    
    // Buscar os diferentes tipos de dados com tratamento de erro para cada um
    const tickets = await tryFetchData(serviceDeskApi.fetchTickets, 'chamados');
    const technicians = await tryFetchData(serviceDeskApi.fetchTechnicians, 'técnicos');
    const departments = await tryFetchData(serviceDeskApi.fetchDepartments, 'departamentos');
    const assets = await tryFetchData(serviceDeskApi.fetchAssets, 'ativos');
    
    // Gerar relatório resumido
    const summary = {
      timestamp: new Date().toISOString(),
      counts: {
        tickets: tickets.length,
        technicians: technicians.length,
        departments: departments.length,
        assets: assets.length
      }
    };
    
    await serviceDeskApi.saveDataToFile(summary, 'sync_summary.json');
    console.log('Resumo da sincronização salvo em data/sync_summary.json');
    
    return { 
      success: true, 
      message: 'Dados coletados com sucesso!',
      summary
    };
  } catch (error) {
    console.error('Erro na coleta de dados:', error.message);
    throw error;
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  console.log('Iniciando coleta de dados do ServiceDesk Plus...');
  console.log('Data e hora:', new Date().toLocaleString());
  console.log('------------------------------------------------');
  
  fetchAllData()
    .then((result) => {
      console.log('\n------------------------------------------------');
      console.log('Coleta de dados concluída com sucesso!');
      console.log('Resumo:');
      console.log(`- ${result.summary.counts.tickets} chamados`);
      console.log(`- ${result.summary.counts.technicians} técnicos`);
      console.log(`- ${result.summary.counts.departments} departamentos`);
      console.log(`- ${result.summary.counts.assets} ativos`);
      console.log('------------------------------------------------');
    })
    .catch(error => {
      console.error('Erro durante a coleta de dados:', error);
      process.exit(1);
    });
}

module.exports = {
  fetchAllData
}; 