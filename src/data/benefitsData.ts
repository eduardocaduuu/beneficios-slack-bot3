/**
 * Base de dados completa dos benefícios do Grupo Alcina Maria
 * Fonte única de verdade para todos os benefícios oferecidos
 */

import { Benefit } from '../types';

export const benefits: Benefit[] = [
  // ==================== DESCONTOS EM PRODUTOS ====================
  {
    id: 'desc_oboticario_30',
    title: 'Desconto de 30% em produtos do Grupo oBoticário',
    description:
      'Desconto de 30% em todos os produtos das marcas oBoticário, Eudora, Quem Disse Berenice? e O.U.I',
    category: 'produtos',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    details: 'Exceto acessórios',
  },
  {
    id: 'desc_maquiagem_40',
    title: 'Desconto de 40% em maquiagem',
    description:
      'Desconto especial de 40% em maquiagem das marcas oBoticário, Eudora, Quem Disse Berenice? e O.U.I',
    category: 'produtos',
    units: ['vd_penedo', 'vd_palmeira', 'loja_coruripe', 'loja_teotonio'],
    roles: [
      'Caixa VD',
      'Recepcionista VD',
      'Supervisora VD',
      'Consultora de loja',
      'Gerente de loja',
    ],
    details: 'Benefício exclusivo para cargos específicos de vendas e atendimento',
  },

  // ==================== SAÚDE E BEM-ESTAR ====================
  {
    id: 'plano_odonto',
    title: 'Plano Odontológico',
    description: 'Plano odontológico completo para cuidar da sua saúde bucal',
    category: 'saude',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    details: 'Mensalidade com desconto em folha de pagamento',
    howToRequest: 'Entre em contato com o RH/DP para saber como solicitar',
  },
  {
    id: 'plano_conexa',
    title: 'Plano Conexa Saúde',
    description: '2 consultas médicas online gratuitas por mês através da plataforma Conexa',
    category: 'saude',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    details: 'Atendimento médico online com praticidade e qualidade',
  },
  {
    id: 'wellhub_gympass',
    title: 'Wellhub (Gympass)',
    description: 'Acesso a rede de academias e espaços wellness com desconto',
    category: 'saude',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    details: 'Descontos em academias parceiras do Wellhub (antigo Gympass)',
  },

  // ==================== EDUCAÇÃO ====================
  {
    id: 'unicesumar',
    title: 'Unicesumar - 70% de desconto',
    description: 'Bolsa de 70% de desconto na Unicesumar, pagamento via boleto',
    category: 'educacao',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    details: 'Cursos de graduação e pós-graduação',
  },
  {
    id: 'unopar',
    title: 'Unopar - 20% de desconto',
    description: 'Desconto de 20% na Unopar, pagamento via boleto',
    category: 'educacao',
    units: ['vd_penedo', 'vd_palmeira', 'loja_coruripe', 'loja_teotonio'],
    details: 'Disponível para as unidades: VD Penedo, VD Palmeira, Loja Coruripe e Loja Teotônio',
  },

  // ==================== MOBILIDADE ====================
  {
    id: 'vale_transporte',
    title: 'Vale Transporte',
    description: 'Vale transporte com desconto de 6% em folha de pagamento',
    category: 'mobilidade',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    howToRequest: 'Solicite ao RH/DP conforme sua necessidade de deslocamento',
  },

  // ==================== PARCERIAS E CONVÊNIOS ====================
  {
    id: 'oticas_belle',
    title: 'Óticas Belle - 30% de desconto',
    description: 'Desconto de 30% na Óticas Belle em folha de pagamento, dinheiro, pix ou cartão',
    category: 'parcerias',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
  },
  {
    id: 'oticas_diniz',
    title: 'Óticas Diniz - 10% a 20% de desconto',
    description: 'Desconto de 10% a 20% na Óticas Diniz em dinheiro, pix ou cartão',
    category: 'parcerias',
    units: ['penedo', 'palmeira', 'vd_penedo', 'vd_palmeira'],
    details: 'Disponível nas unidades de Penedo e Palmeira dos Índios',
  },

  // ==================== ALIMENTAÇÃO ====================
  {
    id: 'caju_beneficios',
    title: 'Caju Benefícios - R$ 250,00',
    description:
      'Crédito mensal de R$ 250,00 para usar em supermercados, restaurantes e muito mais',
    category: 'alimentacao',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    details: 'Cartão Caju com multibenefícios flexíveis',
  },
  {
    id: 'supermercado_vital',
    title: 'Convênio Supermercado Vital',
    description: 'Desconto de 4% nas compras com desconto direto em folha de pagamento',
    category: 'alimentacao',
    units: ['penedo', 'vd_penedo'],
    details: 'Disponível apenas para unidades de Penedo',
  },
  {
    id: 'farmacia_permanente',
    title: 'Convênio Farmácia Permanente',
    description: 'Compras com desconto em folha e possibilidade de parcelamento',
    category: 'alimentacao',
    units: [
      'todas',
      'penedo',
      'palmeira',
      'loja_coruripe',
      'loja_teotonio',
      'vd_penedo',
      'vd_palmeira',
    ],
    details: 'Disponível em todas as cidades que têm a farmácia permanente, inclusive pode ser usado em Maceió, Arapiraca e fora do Estado. Pode ser usado em qualquer farmácia Permanente do país.',
  },
];

/**
 * Retorna todos os benefícios
 */
export function getAllBenefits(): Benefit[] {
  return benefits;
}

/**
 * Busca benefício por ID
 */
export function getBenefitById(id: string): Benefit | undefined {
  return benefits.find((b) => b.id === id);
}

/**
 * Retorna benefícios por categoria
 */
export function getBenefitsByCategory(category: string): Benefit[] {
  return benefits.filter((b) => b.category === category);
}
