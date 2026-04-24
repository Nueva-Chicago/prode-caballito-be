"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const serverless_http_1 = __importDefault(require("serverless-http"));
const express_1 = __importDefault(require("express"));
const middleware_1 = require("./middleware");
const rateLimit_1 = require("./middleware/rateLimit");
const routes_1 = require("./routes");
const { sendWhatsApp } = require('./services/whatsapp');
const { db } = require('./db/connection');
const { authMiddleware, requireAdmin } = require('./middleware/auth');
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use(middleware_1.securityMiddleware);
app.use(middleware_1.corsMiddleware);
app.use(middleware_1.compressionMiddleware);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', rateLimit_1.authLimiter, routes_1.authRoutes);
app.use('/api/users', rateLimit_1.authLimiter, routes_1.usersRoutes);
app.use('/api/matches', routes_1.matchesRoutes);
app.use('/api/bets', routes_1.betsRoutes);
app.use('/api/ranking', routes_1.rankingRoutes);
app.use('/api/comments', routes_1.commentsRoutes);
app.use('/api/notifications', routes_1.notificationsRoutes);
app.use('/api/planillas', routes_1.planillasRoutes);
app.use('/api/messages', routes_1.messagesRoutes);
app.use('/api/subscriptions', routes_1.subscriptionsRoutes);
app.use('/api/config', routes_1.configRoutes);
app.use('/api/theme', routes_1.themeRoutes);
app.use('/api/tournaments', routes_1.tournamentsRoutes);
app.use('/api/matchdays', routes_1.matchdaysRoutes);
app.use('/api/imagemail', routes_1.imagemailRoutes);
app.use('/api/push', routes_1.pushRoutes);
app.post('/api/internal/broadcast-whatsapp', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Mensaje requerido' });
        }
        const result = await db.query(
            `SELECT whatsapp_number FROM users WHERE whatsapp_number IS NOT NULL AND whatsapp_consent = true`
        );
        const numbers = result.rows.map(r => r.whatsapp_number);
        let sent = 0;
        let failed = 0;
        for (const number of numbers) {
            try {
                await sendWhatsApp({ to: number, body: message });
                sent++;
            } catch (err) {
                console.error(`[broadcast-whatsapp] error enviando a ${number}:`, err.message);
                failed++;
            }
        }
        console.log(`[broadcast-whatsapp] total=${numbers.length} sent=${sent} failed=${failed}`);
        res.json({ success: true, data: { total: numbers.length, sent, failed } });
    } catch (error) {
        console.error('[broadcast-whatsapp] error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor',
    });
});
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});
const serverlessHandler = (0, serverless_http_1.default)(app, {
    basePath: '/prod',
});
const handler = async (event, context) => {
    // Internal async winner notification event
    if (event.source === 'winner-notification') {
        const { recalcMatchdayForMatch } = require('./routes/matchdays');
        const matchdays = require('./routes/matchdays');
        await matchdays.processWinnerNotification(event.winner, event.matchday, event.winnerEmail, event.allEmails || []);
        return { statusCode: 200 };
    }

    // Weekly digest cron (EventBridge every Monday)
    if (event.source === 'weekly-digest' || event['detail-type'] === 'weekly-digest') {
        const { sendWeeklyDigestEmail } = require('./services/email');
        try {
            const top3Res = await db.query(`
                SELECT u.nombre as user_name, r.puntos_totales, r.position
                FROM ranking r JOIN planillas p ON r.planilla_id = p.id JOIN users u ON p.user_id = u.id
                WHERE p.precio_pagado = true ORDER BY r.position ASC NULLS LAST, r.puntos_totales DESC LIMIT 3
            `);
            const matchesRes = await db.query(`
                SELECT home_team, away_team, start_time FROM matches
                WHERE estado = 'scheduled' AND start_time >= NOW() AND start_time <= NOW() + INTERVAL '7 days'
                ORDER BY start_time ASC LIMIT 5
            `);
            const top3 = top3Res.rows;
            const upcomingMatches = matchesRes.rows;
            const usersRes = await db.query(`
                SELECT DISTINCT ON (u.id)
                    u.id, u.nombre, u.email,
                    r.puntos_totales, r.position
                FROM users u
                JOIN planillas p ON p.user_id = u.id
                LEFT JOIN ranking r ON r.planilla_id = p.id AND p.precio_pagado = true
                WHERE u.email IS NOT NULL
                ORDER BY u.id, r.position ASC NULLS LAST
            `);
            let sent = 0;
            for (const user of usersRes.rows) {
                try {
                    const pendingRes = await db.query(`
                        SELECT COUNT(*) as cnt FROM matches m
                        LEFT JOIN planillas p2 ON p2.user_id = $1 AND p2.precio_pagado = true
                        LEFT JOIN bets b ON b.match_id = m.id AND b.planilla_id = p2.id
                        WHERE m.estado = 'scheduled' AND m.start_time >= NOW()
                          AND m.start_time <= NOW() + INTERVAL '7 days'
                          AND b.id IS NULL AND p2.id IS NOT NULL
                    `, [user.id]);
                    await sendWeeklyDigestEmail({
                        userEmail: user.email,
                        userName: user.nombre,
                        rankingPos: user.position || null,
                        puntos: user.puntos_totales || 0,
                        upcomingMatches,
                        pendingCount: parseInt(pendingRes.rows[0]?.cnt || 0),
                        top3,
                    });
                    sent++;
                } catch (err) {
                    console.error(`[weekly-digest-cron] error ${user.email}:`, err.message);
                }
            }
            console.log(`[weekly-digest-cron] sent=${sent}`);
        } catch (err) {
            console.error('[weekly-digest-cron] fatal:', err.message);
        }
        return { statusCode: 200 };
    }

    const response = await serverlessHandler(event, context);
    // Asegurarse de que los headers CORS estén presentes
    if (!response.headers) {
        response.headers = {};
    }
    // Solo agregar headers CORS si no están ya presentes
    // El middleware CORS ya los configura correctamente
    if (!response.headers['Access-Control-Allow-Origin'] && !response.headers['access-control-allow-origin']) {
        response.headers['Access-Control-Allow-Origin'] = event.headers?.origin || event.headers?.Origin || '*';
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        response.headers['Access-Control-Max-Age'] = '86400';
    }
    return response;
};
exports.handler = handler;
//# sourceMappingURL=lambda.js.map