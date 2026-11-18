"""Lector de QR de la puerta de ingreso: webcam -> OpenCV -> MySQL."""
import time

import cv2

from config import CAMARA_INDEX, PUERTA_ID, SEGUNDOS_ANTIRREBOTE
from db import buscar_trabajador, obtener_conexion, registrar_asistencia

VERDE = (0, 200, 0)
ROJO = (0, 0, 220)
SEGUNDOS_MENSAJE = 3

def leer_qr(detector, frame):
    """Devuelve el texto del QR del frame, o '' si no hay ninguno legible."""
    try:
        codigo, _, _ = detector.detectAndDecode(frame)
        return codigo
    except cv2.error:
        return ""


def procesar_codigo(conexion, codigo):
    """Valida el QR y registra la entrada. Devuelve (mensaje, color)."""
    trabajador = buscar_trabajador(conexion, codigo)
    if trabajador is None:
        return "QR no valido", ROJO

    nombre = f"{trabajador['nombres']} {trabajador['apellidos']}"
    registrado, tardanza = registrar_asistencia(conexion, trabajador)

    if not registrado:
        return f"{nombre}: ya registrado hoy", ROJO
    if tardanza > 0:
        return f"Bienvenido {nombre} (tardanza: {tardanza} min)", VERDE
    return f"Bienvenido {nombre}", VERDE


def dibujar_mensaje(frame, mensaje, color):
    cv2.rectangle(frame, (0, 0), (frame.shape[1], 50), color, -1)
    cv2.putText(frame, mensaje, (10, 33), cv2.FONT_HERSHEY_SIMPLEX,
                0.8, (255, 255, 255), 2)


def main():
    conexion = obtener_conexion()
    camara = cv2.VideoCapture(CAMARA_INDEX)
    if not camara.isOpened():
        print("No se pudo abrir la camara.")
        return

    detector = cv2.QRCodeDetector()
    ultimo_codigo = None
    ultima_lectura = 0.0
    mensaje, color, mensaje_hasta = "", VERDE, 0.0

    print(f"Puerta N°{PUERTA_ID} activa. Presiona 'q' para salir.")

    while True:
        ok, frame = camara.read()
        if not ok:
            break

        codigo = leer_qr(detector, frame)
        ahora = time.time()

        es_nuevo = codigo != ultimo_codigo or ahora - ultima_lectura > SEGUNDOS_ANTIRREBOTE
        if codigo and es_nuevo:
            mensaje, color = procesar_codigo(conexion, codigo)
            mensaje_hasta = ahora + SEGUNDOS_MENSAJE
            ultimo_codigo = codigo
            ultima_lectura = ahora
            print(mensaje)

        if ahora < mensaje_hasta:
            dibujar_mensaje(frame, mensaje, color)

        cv2.imshow(f"Puerta N°{PUERTA_ID}", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    camara.release()
    cv2.destroyAllWindows()
    conexion.close()


if __name__ == "__main__":
    main()