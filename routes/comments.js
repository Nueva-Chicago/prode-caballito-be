"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimit_1 = require("../middleware/rateLimit");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
const WORD_FILTER = ['spam', ' SCAM', 'estafa'];
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const targetType = req.query.target_type;
        const targetId = req.query.target_id;
        let query = `
      SELECT c.*, u.nombre as author_name, u.foto_url as author_avatar,
        (SELECT COUNT(*) FROM reactions r WHERE r.comment_id = c.id) as likes
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.status = 'active'
    `;
        const params = [];
        if (targetType) {
            params.push(targetType);
            query += ` AND c.target_type = $${params.length}`;
        }
        if (targetId) {
            params.push(targetId);
            query += ` AND c.target_id = $${params.length}`;
        }
        query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        const result = await connection_1.db.query(query, params);
        const comments = await Promise.all(result.rows.map(async (row) => {
            const replies = await connection_1.db.query(`
        SELECT c.*, u.nombre as author_name, u.foto_url as author_avatar,
          (SELECT COUNT(*) FROM reactions r WHERE r.comment_id = c.id) as likes
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.parent_id = $1 AND c.status = 'active'
        ORDER BY c.created_at ASC
      `, [row.id]);
            return {
                ...row,
                replies: replies.rows,
            };
        }));
        res.json({
            success: true,
            data: {
                comments,
                pagination: { page, limit },
            },
        });
    }
    catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.post('/', auth_1.authMiddleware, rateLimit_1.commentsLimiter, validation_1.commentValidation, async (req, res) => {
    try {
        const { target_type, target_id, content, parent_id } = req.body;
        const contentSanitized = (0, utils_1.sanitizeHtml)(content);
        for (const word of WORD_FILTER) {
            if (contentSanitized.toLowerCase().includes(word.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Tu comentario contiene palabras no permitidas'
                });
            }
        }
        const result = await connection_1.db.query(`INSERT INTO comments (author_id, target_type, target_id, content, content_sanitized, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [req.user.userId, target_type, target_id, content, contentSanitized, parent_id || null]);
        const userResult = await connection_1.db.query('SELECT nombre, foto_url FROM users WHERE id = $1', [req.user.userId]);
        const comment = {
            ...result.rows[0],
            author_name: userResult.rows[0].nombre,
            author_avatar: userResult.rows[0].foto_url,
            likes: 0,
            replies: [],
        };
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.put('/:id', auth_1.authMiddleware, validation_1.uuidParam, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const existingResult = await connection_1.db.query('SELECT * FROM comments WHERE id = $1 AND author_id = $2', [id, req.user.userId]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Comentario no encontrado o no tienes permisos' });
        }
        const contentSanitized = (0, utils_1.sanitizeHtml)(content);
        const result = await connection_1.db.query(`UPDATE comments SET content = $1, content_sanitized = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`, [content, contentSanitized, id]);
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.delete('/:id', auth_1.authMiddleware, validation_1.uuidParam, async (req, res) => {
    try {
        const { id } = req.params;
        const existingResult = await connection_1.db.query('SELECT * FROM comments WHERE id = $1', [id]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Comentario no encontrado' });
        }
        const comment = existingResult.rows[0];
        if (comment.author_id !== req.user.userId && req.user.rol === 'usuario') {
            return res.status(403).json({ success: false, error: 'No tienes permisos' });
        }
        if (req.user.rol === 'moderator' || req.user.rol === 'admin') {
            await connection_1.db.query(`UPDATE comments SET status = 'deleted', updated_at = NOW() WHERE id = $1`, [id]);
            await connection_1.db.query(`INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, ip_address, user_agent) 
         VALUES ($1, 'comment_delete_mod', 'comments', $2, $3, $4, $5)`, [req.user.userId, id, JSON.stringify({ status: 'deleted' }), req.ip, req.headers['user-agent']]);
        }
        else {
            await connection_1.db.query('DELETE FROM comments WHERE id = $1', [id]);
        }
        res.json({ success: true, message: 'Comentario eliminado' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.post('/:id/report', auth_1.authMiddleware, validation_1.uuidParam, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const commentResult = await connection_1.db.query('SELECT id FROM comments WHERE id = $1', [id]);
        if (commentResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Comentario no encontrado' });
        }
        await connection_1.db.query(`INSERT INTO reports (reporter_id, comment_id, reason)
       VALUES ($1, $2, $3)`, [req.user.userId, id, reason || null]);
        await connection_1.db.query(`UPDATE comments SET status = 'reported' WHERE id = $1 AND status = 'active'`, [id]);
        res.json({ success: true, message: 'Comentario reportado' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.post('/:id/reaction', auth_1.authMiddleware, validation_1.uuidParam, async (req, res) => {
    try {
        const { id } = req.params;
        const existingReaction = await connection_1.db.query('SELECT id FROM reactions WHERE user_id = $1 AND comment_id = $2', [req.user.userId, id]);
        if (existingReaction.rows.length > 0) {
            await connection_1.db.query('DELETE FROM reactions WHERE user_id = $1 AND comment_id = $2', [req.user.userId, id]);
            return res.json({ success: true, action: 'removed' });
        }
        await connection_1.db.query('INSERT INTO reactions (user_id, comment_id) VALUES ($1, $2)', [req.user.userId, id]);
        const countResult = await connection_1.db.query('SELECT COUNT(*) as count FROM reactions WHERE comment_id = $1', [id]);
        res.json({ success: true, action: 'added', likes: parseInt(countResult.rows[0].count) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.get('/reports/queue', auth_1.authMiddleware, auth_1.requireModerator, async (req, res) => {
    try {
        const result = await connection_1.db.query(`
      SELECT r.*, c.content, c.target_type, c.target_id,
        u.nombre as reporter_name
      FROM reports r
      JOIN comments c ON r.comment_id = c.id
      JOIN users u ON r.reporter_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
router.post('/reports/:id/review', auth_1.authMiddleware, auth_1.requireModerator, async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        const reportResult = await connection_1.db.query('SELECT comment_id FROM reports WHERE id = $1', [id]);
        if (reportResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
        }
        const commentId = reportResult.rows[0].comment_id;
        if (action === 'hide') {
            await connection_1.db.query(`UPDATE comments SET status = 'hidden' WHERE id = $1`, [commentId]);
        }
        else if (action === 'dismiss') {
            await connection_1.db.query(`UPDATE comments SET status = 'active' WHERE id = $1`, [commentId]);
        }
        await connection_1.db.query(`UPDATE reports SET status = 'reviewed', reviewed_at = NOW(), reviewed_by = $1 WHERE id = $2`, [req.user.userId, id]);
        await connection_1.db.query(`UPDATE reports SET status = 'reviewed', reviewed_at = NOW(), reviewed_by = $1 WHERE comment_id = $2 AND status = 'pending'`, [req.user.userId, commentId]);
        res.json({ success: true, message: `Reporte ${action === 'hide' ? 'ocultado' : 'descartado'}` });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=comments.js.map