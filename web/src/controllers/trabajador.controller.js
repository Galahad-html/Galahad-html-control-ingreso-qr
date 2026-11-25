const { randomUUID } = require('crypto');
const QRCode = require('qrcode');
const trabajadorModel = require('../models/trabajador.model');

const REGEX_DNI = /^\d{8}$/;

function leerFormulario(body) {
  return {
    dni: (body.dni || '').trim(),
    nombres: (body.nombres || '').trim(),
    apellidos: (body.apellidos || '').trim(),
    area: (body.area || '').trim(),
    horaEntrada: body.horaEntrada || '08:00',
  };
}

function validar(datos) {
  if (!REGEX_DNI.test(datos.dni)) return 'El DNI debe tener 8 dígitos';
  if (!datos.nombres || !datos.apellidos || !datos.area) {
    return 'Nombres, apellidos y área son obligatorios';
  }
  return null;
}

async function listar(req, res) {
  const trabajadores = await trabajadorModel.listarTodos();
  res.render('trabajadores/listado', { titulo: 'Trabajadores', trabajadores });
}

function formularioNuevo(req, res) {
  res.render('trabajadores/formulario', {
    titulo: 'Nuevo trabajador',
    trabajador: { hora_entrada_oficial: '08:00:00' },
    error: null,
    accion: '/trabajadores',
  });
}

async function crear(req, res) {
  const datos = leerFormulario(req.body);
  const error =
    validar(datos) ||
    ((await trabajadorModel.buscarPorDni(datos.dni)) ? 'Ya existe un trabajador con ese DNI' : null);

  if (error) {
    return res.status(400).render('trabajadores/formulario', {
      titulo: 'Nuevo trabajador',
      trabajador: { ...datos, hora_entrada_oficial: datos.horaEntrada },
      error,
      accion: '/trabajadores',
    });
  }

  await trabajadorModel.crear({ ...datos, codigoQr: `QR-${randomUUID()}` });
  res.redirect('/trabajadores');
}

async function formularioEditar(req, res) {
  const trabajador = await trabajadorModel.buscarPorId(req.params.id);
  if (!trabajador) return res.status(404).send('Trabajador no encontrado');

  res.render('trabajadores/formulario', {
    titulo: 'Editar trabajador',
    trabajador,
    error: null,
    accion: `/trabajadores/${trabajador.id}`,
  });
}

async function actualizar(req, res) {
  const id = req.params.id;
  const datos = leerFormulario(req.body);
  const existente = await trabajadorModel.buscarPorDni(datos.dni);
  const error =
    validar(datos) ||
    (existente && String(existente.id) !== String(id) ? 'Ya existe otro trabajador con ese DNI' : null);

  if (error) {
    return res.status(400).render('trabajadores/formulario', {
      titulo: 'Editar trabajador',
      trabajador: { id, ...datos, hora_entrada_oficial: datos.horaEntrada },
      error,
      accion: `/trabajadores/${id}`,
    });
  }

  await trabajadorModel.actualizar(id, datos);
  res.redirect('/trabajadores');
}

async function cambiarEstado(req, res) {
  const activo = req.body.activo === '1' ? 1 : 0;
  await trabajadorModel.cambiarEstado(req.params.id, activo);
  res.redirect('/trabajadores');
}

async function mostrarQr(req, res) {
  const trabajador = await trabajadorModel.buscarPorId(req.params.id);
  if (!trabajador) return res.status(404).send('Trabajador no encontrado');

  const imagen = await QRCode.toBuffer(trabajador.codigo_qr, { width: 400, margin: 2 });
  if (req.query.descargar) {
    res.attachment(`${trabajador.dni}_QR.png`);
  }
  res.type('png').send(imagen);
}

module.exports = {
  listar,
  formularioNuevo,
  crear,
  formularioEditar,
  actualizar,
  cambiarEstado,
  mostrarQr,
};