#!/bin/bash
set -e

echo "=== POSTDEPLOY QGTUNNEL ==="

echo "RENDER_SERVICE_ROOT = $RENDER_SERVICE_ROOT"

# Entrar al directorio real del proyecto
cd "$RENDER_SERVICE_ROOT/project" || {
  echo "No se pudo entrar al directorio project"
  exit 1
}

echo "Directorio actual:"
pwd

echo "Contenido antes de chmod:"
ls -l

echo "Asignando permisos de ejecución a qgtunnel..."
chmod +x qgtunnel

echo "Contenido después de chmod:"
ls -l qgtunnel

echo "Arrancando QGTunnel en background..."
./qgtunnel &

echo "=== FIN POSTDEPLOY ==="
