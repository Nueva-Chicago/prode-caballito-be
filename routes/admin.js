"use strict";
const { Router } = require("express");
const { authMiddleware, requireAdmin } = require("../middleware/auth");
const { sendWhatsApp } = require("../services/whatsapp");

const router = Router();

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
