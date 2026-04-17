"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRollback = void 0;
const connection_1 = require("./connection");
const runRollback = async () => {
    console.log('Rolling back migrations...');
    const pool = {
        query: connection_1.db.query.bind(connection_1.db),
    };
    try {
        await pool.query('DROP TABLE IF EXISTS scheduled_jobs CASCADE');
        console.log('Rolled back: scheduled_jobs');
        console.log('Rollback completed');
    }
    catch (error) {
        console.error('Rollback failed:', error);
        throw error;
    }
};
exports.runRollback = runRollback;
if (require.main === module) {
    (0, exports.runRollback)()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error('Rollback failed:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=rollback.js.map