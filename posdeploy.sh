#!/bin/bash
set -e  # Salir si hay errores

echo "=== POSTDEPLOY QGTUNNEL ==="

# Ir al directorio del proyecto (Render define esta variable)
cd $RENDER_SERVICE_ROOT || exit 1

echo "Contenido antes de chmod:"
ls -l qgtunnel

echo "Asignando permisos de ejecución a qgtunnel..."
chmod +x qgtunnel

echo "Contenido después de chmod:"
ls -l qgtunnel

echo "=== FIN POSTDEPLOY ==="
