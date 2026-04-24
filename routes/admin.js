"use strict";
const { Router } = require("express");
const { authMiddleware, requireAdmin } = require("../middleware/auth");
const { sendWhatsApp } = require("../services/whatsapp");
const { sendWeeklyDigestEmail } = require("../services/email");
const { db } = require("../db/connection");

const router = Router();

async function buildWeeklyDigestData() {
    // Top 3 ranking
    const top3Res = await db.query(`
        SELECT u.nombre as user_name, r.puntos_totales, r.position
        FROM ranking r
        JOIN planillas p ON r.planilla_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE p.precio_pagado = true
        ORDER BY r.position ASC NULLS LAST, r.puntos_totales DESC
        LIMIT 3
    `);
    const top3 = top3Res.rows;

    // Upcoming matches next 7 days
    const matchesRes = await db.query(`
        SELECT home_team, away_team, start_time
        FROM matches
        WHERE estado = 'scheduled'
          AND start_time >= NOW()
          AND start_time <= NOW() + INTERVAL '7 days'
        ORDER BY start_time ASC
        LIMIT 5
    `);
    const upcomingMatches = matchesRes.rows;

    return { top3, upcomingMatches };
}

router.post('/weekly-digest', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { test_email } = req.body;
        const { top3, upcomingMatches } = await buildWeeklyDigestData();

        if (test_email) {
            // Modo test: enviar solo al email indicado con datos del admin
            const userRes = await db.query(
                `SELECT u.id, u.nombre, u.email,
                    r.puntos_totales, r.position
                 FROM users u
                 LEFT JOIN planillas p ON p.user_id = u.id AND p.precio_pagado = true
                 LEFT JOIN ranking r ON r.planilla_id = p.id
                 WHERE u.email = $1
                 ORDER BY r.position ASC NULLS LAST
                 LIMIT 1`,
                [test_email]
            );
            const user = userRes.rows[0];
            if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

            // Pending bets for this week
            const pendingRes = await db.query(`
                SELECT COUNT(*) as cnt
                FROM matches m
                LEFT JOIN planillas p ON p.user_id = $1 AND p.precio_pagado = true
                LEFT JOIN bets b ON b.match_id = m.id AND b.planilla_id = p.id
                WHERE m.estado = 'scheduled'
                  AND m.start_time >= NOW()
                  AND m.start_time <= NOW() + INTERVAL '7 days'
                  AND b.id IS NULL
                  AND p.id IS NOT NULL
            `, [user.id]);
            const pendingCount = parseInt(pendingRes.rows[0]?.cnt || 0);

            await sendWeeklyDigestEmail({
                userEmail: test_email,
                userName: user.nombre,
                rankingPos: user.position || null,
                puntos: user.puntos_totales || 0,
                upcomingMatches,
                pendingCount,
                top3,
            });
            return res.json({ success: true, sent: 1, to: test_email });
        }

        // Envío masivo: todos los usuarios activos
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
        let failed = 0;
        for (const user of usersRes.rows) {
            try {
                const pendingRes = await db.query(`
                    SELECT COUNT(*) as cnt
                    FROM matches m
                    LEFT JOIN planillas p2 ON p2.user_id = $1 AND p2.precio_pagado = true
                    LEFT JOIN bets b ON b.match_id = m.id AND b.planilla_id = p2.id
                    WHERE m.estado = 'scheduled'
                      AND m.start_time >= NOW()
                      AND m.start_time <= NOW() + INTERVAL '7 days'
                      AND b.id IS NULL
                      AND p2.id IS NOT NULL
                `, [user.id]);
                const pendingCount = parseInt(pendingRes.rows[0]?.cnt || 0);

                await sendWeeklyDigestEmail({
                    userEmail: user.email,
                    userName: user.nombre,
                    rankingPos: user.position || null,
                    puntos: user.puntos_totales || 0,
                    upcomingMatches,
                    pendingCount,
                    top3,
                });
                sent++;
            } catch (err) {
                console.error(`[weekly-digest] error enviando a ${user.email}:`, err.message);
                failed++;
            }
        }
        res.json({ success: true, sent, failed, total: usersRes.rows.length });

    } catch (error) {
        console.error('[admin] weekly-digest error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/test-whatsapp', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { to, message } = req.body;
        if (!to || !message) {
            return res.status(400).json({ success: false, error: 'to y message requeridos' });
        }
        await sendWhatsApp({ to, body: message });
        res.json({ success: true, message: `WhatsApp enviado a ${to}` });
    } catch (error) {
        console.error('[admin] test-whatsapp error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
