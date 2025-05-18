#!/usr/bin/env node
const cron = require('node-cron');
const { syncConfig } = require('./config');
const { fetchAllData } = require('./fetchServiceDeskData');
const { pushAllData } = require('./pushToAnalytics');

// Função para executar uma sincronização completa
async function syncData() {
  // Implementação futura
}

// Função para configurar o agendamento de sincronização
function setupScheduler() {
  // Implementação futura
}

// Função para executar uma sincronização imediata
async function runImmediateSync() {
  // Implementação futura
}

// Executa se chamado diretamente
if (require.main === module) {
  console.log('Iniciando serviço de integração ServiceDesk Plus com Analytics Plus...');
  console.log(`Sincronização agendada: ${syncConfig.cronExpression}`);
  
  // Configura o agendamento
  setupScheduler();
  
  // Executa uma sincronização inicial
  console.log('Executando sincronização inicial...');
  runImmediateSync()
    .then(() => {
      console.log('Sincronização inicial concluída com sucesso!');
    })
    .catch(error => {
      console.error('Erro durante a sincronização inicial:', error);
    });
} 