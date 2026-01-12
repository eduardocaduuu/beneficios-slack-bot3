# Dockerfile para Bot de Benefícios Alcina Maria
# Node.js 20 Alpine (imagem leve)

FROM node:20-alpine AS builder

# Instala dependências necessárias
RUN apk add --no-cache python3 make g++

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependências
RUN npm ci

# Copia código fonte
COPY src ./src

# Compila TypeScript
RUN npm run build

# ===== STAGE 2: Production =====
FROM node:20-alpine

# Metadados
LABEL maintainer="Alcina Maria"
LABEL description="Slack Bot para gerenciar benefícios dos colaboradores"

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Copia código compilado do builder
COPY --from=builder /app/dist ./dist

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Muda para usuário não-root
USER nodejs

# Expõe porta (apenas para HTTP mode)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Comando de inicialização
CMD ["node", "dist/index.js"]
