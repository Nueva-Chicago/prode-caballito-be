"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerService = void 0;
const connection_1 = require("../db/connection");
const notificationService_1 = require("./notificationService");
exports.schedulerService = {
    async scheduleMatchJobs(match) {
        console.log(`Scheduling jobs for match ${match.id}: ${match.home_team} vs ${match.away_team}`);
        const kickoffTime = new Date(match.start_time);
        const secondHalfTime = new Date(kickoffTime.getTime() + 45 * 60 * 1000 + match.halftime_minutes * 60 * 1000);
        await connection_1.db.query(`
      INSERT INTO scheduled_jobs (match_id, job_type, scheduled_for, status)
      VALUES ($1, 'kickoff', $2, 'pending'),
             ($1, 'second_half', $3, 'pending')
      ON CONFLICT (match_id, job_type) DO UPDATE SET
        scheduled_for = CASE 
          WHEN EXCLUDED.scheduled_for != scheduled_jobs.scheduled_for THEN EXCLUDED.scheduled_for
          ELSE scheduled_jobs.scheduled_for
        END,
        status = 'pending'
    `, [match.id, kickoffTime, secondHalfTime]);
        console.log(`Jobs scheduled for match ${match.id}`);
        console.log(`  Kickoff: ${kickoffTime.toISOString()}`);
        console.log(`  Second half: ${secondHalfTime.toISOString()}`);
    },
    async getPendingJobs() {
        const result = await connection_1.db.query(`
      SELECT sj.*, m.home_team, m.away_team, m.start_time, m.halftime_minutes
      FROM scheduled_jobs sj
      JOIN matches m ON sj.match_id = m.id
      WHERE sj.status = 'pending' AND sj.scheduled_for <= NOW()
      ORDER BY sj.scheduled_for ASC
      LIMIT 100
    `);
        return result.rows.map((row) => ({
            matchId: row.match_id,
            homeTeam: row.home_team,
            awayTeam: row.away_team,
            startTime: row.start_time,
            halftimeMinutes: row.halftime_minutes,
            type: row.job_type === 'kickoff' ? 'kickoff' : 'second_half',
        }));
    },
    async markJobCompleted(matchId, jobType) {
        await connection_1.db.query(`
      UPDATE scheduled_jobs SET status = 'completed' 
      WHERE match_id = $1 AND job_type = $2
    `, [matchId, jobType]);
    },
    async processPendingJobs() {
        const jobs = await this.getPendingJobs();
        for (const job of jobs) {
            try {
                console.log(`Processing ${job.type} job for match ${job.matchId}`);
                const subscriptions = await connection_1.db.query(`
          SELECT s.*, u.id as user_id, u.nombre, u.email
          FROM subscriptions s
          JOIN users u ON s.user_id = u.id
          WHERE s.match_id = $1
            AND ($2 = 'kickoff' AND s.notify_kickoff = true
                 OR $2 = 'second_half' AND s.notify_second_half = true)
        `, [job.matchId, job.type]);
                for (const sub of subscriptions.rows) {
                    const channels = sub.channels || ['in_app'];
                    for (const channel of channels) {
                        if (channel === 'in_app') {
                            await (0, notificationService_1.generarNotificacionKickoff)(sub.user_id, job.matchId, job.homeTeam, job.awayTeam, job.type, job.startTime);
                        }
                    }
                }
                await this.markJobCompleted(job.matchId, job.type);
                console.log(`Completed ${job.type} job for match ${job.matchId}`);
            }
            catch (error) {
                console.error(`Error processing job for match ${job.matchId}:`, error);
            }
        }
    },
};
//# sourceMappingURL=schedulerService.js.map