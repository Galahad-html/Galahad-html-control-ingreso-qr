const express = require('express');
const authController = require('../controllers/auth.controller');
const dashboardController = require('../controllers/dashboard.controller');
const asistenciaController = require('../controllers/asistencia.controller');
const trabajadorController = require('../controllers/trabajador.controller');
const { requiereLogin, requiereRol } = require('../middlewares/auth');

const router = express.Router();

// Pasa los errores de funciones async al manejador global de Express
const atrapar = (controlador) => (req, res, next) =>
  Promise.resolve(controlador(req, res, next)).catch(next);

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/login', authController.mostrarLogin);
router.post('/login', atrapar(authController.login));
router.post('/logout', authController.logout);

router.get('/dashboard', requiereLogin, atrapar(dashboardController.mostrarDashboard));
router.get('/asistencias', requiereLogin, atrapar(asistenciaController.listar));

// Rutas de gestión de trabajadores
const soloGestion = [requiereLogin, requiereRol('admin', 'rrhh')];

router.get('/trabajadores', soloGestion, atrapar(trabajadorController.listar));
router.get('/trabajadores/nuevo', soloGestion, trabajadorController.formularioNuevo);
router.post('/trabajadores', soloGestion, atrapar(trabajadorController.crear));
router.get('/trabajadores/:id/editar', soloGestion, atrapar(trabajadorController.formularioEditar));
router.post('/trabajadores/:id', soloGestion, atrapar(trabajadorController.actualizar));
router.post('/trabajadores/:id/estado', soloGestion, atrapar(trabajadorController.cambiarEstado));
router.get('/trabajadores/:id/qr', soloGestion, atrapar(trabajadorController.mostrarQr));

module.exports = router;
