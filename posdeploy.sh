#!/bin/bash
set -e

echo "=== Iniciando configuración QGTunnel ==="

cd $RENDER_SERVICE_ROOT

echo "Verificando binario QGTunnel..."
ls -l qgtunnel

chmod +x qgtunnel

echo "Iniciando QGTunnel en background..."
./qgtunnel -c qgtunnel.conf > qgtunnel.log 2>&1 &

sleep 2

echo "Verificando si QGTunnel está escuchando en 2222..."
netstat -tlnp || ss -tlnp

echo "=== QGTunnel iniciado ==="
