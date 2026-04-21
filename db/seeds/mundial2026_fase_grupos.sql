-- Seed: 72 partidos Fase de Grupos Mundial 2026
-- Antes de ejecutar, reemplazá TOURNAMENT_ID con el UUID del torneo:
--   SELECT id FROM tournaments WHERE name ILIKE '%mundial%2026%' LIMIT 1;
-- Si no existe, crealo:
--   INSERT INTO tournaments (name, fase, is_active) VALUES ('Mundial 2026', 'Fase de Grupos', true) RETURNING id;
--
-- Tiempos en UTC (hora ARS + 3h). Cierre 30 min antes del inicio.

-- ============================================================
-- JORNADA 1
-- ============================================================

-- Jueves 11 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('México', 'Sudáfrica', '2026-06-11 19:00:00+00', 30, '2026-06-11 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'A', 1, 'Ciudad de México');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Corea del Sur', 'República Checa', '2026-06-12 02:00:00+00', 30, '2026-06-12 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'A', 1, 'Guadalajara');

-- Viernes 12 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Canadá', 'Bosnia y Herzegovina', '2026-06-12 19:00:00+00', 30, '2026-06-12 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'B', 1, 'Toronto');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Estados Unidos', 'Paraguay', '2026-06-13 01:00:00+00', 30, '2026-06-13 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'D', 1, 'Los Ángeles');

-- Sábado 13 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Qatar', 'Suiza', '2026-06-13 19:00:00+00', 30, '2026-06-13 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'B', 1, 'San Francisco');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Brasil', 'Marruecos', '2026-06-13 22:00:00+00', 30, '2026-06-13 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'C', 1, 'Nueva Jersey');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Haití', 'Escocia', '2026-06-14 01:00:00+00', 30, '2026-06-14 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'C', 1, 'Boston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Australia', 'Turquía', '2026-06-14 04:00:00+00', 30, '2026-06-14 03:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'D', 1, 'Vancouver');

-- Domingo 14 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Alemania', 'Curazao', '2026-06-14 17:00:00+00', 30, '2026-06-14 16:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'E', 1, 'Houston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Países Bajos', 'Japón', '2026-06-14 20:00:00+00', 30, '2026-06-14 19:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'F', 1, 'Dallas');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Costa de Marfil', 'Ecuador', '2026-06-14 23:00:00+00', 30, '2026-06-14 22:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'E', 1, 'Philadelphia');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Suecia', 'Túnez', '2026-06-15 02:00:00+00', 30, '2026-06-15 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'F', 1, 'Monterrey');

-- Lunes 15 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('España', 'Cabo Verde', '2026-06-15 16:00:00+00', 30, '2026-06-15 15:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'H', 1, 'Atlanta');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Bélgica', 'Egipto', '2026-06-15 19:00:00+00', 30, '2026-06-15 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'G', 1, 'Seattle');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Arabia Saudita', 'Uruguay', '2026-06-15 22:00:00+00', 30, '2026-06-15 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'H', 1, 'Miami');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Irán', 'Nueva Zelanda', '2026-06-16 01:00:00+00', 30, '2026-06-16 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'G', 1, 'Los Ángeles');

-- Martes 16 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Francia', 'Senegal', '2026-06-16 19:00:00+00', 30, '2026-06-16 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'I', 1, 'Nueva Jersey');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Irak', 'Noruega', '2026-06-16 22:00:00+00', 30, '2026-06-16 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'I', 1, 'Boston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Argentina', 'Argelia', '2026-06-17 01:00:00+00', 30, '2026-06-17 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'J', 1, 'Kansas City');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Austria', 'Jordania', '2026-06-17 04:00:00+00', 30, '2026-06-17 03:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'J', 1, 'San Francisco');

-- Miércoles 17 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Portugal', 'RD de Congo', '2026-06-17 17:00:00+00', 30, '2026-06-17 16:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'K', 1, 'Houston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Inglaterra', 'Croacia', '2026-06-17 20:00:00+00', 30, '2026-06-17 19:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'L', 1, 'Dallas');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Ghana', 'Panamá', '2026-06-17 23:00:00+00', 30, '2026-06-17 22:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'L', 1, 'Toronto');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Uzbekistán', 'Colombia', '2026-06-18 02:00:00+00', 30, '2026-06-18 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'K', 1, 'Ciudad de México');

