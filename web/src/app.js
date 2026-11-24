const path = require('path');
const express = require('express');
const session = require('express-session');
const routes = require('./routes');

const app = express();
const PUERTO = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 horas
  })
);

// Disponible en todas las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

app.use(routes);

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send('Ocurrió un error en el servidor');
});

app.listen(PUERTO, '0.0.0.0', () => {
  console.log(`Web escuchando en el puerto ${PUERTO}`);
});