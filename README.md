# nutri. — Diário alimentar

MVP mobile-first com Next.js App Router, TypeScript, Tailwind CSS, DaisyUI e Lucide. O diário fica exclusivamente em memória: atualizar ou fechar a página apaga as refeições. Não há login, histórico, localStorage, IndexedDB nem gravações no Directus.

## Executar

Use Node.js 20.9 ou superior e npm.

```powershell
npm install
Copy-Item .env.example .env.local
# O catálogo local já está habilitado; Directus não é necessário neste modo.
npm run dev
```

Abra http://localhost:3000. Para produção: `npm run build` e `npm start`.

## Usar o catálogo local

O JSON fornecido está em `src/data/directus-mock-plano-alimentar.json`. A aplicação usa seus 36 alimentos e 6 tipos de refeição com `CATALOG_SOURCE=mock` (também é o padrão quando a variável está ausente). Funciona sem conexão ao Directus: refeições, quantidades, itens customizados e exportações ficam disponíveis normalmente.

O adaptador `src/lib/mock-catalog.ts` filtra alimentos ativos, ordena por `sort`/nome/ID e entrega o mesmo formato usado pela integração. As unidades e quantidades padrão são preservadas. O arquivo nunca é alterado ao montar o diário, que continua apenas em memória.

Os campos extras `category`, `caution`, `notes`, `meal_templates` e `guidelines` estão preservados no JSON, mas não são consumidos nem enviados pela API do MVP. O diário começa vazio; modelos de refeições não são registros de consumo. Para editar o catálogo temporário, altere o JSON e reinicie a aplicação (em produção, gere um novo build).

## Associar o Directus depois

Quando sua instância estiver disponível:

1. Crie as duas collections conforme as tabelas abaixo e cadastre os alimentos e tipos de refeição.
2. Configure uma política de somente leitura pública ou crie uma conta de serviço com token estático e permissão de leitura.
3. Em `.env.local`, altere `CATALOG_SOURCE=directus` e preencha a URL base e o token opcional. Se o arquivo ainda não existir, copie `.env.example` antes.
4. Reinicie `npm run dev`. Abra a aplicação e verifique se os tipos e alimentos aparecem.
5. Na hospedagem, cadastre as mesmas variáveis de ambiente e faça um novo build/deploy.

| Variável                   | Uso                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `CATALOG_SOURCE` | `mock` (padrão) usa o JSON local; `directus` usa a API. |
| `NEXT_PUBLIC_DIRECTUS_URL` | URL base, por exemplo `https://cms.exemplo.com`. Obrigatória somente no modo `directus`.                                           |
| `DIRECTUS_READ_TOKEN`      | Token estático com somente leitura. Opcional se leitura pública estiver permitida. Nunca prefixar este token com `NEXT_PUBLIC_`. |

## Collections

No modo `directus`, falhas de conexão exibem um erro com opção de tentar novamente; não há troca automática para o mock.

IDs podem ser UUID ou inteiros; a aplicação os converte para strings.

### `foods`

| Campo              | Tipo            | Configuração                                            |
| ------------------ | --------------- | ------------------------------------------------------- |
| `id`               | UUID ou inteiro | Chave primária                                          |
| `name`             | String          | Obrigatório, não vazio                                  |
| `unit`             | String          | `unidade`, `g`, `ml` ou outra unidade; pode ficar vazio |
| `default_quantity` | Decimal         | Obrigatório, maior que zero; padrão 1                   |
| `icon_name`        | String          | Opcional, nome Lucide respeitando maiúsculas/minúsculas |
| `active`           | Boolean         | Padrão true; só ativos são consultados                  |
| `sort`             | Inteiro         | Ordenação ascendente, padrão 0                          |

| name       | unit    | default_quantity | icon_name | active | sort |
| ---------- | ------- | ---------------- | --------- | ------ | ---- |
| Ovo cozido | unidade | 1                | Egg       | true   | 1    |
| Banana     | unidade | 1                | Banana    | true   | 2    |
| Café       | ml      | 150              | Coffee    | true   | 3    |
| Aveia      | g       | 20               | Wheat     | true   | 4    |

### `meal_types`

| Campo       | Tipo            | Configuração                   |
| ----------- | --------------- | ------------------------------ |
| `id`        | UUID ou inteiro | Chave primária                 |
| `name`      | String          | Obrigatório, não vazio         |
| `icon_name` | String          | Opcional                       |
| `sort`      | Inteiro         | Ordenação ascendente, padrão 0 |

Sugestões: Café da manhã (`Sunrise`, 1), Lanche da manhã (`Apple`, 2), Almoço (`Sun`, 3), Lanche da tarde (`Coffee`, 4), Jantar (`Sunset`, 5), Ceia (`Moon`, 6).

