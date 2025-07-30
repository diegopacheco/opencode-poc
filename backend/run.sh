#!/bin/bash

echo "Starting coaching backend..."

if [ ! -f "bin/coaching-backend" ]; then
    echo "Binary not found. Building first..."
    ./build.sh
fi

export DB_DSN="${DB_DSN:-root:password@tcp(localhost:3306)/coaching_app?charset=utf8mb4&parseTime=True&loc=Local}"

echo "Using database: $DB_DSN"
echo "Server starting on port 8080..."

./bin/coaching-backend