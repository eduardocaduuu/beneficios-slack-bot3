/**
 * Tipos e interfaces do Bot de Benefícios
 */

export type Unit =
  | 'todas'
  | 'penedo'
  | 'palmeira'
  | 'loja_coruripe'
  | 'loja_teotonio'
  | 'vd_penedo'
  | 'vd_palmeira';

export type BenefitCategory =
  | 'produtos'
  | 'saude'
  | 'educacao'
  | 'mobilidade'
  | 'parcerias'
  | 'alimentacao';

export interface Benefit {
  id: string;
  title: string;
  description: string;
  category: BenefitCategory;
  units: Unit[];
  roles?: string[]; // Cargos específicos (se aplicável)
  details?: string; // Detalhes adicionais
  howToRequest?: string; // Como solicitar
}

export interface AppConfig {
  slackBotToken: string;
  slackAppToken: string;
  slackSigningSecret: string;
  welcomeChannelId: string;
  sendDm: boolean;
  defaultLocale: string;
  rhContactLink: string;
  appMode: 'socket' | 'http';
  port: number;
  logLevel: string;
  nodeEnv: string;
}

export interface MessageCache {
  userId: string;
  timestamp: number;
  messageType: string;
}

export const UNIT_LABELS: Record<Unit, string> = {
  todas: 'Todas as unidades',
  penedo: 'Penedo',
  palmeira: 'Palmeira dos Índios',
  loja_coruripe: 'Loja Coruripe',
  loja_teotonio: 'Loja Teotônio',
  vd_penedo: 'VD Penedo',
  vd_palmeira: 'VD Palmeira',
};

export const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  produtos: '🛍️ Descontos em Produtos',
  saude: '🏥 Saúde e Bem-Estar',
  educacao: '📚 Educação',
  mobilidade: '🚌 Mobilidade',
  parcerias: '🤝 Parcerias e Convênios',
  alimentacao: '🍽️ Alimentação',
};

export const CATEGORY_ORDER: BenefitCategory[] = [
  'produtos',
  'saude',
  'educacao',
  'mobilidade',
  'alimentacao',
  'parcerias',
];
