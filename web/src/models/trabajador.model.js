const db = require('../config/db');

async function listarActivos() {
  const [filas] = await db.query(
    `SELECT id, dni, nombres, apellidos, area
     FROM trabajadores
     WHERE activo = 1
     ORDER BY apellidos, nombres`
  );
  return filas;
}

async function listarAreas() {
  const [filas] = await db.query(
    'SELECT DISTINCT area FROM trabajadores ORDER BY area'
  );
  return filas.map((fila) => fila.area);
}

module.exports = { listarActivos, listarAreas };