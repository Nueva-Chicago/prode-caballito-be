"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { match_id } = req.query;
        const userId = req.user.userId;
        let query = `
      SELECT s.*, m.home_team, m.away_team, m.start_time
      FROM subscriptions s
      JOIN matches m ON s.match_id = m.id
      WHERE s.user_id = $1
    `;
        const params = [userId];
        if (match_id) {
            params.push(match_id);
            query += ` AND s.match_id = $${params.length}`;
        }
        query += ' ORDER BY m.start_time ASC';
        const result = await connection_1.db.query(query, params);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { match_id, notify_kickoff, notify_second_half, channels } = req.body;
        const userId = req.user.userId;
        const matchResult = await connection_1.db.query('SELECT id FROM matches WHERE id = $1', [match_id]);
        if (matchResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Partido no encontrado' });
        }
        const result = await connection_1.db.query(`
      INSERT INTO subscriptions (user_id, match_id, notify_kickoff, notify_second_half, channels)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, match_id) DO UPDATE SET
        notify_kickoff = $3,
        notify_second_half = $4,
        channels = $5
      RETURNING *
    `, [userId, match_id, notify_kickoff ?? true, notify_second_half ?? true, JSON.stringify(channels || ['in_app'])]);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.delete('/:id', auth_1.authMiddleware, validation_1.uuidParam, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const result = await connection_1.db.query('DELETE FROM subscriptions WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Suscripción no encontrada' });
        }
        res.json({ success: true, message: 'Suscripción eliminada' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.delete('/match/:matchId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.userId;
        await connection_1.db.query('DELETE FROM subscriptions WHERE match_id = $1 AND user_id = $2', [matchId, userId]);
        res.json({ success: true, message: 'Suscripción eliminada' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=subscriptions.js.map