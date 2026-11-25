const asistenciaModel = require('../models/asistencia.model');

async function mostrarDashboard(req, res) {
  const [resumen, ranking, ultimas] = await Promise.all([
    asistenciaModel.resumenDelDia(),
    asistenciaModel.rankingTardanzaMes(),
    asistenciaModel.ultimasDelDia(),
  ]);

  res.render('dashboard', { titulo: 'Dashboard', resumen, ranking, ultimas });
}

module.exports = { mostrarDashboard };