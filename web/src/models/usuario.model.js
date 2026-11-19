const db = require('../config/db');

async function buscarPorEmail(email) {
  const [filas] = await db.query(
    'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = ? AND activo = 1',
    [email]
  );
  return filas[0] || null;
}

module.exports = { buscarPorEmail };