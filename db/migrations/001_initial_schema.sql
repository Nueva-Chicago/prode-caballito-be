-- PRODE Mundial 2026 - Schema v1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hash_pass VARCHAR(255) NOT NULL,
    foto_url VARCHAR(500),
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('admin', 'moderator', 'usuario')),
    idioma_pref VARCHAR(5) DEFAULT 'es' CHECK (idioma_pref IN ('es', 'pt-BR')),
    estado_pago_visible BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);

-- =====================================================
-- PLANILLAS
-- =====================================================
CREATE TABLE planillas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre_planilla VARCHAR(100) NOT NULL,
    precio_pagado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_planillas_user_id ON planillas(user_id);

-- =====================================================
-- MATCHES
-- =====================================================
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    halftime_minutes INT DEFAULT 15,
    time_cutoff TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'scheduled' CHECK (estado IN ('scheduled', 'live', 'halftime', 'finished', 'cancelled')),
    resultado_local INT,
    resultado_visitante INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_start_time ON matches(start_time);
CREATE INDEX idx_matches_estado ON matches(estado);

-- =====================================================
-- BETS / PRONOSTICOS
-- =====================================================
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planilla_id UUID NOT NULL REFERENCES planillas(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    goles_local INT NOT NULL CHECK (goles_local >= 0),
    goles_visitante INT NOT NULL CHECK (goles_visitante >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(planilla_id, match_id)
);

CREATE INDEX idx_bets_planilla_id ON bets(planilla_id);
CREATE INDEX idx_bets_match_id ON bets(match_id);

-- =====================================================
-- SCORES (materializado por planilla/match)
-- =====================================================
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planilla_id UUID NOT NULL REFERENCES planillas(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    puntos_obtenidos INT DEFAULT 0,
    bonus_aplicado BOOLEAN DEFAULT false,
    detalle_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(planilla_id, match_id)
);

CREATE INDEX idx_scores_planilla_id ON scores(planilla_id);
CREATE INDEX idx_scores_match_id ON scores(match_id);

-- =====================================================
-- RANKING (materializado)
-- =====================================================
CREATE TABLE ranking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planilla_id UUID NOT NULL REFERENCES planillas(id) ON DELETE CASCADE,
    puntos_totales INT DEFAULT 0,
    exactos_count INT DEFAULT 0,
    goles_favor INT DEFAULT 0,
    goles_contra INT DEFAULT 0,
    position INT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(planilla_id)
);

CREATE INDEX idx_ranking_puntos ON ranking(puntos_totales DESC);
CREATE INDEX idx_ranking_position ON ranking(position);

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('ranking', 'match', 'planilla')),
    target_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_sanitized TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted', 'reported')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);

-- =====================================================
-- REACTIONS
-- =====================================================
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL DEFAULT 'like',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- =====================================================
-- REPORTS
-- =====================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_reports_status ON reports(status);

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    notify_kickoff BOOLEAN DEFAULT true,
    notify_second_half BOOLEAN DEFAULT true,
    channels JSONB DEFAULT '["in_app"]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_match ON subscriptions(match_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =====================================================
-- MESSAGES (DM entre usuarios)
-- =====================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);

-- =====================================================
-- MESSAGE_COUNTERS (límite de mensajes entre usuarios)
-- =====================================================
CREATE TABLE message_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counter_a_to_b INT DEFAULT 0,
    counter_b_to_a INT DEFAULT 0,
    blocked BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_a, user_b)
);

-- =====================================================
-- CONFIG (configuraciones editables por admin)
-- =====================================================
CREATE TABLE config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Insertar config default
INSERT INTO config (key, value, description) VALUES
('precio_planilla', '{"amount": 100, "currency": "ARS"}', 'Precio por planilla'),
('limite_mensajes', '{"max": 5, "period_hours": 24}', 'Límite de mensajes entre usuarios'),
('excluir_impagos', '{"exclude": false}', 'Excluir planillas impagas del ranking'),
('time_cutoff_minutes', '{"minutes": 30}', 'Minutos antes del partido para cerrar pronósticos');

-- =====================================================
-- AUDIT_LOG
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- =====================================================
-- REFRESH_TOKENS
-- =====================================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- =====================================================
-- TRIGGERS para updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planillas_updated_at BEFORE UPDATE ON planillas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON bets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
