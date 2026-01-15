#!/bin/bash

# Dar permisos de ejecución al binario y al script
chmod +x ./qgtunnel
chmod +x ./postdeploy.sh

# Iniciar QGTunnel en background
./qgtunnel &

echo "QGTunnel iniciado correctamente."
