#!/bin/bash

# Salir si hay errores
set -e

echo "=== Configurando QGTunnel ==="

# Ir al directorio del proyecto
cd $RENDER_SERVICE_ROOT || exit 1

# Extraer qgtunnel si no existe el ejecutable
if [ ! -f ./qgtunnel ]; then
  echo "Extrayendo qgtunnel.tar.gz..."
  tar -xvzf qgtunnel.tar.gz
  chmod +x qgtunnel
fi

echo "QGTunnel listo:"
./qgtunnel --version || echo "No se pudo ejecutar qgtunnel aún."

echo "=== Fin de postdeploy ==="
