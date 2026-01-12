# 🎁 Bot de Benefícios Alcina Maria

Bot do Slack para informar e gerenciar benefícios dos colaboradores da Alcina Maria. O bot monitora automaticamente novos membros em um canal específico e permite que todos os colaboradores consultem seus benefícios de forma simples e interativa.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Local](#-instalação-local)
- [Configuração do Slack App](#-configuração-do-slack-app)
- [Configuração de Variáveis de Ambiente](#-configuração-de-variáveis-de-ambiente)
- [Executar o Bot](#-executar-o-bot)
- [Comandos Disponíveis](#-comandos-disponíveis)
- [Interações](#-interações)
- [Arquitetura](#-arquitetura)
- [Deploy em Produção](#-deploy-em-produção)
- [Testes](#-testes)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Funcionalidades

### 🎉 Boas-vindas automáticas
- Detecta quando um novo colaborador entra no canal configurado
- Envia mensagem de boas-vindas automaticamente no canal
- Opcionalmente envia DM (mensagem direta) para o novo colaborador
- Rate limiting: não envia mensagens duplicadas em 24h

### 📊 Consulta de benefícios
- Lista completa de benefícios organizados por categoria
- Filtro por unidade (Penedo, Palmeira, Lojas, VDs)
- Filtro por categoria (Produtos, Saúde, Educação, etc.)
- Interface interativa com botões e menus

### 🏢 Benefícios por unidade
- **Todas as unidades**: Benefícios gerais do Grupo
- **Penedo**: Inclui convênios locais (Supermercado Vital, Farmácia Permanente)
- **Palmeira dos Índios**: Convênios locais
- **Lojas e VDs**: Benefícios específicos por cargo

### 💬 Comandos Slash
- `/beneficios` - Consulta geral de benefícios
- `/beneficios-novato` - Mensagem de boas-vindas
- `/beneficios-time` - Mensagem para colaboradores antigos
- `/beneficios-unidade [nome]` - Benefícios filtrados por unidade

---

## 🔧 Pré-requisitos

- **Node.js** 20.x ou superior
- **npm** ou **yarn**
- Conta de administrador no Slack workspace
- Acesso à [Slack API](https://api.slack.com/apps)

---

## 📥 Instalação Local

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd BotBeneficios
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (veja próxima seção).

---

## 🔐 Configuração do Slack App

Siga este passo a passo detalhado para criar e configurar seu Slack App.

### Passo 1: Criar o App no Slack

1. Acesse [https://api.slack.com/apps](https://api.slack.com/apps)
2. Clique em **"Create New App"**
3. Escolha **"From scratch"**
4. Dê um nome ao app: **"Benefícios Alcina Maria"**
5. Selecione seu workspace
6. Clique em **"Create App"**

### Passo 2: Configurar OAuth & Permissions

1. No menu lateral, vá em **"OAuth & Permissions"**
2. Role até **"Scopes"** → **"Bot Token Scopes"**
3. Adicione os seguintes scopes:

```
chat:write            - Enviar mensagens
chat:write.public     - Enviar mensagens em canais públicos
channels:read         - Ver informações de canais
groups:read           - Ver informações de canais privados
users:read            - Ver informações de usuários
commands              - Usar comandos slash
```

4. Role para cima e clique em **"Install to Workspace"**
5. Autorize o app
6. **Copie o "Bot User OAuth Token"** (começa com `xoxb-`)
   - Cole no arquivo `.env` como `SLACK_BOT_TOKEN`

### Passo 3: Ativar Socket Mode (recomendado para desenvolvimento)

1. No menu lateral, vá em **"Socket Mode"**
2. Ative **"Enable Socket Mode"**
3. Dê um nome ao token (ex: "Local Dev Token")
4. Clique em **"Generate"**
5. **Copie o App-Level Token** (começa com `xapp-`)
   - Cole no arquivo `.env` como `SLACK_APP_TOKEN`

### Passo 4: Configurar Event Subscriptions

1. No menu lateral, vá em **"Event Subscriptions"**
2. Ative **"Enable Events"**
3. Em **"Subscribe to bot events"**, adicione:

```
member_joined_channel  - Detectar quando alguém entra em um canal
app_mention           - Detectar quando o bot é mencionado
```

4. Clique em **"Save Changes"**

### Passo 5: Configurar Interactivity & Shortcuts

1. No menu lateral, vá em **"Interactivity & Shortcuts"**
2. Ative **"Interactivity"**
3. Se estiver usando Socket Mode, não precisa configurar Request URL
4. Clique em **"Save Changes"**

### Passo 6: Criar Slash Commands

1. No menu lateral, vá em **"Slash Commands"**
2. Clique em **"Create New Command"**

Crie os seguintes comandos:

**Comando 1:**
```
Command: /beneficios
Short Description: Consultar benefícios disponíveis
Usage Hint:
```

**Comando 2:**
```
Command: /beneficios-novato
Short Description: Mensagem de boas-vindas com benefícios
Usage Hint:
```

**Comando 3:**
```
Command: /beneficios-time
Short Description: Benefícios para colaboradores existentes
Usage Hint:
```

**Comando 4:**
```
Command: /beneficios-unidade
Short Description: Ver benefícios por unidade
Usage Hint: [penedo|palmeira|loja_coruripe|loja_teotonio|vd_penedo|vd_palmeira]
```

### Passo 7: Obter Signing Secret

1. No menu lateral, vá em **"Basic Information"**
2. Role até **"App Credentials"**
3. **Copie o "Signing Secret"**
   - Cole no arquivo `.env` como `SLACK_SIGNING_SECRET`

### Passo 8: Obter ID do Canal

1. Abra o Slack
2. Vá até o canal onde quer monitorar novos membros
3. Clique no nome do canal (topo da tela)
4. Role até o final da janela de informações
5. **Copie o "Channel ID"** (formato: C1234567890)
   - Cole no arquivo `.env` como `WELCOME_CHANNEL_ID`

---

## ⚙️ Configuração de Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:

```env
# Tokens obtidos do Slack
SLACK_BOT_TOKEN=xoxb-seu-token-aqui
SLACK_APP_TOKEN=xapp-seu-token-aqui
SLACK_SIGNING_SECRET=seu-signing-secret-aqui

# ID do canal de boas-vindas
WELCOME_CHANNEL_ID=C1234567890

# Configurações
SEND_DM=true
DEFAULT_LOCALE=pt-BR
RH_CONTACT_LINK=https://slack.com/app_redirect?channel=rh-dp
RH_USER_ID=U1234567890

# Modo (socket ou http)
APP_MODE=socket

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

### Variáveis explicadas:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SLACK_BOT_TOKEN` | Token do bot (OAuth) | `xoxb-123456...` |
| `SLACK_APP_TOKEN` | Token do app (Socket Mode) | `xapp-123456...` |
| `SLACK_SIGNING_SECRET` | Secret para validar requests | `abc123def456...` |
| `WELCOME_CHANNEL_ID` | ID do canal a monitorar | `C1234567890` |
| `SEND_DM` | Enviar DM para novos membros? | `true` ou `false` |
| `RH_CONTACT_LINK` | Link para contato do RH (legado) | URL ou canal do Slack |
| `RH_USER_ID` | User ID do RH/DP para botão interativo | `U1234567890` |
| `APP_MODE` | Modo de conexão | `socket` (dev) ou `http` (prod) |
| `LOG_LEVEL` | Nível de log | `info`, `debug`, `error` |

---

## 🚀 Executar o Bot

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

### Compilar TypeScript

```bash
npm run build
```

### Executar em produção

```bash
npm start
```

### Executar testes

```bash
npm test
```

---

## 📱 Comandos Disponíveis

### `/beneficios`
Exibe visão geral dos benefícios com botões interativos.

**Uso:**
```
/beneficios
```

### `/beneficios-novato`
Mensagem de boas-vindas para novos colaboradores.

**Uso:**
```
/beneficios-novato
```

### `/beneficios-time`
Mensagem para colaboradores antigos descobrirem benefícios.

**Uso:**
```
/beneficios-time
```

### `/beneficios-unidade [nome]`
Filtra benefícios por unidade específica.

**Uso:**
```
/beneficios-unidade penedo
/beneficios-unidade palmeira
/beneficios-unidade loja_coruripe
/beneficios-unidade vd_penedo
```

Se executado sem parâmetro, mostra um menu de seleção:
```
/beneficios-unidade
```

---

## 🎯 Interações

### Botões Disponíveis

**📋 Ver todos os benefícios**
- Mostra lista completa e detalhada de todos os benefícios

**🏢 Ver por unidade**
- Abre menu dropdown para selecionar unidade
- Filtra benefícios específicos da unidade escolhida

**💬 Falar com RH/DP**
- Abre link configurado para contato com RH
- Pode ser canal do Slack, email ou URL

### Menus Interativos

**Seletor de Unidade**
- Todas as unidades
- Penedo
- Palmeira dos Índios
- Loja Coruripe
- Loja Teotônio
- VD Penedo
- VD Palmeira

---

## 🏗️ Arquitetura

### Estrutura do Projeto

```
BotBeneficios/
├── src/
│   ├── config/
│   │   └── environment.ts       # Configuração e validação de env
│   ├── data/
│   │   └── benefitsData.ts      # Base de dados dos benefícios
│   ├── handlers/
│   │   ├── actions.ts           # Handlers de ações (botões, menus)
│   │   ├── commands.ts          # Handlers de comandos slash
│   │   └── events.ts            # Handlers de eventos
│   ├── services/
│   │   ├── cacheService.ts      # Cache e rate limiting
│   │   └── slackApp.ts          # Configuração do Slack App
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── utils/
│   │   ├── logger.ts            # Sistema de logging
│   │   ├── messageBuilders.ts  # Construtores de mensagens Block Kit
│   │   └── unitFilter.ts        # Filtros por unidade
│   └── index.ts                 # Entry point
├── tests/
│   └── unitFilter.test.ts       # Testes unitários
├── .env                          # Variáveis de ambiente (não commitado)
├── .env.example                  # Template de .env
├── package.json
├── tsconfig.json
└── README.md
```

### Fluxo de Dados

1. **Evento recebido** (novo membro, comando, ação)
2. **Handler processa** (events, commands, actions)
3. **Busca dados** (benefitsData.ts)
4. **Filtra se necessário** (unitFilter.ts)
5. **Constrói mensagem** (messageBuilders.ts)
6. **Envia resposta** (Slack API)
7. **Registra em cache** (cacheService.ts)

### Tecnologias

- **Node.js 20+** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Slack Bolt** - Framework oficial do Slack
- **Pino** - Logging estruturado
- **Jest** - Testes unitários

---

## 🌐 Deploy em Produção

### Opção 1: Socket Mode (mais fácil)

Socket Mode funciona bem para produção em pequena escala:

```env
APP_MODE=socket
```

**Vantagens:**
- Não precisa de URL pública
- Não precisa configurar webhooks
- Conexão bidirecional via WebSocket

**Desvantagens:**
- Processo precisa ficar rodando continuamente
- Não escala horizontalmente

### Opção 2: HTTP Mode (recomendado para produção)

Para produção em larga escala, use HTTP Mode:

```env
APP_MODE=http
PORT=3000
```

**Requisitos:**
1. URL pública acessível (ex: via Heroku, AWS, etc.)
2. Configurar Request URL no Slack:
   - Event Subscriptions: `https://seu-dominio.com/slack/events`
   - Interactivity: `https://seu-dominio.com/slack/events`

**Vantagens:**
- Escalável horizontalmente
- Padrão para produção
- Melhor para alta disponibilidade

### Deploy em Heroku (exemplo)

1. Crie app no Heroku:
```bash
heroku create bot-beneficios-alcina
```

2. Configure variáveis de ambiente:
```bash
heroku config:set SLACK_BOT_TOKEN=xoxb-...
heroku config:set SLACK_APP_TOKEN=xapp-...
heroku config:set SLACK_SIGNING_SECRET=...
heroku config:set WELCOME_CHANNEL_ID=C...
heroku config:set APP_MODE=http
heroku config:set NODE_ENV=production
```

3. Deploy:
```bash
git push heroku main
```

4. Configure Request URL no Slack:
```
https://bot-beneficios-alcina.herokuapp.com/slack/events
```

### Deploy em Docker (exemplo)

Crie `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build e run:

```bash
docker build -t bot-beneficios .
docker run -p 3000:3000 --env-file .env bot-beneficios
```

---

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes em watch mode

```bash
npm test -- --watch
```

### Coverage

```bash
npm test -- --coverage
```

### Testes incluídos

- ✅ Filtro de benefícios por unidade
- ✅ Parsing de nomes de unidades
- ✅ Contagem de benefícios
- ✅ Detecção de benefícios exclusivos

---

## 🐛 Troubleshooting

### Bot não responde

**Problema:** Bot não responde a comandos ou eventos

**Soluções:**
1. Verifique se o bot está rodando: `ps aux | grep node`
2. Verifique logs: olhe para erros no console
3. Verifique tokens no `.env`
4. Verifique se Socket Mode está ativado no Slack
5. Teste com `/beneficios` para verificar se comandos funcionam

### Erro de permissões

**Problema:** `missing_scope` ou `not_authed`

**Soluções:**
1. Revise os scopes em OAuth & Permissions
2. Reinstale o app no workspace
3. Gere novos tokens se necessário

### Canal não é monitorado

**Problema:** Bot não detecta novos membros

**Soluções:**
1. Verifique `WELCOME_CHANNEL_ID` no `.env`
2. Convide o bot para o canal: `/invite @Benefícios Alcina Maria`
3. Verifique se o evento `member_joined_channel` está inscrito
4. Teste manualmente com `/beneficios-novato`

### Mensagens duplicadas

**Problema:** Bot envia mesma mensagem várias vezes

**Soluções:**
1. Rate limiting está ativo por 24h
2. Se precisar resetar, reinicie o bot (cache em memória)
3. Para persistência, considere usar Redis

### Erros de validação de ambiente

**Problema:** Erro ao iniciar: variável não definida

**Soluções:**
1. Verifique se `.env` existe
2. Compare com `.env.example`
3. Certifique-se de que não há espaços extras
4. Tokens devem começar com prefixos corretos (`xoxb-`, `xapp-`)

---

## 📝 Benefícios Cadastrados

O bot gerencia os seguintes benefícios:

### 🛍️ Descontos em Produtos
- 30% Grupo oBoticário (todas unidades)
- 40% Maquiagem (cargos específicos)

### 🏥 Saúde e Bem-Estar
- Plano Odontológico
- Plano Conexa (2 consultas/mês)
- Wellhub (Gympass)

### 📚 Educação
- Unicesumar (70% desconto)
- Unopar (20% desconto)

### 🚌 Mobilidade
- Vale Transporte (6% em folha)

### 🍽️ Alimentação
- Caju Benefícios (R$ 250/mês)
- Supermercado Vital (Penedo)
- Farmácia Permanente (Penedo)

### 🤝 Parcerias
- Óticas Belle (30% todas unidades)
- Óticas Diniz (10-20% Penedo/Palmeira)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja LICENSE para detalhes

---

## 👥 Suporte

Para dúvidas ou problemas:

1. Verifique a seção [Troubleshooting](#-troubleshooting)
2. Abra uma issue no GitHub
3. Entre em contato com o RH/DP

---

## 🎉 Pronto!

Seu bot está configurado e pronto para usar. Digite `/beneficios` no Slack para testar!

**Dica:** Adicione novos colaboradores ao canal configurado para ver a mensagem automática de boas-vindas em ação! 🚀
