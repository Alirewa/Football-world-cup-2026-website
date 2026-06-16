/**
 * Pure scoring function — zero side effects, zero DB calls.
 * Fully unit-testable. Called by the BullMQ scoring worker.
 */

export interface ScoreInput {
  home: number
  away: number
}

export interface ScoringConfig {
  exactScore:    number  // points for exact scoreline (default 3)
  correctResult: number  // points for correct winner/draw only (default 1)
}

type MatchResult = 'home_win' | 'draw' | 'away_win'

function getResult(score: ScoreInput): MatchResult {
  if (score.home > score.away) return 'home_win'
  if (score.home < score.away) return 'away_win'
  return 'draw'
}

/**
 * Calculate points earned for a prediction against the actual result.
 *
 * Rules:
 *   - Exact scoreline match → config.exactScore (e.g. 3 pts)
 *   - Correct winner/draw only → config.correctResult (e.g. 1 pt)
 *   - Wrong result → 0 pts
 */
export function calculatePoints(
  prediction: ScoreInput,
  actual:     ScoreInput,
  config:     ScoringConfig,
): number {
  // Exact match
  if (prediction.home === actual.home && prediction.away === actual.away) {
    return config.exactScore
  }

  // Correct result (W/D/L)
  if (getResult(prediction) === getResult(actual)) {
    return config.correctResult
  }

  return 0
}

/** Default config — read from tournament_config at runtime */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  exactScore:    3,
  correctResult: 1,
}
