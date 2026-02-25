import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ─── SEED: CLAIMDICTIONARY (VERBAS TRABALHISTAS) ───────────────────────────────────────
  
  const claimDictionary = [
    // Verbas Remuneratórias
    { id: 'horas_extras', name: 'Horas extras', shortDesc: 'Horas trabalhadas além da jornada contratada', category: 'Remuneratória' },
    { id: 'adicional_noturno', name: 'Adicional noturno', shortDesc: 'Acréscimo para trabalho noturno', category: 'Remuneratória' },
    { id: 'adicional_insalubridade', name: 'Adicional de insalubridade', shortDesc: 'Acréscimo para trabalho em condições insalubres', category: 'Remuneratória' },
    { id: 'adicional_periculosidade', name: 'Adicional de periculosidade', shortDesc: 'Acréscimo para trabalho em condições perigosas', category: 'Remuneratória' },
    { id: 'sobresalario', name: 'Sobresalário', shortDesc: 'Salário superior ao piso da categoria', category: 'Remuneratória' },
    { id: 'gratificacoes', name: 'Gratificações', shortDesc: 'Valores pagos a título de gratificação', category: 'Remuneratória' },
    { id: 'comissoes', name: 'Comissões', shortDesc: 'Pagamentos baseados em comissão', category: 'Remuneratória' },
    { id: 'ajuda_custo', name: 'Ajuda de custo', shortDesc: 'Valores para despesas profissionais', category: 'Remuneratória' },
    
    // Verbas Rescisórias
    { id: 'aviso_previo', name: 'Aviso prévio', shortDesc: 'Aviso prévio indenizado ou trabalhado', category: 'Rescisória' },
    { id: 'fgts_multa_40', name: 'Multa de 40% do FGTS', shortDesc: 'Multa rescisória sobre o FGTS', category: 'Rescisória' },
    { id: 'fgts_deposito', name: 'Depósitos de FGTS', shortDesc: 'Depósitos mensais de FGTS não realizados', category: 'Rescisória' },
    { id: 'saldo_salario', name: 'Saldo de salário', shortDesc: 'Salário dos dias trabalhados no mês da rescisão', category: 'Rescisória' },
    { id: 'ferias_proporcionais', name: 'Férias proporcionais', shortDesc: 'Férias proporcionais ao tempo de trabalho', category: 'Rescisória' },
    { id: 'ferias_dobradas', name: 'Férias dobradas', shortDesc: 'Férias vencidas não gozadas', category: 'Rescisória' },
    { id: 'terco_constitucional', name: 'Terço constitucional', shortDesc: 'Acréscimo de 1/3 sobre férias', category: 'Rescisória' },
    { id: 'decimo_terceiro', name: '13º salário', shortDesc: 'Décimo terceiro salário proporcional', category: 'Rescisória' },
    { id: 'decimo_terceiro_exercicio', name: '13º salário do exercício', shortDesc: '13º salário do ano anterior não pago', category: 'Rescisória' },
    
    // Verbas Indenizatórias
    { id: 'indenizacao_estabilidade', name: 'Indenização por estabilidade', shortDesc: 'Indenização por estabilidade provisória', category: 'Indenizatória' },
    { id: 'indenizacao_dano_moral', name: 'Indenização por dano moral', shortDesc: 'Compensação por dano moral', category: 'Indenizatória' },
    { id: 'indenizacao_dano_material', name: 'Indenização por dano material', shortDesc: 'Compensação por dano material', category: 'Indenizatória' },
    { id: 'indenizacao_dano_existencial', name: 'Indenização por dano existencial', shortDesc: 'Compensação por dano existencial', category: 'Indenizatória' },
    
    // Multas
    { id: 'multa_artigo_467', name: 'Multa do artigo 467 da CLT', shortDesc: 'Multa por atraso no pagamento de verbas rescisórias', category: 'Multa' },
    { id: 'multa_artigo_477', name: 'Multa do artigo 477 da CLT', shortDesc: 'Multa por falta de homologação rescisória', category: 'Multa' },
    { id: 'multa_normas_coletivas', name: 'Multa de normas coletivas', shortDesc: 'Multa prevista em CCT/ACT', category: 'Multa' },
  ]

  for (const claim of claimDictionary) {
    await prisma.claimDictionary.upsert({
      where: { id: claim.id },
      update: claim,
      create: claim,
    })
  }

  // ─── SEED: SPECIALSITUATIONS (SITUAÇÕES ESPECIAIS) ─────────────────────────────────────
  
  const specialSituations = [
    {
      id: 'gestante',
      name: 'Gestante',
      description: 'Empregada grávida ou em período de licença-maternidade',
      suggestedClaims: JSON.stringify(['estabilidade_gestacional', 'licenca_maternidade']),
      suggestedBlocks: JSON.stringify(['fundamento_estabilidade_gestante', 'pedidos_licenca_maternidade']),
    },
    {
      id: 'acidente_trabalho',
      name: 'Acidente de trabalho',
      description: 'Empregado que sofreu acidente de trabalho',
      suggestedClaims: JSON.stringify(['estabilidade_acidente', 'auxilio_doenca_acidente']),
      suggestedBlocks: JSON.stringify(['fundamento_estabilidade_acidente', 'pedidos_estabilidade_acidente']),
    },
    {
      id: 'doenca_ocupacional',
      name: 'Doença ocupacional',
      description: 'Doença adquirida em função do trabalho',
      suggestedClaims: JSON.stringify(['estabilidade_doente', 'auxilio_doenca']),
      suggestedBlocks: JSON.stringify(['fundamento_estabilidade_doente', 'pedidos_estabilidade_doente']),
    },
    {
      id: 'diretor_sindical',
      name: 'Diretor sindical',
      description: 'Empregado eleito para cargo de direção sindical',
      suggestedClaims: JSON.stringify(['estabilidade_sindical']),
      suggestedBlocks: JSON.stringify(['fundamento_estabilidade_sindical', 'pedidos_estabilidade_sindical']),
    },
    {
      id: 'representante_empregados',
      name: 'Representante dos empregados',
      description: 'Membro da CIPA ou representante dos empregados',
      suggestedClaims: JSON.stringify(['estabilidade_representante']),
      suggestedBlocks: JSON.stringify(['fundamento_estabilidade_representante', 'pedidos_estabilidade_representante']),
    },
    {
      id: 'menor_aprendiz',
      name: 'Menor aprendiz',
      description: 'Empregado menor de idade em contrato de aprendizagem',
      suggestedClaims: JSON.stringify(['protecao_menor_aprendiz']),
      suggestedBlocks: JSON.stringify(['fundamento_protecao_menor', 'pedidos_protecao_menor']),
    },
    {
      id: 'banco_horas',
      name: 'Banco de horas',
      description: 'Sistema de compensação de horas implementado',
      suggestedClaims: JSON.stringify(['banco_horas_positivo', 'banco_horas_negativo']),
      suggestedBlocks: JSON.stringify(['fundamento_banco_horas', 'pedidos_banco_horas']),
    },
    {
      id: 'trabalho_noturno',
      name: 'Trabalho noturno',
      description: 'Empregado realiza trabalho em horário noturno',
      suggestedClaims: JSON.stringify(['adicional_noturno', 'horas_noturnas']),
      suggestedBlocks: JSON.stringify(['fundamento_adicional_noturno', 'pedidos_adicional_noturno']),
    },
    {
      id: 'trabalho_insalubre',
      name: 'Trabalho insalubre',
      description: 'Empregado trabalha em condições insalubres',
      suggestedClaims: JSON.stringify(['adicional_insalubridade', 'epi']),
      suggestedBlocks: JSON.stringify(['fundamento_insalubridade', 'pedidos_insalubridade']),
    },
    {
      id: 'trabalho_perigoso',
      name: 'Trabalho perigoso',
      description: 'Empregado trabalha em condições perigosas',
      suggestedClaims: JSON.stringify(['adicional_periculosidade']),
      suggestedBlocks: JSON.stringify(['fundamento_periculosidade', 'pedidos_periculosidade']),
    },
    {
      id: 'equiparacao_salarial',
      name: 'Equiparação salarial',
      description: 'Empregado realiza mesma função de colega com maior salário',
      suggestedClaims: JSON.stringify(['equiparacao_salarial', 'diferenca_salarial']),
      suggestedBlocks: JSON.stringify(['fundamento_equiparacao', 'pedidos_equiparacao']),
    },
    {
      id: 'transferencia',
      name: 'Transferência',
      description: 'Empregado foi transferido de localidade',
      suggestedClaims: JSON.stringify(['adicional_transferencia', 'ajuda_mudanca']),
      suggestedBlocks: JSON.stringify(['fundamento_transferencia', 'pedidos_transferencia']),
    },
  ]

  for (const situation of specialSituations) {
    await prisma.specialSituation.upsert({
      where: { id: situation.id },
      update: situation,
      create: situation,
    })
  }

  console.log('✅ Seeds criados com sucesso!')
  console.log(`📋 ${claimDictionary.length} verbas adicionadas`)
  console.log(`🎯 ${specialSituations.length} situações especiais adicionadas`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
