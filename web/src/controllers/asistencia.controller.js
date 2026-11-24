const asistenciaModel = require('../models/asistencia.model');
const trabajadorModel = require('../models/trabajador.model');

async function listar(req, res) {
  const filtros = {
    desde: req.query.desde || '',
    hasta: req.query.hasta || '',
    trabajadorId: req.query.trabajadorId || '',
    area: req.query.area || '',
  };

  const [asistencias, trabajadores, areas] = await Promise.all([
    asistenciaModel.listar(filtros),
    trabajadorModel.listarActivos(),
    trabajadorModel.listarAreas(),
  ]);

  const totalTardanza = asistencias.reduce(
    (suma, fila) => suma + fila.minutos_tardanza,
    0
  );

  res.render('asistencias', {
    titulo: 'Asistencias',
    asistencias,
    trabajadores,
    areas,
    filtros,
    totalTardanza,
  });
}

module.exports = { listar };