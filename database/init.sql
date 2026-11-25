SET NAMES utf8mb4;

-- Control de Ingreso de Personal con QR

CREATE DATABASE IF NOT EXISTS control_ingreso
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE control_ingreso;


-- Usuarios del sistema web (RRHH, supervisores, admin)

CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           ENUM('admin', 'rrhh', 'supervisor') NOT NULL DEFAULT 'rrhh',
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- Trabajadores (cada uno tiene un QR único)

CREATE TABLE trabajadores (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  codigo_qr            VARCHAR(64) NOT NULL UNIQUE,
  dni                  CHAR(8) NOT NULL UNIQUE,
  nombres              VARCHAR(100) NOT NULL,
  apellidos            VARCHAR(100) NOT NULL,
  area                 VARCHAR(80) NOT NULL,
  hora_entrada_oficial TIME NOT NULL DEFAULT '08:00:00',
  activo               TINYINT(1) NOT NULL DEFAULT 1,
  creado_en            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trabajadores_area (area)
) ENGINE=InnoDB;


-- Puertas de ingreso (cámaras)

CREATE TABLE puertas (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;


-- Asistencias (una entrada por trabajador por día)

CREATE TABLE asistencias (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  trabajador_id    INT NOT NULL,
  puerta_id        INT NOT NULL,
  fecha            DATE NOT NULL,
  hora_entrada     TIME NOT NULL,
  minutos_tardanza INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_asistencia_trabajador FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id),
  CONSTRAINT fk_asistencia_puerta     FOREIGN KEY (puerta_id)     REFERENCES puertas(id),
  UNIQUE KEY uq_trabajador_fecha (trabajador_id, fecha),
  INDEX idx_asistencias_fecha (fecha)
) ENGINE=InnoDB;


-- Datos de prueba

INSERT INTO puertas (nombre) VALUES ('Puerta N°1'), ('Puerta N°2');

INSERT INTO trabajadores (codigo_qr, dni, nombres, apellidos, area, hora_entrada_oficial) VALUES
('QR-0001-DEMO', '70000001', 'Ana',   'Quispe Rojas',   'Sistemas',   '08:00:00'),
('QR-0002-DEMO', '70000002', 'Luis',  'Mendoza Vega',   'Contabilidad','08:00:00'),
('QR-0003-DEMO', '70000003', 'Carla', 'Torres Díaz',    'Recursos Humanos','08:30:00');