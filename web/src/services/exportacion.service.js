const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const COLUMNAS = [
  { header: 'Fecha', key: 'fecha', width: 12 },
  { header: 'DNI', key: 'dni', width: 11 },
  { header: 'Trabajador', key: 'trabajador', width: 30 },
  { header: 'Área', key: 'area', width: 20 },
  { header: 'Puerta', key: 'puerta', width: 14 },
  { header: 'Hora entrada', key: 'hora_entrada', width: 14 },
  { header: 'Tardanza (min)', key: 'minutos_tardanza', width: 15 },
];

function aFilaPlana(a) {
  return { ...a, trabajador: `${a.apellidos}, ${a.nombres}` };
}

function sumarTardanza(asistencias) {
  return asistencias.reduce((suma, a) => suma + a.minutos_tardanza, 0);
}

async function generarExcel(asistencias, resumen) {
  const libro = new ExcelJS.Workbook();

  // Hoja 1: detalle
  const detalle = libro.addWorksheet('Asistencias');
  detalle.columns = COLUMNAS;
  detalle.getRow(1).font = { bold: true };
  asistencias.forEach((a) => detalle.addRow(aFilaPlana(a)));
  const total = detalle.addRow({ trabajador: 'TOTAL ACUMULADO', minutos_tardanza: sumarTardanza(asistencias) });
  total.font = { bold: true };

  // Hoja 2: resumen por trabajador
  const hoja = libro.addWorksheet('Resumen por trabajador');
  hoja.columns = [
    { header: 'DNI', key: 'dni', width: 11 },
    { header: 'Trabajador', key: 'trabajador', width: 30 },
    { header: 'Área', key: 'area', width: 20 },
    { header: 'Días asistidos', key: 'dias_asistidos', width: 15 },
    { header: 'Días con tardanza', key: 'dias_tarde', width: 18 },
    { header: 'Tardanza acumulada (min)', key: 'total_tardanza', width: 24 },
  ];
  hoja.getRow(1).font = { bold: true };
  resumen.forEach((r) => hoja.addRow(aFilaPlana(r)));

  return libro.xlsx.writeBuffer();
}

function generarPdf(asistencias, resumen, filtros, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(18).text('Reporte de Asistencias', { align: 'center' });
  doc.moveDown(0.5).fontSize(10).fillColor('#555');
  doc.text(
    `Periodo: ${filtros.desde || 'inicio'} a ${filtros.hasta || 'hoy'}  |  Área: ${filtros.area || 'Todas'}`,
    { align: 'center' }
  );
  doc.moveDown().fillColor('#000');

  // Resumen por trabajador
  doc.fontSize(13).text('Resumen por trabajador');
  doc.moveDown(0.3).fontSize(9);
  resumen.forEach((r) => {
    doc.text(
      `${r.dni}  ${r.apellidos}, ${r.nombres} (${r.area})  -  ` +
      `Asistidos: ${r.dias_asistidos}  Tarde: ${r.dias_tarde}  Acumulado: ${r.total_tardanza} min`
    );
  });

  // Detalle
  doc.moveDown().fontSize(13).text('Detalle');
  doc.moveDown(0.3).fontSize(9);
  asistencias.forEach((a) => {
    if (doc.y > 760) doc.addPage();
    doc.text(
      `${a.fecha}  ${a.hora_entrada}  ${a.apellidos}, ${a.nombres}  -  ${a.puerta}  -  ` +
      `${a.minutos_tardanza > 0 ? `${a.minutos_tardanza} min tarde` : 'Puntual'}`
    );
  });

  doc.moveDown().fontSize(11).text(`Total acumulado de tardanza: ${sumarTardanza(asistencias)} min`);
  doc.end();
}

module.exports = { generarExcel, generarPdf };