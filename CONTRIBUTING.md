# Guia de Contribuição

Obrigado por considerar contribuir com o Bot de Benefícios Alcina Maria!

## Como Contribuir

### 1. Reporte Bugs

Se encontrar um bug, por favor abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots se aplicável
- Versão do Node.js e do bot

### 2. Sugira Melhorias

Sugestões são bem-vindas! Abra uma issue com:
- Descrição da funcionalidade
- Caso de uso / problema que resolve
- Exemplos de como funcionaria

### 3. Contribua com Código

#### Setup Local

1. Fork o repositório
2. Clone seu fork:
```bash
git clone https://github.com/seu-usuario/BotBeneficios.git
cd BotBeneficios
```

3. Instale dependências:
```bash
npm install
```

4. Configure `.env` conforme o README

5. Crie uma branch:
```bash
git checkout -b feature/minha-feature
```

#### Padrões de Código

- Use TypeScript
- Siga o ESLint configurado
- Use Prettier para formatação
- Escreva código limpo e comentado
- Adicione testes quando apropriado

#### Processo de PR

1. Certifique-se de que o código compila:
```bash
npm run build
```

2. Execute testes:
```bash
npm test
```

3. Execute linter:
```bash
npm run lint
```

4. Commit suas mudanças:
```bash
git commit -m "feat: adiciona nova funcionalidade X"
```

Use conventional commits:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` manutenção

5. Push para seu fork:
```bash
git push origin feature/minha-feature
```

6. Abra Pull Request no GitHub

#### Checklist de PR

- [ ] Código compila sem erros
- [ ] Testes passam
- [ ] Lint passa
- [ ] README atualizado se necessário
- [ ] Comentários úteis no código
- [ ] Sem console.log desnecessários
- [ ] Variáveis de ambiente documentadas

### 4. Adicionar Novos Benefícios

Para adicionar benefícios:

1. Edite `src/data/benefitsData.ts`
2. Adicione objeto do tipo `Benefit`:

```typescript
{
  id: 'id_unico',
  title: 'Título do Benefício',
  description: 'Descrição clara',
  category: 'categoria', // produtos, saude, educacao, etc
  units: ['unidades', 'aplicáveis'],
  roles: ['cargos'], // opcional
  details: 'Detalhes adicionais', // opcional
  howToRequest: 'Como solicitar', // opcional
}
```

3. Teste localmente
4. Abra PR com as mudanças

## Código de Conduta

- Seja respeitoso e profissional
- Aceite feedback construtivo
- Foque no que é melhor para o projeto
- Mostre empatia com outros contribuidores

## Dúvidas?

Abra uma issue com a tag `question` ou entre em contato com a equipe.

Obrigado por contribuir! 🎉
