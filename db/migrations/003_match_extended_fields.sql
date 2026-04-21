-- Migration 003: Extended match fields for Mundial 2026
-- Adds sede (city), grupo (group A-L), jornada (matchday 1-3)
-- and translation fields for team names

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS sede VARCHAR(100),
  ADD COLUMN IF NOT EXISTS grupo VARCHAR(5),
  ADD COLUMN IF NOT EXISTS jornada INTEGER,
  ADD COLUMN IF NOT EXISTS home_team_pt VARCHAR(100),
  ADD COLUMN IF NOT EXISTS away_team_pt VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_matches_grupo ON matches(grupo);
CREATE INDEX IF NOT EXISTS idx_matches_jornada ON matches(jornada);
