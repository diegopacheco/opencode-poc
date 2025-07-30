#!/bin/bash

echo "🚀 Starting Coaching Application Full Stack..."
echo "=================================================="

echo "📋 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

echo "🏗️  Building and starting all services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "🔍 Checking service status..."
docker-compose ps

echo "🏥 Checking MySQL health..."
until docker exec coaching-mysql mysqladmin ping -h localhost --silent; do
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 5
done

echo "✅ MySQL is ready!"

echo "🔍 Testing backend API..."
sleep 5
backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
if [ "$backend_health" == "200" ]; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check returned: $backend_health"
fi

echo "🔍 Testing frontend..."
frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$frontend_health" == "200" ]; then
    echo "✅ Frontend is healthy!"
else
    echo "⚠️  Frontend health check returned: $frontend_health"
fi

echo "=================================================="
echo "🎉 Coaching Application is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🗄️  MySQL: localhost:3306"
echo ""
echo "📊 Sample API endpoints:"
echo "  GET  http://localhost:8080/health"
echo "  GET  http://localhost:8080/api/v1/members"
echo "  GET  http://localhost:8080/api/v1/teams"
echo "  GET  http://localhost:8080/api/v1/feedbacks"
echo ""
echo "🛑 To stop: docker-compose down"
echo "📝 To view logs: docker-compose logs -f"
echo "=================================================="