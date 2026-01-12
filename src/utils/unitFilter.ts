/**
 * Funções para filtrar benefícios por unidade
 */

import { Benefit, Unit, BenefitCategory, CATEGORY_ORDER } from '../types';
import { getAllBenefits } from '../data/benefitsData';

/**
 * Filtra benefícios por unidade
 */
export function filterBenefitsByUnit(unit: Unit): Benefit[] {
  const allBenefits = getAllBenefits();

  if (unit === 'todas') {
    return allBenefits;
  }

  return allBenefits.filter(
    (benefit) => benefit.units.includes(unit) || benefit.units.includes('todas')
  );
}

/**
 * Agrupa benefícios por categoria
 */
export function groupBenefitsByCategory(benefits: Benefit[]): Map<BenefitCategory, Benefit[]> {
  const grouped = new Map<BenefitCategory, Benefit[]>();

  for (const benefit of benefits) {
    const existing = grouped.get(benefit.category) || [];
    existing.push(benefit);
    grouped.set(benefit.category, existing);
  }

  return grouped;
}

/**
 * Ordena categorias de benefícios conforme ordem definida
 */
export function sortBenefitCategories(
  categoriesMap: Map<BenefitCategory, Benefit[]>
): [BenefitCategory, Benefit[]][] {
  const entries = Array.from(categoriesMap.entries());

  return entries.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a[0]);
    const indexB = CATEGORY_ORDER.indexOf(b[0]);
    return indexA - indexB;
  });
}

/**
 * Converte string para tipo Unit (com validação)
 */
export function parseUnit(unitString: string): Unit | null {
  const normalized = unitString.toLowerCase().trim().replace(/\s+/g, '_');

  const unitMap: Record<string, Unit> = {
    todas: 'todas',
    'todas_as_unidades': 'todas',
    penedo: 'penedo',
    palmeira: 'palmeira',
    'palmeira_dos_índios': 'palmeira',
    'palmeira_dos_indios': 'palmeira',
    'loja_coruripe': 'loja_coruripe',
    coruripe: 'loja_coruripe',
    'loja_teotônio': 'loja_teotonio',
    'loja_teotonio': 'loja_teotonio',
    teotonio: 'loja_teotonio',
    teotônio: 'loja_teotonio',
    'vd_penedo': 'vd_penedo',
    'vd_palmeira': 'vd_palmeira',
  };

  return unitMap[normalized] || null;
}

/**
 * Retorna contagem de benefícios por unidade
 */
export function getBenefitsCountByUnit(unit: Unit): number {
  return filterBenefitsByUnit(unit).length;
}

/**
 * Verifica se uma unidade tem benefícios exclusivos
 */
export function hasExclusiveBenefits(unit: Unit): boolean {
  if (unit === 'todas') return false;

  const unitBenefits = filterBenefitsByUnit(unit);
  const allBenefits = getAllBenefits();

  return unitBenefits.length !== allBenefits.length;
}
