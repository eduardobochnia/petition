// ─── ENUMS (para uso no frontend) ───────────────────────────────────────────────

export const CASE_STATUS = {
  INTAKE: 'INTAKE',
  ASSEMBLY: 'ASSEMBLY',
  VALIDATION: 'VALIDATION',
  READY: 'READY',
  CONCLUDED: 'CONCLUDED',
} as const

export type CaseStatus = typeof CASE_STATUS[keyof typeof CASE_STATUS]

export const RESIGNATION_TYPE = {
  SEM_JUSTA_CAUSA: 'SEM_JUSTA_CAUSA',
  PEDIDO_DEMISSAO: 'PEDIDO_DEMISSAO',
  RESCISAO_INDIRETA: 'RESCISAO_INDIRETA',
  ACORDO_MUTUO: 'ACORDO_MUTUO',
  CULPA_RECIPROCA: 'CULPA_RECIPROCA',
  MORTE: 'MORTE',
} as const

export type ResignationType = typeof RESIGNATION_TYPE[keyof typeof RESIGNATION_TYPE]

export const BLOCK_TYPE = {
  FATOS: 'FATOS',
  FUNDAMENTO: 'FUNDAMENTO',
  PEDIDOS: 'PEDIDOS',
  PROVAS: 'PROVAS',
  VALOR_CAUSA: 'VALOR_CAUSA',
} as const

export type BlockType = typeof BLOCK_TYPE[keyof typeof BLOCK_TYPE]

export const BLOCK_ORIGIN = {
  MANUAL: 'MANUAL',
  TEMPLATE: 'TEMPLATE',
  IA: 'IA',
  IA_EDITADO: 'IA_EDITADO',
} as const

export type BlockOrigin = typeof BLOCK_ORIGIN[keyof typeof BLOCK_ORIGIN]

export const REVIEW_ERROR_CATEGORY = {
  DADO_INCORRETO: 'DADO_INCORRETO',
  VERBA_ESQUECIDA: 'VERBA_ESQUECIDA',
  TESE_INCOERENTE: 'TESE_INCOERENTE',
  TEXTO_NAO_ADAPTADO: 'TEXTO_NAO_ADAPTADO',
  ERRO_CALCULO: 'ERRO_CALCULO',
  OUTRO: 'OUTRO',
} as const

export type ReviewErrorCategory = typeof REVIEW_ERROR_CATEGORY[keyof typeof REVIEW_ERROR_CATEGORY]

// ─── TIPOS DE DOMÍNIO ───────────────────────────────────────────────

export type ContractMetrics = {
  monthsWorked: number
  yearsWorked: number
  estimatedHourlyRate: number
  estimatedOvertimeHourlyRate: number
  salaryBaseDiff: number | null // vs piso da CCT (se informado)
}

export type Warning = {
  id: string
  message: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  blockId?: string
}

export type PjeCalcMapItem = {
  claimId: string
  claimName: string
  tipoEvento: string
  baseCalculo: string
  periodo: string
}

export type ReadyCheckResult = {
  isReady: boolean
  blockers: string[]
  warnings: string[]
}

// ─── TIPOS ESTENDIDOS DO PRISMA ───────────────────────────────────────────────

export type CaseWithRelations = {
  id: string
  title: string
  status: CaseStatus
  cctInfo: string | null
  notes: string | null
  authorId: string
  defendantId: string
  contractId: string | null
  createdAt: Date
  updatedAt: Date
  author: Party
  defendant: Party
  contract: Contract | null
  caseClaims: CaseClaim[]
  caseBlocks: CaseBlock[]
  specialSituations: CaseSpecialSituation[]
  reviewErrors: ReviewError[]
}

export type ContractWithMetrics = Contract & {
  metrics: ContractMetrics
}

// ─── TIPOS DE FORMULÁRIO ───────────────────────────────────────────────

export type CreateCaseFormData = {
  // Step 1 - Partes
  authorName: string
  authorDocument: string
  authorAddress: string
  defendantName: string
  defendantDocument: string
  defendantAddress: string
  defendantSector: string

  // Step 2 - Contrato
  admissionDate: Date
  dismissalDate?: Date
  resignationType?: ResignationType
  baseSalary: number
  role: string
  department?: string
  journeyHours: number
  journeyString: string
  hasNightWork: boolean
  hasBankOfHours: boolean
  cnae?: string
  activitySector?: string
  municipality?: string

  // Step 3 - Situações Especiais
  specialSituationIds: string[]

  // Step 4 - Verbas
  claimIds: string[]

  // Step 5 - Revisão
  title: string
  notes?: string
  cctInfo?: string
}

export type UpdateCaseFormData = Partial<CreateCaseFormData> & {
  status?: CaseStatus
}

// ─── TIPOS DE API ───────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T
  success: boolean
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── TIPOS DE UI ───────────────────────────────────────────────

export type TabItem = {
  id: string
  label: string
  content: React.ReactNode
}

export type TableColumn<T> = {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
}

export type SelectOption = {
  value: string
  label: string
}

export type CheckboxOption = {
  id: string
  label: string
  description?: string
  checked: boolean
}

// ─── TIPOS DE BLOCOS ───────────────────────────────────────────────

export type BlockNoteAST = {
  type: string
  children: any[]
  [key: string]: any
}

export type TemplateBlockWithRelations = TemplateBlock & {
  caseBlocks: CaseBlock[]
}

export type CaseBlockWithTemplate = CaseBlock & {
  template?: TemplateBlock
}

// ─── CONSTANTES ───────────────────────────────────────────────

export const CLAIM_CATEGORIES = {
  REMUNERATORIA: 'Remuneratória',
  RESCISORIA: 'Rescisória',
  INDENIZATORIA: 'Indenizatória',
  MULTA: 'Multa',
} as const

export type ClaimCategory = typeof CLAIM_CATEGORIES[keyof typeof CLAIM_CATEGORIES]

export const BLOCK_TYPE_LABELS = {
  FATOS: 'Fatos',
  FUNDAMENTO: 'Fundamento',
  PEDIDOS: 'Pedidos',
  PROVAS: 'Provas',
  VALOR_CAUSA: 'Valor da Causa',
} as const

export const CASE_STATUS_LABELS = {
  INTAKE: 'Coletando dados',
  ASSEMBLY: 'Montando blocos',
  VALIDATION: 'Em validação',
  READY: 'Pronto para exportar',
  CONCLUDED: 'Concluído',
} as const

export const RESIGNATION_TYPE_LABELS = {
  SEM_JUSTA_CAUSA: 'Sem justa causa',
  PEDIDO_DEMISSAO: 'Pedido de demissão',
  RESCISAO_INDIRETA: 'Rescisão indireta',
  ACORDO_MUTUO: 'Acordo mútuo',
  CULPA_RECIPROCA: 'Culpa recíproca',
  MORTE: 'Morte',
} as const

// Importações dos tipos do Prisma (serão adicionadas quando os tipos estiverem disponíveis)
// import type {
//   Case,
//   Party,
//   Contract,
//   ClaimDictionary,
//   CaseClaim,
//   SpecialSituation,
//   CaseSpecialSituation,
//   TemplateBlock,
//   CaseBlock,
//   ReviewError,
// } from '@prisma/client'

// Tipos temporários até que o Prisma gere os tipos corretamente
export type Case = any
export type Party = any
export type Contract = any
export type ClaimDictionary = any
export type CaseClaim = any
export type SpecialSituation = any
export type CaseSpecialSituation = any
export type TemplateBlock = any
export type CaseBlock = any
export type ReviewError = any
