const db = require('../config/db');

/**
 * Lista asistencias aplicando filtros opcionales.
 * filtros: { desde, hasta, trabajadorId, area }  (formato de fecha: YYYY-MM-DD)
 */
async function listar({ desde, hasta, trabajadorId, area } = {}) {
  const condiciones = [];
  const parametros = [];

  if (desde) {
    condiciones.push('a.fecha >= ?');
    parametros.push(desde);
  }
  if (hasta) {
    condiciones.push('a.fecha <= ?');
    parametros.push(hasta);
  }
  if (trabajadorId) {
    condiciones.push('a.trabajador_id = ?');
    parametros.push(trabajadorId);
  }
  if (area) {
    condiciones.push('t.area = ?');
    parametros.push(area);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await db.query(
    `SELECT a.id, a.fecha, a.hora_entrada, a.minutos_tardanza,
            t.dni, t.nombres, t.apellidos, t.area,
            p.nombre AS puerta
     FROM asistencias a
     JOIN trabajadores t ON t.id = a.trabajador_id
     JOIN puertas p ON p.id = a.puerta_id
     ${where}
     ORDER BY a.fecha DESC, a.hora_entrada DESC`,
    parametros
  );
  return filas;
}

/** Resumen del día: presentes y cuántos llegaron tarde. */
async function resumenDelDia() {
  const [[resumen]] = await db.query(
    `SELECT COUNT(*) AS presentes,
            COALESCE(SUM(minutos_tardanza > 0), 0) AS tardanzas
     FROM asistencias
     WHERE fecha = CURDATE()`
  );
  const [[activos]] = await db.query(
    'SELECT COUNT(*) AS total FROM trabajadores WHERE activo = 1'
  );

  return {
    presentes: Number(resumen.presentes),
    tardanzas: Number(resumen.tardanzas),
    ausentes: Math.max(0, activos.total - Number(resumen.presentes)),
    totalActivos: activos.total,
  };
}

/** Ranking de tardanza acumulada del mes en curso. */
async function rankingTardanzaMes(limite = 5) {
  const [filas] = await db.query(
    `SELECT t.dni, t.nombres, t.apellidos, t.area,
            SUM(a.minutos_tardanza) AS total_tardanza,
            SUM(a.minutos_tardanza > 0) AS dias_tarde
     FROM asistencias a
     JOIN trabajadores t ON t.id = a.trabajador_id
     WHERE a.fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
       AND a.fecha <= LAST_DAY(CURDATE())
     GROUP BY t.id
     HAVING total_tardanza > 0
     ORDER BY total_tardanza DESC
     LIMIT ?`,
    [limite]
  );
  return filas;
}

/** Últimas entradas registradas hoy. */
async function ultimasDelDia(limite = 8) {
  const [filas] = await db.query(
    `SELECT a.hora_entrada, a.minutos_tardanza,
            t.nombres, t.apellidos, t.area,
            p.nombre AS puerta
     FROM asistencias a
     JOIN trabajadores t ON t.id = a.trabajador_id
     JOIN puertas p ON p.id = a.puerta_id
     WHERE a.fecha = CURDATE()
     ORDER BY a.hora_entrada DESC
     LIMIT ?`,
    [limite]
  );
  return filas;
}

module.exports = { listar, resumenDelDia, rankingTardanzaMes, ultimasDelDia };