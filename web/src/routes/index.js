const express = require('express');
const authController = require('../controllers/auth.controller');
const dashboardController = require('../controllers/dashboard.controller');
const { requiereLogin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/login', authController.mostrarLogin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/dashboard', requiereLogin, dashboardController.mostrarDashboard);

module.exports = router;