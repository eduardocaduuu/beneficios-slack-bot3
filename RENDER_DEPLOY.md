# 🚀 Guia de Deploy no Render

Este guia explica como fazer o deploy do Bot de Benefícios no Render.

## 📋 Pré-requisitos

1. Conta no Render (https://render.com)
2. Repositório GitHub com o código
3. Tokens do Slack configurados

## 🔧 Passo a Passo

### 1. Conectar Repositório no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub:
   - Selecione o repositório: `beneficios-slack-bot3` (ou o repositório correto)
   - Clique em **"Connect"**

### 2. Configurar o Serviço

#### Configurações Básicas:
- **Name**: `bot-beneficios-alcina-maria`
- **Region**: `Sao Paulo` (ou a região mais próxima)
- **Branch**: `main`
- **Root Directory**: `BotBeneficios` (se o repositório tiver subdiretório)

#### Configurações de Build:
- **Environment**: `Node`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

#### Configurações Avançadas:
- **Health Check Path**: `/health`
- **Plan**: `Free` (ou escolha o plano desejado)

### 3. Configurar Variáveis de Ambiente

No painel do Render, vá em **"Environment"** e adicione:

#### Variáveis Obrigatórias:
```
SLACK_BOT_TOKEN=xoxb-seu-token-aqui
SLACK_APP_TOKEN=xapp-seu-token-aqui
SLACK_SIGNING_SECRET=seu-signing-secret-aqui
WELCOME_CHANNEL_ID=C1234567890
```

#### Variáveis Opcionais (com valores padrão):
```
APP_MODE=socket
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
SEND_DM=true
DEFAULT_LOCALE=pt-BR
RH_CONTACT_LINK=https://slack.com/app_redirect?channel=rh-dp
```

### 4. Deploy Automático

- O Render fará deploy automaticamente quando você fizer push para a branch `main`
- Você também pode fazer deploy manual clicando em **"Manual Deploy"**

### 5. Verificar Deploy

1. Aguarde o build completar (pode levar 2-5 minutos)
2. Verifique os logs em **"Logs"**
3. Teste o health check: `https://seu-app.onrender.com/health`
4. O bot deve estar rodando em Socket Mode

## 🔍 Troubleshooting

### Erro: "Build failed"
- Verifique se o TypeScript está instalado (devDependencies)
- Confira os logs de build para erros de compilação

### Erro: "Health check failed"
- Verifique se o PORT está configurado corretamente
- Confirme que o health check está em `/health`

### Erro: "Token inválido"
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que os tokens começam com `xoxb-` e `xapp-`

### Bot não responde
- Verifique os logs do Render
- Confirme que o Socket Mode está funcionando
- Teste o comando `/beneficios` no Slack

## 📝 Notas Importantes

- O Render usa **Socket Mode** por padrão (APP_MODE=socket)
- O health check está disponível em `/health` mesmo em Socket Mode
- O servidor HTTP mínimo é iniciado automaticamente para o health check
- Logs estão disponíveis no painel do Render em tempo real

## 🔗 Links Úteis

- [Documentação Render](https://render.com/docs)
- [Slack Bolt Framework](https://slack.dev/bolt-js/tutorial/getting-started)
