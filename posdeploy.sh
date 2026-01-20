#!/bin/bash
set -e

echo "=== POSTDEPLOY QGTUNNEL ==="

# Ir al directorio del proyecto
cd $RENDER_SERVICE_ROOT || exit 1

# Listar archivos antes de chmod
echo "Contenido antes de chmod:"
ls -l

# Asignar permisos de ejecución al binario
echo "Asignando permisos de ejecución a qgtunnel..."
chmod +x ./qgtunnel || echo "Error asignando permisos"

# Verificar permisos
echo "Contenido después de chmod:"
ls -l

echo "=== FIN POSTDEPLOY ==="
