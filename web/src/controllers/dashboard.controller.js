function mostrarDashboard(req, res) {
  res.render('dashboard', { titulo: 'Dashboard' });
}

module.exports = { mostrarDashboard };