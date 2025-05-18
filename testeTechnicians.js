const api = require('./serviceDeskApi');

console.log('Iniciando teste de busca de técnicos...');

api.fetchTechnicians()
  .then(technicians => {
    console.log('Busca de técnicos bem-sucedida!');
    console.log(`Total de técnicos obtidos: ${technicians.length}`);
    
    if (technicians.length > 0) {
      console.log('\nExemplo do primeiro técnico:');
      console.log(JSON.stringify(technicians[0], null, 2));
      
      // Mostrar um resumo de todos os técnicos
      console.log('\nResumo de todos os técnicos:');
      technicians.forEach((technician, index) => {
        console.log(`\nTécnico #${index + 1}:`);
        console.log(`- ID: ${technician.id || 'N/A'}`);
        console.log(`- Nome: ${technician.name || 'Não informado'}`);
        console.log(`- Email: ${technician.email_id || 'Não informado'}`);
        console.log(`- Cargo: ${technician.job_title || 'Não informado'}`);
        console.log(`- Departamento: ${technician.department?.name || 'Não informado'}`);
        console.log(`- Site: ${technician.site?.name || 'Não informado'}`);
      });
    } else {
      console.log('Nenhum técnico encontrado.');
    }
  })
  .catch(error => {
    console.error('Erro na busca de técnicos:', error.message);
  }); 