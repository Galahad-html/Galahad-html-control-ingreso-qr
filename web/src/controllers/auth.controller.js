const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuario.model');

function mostrarLogin(req, res) {
  if (req.session.usuario) return res.redirect('/dashboard');
  res.render('login', { error: null });
}

async function login(req, res) {
  const { email, password } = req.body;
  const usuario = await usuarioModel.buscarPorEmail(email);

  const valido = usuario && (await bcrypt.compare(password, usuario.password_hash));
  if (!valido) {
    return res.status(401).render('login', { error: 'Correo o contraseña incorrectos' });
  }

  req.session.usuario = { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol };
  res.redirect('/dashboard');
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/login'));
}

module.exports = { mostrarLogin, login, logout };