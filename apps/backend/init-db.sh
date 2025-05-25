#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE DATABASE ghibli;
    GRANT ALL PRIVILEGES ON DATABASE ghibli TO $POSTGRES_USER;
EOSQL 