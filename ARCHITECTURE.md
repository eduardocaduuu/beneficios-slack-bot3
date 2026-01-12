# Arquitetura do Bot de Benefícios

Este documento descreve a arquitetura técnica do Bot de Benefícios Alcina Maria.

## Visão Geral

O bot é construído usando **Slack Bolt** (framework oficial do Slack) com **TypeScript** e **Node.js**. A arquitetura segue princípios de separação de responsabilidades e modularidade.

## Estrutura de Camadas

```
┌─────────────────────────────────────────────┐
│           Slack Platform                    │
│  (Events, Commands, Actions, Messages)      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│           Handlers Layer                    │
│  ┌──────────┬───────────┬──────────────┐   │
│  │ Events   │ Commands  │   Actions    │   │
│  └──────────┴───────────┴──────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         Services Layer                      │
│  ┌──────────────┬──────────────────────┐   │
│  │ Slack App    │   Cache Service      │   │
│  └──────────────┴──────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│           Utils Layer                       │
│  ┌──────────┬──────────────┬──────────┐    │
│  │ Messages │ Unit Filter  │  Logger  │    │
│  └──────────┴──────────────┴──────────┘    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            Data Layer                       │
│         Benefits Database                   │
└─────────────────────────────────────────────┘
```

## Componentes Principais

### 1. Entry Point (`src/index.ts`)

- Inicializa a aplicação
- Gerencia lifecycle (startup/shutdown)
- Configura tratamento de erros globais
- Registra signal handlers

### 2. Slack App Service (`src/services/slackApp.ts`)

**Responsabilidades:**
- Cria instância do Slack Bolt App
- Configura Socket Mode ou HTTP Mode
- Registra todos os handlers
- Gerencia inicialização e parada do bot

**Modos de Operação:**

#### Socket Mode (Desenvolvimento)
- Conexão WebSocket bidirecional
- Não requer URL pública
- Ideal para desenvolvimento local
- Usa `SLACK_APP_TOKEN`

#### HTTP Mode (Produção)
- Recebe eventos via HTTP POST
- Requer URL pública
- Escalável horizontalmente
- Usa webhook endpoints

### 3. Handlers Layer

#### Events Handler (`src/handlers/events.ts`)

Processa eventos assíncronos do Slack:

- `member_joined_channel`: Novo membro no canal
  - Valida se é o canal configurado
  - Verifica rate limit
  - Envia mensagem de boas-vindas
  - Envia DM (opcional)

- `app_mention`: Bot mencionado
  - Responde com menu de opções

#### Commands Handler (`src/handlers/commands.ts`)

Processa comandos slash:

- `/beneficios`: Menu geral
- `/beneficios-novato`: Mensagem para novatos
- `/beneficios-time`: Mensagem para time
- `/beneficios-unidade [nome]`: Filtro por unidade

**Fluxo:**
1. Ack (acknowledge) imediato
2. Parse de argumentos (se houver)
3. Busca dados necessários
4. Constrói mensagem
5. Responde (ephemeral ou público)

#### Actions Handler (`src/handlers/actions.ts`)

Processa interações (botões, menus):

- `view_all_benefits`: Mostra todos benefícios
- `view_by_unit`: Mostra seletor de unidade
- `unit_select`: Processa seleção de unidade

**Fluxo:**
1. Ack imediato
2. Extrai dados da ação
3. Processa lógica
4. Responde (replace_original ou nova mensagem)

### 4. Services Layer

#### Cache Service (`src/services/cacheService.ts`)

**Função:** Rate limiting e prevenção de spam

**Implementação:**
- Cache em memória (Map)
- TTL de 24 horas
- Chave: `userId:messageType`
- Limpeza automática periódica

**Métodos:**
- `canSendMessage()`: Verifica se pode enviar
- `markMessageSent()`: Marca como enviado
- `clearUserCache()`: Limpa cache de usuário
- `cleanExpiredCache()`: Limpeza automática

### 5. Utils Layer

#### Message Builders (`src/utils/messageBuilders.ts`)

**Função:** Constrói mensagens usando Block Kit

**Mensagens:**
- `buildWelcomeMessageForNewbie()`: Boas-vindas novato
- `buildBenefitsMessageForTeam()`: Benefícios time
- `buildDetailedBenefitsMessage()`: Lista completa
- `buildUnitSelectorMessage()`: Menu de unidades
- `buildBenefitsForUnitMessage()`: Filtrado por unidade
- `buildErrorMessage()`: Mensagem de erro

