"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDatabase = cleanDatabase;
exports.loadQatar2022Data = loadQatar2022Data;
const connection_1 = require("../db/connection");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const QATAR_DATA_PATH = path.join(__dirname, '../../../qatar22_data.json');
function parseDate(dateStr) {
    const [dayMonth, time] = dateStr.split(' - ');
    const [day, month] = dayMonth.split('/').map(Number);
    const [hours, minutes] = time.replace('hs', '').split(':').map(Number);
    const year = 2022;
    return new Date(year, month - 1, day, hours, minutes);
}
function parseScore(scoreStr) {
    const [home, away] = scoreStr.split('-').map(Number);
    return { home, away };
}
async function cleanDatabase() {
    console.log('🧹 Limpiando base de datos...');
    await connection_1.db.query('TRUNCATE TABLE scores CASCADE');
    await connection_1.db.query('TRUNCATE TABLE bets CASCADE');
    await connection_1.db.query('TRUNCATE TABLE ranking CASCADE');
    await connection_1.db.query('TRUNCATE TABLE planillas CASCADE');
    await connection_1.db.query('TRUNCATE TABLE messages CASCADE');
    await connection_1.db.query('TRUNCATE TABLE message_counters CASCADE');
    await connection_1.db.query('TRUNCATE TABLE comments CASCADE');
    await connection_1.db.query('TRUNCATE TABLE reactions CASCADE');
    await connection_1.db.query('TRUNCATE TABLE reports CASCADE');
    await connection_1.db.query('TRUNCATE TABLE notifications CASCADE');
    await connection_1.db.query('TRUNCATE TABLE subscriptions CASCADE');
    await connection_1.db.query('TRUNCATE TABLE users CASCADE');
    await connection_1.db.query('TRUNCATE TABLE matches CASCADE');
    await connection_1.db.query('TRUNCATE TABLE refresh_tokens CASCADE');
    await connection_1.db.query('TRUNCATE TABLE audit_log CASCADE');
    console.log('✅ Base de datos limpiada');
}
async function loadQatar2022Data() {
    console.log('📦 Cargando datos Qatar 2022...');
    const data = JSON.parse(fs.readFileSync(QATAR_DATA_PATH, 'utf-8'));
    console.log(`📊 ${data.participants.length} participantes, ${data.matches.length} partidos`);
    console.log('👥 Creando usuarios...');
    const userIds = {};
    for (const p of data.participants) {
        const result = await connection_1.db.query(`INSERT INTO users (nombre, email, hash_pass, rol)
       VALUES ($1, $2, $3, 'usuario')
       ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
       RETURNING id`, [p.name, p.email, 'qatar2022']);
        userIds[p.email] = result.rows[0].id;
    }
    console.log(`✅ ${Object.keys(userIds).length} usuarios creados`);
    console.log('📋 Creando planillas...');
    const planillaIds = {};
    for (const email of Object.keys(userIds)) {
        const result = await connection_1.db.query(`INSERT INTO planillas (user_id, nombre_planilla, precio_pagado)
       VALUES ($1, 'Qatar 2022', true)
       RETURNING id`, [userIds[email]]);
        planillaIds[email] = result.rows[0].id;
    }
    console.log(`✅ ${Object.keys(planillaIds).length} planillas creadas`);
    console.log('⚽ Creando partidos...');
    const matchIds = {};
    for (const m of data.matches) {
        const teams = m.match.split(/ - |- /);
        const homeTeam = teams[0].trim();
        const awayTeam = teams[1] ? teams[1].trim() : teams[0].trim();
        const startTime = parseDate(m.date);
        const cutoffTime = new Date(startTime.getTime() - 30 * 60 * 1000);
        const { home: resultHome, away: resultAway } = parseScore(m.result);
        const result = await connection_1.db.query(`INSERT INTO matches (home_team, away_team, start_time, time_cutoff, estado, resultado_local, resultado_visitante)
       VALUES ($1, $2, $3, $4, 'finished', $5, $6)
       RETURNING id`, [homeTeam, awayTeam, startTime, cutoffTime, resultHome, resultAway]);
        matchIds[m.match] = result.rows[0].id;
    }
    console.log(`✅ ${Object.keys(matchIds).length} partidos creados`);
    console.log('🎯 Cargando apuestas...');
    let betCount = 0;
    for (const m of data.matches) {
        const teams = m.match.split(/ - |- /);
        const homeTeam = teams[0].trim();
        const awayTeam = teams[1] ? teams[1].trim() : teams[0].trim();
        const matchKey = `${homeTeam} - ${awayTeam}`;
        const matchId = matchIds[matchKey] || matchIds[m.match];
        const bets = Object.entries(m.bets);
        for (const [email, scoreStr] of bets) {
            if (!planillaIds[email]) {
                console.log(`⚠️ Planilla no encontrada para ${email}`);
                continue;
            }
            const { home, away } = parseScore(scoreStr);
            await connection_1.db.query(`INSERT INTO bets (planilla_id, match_id, goles_local, goles_visitante)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (planilla_id, match_id) DO UPDATE SET
           goles_local = EXCLUDED.goles_local,
           goles_visitante = EXCLUDED.goles_visitante`, [planillaIds[email], matchId, home, away]);
            betCount++;
        }
    }
    console.log(`✅ ${betCount} apuestas cargadas`);
    console.log('🏆 Calculando scores...');
    const matchesResult = await connection_1.db.query('SELECT id, resultado_local, resultado_visitante FROM matches');
    for (const match of matchesResult.rows) {
        const betsResult = await connection_1.db.query('SELECT * FROM bets WHERE match_id = $1', [match.id]);
        for (const bet of betsResult.rows) {
            const { home: betHome, away: betAway } = { home: bet.goles_local, away: bet.goles_visitante };
            const { home: resHome, away: resAway } = { home: match.resultado_local, away: match.resultado_visitante };
            const score = calculateScore(betHome, betAway, resHome, resAway);
            await connection_1.db.query(`INSERT INTO scores (planilla_id, match_id, puntos_obtenidos, bonus_aplicado, detalle_json)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (planilla_id, match_id) DO UPDATE SET
           puntos_obtenidos = EXCLUDED.puntos_obtenidos,
           bonus_aplicado = EXCLUDED.bonus_aplicado,
           detalle_json = EXCLUDED.detalle_json`, [bet.planilla_id, match.id, score.points, score.bonus, JSON.stringify(score.detail)]);
        }
    }
    console.log('✅ Scores calculados');
    console.log('📈 Actualizando ranking...');
    await connection_1.db.query(`
    INSERT INTO ranking (planilla_id, puntos_totales, exactos_count, updated_at)
    SELECT 
      p.id as planilla_id,
      COALESCE(SUM(s.puntos_obtenidos), 0) as puntos_totales,
      COUNT(s.id) FILTER (WHERE s.puntos_obtenidos >= 3) as exactos_count,
      NOW() as updated_at
    FROM planillas p
    LEFT JOIN scores s ON p.id = s.planilla_id
    LEFT JOIN matches m ON s.match_id = m.id AND m.estado = 'finished'
    WHERE p.precio_pagado = true
    GROUP BY p.id
    ON CONFLICT (planilla_id) DO UPDATE SET
      puntos_totales = EXCLUDED.puntos_totales,
      exactos_count = EXCLUDED.exactos_count,
      updated_at = NOW()
  `);
    await connection_1.db.query(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY puntos_totales DESC, exactos_count DESC) as position
      FROM ranking
    )
    UPDATE ranking r SET position = ranked.position FROM ranked WHERE r.id = ranked.id
  `);
    console.log('✅ Ranking actualizado');
    console.log('\n🎉 Datos de Qatar 2022 cargados exitosamente!');
    console.log(`   - Usuarios: ${Object.keys(userIds).length}`);
    console.log(`   - Partidos: ${Object.keys(matchIds).length}`);
    console.log(`   - Apuestas: ${betCount}`);
}
function calculateScore(betHome, betAway, resHome, resAway) {
    let points = 0;
    let bonus = false;
    const detail = [];
    if (betHome === resHome && betAway === resAway) {
        points = 3;
        bonus = true;
        detail.push('Resultado exacto (+3 pts)');
    }
    else if ((betHome > betAway && resHome > resAway) ||
        (betHome < betAway && resHome < resAway) ||
        (betHome === betAway && resHome === resAway)) {
        points = 1;
        detail.push('Ganador correcto (+1 pt)');
    }
    else {
        detail.push('Incorrecto (0 pts)');
    }
    return { points, bonus, detail };
}
async function main() {
    try {
        await cleanDatabase();
        await loadQatar2022Data();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=loadQatar2022.js.map