"""Genera una imagen PNG de QR por cada trabajador activo."""
from pathlib import Path

import qrcode

from db import obtener_conexion

CARPETA_SALIDA = Path("qr_generados")


def main():
    CARPETA_SALIDA.mkdir(exist_ok=True)

    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT codigo_qr, dni, nombres, apellidos FROM trabajadores WHERE activo = 1")

    for t in cursor.fetchall():
        imagen = qrcode.make(t["codigo_qr"])
        ruta = CARPETA_SALIDA / f"{t['dni']}_{t['apellidos'].split()[0]}.png"
        imagen.save(ruta)
        print(f"Generado: {ruta}")

    cursor.close()
    conexion.close()


if __name__ == "__main__":
    main()