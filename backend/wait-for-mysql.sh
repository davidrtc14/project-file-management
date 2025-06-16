#!/bin/sh

# Espera o MySQL aceitar conexões
echo "Aguardando MySQL em $DB_HOST:$DB_PORT..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "MySQL está pronto! Iniciando servidor..."
exec "$@"
