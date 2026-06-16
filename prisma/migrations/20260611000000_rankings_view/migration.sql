-- Rankings materialized view
-- UNIQUE INDEX on user_id is REQUIRED for REFRESH CONCURRENTLY
-- (without it, CONCURRENTLY fails at runtime)

CREATE MATERIALIZED VIEW IF NOT EXISTS rankings_view AS
SELECT
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(p.points_earned), 0) DESC, u.created_at ASC) AS rank,
  u.id                                                                                    AS user_id,
  u.first_name,
  -- Mobile masking: 09121234567 → 0912****567
  SUBSTRING(u.mobile, 1, 4) || '****' || SUBSTRING(u.mobile, 8, 4)                     AS mobile_masked,
  u.avatar_id,
  COALESCE(SUM(p.points_earned), 0)::int                                                 AS total_points
FROM   users u
LEFT JOIN predictions p ON p.user_id = u.id AND p.points_earned IS NOT NULL
WHERE  u.deleted_at IS NULL
  AND  u.is_active = true
GROUP BY u.id, u.first_name, u.mobile, u.avatar_id, u.created_at
WITH DATA;

-- REQUIRED unique index for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_rankings_user ON rankings_view (user_id);

-- Initial data already loaded by WITH DATA above
-- Refresh via: REFRESH MATERIALIZED VIEW CONCURRENTLY rankings_view
-- Runs: after each match scoring job completes, or manually by admin
