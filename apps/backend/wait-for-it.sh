#!/bin/sh
# wait-for-it.sh

set -e

# Debug: Print environment variables
echo "Debug: Environment variables:"
echo "POSTGRES_USER: postgres"
echo "POSTGRES_PASSWORD: asdgekvnknrgkwuer"
echo "POSTGRES_DB: ghibli"

host="$1"
port="$2"
shift 2
cmd="$@"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -p "5432" -U "postgres" -d "ghibli" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec "$@" 