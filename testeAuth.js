const api = require('./serviceDeskApi');

console.log('Iniciando teste de autenticação...');

api.authenticate()
  .then(data => {
    console.log('Autenticação bem-sucedida!');
    console.log('Resposta completa da API:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\nDados importantes:');
    console.log('- Access Token:', data.access_token);
    console.log('- Refresh Token:', data.refresh_token);
    console.log('- Tempo de expiração:', data.expires_in, 'segundos');
    console.log('- Escopo de permissão:', data.scope);
    console.log('- Tipo do token:', data.token_type);
    console.log('- API Domain:', data.api_domain);
  })
  .catch(error => {
    console.error('Erro na autenticação:', error.message);
    if (error.response) {
      console.error('Detalhes da resposta:', error.response.data);
    }
  }); 