-- ============================================================
-- JORNADA 2
-- ============================================================

-- Jueves 18 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('República Checa', 'Sudáfrica', '2026-06-18 16:00:00+00', 30, '2026-06-18 15:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'A', 2, 'Atlanta');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Suiza', 'Bosnia y Herzegovina', '2026-06-18 19:00:00+00', 30, '2026-06-18 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'B', 2, 'Los Ángeles');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Canadá', 'Qatar', '2026-06-18 22:00:00+00', 30, '2026-06-18 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'B', 2, 'Vancouver');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('México', 'Corea del Sur', '2026-06-19 01:00:00+00', 30, '2026-06-19 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'A', 2, 'Guadalajara');

-- Viernes 19 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Estados Unidos', 'Australia', '2026-06-19 19:00:00+00', 30, '2026-06-19 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'D', 2, 'Seattle');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Escocia', 'Marruecos', '2026-06-19 22:00:00+00', 30, '2026-06-19 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'C', 2, 'Boston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Brasil', 'Haití', '2026-06-20 00:30:00+00', 30, '2026-06-20 00:00:00+00', 'pending', false, 'TOURNAMENT_ID', 'C', 2, 'Philadelphia');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Turquía', 'Paraguay', '2026-06-20 03:00:00+00', 30, '2026-06-20 02:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'D', 2, 'San Francisco');

-- Sábado 20 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Países Bajos', 'Suecia', '2026-06-20 17:00:00+00', 30, '2026-06-20 16:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'F', 2, 'Houston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Alemania', 'Costa de Marfil', '2026-06-20 20:00:00+00', 30, '2026-06-20 19:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'E', 2, 'Toronto');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Ecuador', 'Curazao', '2026-06-21 02:00:00+00', 30, '2026-06-21 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'E', 2, 'Kansas City');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Túnez', 'Japón', '2026-06-21 04:00:00+00', 30, '2026-06-21 03:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'F', 2, 'Monterrey');

-- Domingo 21 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('España', 'Arabia Saudita', '2026-06-21 16:00:00+00', 30, '2026-06-21 15:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'H', 2, 'Atlanta');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Bélgica', 'Irán', '2026-06-21 19:00:00+00', 30, '2026-06-21 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'G', 2, 'Los Ángeles');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Uruguay', 'Cabo Verde', '2026-06-21 22:00:00+00', 30, '2026-06-21 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'H', 2, 'Miami');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Nueva Zelanda', 'Egipto', '2026-06-22 01:00:00+00', 30, '2026-06-22 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'G', 2, 'Vancouver');

-- Lunes 22 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Argentina', 'Austria', '2026-06-22 17:00:00+00', 30, '2026-06-22 16:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'J', 2, 'Dallas');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Francia', 'Irak', '2026-06-22 21:00:00+00', 30, '2026-06-22 20:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'I', 2, 'Philadelphia');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Noruega', 'Senegal', '2026-06-23 00:00:00+00', 30, '2026-06-22 23:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'I', 2, 'Nueva Jersey');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Jordania', 'Argelia', '2026-06-23 03:00:00+00', 30, '2026-06-23 02:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'J', 2, 'San Francisco');

-- Martes 23 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Portugal', 'Uzbekistán', '2026-06-23 17:00:00+00', 30, '2026-06-23 16:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'K', 2, 'Houston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Inglaterra', 'Ghana', '2026-06-23 20:00:00+00', 30, '2026-06-23 19:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'L', 2, 'Boston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Panamá', 'Croacia', '2026-06-23 23:00:00+00', 30, '2026-06-23 22:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'L', 2, 'Toronto');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Colombia', 'RD de Congo', '2026-06-24 02:00:00+00', 30, '2026-06-24 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'K', 2, 'Guadalajara');

