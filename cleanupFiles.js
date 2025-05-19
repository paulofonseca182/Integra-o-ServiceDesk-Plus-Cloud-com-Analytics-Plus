#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { syncConfig } = require('./config');

// Função para limpar arquivos desnecessários
async function cleanupUnnecessaryFiles() {
  try {
    const dataPath = syncConfig.dataPath;
    console.log(`\nLimpando arquivos desnecessários em ${dataPath}...`);
    
    // Garantir que o diretório existe
    if (!fs.existsSync(dataPath)) {
      console.log(`Diretório de dados não encontrado: ${dataPath}`);
      return;
    }
    
    // Lista todos os arquivos no diretório de dados
    const files = fs.readdirSync(dataPath);
    
    // Arquivos necessários para manter
    const necessaryFiles = [
      'tickets.json',      // Dados dos chamados formatados
      'auth_token.json',   // Token de autenticação
      'sync_summary.json'  // Resumo da sincronização
    ];
    
    // Remove arquivos desnecessários
    let removedCount = 0;
    for (const file of files) {
      if (file.endsWith('.json') && !necessaryFiles.includes(file)) {
        const filePath = path.join(dataPath, file);
        fs.unlinkSync(filePath);
        console.log(`Arquivo removido: ${file}`);
        removedCount++;
      }
    }
    
    if (removedCount === 0) {
      console.log('Nenhum arquivo desnecessário encontrado.');
    } else {
      console.log(`${removedCount} arquivos desnecessários foram removidos.`);
    }
    
    console.log('Limpeza concluída.');
  } catch (error) {
    console.error('Erro ao limpar arquivos:', error.message);
  }
}

module.exports = {
  cleanupUnnecessaryFiles
};

// Executa a limpeza
console.log('Iniciando limpeza de arquivos...');
cleanupUnnecessaryFiles(); 