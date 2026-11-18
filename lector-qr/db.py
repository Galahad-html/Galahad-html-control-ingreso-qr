"""Acceso a la base de datos: buscar trabajadores y registrar asistencias."""
from datetime import datetime

import mysql.connector

from config import DB_CONFIG, PUERTA_ID


def obtener_conexion():
    return mysql.connector.connect(**DB_CONFIG)


def buscar_trabajador(conexion, codigo_qr):
    """Devuelve el trabajador activo con ese QR, o None."""
    cursor = conexion.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT id, nombres, apellidos, hora_entrada_oficial
        FROM trabajadores
        WHERE codigo_qr = %s AND activo = 1
        """,
        (codigo_qr,),
    )
    trabajador = cursor.fetchone()
    cursor.close()
    return trabajador


def calcular_minutos_tardanza(hora_entrada, hora_oficial):
    """Minutos de retraso respecto a la hora oficial (0 si llegó a tiempo)."""
    segundos = hora_entrada.hour * 3600 + hora_entrada.minute * 60 + hora_entrada.second
    segundos_oficial = int(hora_oficial.total_seconds())
    diferencia = (segundos - segundos_oficial) // 60
    return max(0, diferencia)


def registrar_asistencia(conexion, trabajador):
    """
    Registra la entrada del día.
    Devuelve (True, minutos_tardanza) si se registró, o (False, 0) si ya tenía registro hoy.
    """
    ahora = datetime.now()
    tardanza = calcular_minutos_tardanza(ahora, trabajador["hora_entrada_oficial"])

    cursor = conexion.cursor()
    cursor.execute(
        """
        INSERT IGNORE INTO asistencias
            (trabajador_id, puerta_id, fecha, hora_entrada, minutos_tardanza)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (trabajador["id"], PUERTA_ID, ahora.date(), ahora.time(), tardanza),
    )
    conexion.commit()
    registrado = cursor.rowcount == 1
    cursor.close()
    return registrado, tardanza