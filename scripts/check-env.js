#!/usr/bin/env node

/**
 * Script para validar arquivo .env
 * Execute: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const requiredVars = [
  'SLACK_BOT_TOKEN',
  'SLACK_APP_TOKEN',
  'SLACK_SIGNING_SECRET',
  'WELCOME_CHANNEL_ID',
];

console.log('\n🔍 Verificando arquivo .env...\n');

// Verifica se .env existe
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  console.log('💡 Execute: cp .env.example .env');
  process.exit(1);
}

// Lê arquivo .env
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    envVars[key] = value;
  }
});

// Valida variáveis obrigatórias
let hasErrors = false;

requiredVars.forEach((varName) => {
  const value = envVars[varName];

  if (!value) {
    console.error(`❌ ${varName} não está definida`);
    hasErrors = true;
  } else if (value.includes('your-') || value.includes('xoxb-seu-') || value.includes('xapp-seu-')) {
    console.error(`❌ ${varName} contém valor de exemplo. Configure com valor real.`);
    hasErrors = true;
  } else {
    // Validações específicas
    if (varName === 'SLACK_BOT_TOKEN' && !value.startsWith('xoxb-')) {
      console.error(`❌ ${varName} deve começar com 'xoxb-'`);
      hasErrors = true;
    } else if (varName === 'SLACK_APP_TOKEN' && !value.startsWith('xapp-')) {
      console.error(`❌ ${varName} deve começar com 'xapp-'`);
      hasErrors = true;
    } else if (varName === 'WELCOME_CHANNEL_ID' && !value.match(/^C[A-Z0-9]+$/)) {
      console.warn(`⚠️  ${varName} não parece ser um ID de canal válido (formato: C1234567890)`);
    } else {
      console.log(`✅ ${varName} configurado`);
    }
  }
});

// Verifica variáveis opcionais
const optionalVars = ['SEND_DM', 'RH_CONTACT_LINK', 'APP_MODE', 'LOG_LEVEL'];

console.log('\nℹ️  Variáveis opcionais:');
optionalVars.forEach((varName) => {
  const value = envVars[varName];
  if (value) {
    console.log(`  ✓ ${varName} = ${value}`);
  } else {
    console.log(`  - ${varName} (usando padrão)`);
  }
});

// Resultado final
console.log('');
if (hasErrors) {
  console.error('❌ Configuração .env tem erros. Corrija antes de executar o bot.\n');
  process.exit(1);
} else {
  console.log('✅ Arquivo .env está válido!\n');
  console.log('💡 Execute: npm run dev\n');
  process.exit(0);
}
