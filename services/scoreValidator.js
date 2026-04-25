'use strict'

const { calcularPuntaje } = require('./scoring')

/**
 * Validates that a persisted score record matches what calcularPuntaje produces.
 * Returns array of error strings, or empty array if valid.
 */
function validateScore(bet, match, scoreRecord) {
  const expected = calcularPuntaje(
    { goles_local: bet.goles_local, goles_visitante: bet.goles_visitante },
    { resultado_local: match.resultado_local, resultado_visitante: match.resultado_visitante }
  )

  const errors = []
  if (scoreRecord.puntos_obtenidos !== expected.puntos) {
    errors.push(
      `puntos incorrectos: persistido=${scoreRecord.puntos_obtenidos}, esperado=${expected.puntos}`
    )
  }
  if (!!scoreRecord.bonus_aplicado !== expected.bonus) {
    errors.push(
      `bonus incorrecto: persistido=${scoreRecord.bonus_aplicado}, esperado=${expected.bonus}`
    )
  }
  return errors
}

/**
 * Validates that a planilla's ranking total equals the sum of its individual scores.
 * Returns error string or null if valid.
 */
function validateRankingTotal(planillaId, scores, rankingTotal) {
  const sum = scores.reduce((acc, s) => acc + (s.puntos_obtenidos ?? 0), 0)
  if (sum !== rankingTotal) {
    return `ranking desincronizado: ranking.puntos_totales=${rankingTotal}, sum(scores)=${sum} (diferencia=${rankingTotal - sum})`
  }
  return null
}

/**
 * Validates that every finished-match bet has a corresponding score record.
 * Returns list of {planilla_id, match_id} pairs missing a score.
 */
function findMissingScores(bets, scoreIndex) {
  return bets.filter(b => !scoreIndex[`${b.planilla_id}:${b.match_id}`])
}

/**
 * Runs a full in-memory validation pass given raw DB data.
 *
 * @param {Array} finishedMatches  - matches with resultado_local/visitante
 * @param {Array} bets             - all bets for those matches
 * @param {Array} scores           - all score records for those matches
 * @param {Array} rankings         - [{planilla_id, puntos_totales}]
 * @returns {{ scoreErrors, missingScores, rankingErrors, summary }}
 */
function runValidation(finishedMatches, bets, scores, rankings) {
  const matchIndex = {}
  for (const m of finishedMatches) matchIndex[m.id] = m

  const scoreIndex = {}
  for (const s of scores) scoreIndex[`${s.planilla_id}:${s.match_id}`] = s

  const planillaScores = {}
  for (const s of scores) {
    if (!planillaScores[s.planilla_id]) planillaScores[s.planilla_id] = []
    planillaScores[s.planilla_id].push(s)
  }

  const finishedMatchIds = new Set(finishedMatches.map(m => m.id))
  const finishedBets = bets.filter(b => finishedMatchIds.has(b.match_id))

  // 1. Score integrity
  const scoreErrors = []
  for (const bet of finishedBets) {
    const match = matchIndex[bet.match_id]
    const record = scoreIndex[`${bet.planilla_id}:${bet.match_id}`]
    if (!record) continue // caught by missingScores
    const errors = validateScore(bet, match, record)
    if (errors.length > 0) {
      scoreErrors.push({ planilla_id: bet.planilla_id, match_id: bet.match_id, errors })
    }
  }

  // 2. Missing scores
  const missingScores = findMissingScores(finishedBets, scoreIndex)

  // 3. Ranking totals
  const rankingErrors = []
  for (const r of rankings) {
    const planScores = planillaScores[r.planilla_id] || []
    const error = validateRankingTotal(r.planilla_id, planScores, r.puntos_totales)
    if (error) rankingErrors.push({ planilla_id: r.planilla_id, error })
  }

  return {
    scoreErrors,
    missingScores,
    rankingErrors,
    summary: {
      checked_matches: finishedMatches.length,
      checked_bets: finishedBets.length,
      checked_rankings: rankings.length,
      score_errors: scoreErrors.length,
      missing_scores: missingScores.length,
      ranking_errors: rankingErrors.length,
      valid: scoreErrors.length === 0 && missingScores.length === 0 && rankingErrors.length === 0,
    },
  }
}

module.exports = { validateScore, validateRankingTotal, findMissingScores, runValidation }
