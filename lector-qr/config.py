"""Configuración del lector, leída desde variables de entorno (.env)."""
import os

from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "database": os.getenv("DB_NAME", "control_ingreso"),
    "user": os.getenv("DB_USER", "app_user"),
    "password": os.getenv("DB_PASSWORD", ""),
}

PUERTA_ID = int(os.getenv("PUERTA_ID", "1"))
CAMARA_INDEX = int(os.getenv("CAMARA_INDEX", "0"))
SEGUNDOS_ANTIRREBOTE = int(os.getenv("SEGUNDOS_ANTIRREBOTE", "5"))