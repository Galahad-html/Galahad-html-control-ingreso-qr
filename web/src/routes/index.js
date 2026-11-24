const express = require('express');
const authController = require('../controllers/auth.controller');
const dashboardController = require('../controllers/dashboard.controller');
const asistenciaController = require('../controllers/asistencia.controller');
const { requiereLogin } = require('../middlewares/auth');

const router = express.Router();

// Pasa los errores de funciones async al manejador global de Express
const atrapar = (controlador) => (req, res, next) =>
  Promise.resolve(controlador(req, res, next)).catch(next);

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/login', authController.mostrarLogin);
router.post('/login', atrapar(authController.login));
router.post('/logout', authController.logout);

router.get('/dashboard', requiereLogin, dashboardController.mostrarDashboard);
router.get('/asistencias', requiereLogin, atrapar(asistenciaController.listar));

module.exports = router;