const api = require('./serviceDeskApi');

console.log('Iniciando teste de busca de chamados...');

api.fetchTickets()
  .then(tickets => {
    console.log('Busca de chamados bem-sucedida!');
    console.log(`Total de chamados obtidos: ${tickets.length}`);
    
    if (tickets.length > 0) {
      console.log('\nExemplo do primeiro chamado:');
      console.log(JSON.stringify(tickets[0], null, 2));
      
      // Exibir propriedades mais comuns de todos os chamados
      console.log('\nResumo de todos os chamados:');
      tickets.forEach((ticket, index) => {
        console.log(`\nChamado #${index + 1}:`);
        console.log(`- ID: ${ticket.id}`);
        console.log(`- Assunto: ${ticket.subject || 'Não informado'}`);
        console.log(`- Status: ${ticket.status?.name || 'Não informado'}`);
        console.log(`- Prioridade: ${ticket.priority?.name || 'Não informada'}`);
        console.log(`- Solicitante: ${ticket.requester?.name || 'Não informado'}`);
        console.log(`- Criado em: ${ticket.createdTime || 'Não informado'}`);
      });
    } else {
      console.log('Nenhum chamado encontrado.');
    }
  })
  .catch(error => {
    console.error('Erro na busca de chamados:', error.message);
    if (error.response) {
      console.error('Detalhes da resposta:', error.response.data);
    }
  }); 