Na política pública ou na política associada ao token, permita **somente Read** para ambas as collections e todos os campos listados. Não permita Create, Update ou Delete. Restrinja `foods` a `active = true` na política se desejar também impedir a leitura externa dos inativos. O Next.js faz consultas REST GET pelo servidor; o navegador acessa apenas `/api/catalog` na mesma origem. Não há backend separado nem necessidade de CORS entre navegador e Directus.

## Arquivos principais

- `src/types/`: tipos do catálogo e diário.
- `src/lib/directus/`: cliente exclusivo do servidor, paginação, filtros, validação e funções `getFoods()` / `getMealTypes()`.
- `src/app/api/catalog/route.ts`: entrega o catálogo, mantendo o token no servidor.
- `src/lib/catalog.ts`: acesso ao catálogo para a aplicação.
- `src/lib/diary.ts` e `src/hooks/use-diary.ts`: reducer puro e estado em memória, independentes do Directus.
- `src/components/`: tela e componentes reutilizáveis, sheets, busca, cards e stepper.
- `src/utils/icons.ts`: mapa explícito de ícones; nomes ausentes/desconhecidos usam `Utensils`. Amplie o mapa para outros ícones do catálogo.
- `src/utils/export.ts`: CSV com UTF-8 BOM, escaping e proteção contra fórmulas; PNG via `html-to-image`.
- `tests/`: testes de estado/exportação e fluxo mobile com API Directus simulada.

Os passos ficam em `QUANTITY_STEPS`: unidade = 1, g = 10, ml = 50; outras unidades = 1. Diminuir nunca produz zero ou número negativo; use remover para excluir um item. A quantidade inicial preserva o valor do catálogo, inclusive decimal. Itens customizados começam em 1. Refeições sem alimentos são preservadas nas exportações.

A data é capturada no fuso local do navegador ao abrir a aplicação e representa aquele diário durante a sessão. O PNG usa layout branco com data, refeições, horários e alimentos, sem botões. O download pode ser aberto ou salvo pelo navegador do celular. Exporte antes de atualizar a página.

## Verificações

Toque no cabeçalho da refeição para recolher ou expandir seu card. O menu de três pontos contém **Editar** e **Excluir**, também disponíveis com o card recolhido. A edição permite alterar tipo e horário mantendo os alimentos e quantidades. Fechar sem salvar cancela a edição; excluir exige confirmação.

Arraste o alimento pela alça de pontos à esquerda para ordenar dentro da mesma refeição, com mouse ou toque. Pelo teclado, foque a alça, pressione espaço, use as setas e pressione espaço novamente para soltar (Escape cancela). O arrasto não é iniciado pelos botões de quantidade. A ordem fica no estado em memória e é respeitada no CSV e PNG, mesmo com o card recolhido.

Na busca, selecionar novamente um alimento já presente aumenta sua quantidade pelo mesmo passo do controle `+`, sem criar outra linha. A lista mostra a quantidade atual na refeição. Itens customizados com o mesmo nome (ignorando espaços nas extremidades e maiúsculas/minúsculas) e a mesma unidade também são agrupados; unidades diferentes continuam em itens separados.

```powershell
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Os testes E2E usam as portas 3100 (Next.js) e 8056 (fixture Directus); deixe-as disponíveis e encerre outro `next dev` neste diretório antes de rodar. A fixture valida autenticação, filtros e paginação, sem uma instância real. O fluxo mobile cobre criação, busca sem acentos, quantidades, item customizado, remoções, downloads CSV/PNG e reset ao atualizar. Quando houver uma instância, configure o Directus real e percorra o mesmo fluxo.

Para executar os testes de interface contra um servidor já aberto, defina `$env:PLAYWRIGHT_BASE_URL='http://localhost:3000'` e rode `npm run test:e2e`. Nesse modo, os testes simulam o catálogo no navegador e o teste REST é pulado; o servidor existente não é interrompido. Sem essa variável, a suíte continua iniciando seus próprios servidores e executa também a integração REST.

Dependências de aplicação: `next`, `react`, `react-dom`, `lucide-react`, `html-to-image`, `server-only`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. Desenvolvimento: `typescript`, tipos React/Node, `tailwindcss`, `@tailwindcss/postcss`, `daisyui`, `eslint`, `eslint-config-next`, `tsx`, `@playwright/test`.

Referências: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [DaisyUI com Next.js](https://daisyui.com/docs/install/nextjs/), [parâmetros REST do Directus](https://docs.directus.io/reference/query).
