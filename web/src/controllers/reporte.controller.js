const asistenciaModel = require('../models/asistencia.model');
const trabajadorModel = require('../models/trabajador.model');
const exportacion = require('../services/exportacion.service');

function leerFiltros(query) {
  return {
    desde: query.desde || '',
    hasta: query.hasta || '',
    trabajadorId: query.trabajadorId || '',
    area: query.area || '',
  };
}

async function mostrar(req, res) {
  const filtros = leerFiltros(req.query);
  const [resumen, trabajadores, areas] = await Promise.all([
    asistenciaModel.resumenPorTrabajador(filtros),
    trabajadorModel.listarActivos(),
    trabajadorModel.listarAreas(),
  ]);

  const totalGeneral = resumen.reduce((suma, r) => suma + Number(r.total_tardanza), 0);

  res.render('reportes/index', {
    titulo: 'Reportes',
    resumen,
    trabajadores,
    areas,
    filtros,
    totalGeneral,
    queryString: new URLSearchParams(filtros).toString(),
  });
}

async function exportarExcel(req, res) {
  const filtros = leerFiltros(req.query);
  const [asistencias, resumen] = await Promise.all([
    asistenciaModel.listar(filtros),
    asistenciaModel.resumenPorTrabajador(filtros),
  ]);

  const buffer = await exportacion.generarExcel(asistencias, resumen);
  res.attachment('reporte_asistencias.xlsx');
  res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(Buffer.from(buffer));
}

async function exportarPdf(req, res) {
  const filtros = leerFiltros(req.query);
  const [asistencias, resumen] = await Promise.all([
    asistenciaModel.listar(filtros),
    asistenciaModel.resumenPorTrabajador(filtros),
  ]);

  res.attachment('reporte_asistencias.pdf');
  res.type('application/pdf');
  exportacion.generarPdf(asistencias, resumen, filtros, res);
}

module.exports = { mostrar, exportarExcel, exportarPdf };