**Block Kit:**
- `header`: Título destacado
- `section`: Conteúdo markdown
- `divider`: Separador visual
- `actions`: Botões interativos
- `context`: Texto secundário

#### Unit Filter (`src/utils/unitFilter.ts`)

**Função:** Filtragem e agrupamento de benefícios

**Métodos:**
- `filterBenefitsByUnit()`: Filtra por unidade
- `groupBenefitsByCategory()`: Agrupa por categoria
- `sortBenefitCategories()`: Ordena categorias
- `parseUnit()`: Converte string para Unit
- `getBenefitsCountByUnit()`: Conta benefícios
- `hasExclusiveBenefits()`: Detecta exclusivos

**Lógica:**
- Benefícios com `units: ['todas']` aparecem em todas
- Benefícios específicos aparecem apenas nas unidades listadas
- Filtro case-insensitive com normalização

#### Logger (`src/utils/logger.ts`)

**Função:** Logging estruturado

**Implementação:**
- Biblioteca: Pino (alta performance)
- Pretty print em desenvolvimento
- JSON estruturado em produção
- Níveis: trace, debug, info, warn, error, fatal

**Métodos:**
- `logger.info()`, `logger.error()`, etc.
- `logError()`: Log de erro com contexto
- `logSlackEvent()`: Log de evento do Slack

### 6. Data Layer

#### Benefits Data (`src/data/benefitsData.ts`)

**Função:** Fonte única de verdade para benefícios

**Estrutura:**
```typescript
interface Benefit {
  id: string;              // Identificador único
  title: string;           // Título do benefício
  description: string;     // Descrição
  category: BenefitCategory; // Categoria
  units: Unit[];           // Unidades aplicáveis
  roles?: string[];        // Cargos específicos (opcional)
  details?: string;        // Detalhes adicionais (opcional)
  howToRequest?: string;   // Como solicitar (opcional)
}
```

**Categorias:**
- `produtos`: Descontos em produtos
- `saude`: Saúde e bem-estar
- `educacao`: Educação
- `mobilidade`: Transporte
- `alimentacao`: Alimentação
- `parcerias`: Parcerias e convênios

### 7. Config Layer

#### Environment (`src/config/environment.ts`)

**Função:** Configuração e validação de ambiente

**Validações:**
- Variáveis obrigatórias presentes
- Formato de tokens correto
- IDs de canal válidos
- Valores de enum válidos

**Carregamento:**
1. Lê `.env` com dotenv
2. Valida cada variável
3. Aplica defaults
4. Retorna objeto tipado `AppConfig`
5. Falha fast se inválido

### 8. Types Layer

#### Types (`src/types/index.ts`)

**Função:** Definições TypeScript

**Tipos principais:**
- `Unit`: Unidades da empresa
- `BenefitCategory`: Categorias de benefícios
- `Benefit`: Estrutura de benefício
- `AppConfig`: Configuração da app
- `MessageCache`: Entrada de cache

**Constantes:**
- `UNIT_LABELS`: Labels legíveis das unidades
- `CATEGORY_LABELS`: Labels com emojis
- `CATEGORY_ORDER`: Ordem de exibição

## Fluxos de Dados

### Fluxo: Novo Membro no Canal

```
1. Slack envia evento member_joined_channel
   ↓
2. events.ts recebe evento
   ↓
3. Valida: é o canal correto?
   ↓
4. cacheService: pode enviar mensagem?
   ↓
5. messageBuilders: constrói mensagem
   ↓
6. Slack API: envia no canal + DM (opcional)
   ↓
7. cacheService: marca como enviado
```

### Fluxo: Comando /beneficios-unidade

```
1. Usuário digita /beneficios-unidade penedo
   ↓
2. commands.ts recebe comando
   ↓
3. Ack imediato
   ↓
4. unitFilter: parse "penedo" → Unit
   ↓
5. benefitsData: busca todos benefícios
   ↓
6. unitFilter: filtra por unidade
   ↓
7. messageBuilders: constrói mensagem
   ↓
8. Responde (ephemeral)
```

### Fluxo: Seleção de Unidade

