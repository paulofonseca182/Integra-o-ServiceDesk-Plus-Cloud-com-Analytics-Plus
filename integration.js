const { fetchTickets } = require('./serviceDeskApi');

// Função para executar a integração
async function runIntegration() {
  try {
    console.log('Iniciando integração ServiceDesk Plus -> Analytics Plus');
    console.log('Data/Hora:', new Date().toLocaleString());
    console.log('------------------------------------------------');

    await fetchTickets();

    console.log('------------------------------------------------');
    console.log('Integração concluída com sucesso!');
    console.log('------------------------------------------------\n');
  } catch (error) {
    console.error('Erro durante a integração:', error.message);
  }
}

// Função para executar a integração periodicamente
function runPeriodicIntegration() {
  console.log('Iniciando integração periódica (a cada 3 minutos)');
  console.log('Pressione Ctrl+C para interromper\n');

  // Executa imediatamente a primeira vez
  runIntegration();

  // Agenda as próximas execuções a cada 3 minutos
  setInterval(runIntegration, 3 * 60 * 1000);
}

// Verifica os argumentos da linha de comando
const args = process.argv.slice(2);
if (args.includes('--periodic')) {
  runPeriodicIntegration();
} else {
  runIntegration();
} 