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

module.exports = { listar };