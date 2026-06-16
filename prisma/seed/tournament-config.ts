// Tournament configuration — replaces all magic numbers in application code

export const TOURNAMENT_CONFIG: Record<string, string> = {
  team_count:              '48',
  group_count:             '12',
  group_size:              '4',
  group_matches_per_group: '6',
  group_matches_total:     '72',
  knockout_rounds:         '5',  // R32, R16, QF, SF, Final (+ 3rd place)
  knockout_matches_total:  '32',
  total_matches:           '104',

  // Scoring — admin can override via site_settings
  scoring_exact:           '3',   // exact scoreline
  scoring_result:          '1',   // correct winner/draw only

  // Tournament dates (UTC)
  tournament_start:        '2026-06-11T19:00:00Z',
  tournament_end:          '2026-07-19T18:00:00Z',

  // OTP config (mirrors .env defaults — site_settings takes precedence)
  otp_expiry_seconds:      '120',
  otp_max_attempts:        '3',
}
