import 'server-only'
import { mapRiskLevel } from './common'
import type { RiskCategory, RiskThresholds, RiskScore, RiskLevel } from './types'
import { DEFAULT_THRESHOLDS } from './types'

export function calculateRiskScore(
  categories: RiskCategory[],
  answers: Record<string, number>,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): RiskScore {
  const categoryScores = categories.map((cat) => {
    const totalQuestionWeight = cat.questions.reduce((sum, q) => sum + q.weight, 0)
    if (totalQuestionWeight === 0) {
      return { name: cat.name, score: 0, level: 'LOW' as RiskLevel }
    }
    const weightedSum = cat.questions.reduce((sum, q) => {
      const answer = answers[q.id] ?? 0
      return sum + answer * q.weight
    }, 0)
    const catScore = weightedSum / totalQuestionWeight
    return {
      name: cat.name,
      score: Math.round(catScore * 100) / 100,
      level: mapRiskLevel(catScore, thresholds),
    }
  })

  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight === 0) {
    return { overallScore: 0, overallLevel: 'LOW', categoryScores }
  }

  const overallScore = Math.round(
    categoryScores.reduce((sum, cs) => {
      const cat = categories.find((c) => c.name === cs.name)
      return sum + cs.score * (cat?.weight ?? 0) / totalWeight
    }, 0) * 100,
  ) / 100

  return {
    overallScore,
    overallLevel: mapRiskLevel(overallScore, thresholds),
    categoryScores,
  }
}
