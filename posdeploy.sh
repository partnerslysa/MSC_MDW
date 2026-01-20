#!/bin/bash
set -e

echo "=== POSTDEPLOY QGTUNNEL ==="

#echo "RENDER_SERVICE_ROOT = $RENDER_SERVICE_ROOT"

echo "Directorio actual:"
pwd

echo "Contenido antes de chmod:"
ls -l

# Entrar al directorio real del proyecto

echo "16.Directorio actual:"
pwd

echo "19.Contenido antes de chmod:"
ls -l

echo "Asignando permisos de ejecución a qgtunnel..."
chmod +x qgtunnel

echo "Contenido después de chmod:"
ls -l qgtunnel

echo "Arrancando QGTunnel en background..."
./qgtunnel &

echo "=== FIN POSTDEPLOY ==="
