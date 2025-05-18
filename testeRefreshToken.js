const api = require('./serviceDeskApi');
const fs = require('fs');
const path = require('path');
const { zohoAuthConfig } = require('./config');

console.log('Iniciando teste de refresh token...');

// Verifica se temos um refresh token salvo ou precisamos fornecê-lo manualmente
async function testarRefreshToken() {
  try {
    // Verificar se o arquivo de token existe
    const tokenFilePath = zohoAuthConfig.tokenFilePath;
    let refreshToken = null;
    
    if (fs.existsSync(tokenFilePath)) {
      console.log(`Arquivo de token encontrado: ${tokenFilePath}`);
      const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
      
      if (tokenData.refresh_token) {
        refreshToken = tokenData.refresh_token;
        console.log(`Refresh token encontrado no arquivo: ${refreshToken.substring(0, 10)}...`);
      } else {
        console.log('Arquivo de token não contém refresh_token');
      }
    } else {
      console.log(`Arquivo de token não encontrado: ${tokenFilePath}`);
    }
    
    // Se não temos refresh token no arquivo, vamos usar o da configuração
    if (!refreshToken && zohoAuthConfig.refreshToken) {
      refreshToken = zohoAuthConfig.refreshToken;
      console.log(`Usando refresh token da configuração: ${refreshToken.substring(0, 10)}...`);
    }
    
    // Se ainda não temos refresh token, precisamos obter um novo
    if (!refreshToken) {
      console.log('Nenhum refresh token encontrado. Obtendo um novo token de acesso...');
      const authResult = await api.authenticate();
      console.log('Autenticação bem-sucedida!');
      console.log('Dados do token:', JSON.stringify(authResult, null, 2));
      return;
    }
    
    // Criar arquivo temporário com o refresh token
    const tempTokenData = { refresh_token: refreshToken };
    fs.writeFileSync(tokenFilePath, JSON.stringify(tempTokenData, null, 2));
    console.log(`Token temporário salvo em ${tokenFilePath}`);
    
    // Agora testa a renovação do token
    console.log('Testando renovação do token...');
    const result = await api.authenticate();
    
    console.log('Renovação de token bem-sucedida!');
    console.log('Novos dados do token:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Erro durante o teste de refresh token:', error.message);
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Detalhes da resposta:', error.response.data);
    }
  }
}

// Executa o teste
testarRefreshToken(); 