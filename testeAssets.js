const api = require('./serviceDeskApi');

console.log('Iniciando teste de busca de ativos...');

api.fetchAssets()
  .then(assets => {
    console.log('Busca de ativos bem-sucedida!');
    console.log(`Total de ativos obtidos: ${assets.length}`);
    
    if (assets.length > 0) {
      console.log('\nExemplo do primeiro ativo:');
      console.log(JSON.stringify(assets[0], null, 2));
      
      // Mostrar um resumo de todos os ativos
      console.log('\nResumo de todos os ativos:');
      assets.forEach((asset, index) => {
        console.log(`\nAtivo #${index + 1}:`);
        console.log(`- ID: ${asset.id || 'N/A'}`);
        console.log(`- Nome: ${asset.name || 'Não informado'}`);
        console.log(`- Tipo: ${asset.asset_type?.name || 'Não informado'}`);
        console.log(`- Status: ${asset.status?.name || 'Não informado'}`);
        console.log(`- Proprietário: ${asset.owner_details?.name || 'Não informado'}`);
        console.log(`- Site: ${asset.site?.name || 'Não informado'}`);
        console.log(`- Departamento: ${asset.department?.name || 'Não informado'}`);
      });
    } else {
      console.log('Nenhum ativo encontrado.');
    }
  })
  .catch(error => {
    console.error('Erro na busca de ativos:', error.message);
  }); 