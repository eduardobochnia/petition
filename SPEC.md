# Petition – Especificação Técnica do Sistema
**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Autor:** Eduardo Bochnia Amparo  
**Status:** Em planejamento  

---

## Sumário

1. [Visão Geral](#1-visão-geral)  
2. [Objetivos e Restrições](#2-objetivos-e-restrições)  
3. [Stack Tecnológica](#3-stack-tecnológica)  
4. [Arquitetura do Sistema](#4-arquitetura-do-sistema)  
5. [Modelagem de Dados](#5-modelagem-de-dados)  
6. [Domínios de Negócio](#6-domínios-de-negócio)  
7. [Automações e Motores](#7-automações-e-motores)  
8. [Telas e UX (UI Specification)](#8-telas-e-ux-ui-specification)  
9. [API Routes](#9-api-routes)  
10. [Exportação Word (DOCX)](#10-exportação-word-docx)  
11. [Testes e Qualidade](#11-testes-e-qualidade)  
12. [Roadmap de Execução (Sprints)](#12-roadmap-de-execução-sprints)  
13. [Regras de Segurança e Uso](#13-regras-de-segurança-e-uso)  
14. [Glossário](#14-glossário)  

---

## 1. Visão Geral

**Petition** é um sistema desktop-web local (roda no próprio navegador via Next.js em localhost) para geração assistida de petições trabalhistas iniciais.

O sistema combina:
- Formulário estruturado de coleta de dados do caso (Intake Wizard)
- Biblioteca de blocos jurídicos reutilizáveis (TemplateBlocks)
- Editor em blocos por caso (drag-and-drop, rich text, instanciado a partir de templates)
- Motores automáticos de sugestão, validação e cálculo
- Exportação para `.docx` com template Word oficial do escritório
- Checklist de verbas, situações especiais, radar de inconsistências e mapa PJe-Calc
- Retroalimentação contínua por registro de erros de revisão

O sistema **não protocola automaticamente** nenhum documento e **não envia dados para servidores externos**. Toda a inteligência roda localmente.

---

## 2. Objetivos e Restrições

### 2.1 Objetivos

- Reduzir o tempo médio de elaboração de petições trabalhistas.
- Eliminar erros de "copiar/colar" (texto de outro modelo não adaptado).
- Garantir coerência entre dados do caso, blocos de texto, checklist de verbas e pedidos.
- Criar uma base crescente de blocos jurídicos validados.
- Preparar terreno para integração futura com IA (RAG + fine-tuning).

### 2.2 Restrições

- O app roda exclusivamente em `localhost`. Sem deploy externo no MVP.
- Não há protocolo automático em sistemas judiciais (PJe, e-Proc etc.).
- Toda exportação é uma **minuta sujeita à revisão do advogado**.
- Não há envio automático de dados para APIs externas. O botão "Perplexity CCT" apenas monta um prompt para uso manual.
- Dados sensíveis (nome de clientes, CPF) ficam apenas no banco SQLite local.

---

## 3. Stack Tecnológica

### 3.1 Frontend

| Camada           | Tecnologia                         | Justificativa                                      |
|------------------|------------------------------------|---------------------------------------------------|
| Framework        | Next.js 15 (App Router)            | SSR + Server Actions + API Routes em um projeto   |
| Linguagem        | TypeScript (strict mode)           | Type-safety de ponta a ponta                      |
| Estilo           | Tailwind CSS                       | Utilitário, rápido, consistente                   |
| Design System    | Shadcn UI (Radix UI + Tailwind)    | Componentes acessíveis e com design de alto nível |
| Editor em blocos | BlockNote                          | AST estruturado (JSON), não HTML sujo             |
| Formulários      | React Hook Form + Zod              | Validação runtime e build-time                    |
| Server state     | TanStack Query (React Query)       | Cache, retry, sincronização com banco local       |
| Client state     | Zustand                            | Estado efêmero de UI (painéis, drag state)        |
| Icons            | Lucide React                       | Leveza e consistência                             |
| DnD              | @dnd-kit/core + @dnd-kit/sortable  | Drag-and-drop acessível para reordenar blocos     |

### 3.2 Backend (dentro do próprio Next.js)

| Camada           | Tecnologia                         | Justificativa                                      |
|------------------|------------------------------------|---------------------------------------------------|
| API              | Next.js Route Handlers             | Colocado no mesmo projeto, sem servidor separado  |
| ORM              | Prisma ORM                         | Type-safety no banco, migrations, seed             |
| Banco de dados   | SQLite (arquivo local)             | Zero infra, roda offline, persistência local      |
| Driver           | better-sqlite3                     | Síncrono, performático para uso local             |
| Validação        | Zod (compartilhado front+back)     | Schemas reutilizados nas duas camadas             |
| Geração DOCX     | docxtemplater + pizzip             | Templates Word com tags, sem quebrar formatação   |

### 3.3 Testes

| Tipo                | Tecnologia    | Foco                                              |
|---------------------|---------------|---------------------------------------------------|
| Unitário            | Vitest        | Regras de negócio (cálculos, radar, recommender)  |
| E2E (smoke tests)   | Playwright    | Fluxo crítico: criar caso → exportar DOCX         |

---

## 4. Arquitetura do Sistema

```
/app                        → Páginas Next.js (App Router)
  /dashboard                → Tela inicial (lista de casos)
  /casos
    /new                    → Wizard de criação (Intake)
    /[id]
      /page.tsx             → Visão geral do caso
      /editor               → Workspace split-screen (blocos)
      /revisao              → Checklist final + Registro de erros
      /exportar             → Route Handler (gera .docx)
  /biblioteca               → CRUD de TemplateBlocks
  /erros-revisao            → Analytics de erros (aprendizado)

/lib
  /db.ts                    → Instância Prisma (singleton)
  /domain
    /calculations.ts        → Motor de campos calculados
    /radar.ts               → Motor de inconsistências
    /recommender.ts         → Motor de sugestão de blocos
    /readyCheck.ts          → Motor de checklist final
    /pjeCalcMap.ts          → Motor do mapa PJe-Calc
    /cctPrompt.ts           → Builder do prompt para Perplexity
  /word
    /exportDocx.ts          → Pipeline de exportação Word
    /astToText.ts           → Conversor BlockNote AST → texto plano

/prisma
  /schema.prisma            → Modelagem completa
  /seed.ts                  → Seed: verbas + situações especiais

/public
  /templates
    /modelo_trabalhista.docx → Template Word oficial

/tests
  /unit                     → Testes Vitest
  /e2e                      → Testes Playwright
```

---

## 5. Modelagem de Dados

### 5.1 Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./juridico.db"
}

// ─── ENUMS ───────────────────────────────────────────────

enum CaseStatus {
  INTAKE        // Coletando dados
  ASSEMBLY      // Montando blocos
  VALIDATION    // No Radar/Checklist
  READY         // Pronto para exportar
  CONCLUDED     // Exportado e arquivado
}

enum ResignationType {
  SEM_JUSTA_CAUSA
  PEDIDO_DEMISSAO
  RESCISAO_INDIRETA
  ACORDO_MUTUO
  CULPA_RECIPROCA
  MORTE
}

enum BlockType {
  FATOS
  FUNDAMENTO
  PEDIDOS
  PROVAS
  VALOR_CAUSA
}

enum BlockOrigin {
  MANUAL
  TEMPLATE
  IA
  IA_EDITADO
}

enum ReviewErrorCategory {
  DADO_INCORRETO
  VERBA_ESQUECIDA
  TESE_INCOERENTE
  TEXTO_NAO_ADAPTADO
  ERRO_CALCULO
  OUTRO
}

// ─── DOMÍNIO: CASO ───────────────────────────────────────

model Case {
  id                String               @id @default(uuid())
  title             String
  status            CaseStatus           @default(INTAKE)
  cctInfo           String?              // JSON: { sindicato, cct, links[], vigencia }
  notes             String?

  authorId          String               @unique
  defendantId       String               @unique
  contractId        String?              @unique

  author            Party                @relation("CaseAuthor",    fields: [authorId],    references: [id])
  defendant         Party                @relation("CaseDefendant", fields: [defendantId], references: [id])
  contract          Contract?            @relation(fields: [contractId], references: [id])

  caseClaims        CaseClaim[]
  caseBlocks        CaseBlock[]
  specialSituations CaseSpecialSituation[]
  reviewErrors      ReviewError[]

  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
}

// ─── DOMÍNIO: PARTES ─────────────────────────────────────

model Party {
  id         String  @id @default(uuid())
  name       String
  document   String? // CPF ou CNPJ
  address    String?
  role       String  // "AUTHOR" | "DEFENDANT"

  caseAuthor    Case? @relation("CaseAuthor")
  caseDefendant Case? @relation("CaseDefendant")
}

// ─── DOMÍNIO: CONTRATO ───────────────────────────────────

model Contract {
  id               String          @id @default(uuid())
  admissionDate    DateTime
  dismissalDate    DateTime?
  resignationType  ResignationType?
  baseSalary       Float
  role             String
  department       String?
  journeyHours     Float           // Horas semanais contratadas
  journeyString    String          // Descrição (ex: "08:00–18:00 c/ 1h intervalo")
  hasNightWork     Boolean         @default(false)
  hasBankOfHours   Boolean         @default(false)
  cnae             String?
  activitySector   String?
  municipality     String?

  case             Case?
}

// ─── DOMÍNIO: VERBAS (DICIONÁRIO MESTRE) ─────────────────

model ClaimDictionary {
  id            String      @id  // ex: "horas_extras"
  name          String           // ex: "Horas extras"
  shortDesc     String?
  category      String           // "Remuneratória" | "Rescisória" | "Indenizatória" | "Multa"
  pjeCalcImpact String?          // JSON: { tipoEvento, baseCalculo, periodo }

  caseClaims    CaseClaim[]
}

model CaseClaim {
  id        String          @id @default(uuid())
  caseId    String
  claimId   String

  case      Case            @relation(fields: [caseId], references: [id], onDelete: Cascade)
  claim     ClaimDictionary @relation(fields: [claimId], references: [id])

  @@unique([caseId, claimId])
}

// ─── DOMÍNIO: SITUAÇÕES ESPECIAIS ────────────────────────

model SpecialSituation {
  id               String                 @id  // ex: "gestante"
  name             String
  description      String?
  suggestedClaims  String                 // JSON: string[]
  suggestedBlocks  String                 // JSON: string[] (ids de TemplateBlock)

  cases            CaseSpecialSituation[]
}

model CaseSpecialSituation {
  id          String           @id @default(uuid())
  caseId      String
  situationId String

  case        Case             @relation(fields: [caseId], references: [id], onDelete: Cascade)
  situation   SpecialSituation @relation(fields: [situationId], references: [id])

  @@unique([caseId, situationId])
}

// ─── DOMÍNIO: BLOCOS ─────────────────────────────────────

model TemplateBlock {
  id             String      @id @default(uuid())
  title          String
  type           BlockType
  contentAST     String      // JSON do BlockNote
  triggerClaims  String?     // JSON: string[] (ids de ClaimDictionary que sugerem este bloco)
  status         String      @default("APPROVED") // "DRAFT" | "APPROVED"
  version        Int         @default(1)
  notes          String?

  caseBlocks     CaseBlock[]

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model CaseBlock {
  id          String         @id @default(uuid())
  caseId      String
  templateId  String?
  type        BlockType
  order       Int
  contentAST  String         // Conteúdo editado e instanciado
  origin      BlockOrigin    @default(MANUAL)

  case        Case           @relation(fields: [caseId], references: [id], onDelete: Cascade)
  template    TemplateBlock? @relation(fields: [templateId], references: [id])

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@unique([caseId, order])
}

// ─── DOMÍNIO: ERROS DE REVISÃO ───────────────────────────

model ReviewError {
  id          String              @id @default(uuid())
  caseId      String
  category    ReviewErrorCategory
  description String
  location    String              // "FATOS" | "FUNDAMENTO_X" | "PEDIDOS"

  case        Case                @relation(fields: [caseId], references: [id], onDelete: Cascade)

  createdAt   DateTime            @default(now())
}
```

---

## 6. Domínios de Negócio

### 6.1 Tipos TypeScript Compartilhados

```typescript
// /types/index.ts

export type ContractMetrics = {
  monthsWorked: number;
  yearsWorked: number;
  estimatedHourlyRate: number;
  estimatedOvertimeHourlyRate: number;
  salaryBaseDiff: number | null; // vs piso da CCT (se informado)
};

export type Warning = {
  id: string;
  message: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  blockId?: string;
};

export type PjeCalcMapItem = {
  claimId: string;
  claimName: string;
  tipoEvento: string;
  baseCalculo: string;
  periodo: string;
};

export type ReadyCheckResult = {
  isReady: boolean;
  blockers: string[];
  warnings: string[];
};
```

---

## 7. Automações e Motores

### 7.1 Motor de Campos Calculados (5 Campos)

```typescript
// /lib/domain/calculations.ts

export function calculateContractMetrics(contract: Contract): ContractMetrics {
  const end = contract.dismissalDate ?? new Date();
  const months = differenceInMonths(end, contract.admissionDate);
  const hours = contract.journeyHours;

  return {
    monthsWorked: months,
    yearsWorked: parseFloat((months / 12).toFixed(1)),
    estimatedHourlyRate: contract.baseSalary / (hours * (52 / 12)),
    estimatedOvertimeHourlyRate: (contract.baseSalary / (hours * (52 / 12))) * 1.5,
    salaryBaseDiff: null, // Calculado se o piso CCT for informado
  };
}
```

### 7.2 Motor de Inconsistências (Radar)

```typescript
// /lib/domain/radar.ts

export function runInconsistencyRadar(
  contract: Contract,
  blocks: CaseBlock[]
): Warning[] {
  const warnings: Warning[] = [];
  const fullText = blocks
    .map((b) => extractTextFromAST(b.contentAST))
    .join(" ")
    .toLowerCase();

  // Regra J01: Jornada
  if (contract.journeyHours <= 36 && fullText.includes("44 horas")) {
    warnings.push({ id: "J01", severity: "HIGH",
      message: "Contrato prevê ≤36h semanais, mas algum bloco menciona 44h." });
  }

  // Regra F01: Função
  if (contract.role.toLowerCase().includes("motorista") && fullText.includes("telemarketing")) {
    warnings.push({ id: "F01", severity: "HIGH",
      message: "Resquício de template: função é Motorista, mas texto menciona telemarketing." });
  }

  // Regra N01: Adicional noturno sem trabalho noturno
  const hasNightClaim = fullText.includes("adicional noturno");
  if (hasNightClaim && !contract.hasNightWork) {
    warnings.push({ id: "N01", severity: "MEDIUM",
      message: "Bloco menciona adicional noturno, mas contrato não indica trabalho noturno." });
  }

  return warnings;
}
```

### 7.3 Motor de Sugestão de Blocos (Recommender)

```typescript
// /lib/domain/recommender.ts

export function getBlockSuggestions(
  caseClaims: string[],          // IDs de verbas marcadas
  caseBlocks: CaseBlock[],       // Blocos já instanciados
  templates: TemplateBlock[]     // Biblioteca de templates
): TemplateBlock[] {
  const existingTemplateIds = new Set(caseBlocks.map((b) => b.templateId));

  return templates.filter((t) => {
    if (existingTemplateIds.has(t.id)) return false; // Já instanciado
    const triggers: string[] = JSON.parse(t.triggerClaims ?? "[]");
    return triggers.some((claimId) => caseClaims.includes(claimId));
  });
}
```

### 7.4 Motor do Mapa PJe-Calc

```typescript
// /lib/domain/pjeCalcMap.ts

export function generatePjeCalcMap(
  caseClaims: string[],
  dictionary: ClaimDictionary[]
): PjeCalcMapItem[] {
  return caseClaims
    .map((id) => dictionary.find((c) => c.id === id))
    .filter((c): c is ClaimDictionary => !!c && !!c.pjeCalcImpact)
    .map((c) => ({ claimId: c.id, claimName: c.name, ...JSON.parse(c.pjeCalcImpact!) }));
}
```

### 7.5 Builder do Prompt CCT para Perplexity

```typescript
// /lib/domain/cctPrompt.ts

export function buildCctPrompt(contract: Contract): string {
  return `
Sou advogado trabalhista no Brasil. Preciso identificar a CCT/ACT provavelmente aplicável:

- Município: ${contract.municipality ?? "N/D"}
- Setor de atividade: ${contract.activitySector ?? "N/D"}
- CNAE: ${contract.cnae ?? "N/D"}
- Função do reclamante: ${contract.role}

Por favor:
1. Indique o sindicato profissional e patronal mais provável.
2. Informe a CCT/ACT aplicável com número e vigência.
3. Forneça links OFICIAIS (MTE/SINDICATO) se possível.
4. Explique seu raciocínio brevemente.
  `.trim();
}
```

### 7.6 Checklist Final (Ready Check)

```typescript
// /lib/domain/readyCheck.ts

export function runReadyCheck(
  caseData: Case & { caseClaims: CaseClaim[]; caseBlocks: CaseBlock[] },
  radarWarnings: Warning[]
): ReadyCheckResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // 1. Dados essenciais
  if (!caseData.contract?.admissionDate) blockers.push("Data de admissão ausente.");
  if (!caseData.contract?.baseSalary)    blockers.push("Salário base ausente.");
  if (!caseData.author?.name)            blockers.push("Nome do autor ausente.");
  if (!caseData.defendant?.name)         blockers.push("Nome do réu ausente.");

  // 2. Verbas marcadas vs. blocos existentes
  const claimIds = caseData.caseClaims.map((c) => c.claimId);
  const blockTypes = caseData.caseBlocks.map((b) => b.type);
  if (claimIds.length > 0 && !blockTypes.includes("PEDIDOS")) {
    blockers.push("Verbas marcadas, mas bloco de PEDIDOS não encontrado.");
  }
  if (claimIds.length > 0 && !blockTypes.includes("FUNDAMENTO")) {
    warnings.push("Verbas marcadas, mas nenhum bloco de FUNDAMENTO foi adicionado.");
  }

  // 3. Warnings do Radar de alta severidade
  const highWarnings = radarWarnings.filter((w) => w.severity === "HIGH");
  highWarnings.forEach((w) => blockers.push(`Radar [${w.id}]: ${w.message}`));

  return { isReady: blockers.length === 0, blockers, warnings };
}
```

---

## 8. Telas e UX (UI Specification)

### 8.1 `/dashboard` – Painel de Controle

- **Componentes:**
  - Tabela paginada de casos (`Shadcn DataTable`) com colunas: Título, Status, Data, Ações.
  - Tags de status coloridas (`CaseStatus`).
  - Botão "Novo caso" no canto superior direito.
  - Card analytics (erros de revisão mais frequentes).
- **Dados:** `GET /api/cases` (lista paginada).

### 8.2 `/casos/new` – Wizard de Intake (5 passos)

**Passo 1 – Partes**
- Campos: Nome do autor, CPF, endereço.
- Campos: Nome do réu, CNPJ, endereço, setor.

**Passo 2 – Contrato**
- Campos: Data de admissão, demissão, tipo de rescisão, salário, função, departamento.
- Campos: Jornada semanal (input numérico), descrição de jornada, trabalho noturno (toggle), banco de horas (toggle).
- Campos: Município, CNAE, setor de atividade (para o botão CCT).
- **Painel lateral dinâmico (live):** Mostra os 5 campos calculados em tempo real.
- **Botão "Consultar CCT no Perplexity":** Monta o prompt, copia para clipboard e abre `https://perplexity.ai` em nova aba.

**Passo 3 – Situações Especiais**
- Multi-select de `SpecialSituation`.
- Ao selecionar: mostra sugestões de verbas e blocos na lateral.

**Passo 4 – Checklist de Verbas**
- Grid responsivo (4 colunas em desktop) de checkboxes.
- Ordenados alfabeticamente por `ClaimDictionary.name`.
- Seleções de situações especiais (Passo 3) pré-marcam verbas sugeridas automaticamente.

**Passo 5 – Revisão do Intake**
- Resumo de todos os dados antes de salvar.
- Botão "Criar Caso" → `POST /api/cases`.

### 8.3 `/casos/[id]/editor` – Workspace Split-Screen

**Lado Esquerdo: O Documento**
- Lista de `CaseBlocks` ordenados pelo campo `order`.
- Cada bloco renderiza com BlockNote em modo editável.
- Drag-and-drop para reordenar (via `@dnd-kit`).
- Botão "+" para adicionar bloco.

**Lado Direito: Painel de Inteligência (3 abas)**

*Aba 1 – Checklist de Verbas:*
- Lista das verbas marcadas no caso.
- Para cada verba: ✅ se há bloco de FUNDAMENTO + PEDIDO, ❌ se não há.
- Botão "Inserir bloco sugerido" para cada ❌.

*Aba 2 – Mapa PJe-Calc:*
- Tabela read-only (verba, tipo de evento, base, período).
- Gerado por `generatePjeCalcMap()`.

*Aba 3 – Radar de Inconsistências:*
- Lista de `Warning` gerados por `runInconsistencyRadar()`.
- Cada warning tem link para o bloco correspondente (quando aplicável).
- Atualiza a cada salvamento de bloco.

### 8.4 `/casos/[id]/revisao` – Revisão Final

- Checklist visual em formato de lista com ✅/❌.
- Botão de exportação só fica ativo se `ReadyCheckResult.isReady === true`.
- Se houver blockers, lista-os visivelmente.
- Seção "Registrar erro de revisão" (formulário `ReviewError`).

### 8.5 `/biblioteca` – Templates de Blocos

- Tabela de `TemplateBlock` filtrada por tipo.
- Botão "Novo template" abre editor BlockNote.
- Cada bloco tem campo `triggerClaims` (multi-select de verbas que o ativam).
- Status: Rascunho / Aprovado.

### 8.6 `/erros-revisao` – Analytics de Aprendizado

- Gráfico de barras: erros por categoria.
- Tabela de erros mais frequentes por localização.
- Filtro por período.

---

## 9. API Routes

```
POST   /api/cases                   → Criar caso
GET    /api/cases                   → Listar casos (paginado)
GET    /api/cases/[id]              → Buscar caso completo
PATCH  /api/cases/[id]              → Atualizar caso (status, cctInfo etc.)
DELETE /api/cases/[id]              → Deletar caso

POST   /api/cases/[id]/blocks       → Adicionar bloco ao caso
PATCH  /api/cases/[id]/blocks/[bid] → Editar conteúdo/ordem de bloco
DELETE /api/cases/[id]/blocks/[bid] → Remover bloco

POST   /api/cases/[id]/claims       → Adicionar verba ao caso
DELETE /api/cases/[id]/claims/[cid] → Remover verba do caso

POST   /api/cases/[id]/situations   → Adicionar situação especial
DELETE /api/cases/[id]/situations/[sid]

GET    /api/cases/[id]/radar        → Rodar Radar de Inconsistências
GET    /api/cases/[id]/ready-check  → Rodar Checklist Final
GET    /api/cases/[id]/pje-map      → Gerar Mapa PJe-Calc
POST   /api/cases/[id]/export       → Exportar .docx

POST   /api/cases/[id]/review-errors → Registrar erro de revisão
GET    /api/cases/[id]/review-errors → Listar erros de um caso

GET    /api/templates               → Listar TemplateBlocks
POST   /api/templates               → Criar TemplateBlock
PATCH  /api/templates/[id]          → Atualizar TemplateBlock
DELETE /api/templates/[id]          → Deletar TemplateBlock

GET    /api/claims-dictionary       → Listar verbas (seed)
GET    /api/special-situations      → Listar situações especiais (seed)

GET    /api/analytics/review-errors → Agregados de erros por categoria
```

---

## 10. Exportação Word (DOCX)

### 10.1 Pipeline

```
1. POST /api/cases/[id]/export
   ↓
2. Buscar caso completo no banco (case + blocks + contract + parties)
   ↓
3. runReadyCheck() → se não isReady, retornar 422 com blockers
   ↓
4. Converter cada CaseBlock.contentAST → texto formatado via astToText()
   ↓
5. Montar objeto de dados para o template:
   { autor, reu, contrato, blocos[], dataExport }
   ↓
6. docxtemplater.loadZip(modelo_trabalhista.docx)
   docxtemplater.setData(dados)
   docxtemplater.render()
   ↓
7. Retornar Buffer como download:
   Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
   Content-Disposition: attachment; filename="[titulo_do_caso].docx"
```

### 10.2 Template Word (`modelo_trabalhista.docx`)

O arquivo base deve conter:
- Logo, cabeçalho, rodapé com nome do escritório.
- Estilos: Título1, Título2, CorpoTexto, ListaPedidos, Citacao.
- Tags docxtemplater:
  ```
  {autor_nome} {reu_nome} {data_admissao}
  {#blocos}{conteudo}{/blocos}
  ```

---

## 11. Testes e Qualidade

### 11.1 Testes Unitários (Vitest)

Arquivos em `/tests/unit/`:

| Arquivo                     | O que testa                                              |
|-----------------------------|----------------------------------------------------------|
| `calculations.test.ts`      | Campos calculados: tempo de casa, hora extra, diferença  |
| `radar.test.ts`             | Cada regra do Radar (J01, F01, N01 etc.)                 |
| `recommender.test.ts`       | Sugestão de blocos correta por verba                     |
| `readyCheck.test.ts`        | Blockers corretos para dados ausentes e verbas sem bloco |
| `pjeCalcMap.test.ts`        | Mapa gerado corretamente para lista de verbas            |

Exemplo de teste:

```typescript
// radar.test.ts
describe("runInconsistencyRadar", () => {
  it("deve gerar warning J01 se jornada ≤36h e texto mencionar 44h", () => {
    const contract = { journeyHours: 30, role: "Auxiliar", hasNightWork: false };
    const blocks = [{ contentAST: JSON.stringify({ text: "jornada de 44 horas" }) }];
    const result = runInconsistencyRadar(contract as any, blocks as any);
    expect(result.find((w) => w.id === "J01")).toBeDefined();
    expect(result.find((w) => w.id === "J01")?.severity).toBe("HIGH");
  });
});
```

### 11.2 Testes E2E (Playwright)

Arquivo `tests/e2e/create-case.spec.ts`:

```typescript
test("Fluxo completo: criar caso → montar blocos → exportar DOCX", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.click("text=Novo caso");
  // Preencher Wizard...
  await page.click("text=Criar Caso");
  await page.click("text=Editor");
  await page.click("text=Aplicar pacote");
  await page.click("text=Revisar");
  await page.click("text=Exportar DOCX");
  // Verificar download...
  const download = await page.waitForEvent("download");
  expect(download.suggestedFilename()).toContain(".docx");
});
```

---

## 12. Roadmap de Execução (Sprints)

### Sprint 1 – Fundação (Dias 1–3)
- [ ] Setup Next.js 15 + TypeScript strict + Tailwind + Shadcn UI
- [ ] Prisma configurado com SQLite
- [ ] Schema completo criado e validado com `prisma migrate dev`
- [ ] Seeds: ClaimDictionary (verbas em ordem alfabética) e SpecialSituations
- [ ] Tipos TypeScript de domínio criados (`/types/index.ts`)

### Sprint 2 – Intake Wizard (Dias 4–7)
- [ ] Tela `/casos/new` com 5 passos (Shadcn Tabs)
- [ ] React Hook Form + Zod para cada passo
- [ ] Campos calculados ao vivo no Passo 2 (`calculations.ts`)
- [ ] Checklist de verbas em grid alfabético (Passo 4)
- [ ] Situações especiais com sugestões automáticas (Passo 3)
- [ ] Botão "Consultar CCT no Perplexity" com `buildCctPrompt()`
- [ ] `POST /api/cases` funcionando

### Sprint 3 – Biblioteca de Blocos (Dias 8–10)
- [ ] Tela `/biblioteca` (lista de TemplateBlocks)
- [ ] Editor BlockNote integrado para criar/editar templates
- [ ] Campo `triggerClaims` (multi-select de verbas)
- [ ] CRUD completo de TemplateBlocks

### Sprint 4 – Editor Workspace (Dias 11–15)
- [ ] Tela `/casos/[id]/editor` (split-screen)
- [ ] Renderização de CaseBlocks com BlockNote
- [ ] Drag-and-drop via `@dnd-kit` (reordenação de blocos)
- [ ] Aba 1: Checklist de verbas com status por bloco
- [ ] Botão "Aplicar pacote" via `getBlockSuggestions()` (`recommender.ts`)

### Sprint 5 – Radar e Mapa PJe-Calc (Dias 16–18)
- [ ] Implementação de `runInconsistencyRadar()` com regras iniciais
- [ ] `GET /api/cases/[id]/radar` retornando warnings
- [ ] Aba 3 do painel lateral: Radar de Inconsistências
- [ ] Implementação de `generatePjeCalcMap()`
- [ ] Aba 2 do painel lateral: Mapa PJe-Calc

### Sprint 6 – Exportação DOCX (Dias 19–21)
- [ ] Template `modelo_trabalhista.docx` criado e validado
- [ ] `astToText.ts` convertendo BlockNote AST para texto limpo
- [ ] `exportDocx.ts` com `docxtemplater + pizzip`
- [ ] `POST /api/cases/[id]/export` com `runReadyCheck()` antes
- [ ] Tela `/casos/[id]/revisao` com Checklist Final bloqueante
- [ ] Download do `.docx` funcionando

### Sprint 7 – Retroalimentação e Testes (Dias 22–25)
- [ ] Sistema de `ReviewError` (formulário + listagem)
- [ ] Dashboard analytics (`/erros-revisao`)
- [ ] Testes unitários Vitest para todos os motores
- [ ] Teste E2E Playwright para o fluxo crítico

---

## 13. Regras de Segurança e Uso

1. Todo documento gerado é uma **MINUTA** e deve ser revisado antes de uso externo.
2. O botão "Exportar DOCX" só é liberado após aprovação do Checklist Final.
3. Warnings de severidade `HIGH` no Radar bloqueiam a exportação (a menos que haja override explícito com justificativa).
4. Dados de clientes ficam exclusivamente no arquivo `juridico.db` local.
5. Nenhuma chamada de API automática é feita para serviços externos.
6. Erros encontrados na revisão manual devem ser registrados para retroalimentação do sistema.
7. Blocos com status "DRAFT" na biblioteca não aparecem como sugestão automática.

---

## 14. Glossário

| Termo              | Definição                                                              |
|--------------------|------------------------------------------------------------------------|
| Case (Caso)        | Uma reclamação trabalhista com todos os dados e blocos relacionados    |
| TemplateBlock      | Bloco modelo reutilizável da biblioteca (aprovado previamente)         |
| CaseBlock          | Instância de um bloco em um caso específico (editável)                 |
| ClaimDictionary    | Lista mestre de verbas trabalhistas (seed)                             |
| Intake             | Etapa de coleta de dados (Wizard)                                      |
| AST                | Abstract Syntax Tree – formato JSON estruturado do BlockNote           |
| Radar              | Motor que detecta inconsistências entre dados e texto dos blocos       |
| Recommender        | Motor que sugere blocos a partir das verbas selecionadas               |
| ReadyCheck         | Validação final antes de liberar a exportação DOCX                     |
| PJe-Calc Map       | Mapa de como cada verba selecionada deve ser lançada no cálculo        |
| CCT/ACT            | Convenção/Acordo Coletivo de Trabalho                                  |
| ReviewError        | Registro de erro encontrado na revisão humana da minuta gerada         |
| BlockOrigin        | Indica a origem do bloco: manual, template, IA, IA editado             |
