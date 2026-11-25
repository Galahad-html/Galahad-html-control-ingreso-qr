const db = require('../config/db');

async function listarTodos() {
  const [filas] = await db.query(
    `SELECT id, dni, nombres, apellidos, area, hora_entrada_oficial, activo
     FROM trabajadores
     ORDER BY apellidos, nombres`
  );
  return filas;
}

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

async function buscarPorId(id) {
  const [filas] = await db.query('SELECT * FROM trabajadores WHERE id = ?', [id]);
  return filas[0] || null;
}

async function buscarPorDni(dni) {
  const [filas] = await db.query('SELECT id FROM trabajadores WHERE dni = ?', [dni]);
  return filas[0] || null;
}

async function crear({ codigoQr, dni, nombres, apellidos, area, horaEntrada }) {
  const [resultado] = await db.query(
    `INSERT INTO trabajadores
       (codigo_qr, dni, nombres, apellidos, area, hora_entrada_oficial)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [codigoQr, dni, nombres, apellidos, area, horaEntrada]
  );
  return resultado.insertId;
}

async function actualizar(id, { dni, nombres, apellidos, area, horaEntrada }) {
  await db.query(
    `UPDATE trabajadores
     SET dni = ?, nombres = ?, apellidos = ?, area = ?, hora_entrada_oficial = ?
     WHERE id = ?`,
    [dni, nombres, apellidos, area, horaEntrada, id]
  );
}

async function cambiarEstado(id, activo) {
  await db.query('UPDATE trabajadores SET activo = ? WHERE id = ?', [activo, id]);
}

module.exports = {
  listarTodos,
  listarActivos,
  listarAreas,
  buscarPorId,
  buscarPorDni,
  crear,
  actualizar,
  cambiarEstado,
};