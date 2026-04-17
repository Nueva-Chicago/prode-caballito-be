"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/theme
 * Obtiene el tema actual del usuario autenticado
 */
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await connection_1.db.query('SELECT tema_equipo FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        res.json({
            success: true,
            data: {
                tema_equipo: result.rows[0].tema_equipo || 'neutral',
            },
        });
    }
    catch (error) {
        console.error('Get theme error:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
/**
 * PUT /api/theme
 * Actualiza el tema del usuario autenticado
 */
router.put('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { tema_equipo } = req.body;
        // Validar valor
        const validThemes = ['neutral', 'boca', 'river', 'independiente', 'racing', 'sanlorenzo', 'estudiantes', 'huracan'];
        if (!tema_equipo || !validThemes.includes(tema_equipo)) {
            return res.status(400).json({
                success: false,
                error: 'Tema inválido. Opciones: ' + validThemes.join(', '),
            });
        }
        const result = await connection_1.db.query(`UPDATE users 
       SET tema_equipo = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, tema_equipo`, [tema_equipo, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        // Audit log
        await connection_1.db.query(`INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_value, ip_address, user_agent)
       VALUES ($1, 'update_theme', 'users', $2, $3, $4, $5)`, [
            userId,
            userId,
            JSON.stringify({ tema_equipo }),
            req.ip,
            req.headers['user-agent'],
        ]);
        res.json({
            success: true,
            message: 'Tema actualizado correctamente',
            data: {
                tema_equipo: result.rows[0].tema_equipo,
            },
        });
    }
    catch (error) {
        console.error('Update theme error:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=theme.js.map