#!/bin/bash

echo "🛑 Stopping Coaching Application..."
echo "=================================="

echo "📋 Checking if Docker Compose services are running..."
if docker-compose ps -q 2>/dev/null | grep -q .; then
    echo "🔄 Stopping all Docker Compose services..."
    docker-compose down --remove-orphans
    
    echo "🧹 Cleaning up containers and networks..."
    docker-compose down -v
    
    echo "📊 Current Docker status:"
    docker-compose ps
else
    echo "ℹ️  No Docker Compose services are currently running"
fi

echo "🔍 Checking for any remaining coaching-related containers..."
remaining_containers=$(docker ps -a --filter name=coaching- -q)
if [ ! -z "$remaining_containers" ]; then
    echo "🧹 Removing remaining coaching containers..."
    docker rm -f $remaining_containers
fi

echo "=================================="
echo "✅ Coaching Application stopped!"
echo "💡 To start again: ./start.sh"
echo "=================================="