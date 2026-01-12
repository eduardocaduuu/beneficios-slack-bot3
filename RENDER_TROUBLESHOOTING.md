# 🔧 Troubleshooting - Deploy no Render

## ⚠️ Erro: "Exited with status 1"

Se o deploy falhar com status 1, o problema mais comum é **variáveis de ambiente não configuradas**.

### ✅ Solução: Configurar Variáveis de Ambiente

No painel do Render, vá em **"Environment"** e adicione **TODAS** estas variáveis:

#### Variáveis Obrigatórias (devem estar configuradas):

```
SLACK_BOT_TOKEN=xoxb-seu-token-aqui
SLACK_APP_TOKEN=xapp-seu-token-aqui
SLACK_SIGNING_SECRET=seu-signing-secret-aqui
WELCOME_CHANNEL_ID=C1234567890
```

#### Variáveis Opcionais (mas recomendadas):

```
APP_MODE=socket
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
SEND_DM=true
```

### 📋 Como Obter os Tokens

1. **SLACK_BOT_TOKEN** (começa com `xoxb-`):
   - Slack App → OAuth & Permissions → Bot User OAuth Token

2. **SLACK_APP_TOKEN** (começa com `xapp-`):
   - Slack App → Basic Information → App-Level Tokens → Create Token
   - Escopos necessários: `connections:write`

3. **SLACK_SIGNING_SECRET**:
   - Slack App → Basic Information → App Credentials → Signing Secret

4. **WELCOME_CHANNEL_ID**:
   - ID do canal do Slack (formato: `C1234567890`)
   - Para obter: clique com botão direito no canal → View channel details → Copy channel ID

### 🔍 Verificar Logs

1. No painel do Render, vá em **"Logs"**
2. Procure por mensagens de erro como:
   - `❌ Variável de ambiente obrigatória não definida: SLACK_BOT_TOKEN`
   - `❌ Erro ao carregar configuração`
3. Se aparecer algum erro específico, configure a variável faltante

### ✅ Checklist de Deploy

- [ ] Todas as 4 variáveis obrigatórias estão configuradas
- [ ] `SLACK_BOT_TOKEN` começa com `xoxb-`
- [ ] `SLACK_APP_TOKEN` começa com `xapp-`
- [ ] `WELCOME_CHANNEL_ID` está no formato `C1234567890`
- [ ] `APP_MODE` está definido como `socket`
- [ ] `PORT` está definido (ou deixe o Render definir automaticamente)
- [ ] `NODE_ENV` está definido como `production`

### 🚀 Após Configurar

1. Salve as variáveis de ambiente
2. O Render fará deploy automaticamente
3. Aguarde o build completar
4. Verifique os logs para confirmar que iniciou corretamente
5. Teste o health check: `https://seu-app.onrender.com/health`

### 📝 Exemplo de Logs de Sucesso

Quando tudo estiver correto, você verá nos logs:

```
✅ Configuração carregada e validada com sucesso
🔌 Iniciando app em Socket Mode
✅ Health check endpoint disponível em http://0.0.0.0:3000/health
⚡ Bot em Socket Mode está rodando!
✅ Bot de Benefícios Alcina Maria pronto para uso!
```

### ❌ Exemplo de Logs de Erro

Se faltar alguma variável, você verá:

```
❌ Variável de ambiente obrigatória não definida: SLACK_BOT_TOKEN
❌ Erro ao carregar configuração
```

**Solução**: Configure a variável faltante no painel do Render.
