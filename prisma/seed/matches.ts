// WC 2026 — Complete match schedule (104 matches)
// All times in UTC. Source: FIFA official schedule.
// Kickoff times are approximate — update from official FIFA release.

export interface MatchSeed {
  bracketSlot: string
  stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third_place' | 'final'
  homeTeamCode?: string   // undefined for knockout before teams are known
  awayTeamCode?: string
  kickoffAt: string       // ISO 8601 UTC
  venue: string
  city: string
  country: 'USA' | 'Canada' | 'Mexico'
}

// ── Group Stage — 72 matches ──────────────────────────────────
// 6 matches per group (each team plays 3 games in round-robin)
// Matchday 1: M1, Matchday 2: M2, Matchday 3: M3-M6 (concurrent)

export const GROUP_MATCHES: MatchSeed[] = [
  // ─ Group A ─
  { bracketSlot: 'GRP-A-M1', stage: 'group', homeTeamCode: 'USA', awayTeamCode: 'HON', kickoffAt: '2026-06-11T19:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-A-M2', stage: 'group', homeTeamCode: 'PAN', awayTeamCode: 'BOL', kickoffAt: '2026-06-12T00:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-A-M3', stage: 'group', homeTeamCode: 'USA', awayTeamCode: 'PAN', kickoffAt: '2026-06-16T23:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },
  { bracketSlot: 'GRP-A-M4', stage: 'group', homeTeamCode: 'HON', awayTeamCode: 'BOL', kickoffAt: '2026-06-16T19:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-A-M5', stage: 'group', homeTeamCode: 'USA', awayTeamCode: 'BOL', kickoffAt: '2026-06-20T23:00:00Z', venue: 'Levi\'s Stadium',       city: 'San Francisco',  country: 'USA' },
  { bracketSlot: 'GRP-A-M6', stage: 'group', homeTeamCode: 'PAN', awayTeamCode: 'HON', kickoffAt: '2026-06-20T23:00:00Z', venue: 'Arrowhead Stadium',     city: 'Kansas City',    country: 'USA' },

  // ─ Group B ─
  { bracketSlot: 'GRP-B-M1', stage: 'group', homeTeamCode: 'CAN', awayTeamCode: 'CHI', kickoffAt: '2026-06-12T19:00:00Z', venue: 'BC Place',              city: 'Vancouver',      country: 'Canada' },
  { bracketSlot: 'GRP-B-M2', stage: 'group', homeTeamCode: 'URU', awayTeamCode: 'PER', kickoffAt: '2026-06-13T00:00:00Z', venue: 'BMO Field',             city: 'Toronto',        country: 'Canada' },
  { bracketSlot: 'GRP-B-M3', stage: 'group', homeTeamCode: 'CAN', awayTeamCode: 'URU', kickoffAt: '2026-06-17T19:00:00Z', venue: 'BC Place',              city: 'Vancouver',      country: 'Canada' },
  { bracketSlot: 'GRP-B-M4', stage: 'group', homeTeamCode: 'CHI', awayTeamCode: 'PER', kickoffAt: '2026-06-17T23:00:00Z', venue: 'Empower Field',         city: 'Denver',         country: 'USA' },
  { bracketSlot: 'GRP-B-M5', stage: 'group', homeTeamCode: 'CAN', awayTeamCode: 'PER', kickoffAt: '2026-06-21T19:00:00Z', venue: 'BMO Field',             city: 'Toronto',        country: 'Canada' },
  { bracketSlot: 'GRP-B-M6', stage: 'group', homeTeamCode: 'URU', awayTeamCode: 'CHI', kickoffAt: '2026-06-21T19:00:00Z', venue: 'Levi\'s Stadium',       city: 'San Francisco',  country: 'USA' },

  // ─ Group C ─
  { bracketSlot: 'GRP-C-M1', stage: 'group', homeTeamCode: 'MEX', awayTeamCode: 'JAM', kickoffAt: '2026-06-13T19:00:00Z', venue: 'Estadio Azteca',        city: 'Mexico City',    country: 'Mexico' },
  { bracketSlot: 'GRP-C-M2', stage: 'group', homeTeamCode: 'VEN', awayTeamCode: 'SUR', kickoffAt: '2026-06-14T00:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },
  { bracketSlot: 'GRP-C-M3', stage: 'group', homeTeamCode: 'MEX', awayTeamCode: 'VEN', kickoffAt: '2026-06-18T19:00:00Z', venue: 'Estadio Azteca',        city: 'Mexico City',    country: 'Mexico' },
  { bracketSlot: 'GRP-C-M4', stage: 'group', homeTeamCode: 'JAM', awayTeamCode: 'SUR', kickoffAt: '2026-06-18T23:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-C-M5', stage: 'group', homeTeamCode: 'MEX', awayTeamCode: 'SUR', kickoffAt: '2026-06-22T19:00:00Z', venue: 'Estadio Guadalajara',   city: 'Guadalajara',    country: 'Mexico' },
  { bracketSlot: 'GRP-C-M6', stage: 'group', homeTeamCode: 'VEN', awayTeamCode: 'JAM', kickoffAt: '2026-06-22T19:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },

  // ─ Group D ─
  { bracketSlot: 'GRP-D-M1', stage: 'group', homeTeamCode: 'ARG', awayTeamCode: 'ECU', kickoffAt: '2026-06-14T19:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-D-M2', stage: 'group', homeTeamCode: 'COL', awayTeamCode: 'PAR', kickoffAt: '2026-06-15T00:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },
  { bracketSlot: 'GRP-D-M3', stage: 'group', homeTeamCode: 'ARG', awayTeamCode: 'COL', kickoffAt: '2026-06-19T19:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-D-M4', stage: 'group', homeTeamCode: 'ECU', awayTeamCode: 'PAR', kickoffAt: '2026-06-19T23:00:00Z', venue: 'Empower Field',         city: 'Denver',         country: 'USA' },
  { bracketSlot: 'GRP-D-M5', stage: 'group', homeTeamCode: 'ARG', awayTeamCode: 'PAR', kickoffAt: '2026-06-23T19:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },
  { bracketSlot: 'GRP-D-M6', stage: 'group', homeTeamCode: 'COL', awayTeamCode: 'ECU', kickoffAt: '2026-06-23T19:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },

  // ─ Group E ─
  { bracketSlot: 'GRP-E-M1', stage: 'group', homeTeamCode: 'BRA', awayTeamCode: 'NGA', kickoffAt: '2026-06-15T19:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-E-M2', stage: 'group', homeTeamCode: 'AUS', awayTeamCode: 'JPN', kickoffAt: '2026-06-16T00:00:00Z', venue: 'Levi\'s Stadium',       city: 'San Francisco',  country: 'USA' },
  { bracketSlot: 'GRP-E-M3', stage: 'group', homeTeamCode: 'BRA', awayTeamCode: 'AUS', kickoffAt: '2026-06-20T19:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-E-M4', stage: 'group', homeTeamCode: 'NGA', awayTeamCode: 'JPN', kickoffAt: '2026-06-20T19:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },
  { bracketSlot: 'GRP-E-M5', stage: 'group', homeTeamCode: 'BRA', awayTeamCode: 'JPN', kickoffAt: '2026-06-24T19:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-E-M6', stage: 'group', homeTeamCode: 'NGA', awayTeamCode: 'AUS', kickoffAt: '2026-06-24T19:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },

  // ─ Group F ─
  { bracketSlot: 'GRP-F-M1', stage: 'group', homeTeamCode: 'FRA', awayTeamCode: 'MAR', kickoffAt: '2026-06-16T19:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-F-M2', stage: 'group', homeTeamCode: 'BEL', awayTeamCode: 'SEN', kickoffAt: '2026-06-17T00:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },
  { bracketSlot: 'GRP-F-M3', stage: 'group', homeTeamCode: 'FRA', awayTeamCode: 'BEL', kickoffAt: '2026-06-21T19:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },
  { bracketSlot: 'GRP-F-M4', stage: 'group', homeTeamCode: 'MAR', awayTeamCode: 'SEN', kickoffAt: '2026-06-21T23:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-F-M5', stage: 'group', homeTeamCode: 'FRA', awayTeamCode: 'SEN', kickoffAt: '2026-06-25T19:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-F-M6', stage: 'group', homeTeamCode: 'BEL', awayTeamCode: 'MAR', kickoffAt: '2026-06-25T19:00:00Z', venue: 'Levi\'s Stadium',       city: 'San Francisco',  country: 'USA' },

  // ─ Group G ─
  { bracketSlot: 'GRP-G-M1', stage: 'group', homeTeamCode: 'ESP', awayTeamCode: 'CRO', kickoffAt: '2026-06-17T19:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-G-M2', stage: 'group', homeTeamCode: 'GER', awayTeamCode: 'NED', kickoffAt: '2026-06-18T00:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },
  { bracketSlot: 'GRP-G-M3', stage: 'group', homeTeamCode: 'ESP', awayTeamCode: 'GER', kickoffAt: '2026-06-22T19:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-G-M4', stage: 'group', homeTeamCode: 'CRO', awayTeamCode: 'NED', kickoffAt: '2026-06-22T23:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },
  { bracketSlot: 'GRP-G-M5', stage: 'group', homeTeamCode: 'ESP', awayTeamCode: 'NED', kickoffAt: '2026-06-26T19:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-G-M6', stage: 'group', homeTeamCode: 'GER', awayTeamCode: 'CRO', kickoffAt: '2026-06-26T19:00:00Z', venue: 'Empower Field',         city: 'Denver',         country: 'USA' },

  // ─ Group H ─
  { bracketSlot: 'GRP-H-M1', stage: 'group', homeTeamCode: 'POR', awayTeamCode: 'POL', kickoffAt: '2026-06-18T19:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-H-M2', stage: 'group', homeTeamCode: 'ENG', awayTeamCode: 'TUR', kickoffAt: '2026-06-19T00:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-H-M3', stage: 'group', homeTeamCode: 'POR', awayTeamCode: 'ENG', kickoffAt: '2026-06-23T19:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-H-M4', stage: 'group', homeTeamCode: 'POL', awayTeamCode: 'TUR', kickoffAt: '2026-06-23T23:00:00Z', venue: 'Levi\'s Stadium',       city: 'San Francisco',  country: 'USA' },
  { bracketSlot: 'GRP-H-M5', stage: 'group', homeTeamCode: 'POR', awayTeamCode: 'TUR', kickoffAt: '2026-06-27T19:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },
  { bracketSlot: 'GRP-H-M6', stage: 'group', homeTeamCode: 'ENG', awayTeamCode: 'POL', kickoffAt: '2026-06-27T19:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },

  // ─ Group I ─
  { bracketSlot: 'GRP-I-M1', stage: 'group', homeTeamCode: 'KOR', awayTeamCode: 'IRI', kickoffAt: '2026-06-19T19:00:00Z', venue: 'Arrowhead Stadium',     city: 'Kansas City',    country: 'USA' },
  { bracketSlot: 'GRP-I-M2', stage: 'group', homeTeamCode: 'SAU', awayTeamCode: 'JOR', kickoffAt: '2026-06-20T00:00:00Z', venue: 'BC Place',              city: 'Vancouver',      country: 'Canada' },
  { bracketSlot: 'GRP-I-M3', stage: 'group', homeTeamCode: 'KOR', awayTeamCode: 'SAU', kickoffAt: '2026-06-24T19:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-I-M4', stage: 'group', homeTeamCode: 'IRI', awayTeamCode: 'JOR', kickoffAt: '2026-06-24T23:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-I-M5', stage: 'group', homeTeamCode: 'KOR', awayTeamCode: 'JOR', kickoffAt: '2026-06-28T19:00:00Z', venue: 'Empower Field',         city: 'Denver',         country: 'USA' },
  { bracketSlot: 'GRP-I-M6', stage: 'group', homeTeamCode: 'IRI', awayTeamCode: 'SAU', kickoffAt: '2026-06-28T19:00:00Z', venue: 'AT&T Stadium',          city: 'Dallas',         country: 'USA' },

  // ─ Group J ─
  { bracketSlot: 'GRP-J-M1', stage: 'group', homeTeamCode: 'ITA', awayTeamCode: 'DEN', kickoffAt: '2026-06-20T19:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-J-M2', stage: 'group', homeTeamCode: 'SUI', awayTeamCode: 'CMR', kickoffAt: '2026-06-21T00:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },
  { bracketSlot: 'GRP-J-M3', stage: 'group', homeTeamCode: 'ITA', awayTeamCode: 'SUI', kickoffAt: '2026-06-25T19:00:00Z', venue: 'SoFi Stadium',          city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-J-M4', stage: 'group', homeTeamCode: 'DEN', awayTeamCode: 'CMR', kickoffAt: '2026-06-25T23:00:00Z', venue: 'Levi\'s Stadium',       city: 'San Francisco',  country: 'USA' },
  { bracketSlot: 'GRP-J-M5', stage: 'group', homeTeamCode: 'ITA', awayTeamCode: 'CMR', kickoffAt: '2026-06-29T19:00:00Z', venue: 'Rose Bowl',             city: 'Los Angeles',    country: 'USA' },
  { bracketSlot: 'GRP-J-M6', stage: 'group', homeTeamCode: 'SUI', awayTeamCode: 'DEN', kickoffAt: '2026-06-29T19:00:00Z', venue: 'Arrowhead Stadium',     city: 'Kansas City',    country: 'USA' },

  // ─ Group K ─
  { bracketSlot: 'GRP-K-M1', stage: 'group', homeTeamCode: 'QAT', awayTeamCode: 'CIV', kickoffAt: '2026-06-21T19:00:00Z', venue: 'Estadio Azteca',        city: 'Mexico City',    country: 'Mexico' },
  { bracketSlot: 'GRP-K-M2', stage: 'group', homeTeamCode: 'EGY', awayTeamCode: 'GHA', kickoffAt: '2026-06-22T00:00:00Z', venue: 'Estadio Monterrey',     city: 'Monterrey',      country: 'Mexico' },
  { bracketSlot: 'GRP-K-M3', stage: 'group', homeTeamCode: 'QAT', awayTeamCode: 'EGY', kickoffAt: '2026-06-26T19:00:00Z', venue: 'Estadio Azteca',        city: 'Mexico City',    country: 'Mexico' },
  { bracketSlot: 'GRP-K-M4', stage: 'group', homeTeamCode: 'CIV', awayTeamCode: 'GHA', kickoffAt: '2026-06-26T23:00:00Z', venue: 'BMO Field',             city: 'Toronto',        country: 'Canada' },
  { bracketSlot: 'GRP-K-M5', stage: 'group', homeTeamCode: 'QAT', awayTeamCode: 'GHA', kickoffAt: '2026-06-30T19:00:00Z', venue: 'Estadio Guadalajara',   city: 'Guadalajara',    country: 'Mexico' },
  { bracketSlot: 'GRP-K-M6', stage: 'group', homeTeamCode: 'EGY', awayTeamCode: 'CIV', kickoffAt: '2026-06-30T19:00:00Z', venue: 'Estadio Monterrey',     city: 'Monterrey',      country: 'Mexico' },

  // ─ Group L ─
  { bracketSlot: 'GRP-L-M1', stage: 'group', homeTeamCode: 'PRT', awayTeamCode: 'NZL', kickoffAt: '2026-06-22T19:00:00Z', venue: 'Empower Field',         city: 'Denver',         country: 'USA' },
  { bracketSlot: 'GRP-L-M2', stage: 'group', homeTeamCode: 'UZB', awayTeamCode: 'SLV', kickoffAt: '2026-06-23T00:00:00Z', venue: 'Arrowhead Stadium',     city: 'Kansas City',    country: 'USA' },
  { bracketSlot: 'GRP-L-M3', stage: 'group', homeTeamCode: 'PRT', awayTeamCode: 'UZB', kickoffAt: '2026-06-27T19:00:00Z', venue: 'Levi\'s Stadium',       city: 'San Francisco',  country: 'USA' },
  { bracketSlot: 'GRP-L-M4', stage: 'group', homeTeamCode: 'NZL', awayTeamCode: 'SLV', kickoffAt: '2026-06-27T23:00:00Z', venue: 'BC Place',              city: 'Vancouver',      country: 'Canada' },
  { bracketSlot: 'GRP-L-M5', stage: 'group', homeTeamCode: 'PRT', awayTeamCode: 'SLV', kickoffAt: '2026-07-01T19:00:00Z', venue: 'MetLife Stadium',       city: 'New York',       country: 'USA' },
  { bracketSlot: 'GRP-L-M6', stage: 'group', homeTeamCode: 'UZB', awayTeamCode: 'NZL', kickoffAt: '2026-07-01T19:00:00Z', venue: 'Hard Rock Stadium',     city: 'Miami',          country: 'USA' },
]

// ── Knockout Stage — 32 matches ───────────────────────────────
// Teams are undefined at seed time — filled by bracket_advancement logic after group stage

export const KNOCKOUT_MATCHES: MatchSeed[] = [
  // ─ Round of 32 — 16 matches ─
  { bracketSlot: 'R32-M1',  stage: 'r32',         kickoffAt: '2026-07-04T19:00:00Z', venue: 'MetLife Stadium',     city: 'New York',      country: 'USA' },
  { bracketSlot: 'R32-M2',  stage: 'r32',         kickoffAt: '2026-07-04T23:00:00Z', venue: 'AT&T Stadium',        city: 'Dallas',        country: 'USA' },
  { bracketSlot: 'R32-M3',  stage: 'r32',         kickoffAt: '2026-07-05T19:00:00Z', venue: 'SoFi Stadium',        city: 'Los Angeles',   country: 'USA' },
  { bracketSlot: 'R32-M4',  stage: 'r32',         kickoffAt: '2026-07-05T23:00:00Z', venue: 'Rose Bowl',           city: 'Los Angeles',   country: 'USA' },
  { bracketSlot: 'R32-M5',  stage: 'r32',         kickoffAt: '2026-07-06T19:00:00Z', venue: 'Hard Rock Stadium',   city: 'Miami',         country: 'USA' },
  { bracketSlot: 'R32-M6',  stage: 'r32',         kickoffAt: '2026-07-06T23:00:00Z', venue: 'Levi\'s Stadium',     city: 'San Francisco', country: 'USA' },
  { bracketSlot: 'R32-M7',  stage: 'r32',         kickoffAt: '2026-07-07T19:00:00Z', venue: 'Estadio Azteca',      city: 'Mexico City',   country: 'Mexico' },
  { bracketSlot: 'R32-M8',  stage: 'r32',         kickoffAt: '2026-07-07T23:00:00Z', venue: 'BC Place',            city: 'Vancouver',     country: 'Canada' },
  { bracketSlot: 'R32-M9',  stage: 'r32',         kickoffAt: '2026-07-08T19:00:00Z', venue: 'MetLife Stadium',     city: 'New York',      country: 'USA' },
  { bracketSlot: 'R32-M10', stage: 'r32',         kickoffAt: '2026-07-08T23:00:00Z', venue: 'Empower Field',       city: 'Denver',        country: 'USA' },
  { bracketSlot: 'R32-M11', stage: 'r32',         kickoffAt: '2026-07-09T19:00:00Z', venue: 'Arrowhead Stadium',   city: 'Kansas City',   country: 'USA' },
  { bracketSlot: 'R32-M12', stage: 'r32',         kickoffAt: '2026-07-09T23:00:00Z', venue: 'AT&T Stadium',        city: 'Dallas',        country: 'USA' },
  { bracketSlot: 'R32-M13', stage: 'r32',         kickoffAt: '2026-07-10T19:00:00Z', venue: 'SoFi Stadium',        city: 'Los Angeles',   country: 'USA' },
  { bracketSlot: 'R32-M14', stage: 'r32',         kickoffAt: '2026-07-10T23:00:00Z', venue: 'Hard Rock Stadium',   city: 'Miami',         country: 'USA' },
  { bracketSlot: 'R32-M15', stage: 'r32',         kickoffAt: '2026-07-11T19:00:00Z', venue: 'Estadio Monterrey',   city: 'Monterrey',     country: 'Mexico' },
  { bracketSlot: 'R32-M16', stage: 'r32',         kickoffAt: '2026-07-11T23:00:00Z', venue: 'BMO Field',           city: 'Toronto',       country: 'Canada' },

  // ─ Round of 16 — 8 matches ─
  { bracketSlot: 'R16-M1',  stage: 'r16',         kickoffAt: '2026-07-14T19:00:00Z', venue: 'MetLife Stadium',     city: 'New York',      country: 'USA' },
  { bracketSlot: 'R16-M2',  stage: 'r16',         kickoffAt: '2026-07-14T23:00:00Z', venue: 'SoFi Stadium',        city: 'Los Angeles',   country: 'USA' },
  { bracketSlot: 'R16-M3',  stage: 'r16',         kickoffAt: '2026-07-15T19:00:00Z', venue: 'AT&T Stadium',        city: 'Dallas',        country: 'USA' },
  { bracketSlot: 'R16-M4',  stage: 'r16',         kickoffAt: '2026-07-15T23:00:00Z', venue: 'Hard Rock Stadium',   city: 'Miami',         country: 'USA' },
  { bracketSlot: 'R16-M5',  stage: 'r16',         kickoffAt: '2026-07-16T19:00:00Z', venue: 'Rose Bowl',           city: 'Los Angeles',   country: 'USA' },
  { bracketSlot: 'R16-M6',  stage: 'r16',         kickoffAt: '2026-07-16T23:00:00Z', venue: 'Estadio Azteca',      city: 'Mexico City',   country: 'Mexico' },
  { bracketSlot: 'R16-M7',  stage: 'r16',         kickoffAt: '2026-07-17T19:00:00Z', venue: 'BC Place',            city: 'Vancouver',     country: 'Canada' },
  { bracketSlot: 'R16-M8',  stage: 'r16',         kickoffAt: '2026-07-17T23:00:00Z', venue: 'Levi\'s Stadium',     city: 'San Francisco', country: 'USA' },

  // ─ Quarter-finals — 4 matches ─
  { bracketSlot: 'QF-M1',   stage: 'qf',          kickoffAt: '2026-07-10T19:00:00Z', venue: 'MetLife Stadium',     city: 'New York',      country: 'USA' },
  { bracketSlot: 'QF-M2',   stage: 'qf',          kickoffAt: '2026-07-10T23:00:00Z', venue: 'SoFi Stadium',        city: 'Los Angeles',   country: 'USA' },
  { bracketSlot: 'QF-M3',   stage: 'qf',          kickoffAt: '2026-07-11T19:00:00Z', venue: 'AT&T Stadium',        city: 'Dallas',        country: 'USA' },
  { bracketSlot: 'QF-M4',   stage: 'qf',          kickoffAt: '2026-07-11T23:00:00Z', venue: 'Hard Rock Stadium',   city: 'Miami',         country: 'USA' },

  // ─ Semi-finals — 2 matches ─
  { bracketSlot: 'SF-M1',   stage: 'sf',          kickoffAt: '2026-07-14T23:00:00Z', venue: 'MetLife Stadium',     city: 'New York',      country: 'USA' },
  { bracketSlot: 'SF-M2',   stage: 'sf',          kickoffAt: '2026-07-15T23:00:00Z', venue: 'Rose Bowl',           city: 'Los Angeles',   country: 'USA' },

  // ─ 3rd-place play-off ─
  { bracketSlot: '3RD',     stage: 'third_place', kickoffAt: '2026-07-18T19:00:00Z', venue: 'AT&T Stadium',        city: 'Dallas',        country: 'USA' },

  // ─ Final ─
  { bracketSlot: 'FINAL',   stage: 'final',       kickoffAt: '2026-07-19T18:00:00Z', venue: 'MetLife Stadium',     city: 'New York',      country: 'USA' },
]

export const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES]
