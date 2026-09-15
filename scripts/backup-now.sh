#!/usr/bin/env bash
# ==============================================================================
# Script para realizar un backup manual inmediato de PostgreSQL en Docker
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "[INFO] Iniciando backup manual de la base de datos..."

# Verificar si el contenedor wedding-db-backup está corriendo
if docker compose ps db-backup | grep -q "Up\|running"; then
    echo "[INFO] Ejecutando backup a través del servicio 'wedding-db-backup'..."
    docker compose exec db-backup /backup.sh
else
    echo "[AVISO] El servicio 'wedding-db-backup' no está corriendo. Iniciándolo..."
    docker compose up -d db-backup
    sleep 3
    docker compose exec db-backup /backup.sh
fi

echo "[SUCCESS] Backup completado con éxito."
echo "[INFO] Archivos de backup disponibles en ./backups/db:"
find "${ROOT_DIR}/backups/db" -type f -name "*.sql.gz" -exec ls -lh {} + 2>/dev/null || echo "No se encontraron archivos en ./backups/db"
