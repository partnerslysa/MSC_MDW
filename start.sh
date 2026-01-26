#!/bin/bash

echo "Copiando qgtunnel a /tmp..."
cp ./qgtunnel /tmp/qgtunnel

echo "Dando permisos de ejecución y escritura a /tmp/qgtunnel..."
chmod +wx /tmp/qgtunnel

echo "Levantando qgtunnel..."
/tmp/qgtunnel &

echo "Levantando la app Node..."
node app.js