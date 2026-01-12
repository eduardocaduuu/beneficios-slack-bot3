/**
 * Construtores de mensagens usando Slack Block Kit
 * Cria mensagens bonitas e interativas para o Slack
 */

import { Block, KnownBlock } from '@slack/bolt';
import { Unit, UNIT_LABELS, CATEGORY_LABELS } from '../types';
import { config } from '../config/environment';
import {
  filterBenefitsByUnit,
  groupBenefitsByCategory,
  sortBenefitCategories,
} from './unitFilter';

/**
 * Mensagem de boas-vindas para NOVATOS
 */
export function buildWelcomeMessageForNewbie(userId: string): (Block | KnownBlock)[] {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🎉 Bem-vindo(a) ao time Alcina Maria!',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Olá <@${userId}>! Seja muito bem-vindo(a) à família Alcina Maria! 🌟\n\nEstamos muito felizes em ter você conosco. A partir de agora, *você já tem acesso a uma série de benefícios* que vão facilitar seu dia a dia e cuidar do seu bem-estar.`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Seus benefícios disponíveis:*',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `
🛍️ *Descontos em Produtos*
• 30% em produtos oBoticário, Eudora, QDB e O.U.I
• 40% em maquiagem (para cargos específicos)

🏥 *Saúde e Bem-Estar*
• Plano Odontológico completo
• Plano Conexa: 2 consultas online gratuitas/mês
• Wellhub (Gympass): acesso a academias

📚 *Educação*
• Unicesumar: 70% de desconto
• Unopar: 20% de desconto (unidades selecionadas)

🍽️ *Alimentação*
• Caju Benefícios: R$ 250,00/mês
• Convênios com supermercados e farmácias

🚌 *Mobilidade*
• Vale Transporte (6% em folha)

🤝 *Parcerias*
• Óticas Belle: 30% de desconto
• Óticas Diniz: 10-20% de desconto
• E muito mais!
        `,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '💡 *Importante:* Alguns benefícios podem variar conforme sua unidade e cargo. Use os botões abaixo para ver os benefícios específicos para você.',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 Ver todos os benefícios',
            emoji: true,
          },
          style: 'primary',
          action_id: 'view_all_benefits',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🏢 Ver por unidade',
            emoji: true,
          },
          action_id: 'view_by_unit',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '💬 Falar com RH/DP',
            emoji: true,
          },
          url: config.rhContactLink,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '🤖 _A qualquer momento, digite `/beneficios` para consultar seus benefícios novamente._',
        },
      ],
    },
  ];
}

/**
 * Mensagem de benefícios para COLABORADORES ANTIGOS
 */
export function buildBenefitsMessageForTeam(userId?: string): (Block | KnownBlock)[] {
  const greeting = userId
    ? `Olá <@${userId}>! 👋`
    : 'Olá! 👋';

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '✨ Seus Benefícios Alcina Maria',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${greeting}\n\nSabia que você tem acesso a *diversos benefícios exclusivos* como colaborador? Talvez você ainda não conheça todos! Dá uma olhada na lista completa abaixo. 🎁`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `
🛍️ *Descontos em Produtos*
• 30% em produtos do Grupo oBoticário
• Até 40% em maquiagem (cargos específicos)

🏥 *Saúde e Bem-Estar*
• Plano Odontológico
• Plano Conexa: 2 consultas online/mês
• Wellhub (Gympass)

📚 *Educação*
• Unicesumar: 70% de desconto
• Unopar: 20% de desconto

🍽️ *Alimentação*
• Caju Benefícios: R$ 250,00/mês
• Convênios locais

🚌 *Mobilidade*
• Vale Transporte

🤝 *Parcerias*
• Óticas Belle e Diniz
• Supermercados e farmácias
        `,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '💡 Alguns benefícios dependem da sua unidade e cargo. Explore as opções abaixo!',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 Ver detalhes completos',
            emoji: true,
          },
          style: 'primary',
          action_id: 'view_all_benefits',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🏢 Filtrar por unidade',
            emoji: true,
          },
          action_id: 'view_by_unit',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '💬 Falar com RH/DP',
            emoji: true,
          },
          url: config.rhContactLink,
        },
      ],
    },
  ];
}

/**
 * Mensagem com todos os benefícios detalhados
 */
export function buildDetailedBenefitsMessage(): (Block | KnownBlock)[] {
  const benefits = filterBenefitsByUnit('todas');
  const grouped = groupBenefitsByCategory(benefits);
  const sorted = sortBenefitCategories(grouped);

  const blocks: (Block | KnownBlock)[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 Benefícios Completos - Alcina Maria',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Aqui está a lista completa de todos os benefícios disponíveis:',
      },
    },
    {
      type: 'divider',
    },
  ];

  // Adiciona cada categoria
  for (const [category, categoryBenefits] of sorted) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${CATEGORY_LABELS[category]}*`,
      },
    });

    for (const benefit of categoryBenefits) {
      let text = `• *${benefit.title}*\n  ${benefit.description}`;

      if (benefit.details) {
        text += `\n  _${benefit.details}_`;
      }

      if (benefit.roles && benefit.roles.length > 0) {
        text += `\n  👥 Cargos: ${benefit.roles.join(', ')}`;
      }

      if (benefit.howToRequest) {
        text += `\n  ℹ️ ${benefit.howToRequest}`;
      }

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      });
    }

    blocks.push({
      type: 'divider',
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: '💡 Para ver benefícios específicos da sua unidade, use o botão "Ver por unidade".',
      },
    ],
  });

  return blocks;
}

