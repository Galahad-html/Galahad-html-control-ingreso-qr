function requiereLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  next();
}

function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.session.usuario.rol)) {
      return res.status(403).send('No tienes permiso para ver esta página');
    }
    next();
  };
}

module.exports = { requiereLogin, requiereRol };