# 🚀 Guia: Migrar Bot para um Novo Workspace do Slack

Este guia explica como migrar o bot de um workspace para outro (substituindo o antigo).

## 📋 Pré-requisitos

- Acesso administrativo ao novo workspace do Slack
- Conta no Render (já configurada)
- Slack App criada no novo workspace

## 🔧 Passo 1: Criar Nova Slack App

1. Acesse: https://api.slack.com/apps
2. Clique em **"Create New App"**
3. Escolha **"From scratch"**
4. Preencha:
   - **App Name**: `Bot de Benefícios Alcina Maria` (ou o nome desejado)
   - **Pick a workspace**: Selecione o **novo workspace**
5. Clique em **"Create App"**

## ⚙️ Passo 2: Configurar OAuth & Permissions

1. No menu lateral, vá em **"OAuth & Permissions"**
2. Role até **"Scopes"** → **"Bot Token Scopes"**
3. Adicione os seguintes escopos (permissões):

### Escopos Obrigatórios:
- `app_mentions:read` - Lê menções ao app
- `channels:history` - Lê histórico de canais públicos
- `channels:read` - Lê informações de canais públicos
- `chat:write` - Envia mensagens
- `commands` - Responde a comandos slash
- `im:history` - Lê histórico de DMs
- `im:read` - Lê informações de DMs
- `im:write` - Envia DMs
- `users:read` - Lê informações de usuários
- `users:read.email` - Lê emails de usuários

### Escopos Opcionais (se necessário):
- `channels:join` - Entrar em canais públicos
- `groups:read` - Lê canais privados (se necessário)

4. Role até **"OAuth Tokens for Your Workspace"**
5. Clique em **"Install to Workspace"**
6. Autorize as permissões
7. **Copie o "Bot User OAuth Token"** (começa com `xoxb-`)
   - Este é o seu novo `SLACK_BOT_TOKEN`

## 🔑 Passo 3: Criar App-Level Token (Socket Mode)

1. No menu lateral, vá em **"Basic Information"**
2. Role até **"App-Level Tokens"**
3. Clique em **"Generate Token and Scopes"**
4. Preencha:
   - **Token Name**: `Socket Mode Token`
   - **Add Scope**: `connections:write`
5. Clique em **"Generate"**
6. **Copie o token gerado** (começa com `xapp-`)
   - Este é o seu novo `SLACK_APP_TOKEN`
   - ⚠️ **IMPORTANTE**: Este token só aparece uma vez! Salve-o com segurança.

## 🔐 Passo 4: Obter Signing Secret

1. Ainda em **"Basic Information"**
2. Role até **"App Credentials"**
3. Clique em **"Signing Secret"** → **"Show"** ou **"Reveal"**
4. **Copie o Signing Secret**
   - Este é o seu novo `SLACK_SIGNING_SECRET`

## 📍 Passo 5: Obter Channel ID

1. No Slack, abra o canal onde o bot deve monitorar novos membros
2. Clique com botão direito no nome do canal
3. Selecione **"View channel details"** ou **"Detalhes do canal"**
4. Role até encontrar **"Channel ID"**
5. **Copie o Channel ID** (formato: `C1234567890`)
   - Este é o seu novo `WELCOME_CHANNEL_ID`

## 🎯 Passo 6: Configurar Comandos Slash (Opcional)

1. No menu lateral, vá em **"Slash Commands"**
2. Clique em **"Create New Command"**
3. Preencha:
   - **Command**: `/beneficios`
   - **Request URL**: Deixe vazio (Socket Mode não precisa)
   - **Short Description**: `Lista os benefícios disponíveis`
   - **Usage Hint**: `[unidade]` (opcional)
4. Clique em **"Save"**

## 🌐 Passo 7: Atualizar Render (Substituir Workspace Antigo)

1. No painel do Render, abra seu serviço existente
2. Vá em **"Environment"**
3. **Substitua** as seguintes variáveis com os novos valores do novo workspace:

```
SLACK_BOT_TOKEN = xoxb-novo-token-aqui (do novo workspace)
SLACK_APP_TOKEN = xapp-novo-token-aqui (do novo workspace)
SLACK_SIGNING_SECRET = novo-signing-secret-aqui (do novo workspace)
WELCOME_CHANNEL_ID = C1234567890 (canal do novo workspace)
```

4. ⚠️ **IMPORTANTE**: Substitua TODOS os valores antigos pelos novos
5. Clique em **"Save Changes"**
6. O Render fará deploy automaticamente
7. O bot agora estará conectado ao novo workspace (o antigo será desconectado)

## ✅ Passo 8: Verificar Funcionamento

1. Aguarde o deploy completar no Render
2. Verifique os logs - deve aparecer:
   ```
   ✅ Configuração carregada e validada com sucesso
   🔌 Iniciando app em Socket Mode
   ⚡ Bot em Socket Mode está rodando!
   ```

3. No Slack, teste:
   - Comando: `/beneficios`
   - Adicione alguém ao canal configurado
   - Verifique se o bot envia mensagem de boas-vindas

## 🔄 Resumo dos Novos Tokens

Após seguir os passos acima, você terá:

- **SLACK_BOT_TOKEN**: `xoxb-...` (do OAuth & Permissions)
- **SLACK_APP_TOKEN**: `xapp-...` (do App-Level Tokens)
- **SLACK_SIGNING_SECRET**: `...` (do Basic Information)
- **WELCOME_CHANNEL_ID**: `C...` (do canal do Slack)

## ⚠️ Importante

- Cada workspace precisa de sua própria Slack App
- Tokens são únicos por workspace
- Ao atualizar as variáveis no Render, o bot será desconectado do workspace antigo
- O bot funcionará apenas no novo workspace após a atualização
- Mantenha os tokens seguros e não os versione no Git
- Você pode desinstalar a Slack App antiga se não for mais usar aquele workspace

## 🆘 Troubleshooting

### Bot não responde
- Verifique se o bot foi instalado no workspace
- Confirme que os escopos estão corretos
- Verifique os logs do Render

### Erro de autenticação
- Confirme que os tokens estão corretos
- Verifique se o App-Level Token tem escopo `connections:write`
- Certifique-se de que o bot está instalado no workspace

### Comando não funciona
- Verifique se o comando `/beneficios` foi criado na Slack App
- Confirme que o bot está online (verifique logs do Render)
