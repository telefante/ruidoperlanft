
#!/bin/bash

# Configuración inicial
set -e
set -u

# Variables
REMOTE_PATH="ssh-w0131c00@w0131c00.kasserver.com:/www/htdocs/w0131c00/ruidoperlanft.artincommon.de"

# Paso 1: Build de Gatsby
echo "Iniciando el build de Gatsby..."
sudo NODE_OPTIONS="--max-old-space-size=8192" gatsby build
if [ $? -eq 0 ]; then
  echo "Build completado exitosamente."
else
  echo "Error durante el build de Gatsby."
  exit 1
fi

# Paso 2: Sincronizar archivos con el servidor remoto usando rsync
echo "Iniciando sincronización con el servidor remoto..."
if [ -d "public" ] && [ "$(ls -A public)" ]; then
  rsync -av --progress public/* "$REMOTE_PATH"
else
  echo "Error: No se encontró el directorio public o está vacío."
  exit 1
fi

if [ $? -eq 0 ]; then
  echo "Sincronización completada exitosamente."
else
  echo "Error durante la sincronización. Revisa los logs."
  exit 1
fi

echo "Proceso completado exitosamente."