# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-01-08

### Adicionado

#### Core Features
- Bot completo em TypeScript usando Slack Bolt
- Suporte para Socket Mode e HTTP Mode
- Sistema de logging estruturado com Pino
- Rate limiting com cache em memória (TTL 24h)
- Graceful shutdown com signal handlers

#### Mensagens e UX
- Mensagem de boas-vindas para novatos
- Mensagem de benefícios para colaboradores existentes
- Lista completa de benefícios com Block Kit
- Filtro de benefícios por unidade
- Seletor interativo de unidades
- Botões para navegação fácil
- Links configuráveis para RH/DP

#### Comandos Slash
- `/beneficios` - Consulta geral de benefícios
- `/beneficios-novato` - Mensagem de boas-vindas
- `/beneficios-time` - Mensagem para colaboradores
- `/beneficios-unidade [nome]` - Filtro por unidade

#### Eventos
- `member_joined_channel` - Boas-vindas automáticas
- `app_mention` - Responde quando mencionado

#### Interações
- Botão "Ver todos os benefícios"
- Botão "Ver por unidade"
- Menu dropdown de seleção de unidade
- Botão "Falar com RH/DP"

#### Benefícios Cadastrados
- **Produtos**: Descontos Grupo oBoticário (30% e 40%)
- **Saúde**: Odontológico, Conexa, Wellhub
- **Educação**: Unicesumar (70%), Unopar (20%)
- **Mobilidade**: Vale Transporte
- **Alimentação**: Caju (R$ 250), Supermercado Vital, Farmácia
- **Parcerias**: Óticas Belle, Óticas Diniz

#### Unidades Suportadas
- Todas as unidades (benefícios gerais)
- Penedo
- Palmeira dos Índios
- Loja Coruripe
- Loja Teotônio
- VD Penedo
- VD Palmeira

#### Infraestrutura
- Configuração via variáveis de ambiente
- Validação robusta de configuração
- Dockerfile e docker-compose
- Scripts de setup e validação
- Health check endpoint (HTTP mode)

#### Documentação
- README completo com instruções detalhadas
- QUICKSTART para setup rápido
- ARCHITECTURE para detalhes técnicos
- CONTRIBUTING para colaboradores
- Este CHANGELOG

#### Testes
- Testes unitários com Jest
- Coverage para unitFilter
- Configuração de CI-ready

#### Developer Experience
- TypeScript com strict mode
- ESLint configurado
- Prettier para formatação
- EditorConfig para consistência
- Hot reload com ts-node-dev
- Scripts NPM úteis

### Segurança
- Validação de tokens na inicialização
- Request signature verification (via Bolt)
- Usuário não-root no Docker
- Secrets via variáveis de ambiente
- Princípio do menor privilégio (scopes mínimos)

---

## [Unreleased]

### Planejado para v1.1.0

#### Features
- [ ] Persistência de cache com Redis
- [ ] Métricas e monitoring
- [ ] Notificações agendadas de benefícios
- [ ] Comando para admin gerenciar benefícios
- [ ] Suporte a múltiplos idiomas
- [ ] Analytics de uso dos benefícios

#### Melhorias
- [ ] Testes end-to-end
- [ ] CI/CD completo
- [ ] Performance profiling
- [ ] Cache de mensagens renderizadas
- [ ] Compressão de responses

#### Documentação
- [ ] Video tutorial
- [ ] FAQ expandido
- [ ] Exemplos de customização
- [ ] Guia de troubleshooting avançado

---

## Tipos de Mudanças

- `Adicionado` - Novas funcionalidades
- `Alterado` - Mudanças em funcionalidades existentes
- `Descontinuado` - Funcionalidades que serão removidas
- `Removido` - Funcionalidades removidas
- `Corrigido` - Correções de bugs
- `Segurança` - Correções de vulnerabilidades

---

## Versionamento

Este projeto usa [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Mudanças incompatíveis na API
- **MINOR** (x.1.x): Novas funcionalidades compatíveis
- **PATCH** (x.x.1): Correções de bugs compatíveis

---

## Links

- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [Conventional Commits](https://www.conventionalcommits.org/)