-- ============================================================
-- JORNADA 3
-- ============================================================

-- Miércoles 24 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Suiza', 'Canadá', '2026-06-24 19:00:00+00', 30, '2026-06-24 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'B', 3, 'Vancouver');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Bosnia y Herzegovina', 'Qatar', '2026-06-24 19:00:00+00', 30, '2026-06-24 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'B', 3, 'Seattle');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Marruecos', 'Haití', '2026-06-24 22:00:00+00', 30, '2026-06-24 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'C', 3, 'Atlanta');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Brasil', 'Escocia', '2026-06-24 22:00:00+00', 30, '2026-06-24 21:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'C', 3, 'Miami');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Sudáfrica', 'Corea del Sur', '2026-06-25 01:00:00+00', 30, '2026-06-25 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'A', 3, 'Monterrey');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('República Checa', 'México', '2026-06-25 01:00:00+00', 30, '2026-06-25 00:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'A', 3, 'Ciudad de México');

-- Jueves 25 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Curazao', 'Costa de Marfil', '2026-06-25 20:00:00+00', 30, '2026-06-25 19:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'E', 3, 'Philadelphia');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Ecuador', 'Alemania', '2026-06-25 20:00:00+00', 30, '2026-06-25 19:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'E', 3, 'Nueva Jersey');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Japón', 'Suecia', '2026-06-25 23:00:00+00', 30, '2026-06-25 22:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'F', 3, 'Dallas');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Túnez', 'Países Bajos', '2026-06-25 23:00:00+00', 30, '2026-06-25 22:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'F', 3, 'Kansas City');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Paraguay', 'Australia', '2026-06-26 02:00:00+00', 30, '2026-06-26 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'D', 3, 'San Francisco');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Turquía', 'Estados Unidos', '2026-06-26 02:00:00+00', 30, '2026-06-26 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'D', 3, 'Los Ángeles');

-- Viernes 26 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Noruega', 'Francia', '2026-06-26 19:00:00+00', 30, '2026-06-26 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'I', 3, 'Boston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Senegal', 'Irak', '2026-06-26 19:00:00+00', 30, '2026-06-26 18:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'I', 3, 'Toronto');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Cabo Verde', 'Arabia Saudita', '2026-06-27 00:00:00+00', 30, '2026-06-26 23:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'H', 3, 'Houston');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Uruguay', 'España', '2026-06-27 00:00:00+00', 30, '2026-06-26 23:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'H', 3, 'Guadalajara');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Egipto', 'Irán', '2026-06-27 03:00:00+00', 30, '2026-06-27 02:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'G', 3, 'Seattle');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Nueva Zelanda', 'Bélgica', '2026-06-27 03:00:00+00', 30, '2026-06-27 02:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'G', 3, 'Vancouver');

-- Sábado 27 jun
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Croacia', 'Ghana', '2026-06-27 21:00:00+00', 30, '2026-06-27 20:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'L', 3, 'Philadelphia');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Panamá', 'Inglaterra', '2026-06-27 21:00:00+00', 30, '2026-06-27 20:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'L', 3, 'Nueva Jersey');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Colombia', 'Portugal', '2026-06-27 23:30:00+00', 30, '2026-06-27 23:00:00+00', 'pending', false, 'TOURNAMENT_ID', 'K', 3, 'Miami');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('RD de Congo', 'Uzbekistán', '2026-06-27 23:30:00+00', 30, '2026-06-27 23:00:00+00', 'pending', false, 'TOURNAMENT_ID', 'K', 3, 'Atlanta');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Argelia', 'Austria', '2026-06-28 02:00:00+00', 30, '2026-06-28 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'J', 3, 'Kansas City');
INSERT INTO matches (home_team, away_team, start_time, halftime_minutes, time_cutoff, estado, finished, tournament_id, grupo, jornada, sede)
VALUES ('Jordania', 'Argentina', '2026-06-28 02:00:00+00', 30, '2026-06-28 01:30:00+00', 'pending', false, 'TOURNAMENT_ID', 'J', 3, 'Dallas');
