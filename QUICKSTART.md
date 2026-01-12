# 🚀 Guia de Início Rápido

Este guia te leva do zero ao bot funcionando em **15 minutos**.

## Pré-requisitos

- Node.js 20+ instalado
- Acesso de admin ao Slack workspace
- 15 minutos disponíveis

---

## Passo 1: Criar Slack App (5 min)

### 1.1 Criar o App

1. Acesse [api.slack.com/apps](https://api.slack.com/apps)
2. **"Create New App"** → **"From scratch"**
3. Nome: `Benefícios Alcina Maria`
4. Selecione seu workspace
5. **"Create App"**

### 1.2 Configurar Permissões

Vá em **"OAuth & Permissions"** → **"Bot Token Scopes"**:

Adicione:
```
chat:write
chat:write.public
channels:read
groups:read
users:read
commands
```

Clique em **"Install to Workspace"** → Autorize

**Copie o Bot Token** (começa com `xoxb-`)

### 1.3 Ativar Socket Mode

Vá em **"Socket Mode"**:
1. Ative **"Enable Socket Mode"**
2. Nome do token: "Local Dev"
3. **"Generate"**

**Copie o App Token** (começa com `xapp-`)

### 1.4 Configurar Eventos

Vá em **"Event Subscriptions"**:
1. Ative **"Enable Events"**
2. Em **"Subscribe to bot events"** adicione:
   - `member_joined_channel`
   - `app_mention`
3. **"Save Changes"**

### 1.5 Ativar Interatividade

Vá em **"Interactivity & Shortcuts"**:
1. Ative **"Interactivity"**
2. **"Save Changes"**

### 1.6 Criar Comandos

Vá em **"Slash Commands"** → **"Create New Command"**:

Crie 4 comandos:

| Command | Description |
|---------|-------------|
| `/beneficios` | Consultar benefícios |
| `/beneficios-novato` | Mensagem de boas-vindas |
| `/beneficios-time` | Benefícios para o time |
| `/beneficios-unidade` | Ver por unidade |

### 1.7 Obter Signing Secret

Vá em **"Basic Information"** → **"App Credentials"**

**Copie o Signing Secret**

### 1.8 Obter ID do Canal

No Slack:
1. Abra o canal desejado
2. Clique no nome do canal (topo)
3. Role até o fim
4. **Copie o Channel ID** (ex: C1234567890)

---

## Passo 2: Configurar Projeto Local (5 min)

### 2.1 Clone e Instale

```bash
git clone <url-do-repo>
cd BotBeneficios
npm install
```

### 2.2 Configure .env

```bash
cp .env.example .env
```

Edite `.env` e cole os valores copiados:

```env
SLACK_BOT_TOKEN=xoxb-seu-token-aqui
SLACK_APP_TOKEN=xapp-seu-token-aqui
SLACK_SIGNING_SECRET=seu-signing-secret
WELCOME_CHANNEL_ID=C1234567890

SEND_DM=true
APP_MODE=socket
LOG_LEVEL=info
NODE_ENV=development
```

### 2.3 Validar Configuração

```bash
node scripts/check-env.js
```

Se tudo estiver correto, verá: `✅ Arquivo .env está válido!`

---

## Passo 3: Executar Bot (5 min)

### 3.1 Iniciar em Modo Dev

```bash
npm run dev
```

Você deve ver:

```
╔════════════════════════════════════════════════╗
║   🎁  Bot de Benefícios Alcina Maria  🎁       ║
╚════════════════════════════════════════════════╝

✅ Configuração carregada e validada com sucesso
⚡ Bot em Socket Mode está rodando!
📢 Monitorando canal: C1234567890
✅ Bot de Benefícios Alcina Maria pronto para uso!
```

### 3.2 Testar no Slack

No Slack, digite:

```
/beneficios
```

Você deve ver uma mensagem com botões interativos! 🎉

### 3.3 Testar Boas-Vindas Automáticas

1. Convide o bot para o canal:
   ```
   /invite @Benefícios Alcina Maria
   ```

2. Adicione um usuário ao canal

3. O bot deve enviar automaticamente a mensagem de boas-vindas!

---

## 🎯 Próximos Passos

### Personalizar Benefícios

Edite `src/data/benefitsData.ts` para ajustar benefícios.

### Customizar Mensagens

Edite `src/utils/messageBuilders.ts` para ajustar textos.

### Alterar Link do RH

No `.env`:
```env
RH_CONTACT_LINK=https://seu-link-aqui
```

### Desativar DM Automático

No `.env`:
```env
SEND_DM=false
```

---

## ❓ Problemas Comuns

### Bot não responde

**Verifique:**
- Bot está rodando? (`npm run dev`)
- Tokens estão corretos no `.env`?
- Socket Mode está ativado?

**Solução:**
```bash
node scripts/check-env.js
npm run dev
```

### Comando não existe

**Verifique:**
- Comando foi criado no Slack App?
- Nome está correto? (ex: `/beneficios`)

**Solução:**
Vá em **Slash Commands** e verifique.

### Boas-vindas não funciona

**Verifique:**
- Bot foi convidado para o canal?
- `WELCOME_CHANNEL_ID` está correto?
- Evento `member_joined_channel` está inscrito?

**Solução:**
```bash
/invite @Benefícios Alcina Maria
```

---

## 📚 Documentação Completa

- [README.md](README.md) - Documentação completa
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura técnica
- [CONTRIBUTING.md](CONTRIBUTING.md) - Como contribuir

---

## 🎉 Pronto!

Seu bot está funcionando! Explore os comandos e interações.

**Comandos disponíveis:**
- `/beneficios` - Menu geral
- `/beneficios-novato` - Mensagem novato
- `/beneficios-time` - Mensagem time
- `/beneficios-unidade` - Por unidade

**Interações:**
- Botões para filtrar
- Menu dropdown de unidades
- Link para RH/DP

Divirta-se! 🚀
