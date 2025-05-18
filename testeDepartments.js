const api = require('./serviceDeskApi');

console.log('Iniciando teste de busca de departamentos...');

api.fetchDepartments()
  .then(departments => {
    console.log('Busca de departamentos bem-sucedida!');
    console.log(`Total de departamentos obtidos: ${departments.length}`);
    
    if (departments.length > 0) {
      console.log('\nExemplo do primeiro departamento:');
      console.log(JSON.stringify(departments[0], null, 2));
      
      // Mostrar um resumo de todos os departamentos
      console.log('\nResumo de todos os departamentos:');
      departments.forEach((department, index) => {
        console.log(`\nDepartamento #${index + 1}:`);
        console.log(`- ID: ${department.id || 'N/A'}`);
        console.log(`- Nome: ${department.name || 'Não informado'}`);
        console.log(`- Descrição: ${department.description || 'Não informada'}`);
        console.log(`- Site: ${department.site?.name || 'Não informado'}`);
      });
    } else {
      console.log('Nenhum departamento encontrado.');
    }
  })
  .catch(error => {
    console.error('Erro na busca de departamentos:', error.message);
  }); 