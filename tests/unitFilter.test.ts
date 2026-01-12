/**
 * Testes unitários para filtro de unidades
 */

import {
  filterBenefitsByUnit,
  parseUnit,
  getBenefitsCountByUnit,
  hasExclusiveBenefits,
} from '../src/utils/unitFilter';
import { Unit } from '../src/types';

describe('UnitFilter', () => {
  describe('parseUnit', () => {
    it('deve parsear nomes de unidades corretamente', () => {
      expect(parseUnit('Penedo')).toBe('penedo');
      expect(parseUnit('PENEDO')).toBe('penedo');
      expect(parseUnit('palmeira dos índios')).toBe('palmeira');
      expect(parseUnit('Loja Coruripe')).toBe('loja_coruripe');
      expect(parseUnit('todas')).toBe('todas');
    });

    it('deve retornar null para unidades inválidas', () => {
      expect(parseUnit('unidade_inexistente')).toBeNull();
      expect(parseUnit('')).toBeNull();
    });
  });

  describe('filterBenefitsByUnit', () => {
    it('deve retornar todos os benefícios para unidade "todas"', () => {
      const benefits = filterBenefitsByUnit('todas');
      expect(benefits.length).toBeGreaterThan(0);
    });

    it('deve filtrar benefícios por unidade específica', () => {
      const penedoBenefits = filterBenefitsByUnit('penedo');
      expect(penedoBenefits.length).toBeGreaterThan(0);

      // Verifica se todos incluem a unidade ou "todas"
      penedoBenefits.forEach((benefit) => {
        expect(
          benefit.units.includes('penedo') || benefit.units.includes('todas')
        ).toBe(true);
      });
    });

    it('deve incluir benefícios de "todas" em qualquer unidade', () => {
      const units: Unit[] = [
        'penedo',
        'palmeira',
        'loja_coruripe',
        'loja_teotonio',
        'vd_penedo',
        'vd_palmeira',
      ];

      units.forEach((unit) => {
        const benefits = filterBenefitsByUnit(unit);
        const hasBenefitsForAll = benefits.some((b) => b.units.includes('todas'));
        expect(hasBenefitsForAll).toBe(true);
      });
    });
  });

  describe('getBenefitsCountByUnit', () => {
    it('deve contar benefícios corretamente', () => {
      const countPenedo = getBenefitsCountByUnit('penedo');
      const countTodas = getBenefitsCountByUnit('todas');

      expect(countPenedo).toBeGreaterThan(0);
      expect(countTodas).toBeGreaterThanOrEqual(countPenedo);
    });
  });

  describe('hasExclusiveBenefits', () => {
    it('deve retornar false para "todas"', () => {
      expect(hasExclusiveBenefits('todas')).toBe(false);
    });

    it('Penedo deve ter benefícios exclusivos', () => {
      // Penedo tem Supermercado Vital e Farmácia Permanente
      expect(hasExclusiveBenefits('penedo')).toBe(true);
    });
  });
});
