const bcrypt = require('bcryptjs');
const db = require('../config/db');

const ADMIN = {
  nombre: 'Administrador',
  email: 'admin@empresa.com',
  password: 'Admin123!',
  rol: 'admin',
};

async function main() {
  const hash = await bcrypt.hash(ADMIN.password, 10);
  await db.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [ADMIN.nombre, ADMIN.email, hash, ADMIN.rol]
  );
  console.log(`Usuario listo: ${ADMIN.email} / ${ADMIN.password}`);
  await db.end();
}

main();