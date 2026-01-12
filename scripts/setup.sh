#!/bin/bash

# Script de setup automático para Bot de Benefícios Alcina Maria
# Facilita a configuração inicial do projeto

set -e

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║                                                ║"
echo "║   🎁  Setup Bot de Benefícios Alcina Maria     ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 20+ primeiro."
    echo "   Visite: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js versão $NODE_VERSION detectada. Recomendado: 20+"
    read -p "Continuar mesmo assim? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# Instala dependências
echo "📦 Instalando dependências..."
npm install

echo ""
echo "✅ Dependências instaladas"
echo ""

# Cria arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais:"
    echo "   - SLACK_BOT_TOKEN"
    echo "   - SLACK_APP_TOKEN"
    echo "   - SLACK_SIGNING_SECRET"
    echo "   - WELCOME_CHANNEL_ID"
    echo ""
    echo "   Veja o README.md para instruções detalhadas."
    echo ""
else
    echo "ℹ️  Arquivo .env já existe. Pulando..."
    echo ""
fi

# Compila TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

echo ""
echo "✅ Compilação concluída"
echo ""

# Testa
echo "🧪 Executando testes..."
npm test

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║                                                ║"
echo "║   ✅  Setup Concluído com Sucesso!             ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Configure o arquivo .env com suas credenciais"
echo "2. Execute: npm run dev"
echo "3. Teste no Slack com: /beneficios"
echo ""
echo "📖 Veja o README.md para mais detalhes"
echo ""