/**
 * Mensagem com seletor de unidade
 */
export function buildUnitSelectorMessage(): (Block | KnownBlock)[] {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🏢 Benefícios por Unidade',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Selecione sua unidade para ver os benefícios disponíveis:',
      },
      accessory: {
        type: 'static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Escolha sua unidade',
          emoji: true,
        },
        action_id: 'unit_select',
        options: [
          {
            text: {
              type: 'plain_text',
              text: UNIT_LABELS.todas,
              emoji: true,
            },
            value: 'todas',
          },
          {
            text: {
              type: 'plain_text',
              text: UNIT_LABELS.penedo,
              emoji: true,
            },
            value: 'penedo',
          },
          {
            text: {
              type: 'plain_text',
              text: UNIT_LABELS.palmeira,
              emoji: true,
            },
            value: 'palmeira',
          },
          {
            text: {
              type: 'plain_text',
              text: UNIT_LABELS.loja_coruripe,
              emoji: true,
            },
            value: 'loja_coruripe',
          },
          {
            text: {
              type: 'plain_text',
              text: UNIT_LABELS.loja_teotonio,
              emoji: true,
            },
            value: 'loja_teotonio',
          },
          {
            text: {
              type: 'plain_text',
              text: UNIT_LABELS.vd_penedo,
              emoji: true,
            },
            value: 'vd_penedo',
          },
          {
            text: {
              type: 'plain_text',
              text: UNIT_LABELS.vd_palmeira,
              emoji: true,
            },
            value: 'vd_palmeira',
          },
        ],
      },
    },
  ];
}

/**
 * Mensagem com benefícios filtrados por unidade
 */
export function buildBenefitsForUnitMessage(unit: Unit): (Block | KnownBlock)[] {
  // Valida se a unidade existe
  if (!UNIT_LABELS[unit]) {
    logger.error(`Unidade inválida ao construir mensagem: ${unit}`);
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ Erro: Unidade "${unit}" não encontrada.`,
        },
      },
    ];
  }

  const benefits = filterBenefitsByUnit(unit);
  const grouped = groupBenefitsByCategory(benefits);
  const sorted = sortBenefitCategories(grouped);

  const unitName = UNIT_LABELS[unit];

  const blocks: (Block | KnownBlock)[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📍 Benefícios - ${unitName}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Aqui estão os benefícios disponíveis para *${unitName}*:`,
      },
    },
    {
      type: 'divider',
    },
  ];

  // Adiciona cada categoria
  for (const [category, categoryBenefits] of sorted) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${CATEGORY_LABELS[category]}*`,
      },
    });

    for (const benefit of categoryBenefits) {
      let text = `• *${benefit.title}*\n  ${benefit.description}`;

      if (benefit.details) {
        text += `\n  _${benefit.details}_`;
      }

      if (benefit.roles && benefit.roles.length > 0) {
        text += `\n  👥 Cargos: ${benefit.roles.join(', ')}`;
      }

      if (benefit.howToRequest) {
        text += `\n  ℹ️ ${benefit.howToRequest}`;
      }

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      });
    }

    blocks.push({
      type: 'divider',
    });
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '🔄 Ver outra unidade',
          emoji: true,
        },
        action_id: 'view_by_unit',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '💬 Falar com RH/DP',
          emoji: true,
        },
        url: config.rhContactLink,
      },
    ],
  });

  return blocks;
}

/**
 * Mensagem de erro genérica
 */
export function buildErrorMessage(errorMessage: string): (Block | KnownBlock)[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `❌ *Ops! Algo deu errado.*\n\n${errorMessage}\n\nPor favor, tente novamente ou entre em contato com o RH/DP.`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '💬 Falar com RH/DP',
            emoji: true,
          },
          url: config.rhContactLink,
        },
      ],
    },
  ];
}
