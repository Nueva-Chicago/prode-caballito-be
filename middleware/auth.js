"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModerator = exports.requireAdmin = exports.requireRole = exports.optionalAuth = exports.authMiddleware = void 0;
const utils_1 = require("../utils");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'Token no proporcionado' });
            return;
        }
        const token = authHeader.substring(7);
        const payload = (0, utils_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            req.user = (0, utils_1.verifyToken)(token);
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'No autenticado' });
            return;
        }
        if (!roles.includes(req.user.rol)) {
            res.status(403).json({ success: false, error: 'No tienes permisos para esta acción' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('admin');
exports.requireModerator = (0, exports.requireRole)('admin', 'moderator');
//# sourceMappingURL=auth.js.map