```
1. Usuário clica botão "Ver por unidade"
   ↓
2. actions.ts: view_by_unit
   ↓
3. Ack imediato
   ↓
4. messageBuilders: constrói seletor
   ↓
5. Responde com menu dropdown
   ↓
6. Usuário seleciona unidade
   ↓
7. actions.ts: unit_select
   ↓
8. Extrai valor selecionado
   ↓
9. Filtra benefícios
   ↓
10. Responde (replace_original)
```

## Padrões e Práticas

### Error Handling

**Estratégia:** Fail gracefully

- Handlers têm try/catch individual
- Erros são logados estruturadamente
- Usuário recebe mensagem de erro amigável
- App não crasha por erro individual

```typescript
try {
  // lógica
} catch (error) {
  logError('Contexto do erro', error, { dados });
  await respond(buildErrorMessage('Mensagem amigável'));
}
```

### Rate Limiting

**Estratégia:** Cache em memória com TTL

- Previne spam de mensagens duplicadas
- TTL: 24 horas
- Chave: `userId:messageType`
- Limpeza automática periódica

### Logging

**Estratégia:** Structured logging

- Logs estruturados em JSON
- Contexto rico (userId, event, etc.)
- Níveis apropriados (debug, info, error)
- Pretty print em dev, JSON em prod

### Type Safety

**Estratégia:** TypeScript estrito

- `strict: true` no tsconfig
- Interfaces para todos os dados
- Type guards onde necessário
- Sem `any` (ou mínimo possível)

### Testabilidade

**Estratégia:** Funções puras onde possível

- Lógica separada de I/O
- Funções pequenas e focadas
- Injeção de dependências implícita
- Testes unitários para lógica de negócio

## Escalabilidade

### Vertical

- Node.js single-threaded
- Bottleneck: CPU para parsing/rendering
- Solução: Otimizar parsing e caching

### Horizontal

- Socket Mode: não escala (1 processo)
- HTTP Mode: escala horizontalmente
- Stateless (exceto cache em memória)
- Para escalar: usar Redis para cache compartilhado

### Performance

**Otimizações atuais:**
- Cache de mensagens (rate limit)
- Limpeza periódica de cache
- Logging assíncrono (Pino)
- Ack imediato antes de processar

**Otimizações futuras:**
- Cache de mensagens Block Kit renderizadas
- Compressão de responses
- CDN para assets (se houver)
- Redis para cache distribuído

## Segurança

### Validação

- Tokens validados na inicialização
- Request signature verificada (Bolt faz isso)
- IDs de canal validados
- Input sanitizado

### Secrets

- Nunca commitar `.env`
- Usar variáveis de ambiente
- Rotacionar tokens periodicamente
- Princípio do menor privilégio (scopes mínimos)

### Isolation

- Usuário não-root no Docker
- Sem acesso a filesystem desnecessário
- Network isolada no docker-compose
- Health checks para monitoramento

## Monitoramento

### Logs

- Structured logging via Pino
- Níveis apropriados
- Contexto rico
- Fácil parsing e análise

### Health Checks

- Endpoint `/health` (HTTP mode)
- Docker health check
- Verifica se app está respondendo

### Metrics (futuro)

- Contador de mensagens enviadas
- Tempo de resposta de comandos
- Erros por tipo
- Uso de memória

## Deployment

### Desenvolvimento

- Socket Mode
- Hot reload (ts-node-dev)
- Logs verbose
- .env local

### Produção

- HTTP Mode
- Docker container
- Logs JSON
- Variáveis de ambiente do sistema
- Health checks
- Auto-restart (docker-compose)

### CI/CD (sugerido)

1. Lint + Type check
2. Tests
3. Build Docker image
4. Push para registry
5. Deploy com rolling update
6. Health check
7. Rollback se falhar

## Manutenção

### Adicionar Benefício

1. Editar `src/data/benefitsData.ts`
2. Adicionar objeto `Benefit`
3. Testar localmente
4. Commit e deploy

### Adicionar Comando

1. Registrar comando no Slack App
2. Adicionar handler em `src/handlers/commands.ts`
3. Adicionar testes
4. Documentar no README

### Adicionar Unidade

1. Adicionar em `Unit` type
2. Adicionar em `UNIT_LABELS`
3. Atualizar seletor de unidade
4. Atualizar benefícios aplicáveis

## Referências

- [Slack Bolt Documentation](https://slack.dev/bolt-js/)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/)
- [Slack API Methods](https://api.slack.com/methods)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Pino Logger](https://getpino.io/)
