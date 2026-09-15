#!/usr/bin/env bash
# ==============================================================================
# Script interactivo para restaurar un backup de PostgreSQL en Docker
# Compatible con macOS (Bash 3.2+) y Linux (Bash 4+)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

BACKUP_DIR="${ROOT_DIR}/backups/db"

if [ ! -d "${BACKUP_DIR}" ]; then
    echo "[ERROR] El directorio de backups ${BACKUP_DIR} no existe."
    exit 1
fi

# Extraer variables de .env de forma segura sin evaluar globs ni comandos
get_env_var() {
    local var_name="$1"
    local default_value="$2"
    if [ -f "${ROOT_DIR}/.env" ]; then
        local val
        val="$(grep "^${var_name}=" "${ROOT_DIR}/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
        if [ -n "${val}" ]; then
            echo "${val}"
            return
        fi
    fi
    echo "${default_value}"
}

DB_USER="$(get_env_var "POSTGRES_USER" "postgres")"
DB_NAME="$(get_env_var "POSTGRES_DB" "wedding_app")"

echo "================================================================="
echo "   RESTAURACION DE COPIA DE SEGURIDAD - POSTGRESQL (DOCKER)      "
echo "================================================================="
echo "Base de datos destino: ${DB_NAME} (Usuario: ${DB_USER})"
echo ""

# Buscar archivos de backup disponibles excluyendo enlaces simbólicos / duplicados de latest si hay fechados
BACKUP_FILES=()
while IFS= read -r file; do
    if [ -n "${file}" ] && [ -f "${file}" ]; then
        BACKUP_FILES+=("${file}")
    fi
done < <(find "${BACKUP_DIR}" -type f -name "*.sql.gz" | sort -r)

if [ ${#BACKUP_FILES[@]} -eq 0 ]; then
    echo "[ERROR] No se encontraron archivos .sql.gz en ${BACKUP_DIR}."
    exit 1
fi

SELECTED_BACKUP=""

if [ $# -ge 1 ]; then
    # Archivo proporcionado por argumento
    if [ -f "$1" ]; then
        SELECTED_BACKUP="$1"
    elif [ -f "${BACKUP_DIR}/$1" ]; then
        SELECTED_BACKUP="${BACKUP_DIR}/$1"
    else
        echo "[ERROR] El archivo especificado '$1' no existe."
        exit 1
    fi
else
    # Selección interactiva
    echo "Selecciona el backup que deseas restaurar:"
    for i in "${!BACKUP_FILES[@]}"; do
        FILE_PATH="${BACKUP_FILES[$i]}"
        REL_NAME="${FILE_PATH#"${ROOT_DIR}/"}"
        FILE_SIZE="$(du -h "${FILE_PATH}" | cut -f1)"
        FILE_DATE="$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "${FILE_PATH}" 2>/dev/null || stat -c "%y" "${FILE_PATH}" 2>/dev/null || echo "Fecha N/A")"
        printf " [%d] %s (%s - %s)\n" "$((i + 1))" "${REL_NAME}" "${FILE_SIZE}" "${FILE_DATE}"
    done
    echo ""
    read -rp "Introduce el numero del backup (1-${#BACKUP_FILES[@]}): " CHOICE

    if ! [[ "${CHOICE}" =~ ^[0-9]+$ ]] || [ "${CHOICE}" -lt 1 ] || [ "${CHOICE}" -gt "${#BACKUP_FILES[@]}" ]; then
        echo "[ERROR] Seleccion no valida. Operacion cancelada."
        exit 1
    fi

    SELECTED_BACKUP="${BACKUP_FILES[$((CHOICE - 1))]}"
fi

echo ""
echo "[ADVERTENCIA DE SEGURIDAD]"
echo "Se restaurara el archivo: ${SELECTED_BACKUP#"${ROOT_DIR}/"}"
echo "Esta accion sobreescribira o agregara datos a la base de datos actual '${DB_NAME}'."
read -rp "¿Estas seguro de continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "${CONFIRM}" != "SI" ]; then
    echo "[CANCELADO] Operacion cancelada por el usuario."
    exit 0
fi

echo ""
echo "[INFO] Limpiando esquema previo y restaurando base de datos..."

# Limpiar esquema previo para permitir restauración limpia de tablas y registros
docker compose exec -T db psql -U "${DB_USER}" -d "${DB_NAME}" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

# Ejecutar restauración del dump SQL
gunzip -c "${SELECTED_BACKUP}" | docker compose exec -T db psql -U "${DB_USER}" -d "${DB_NAME}" --quiet

echo ""
echo "[SUCCESS] Base de datos restaurada satisfactoriamente desde ${SELECTED_BACKUP#"${ROOT_DIR}/"}."
