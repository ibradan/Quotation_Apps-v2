#!/bin/bash

# Docker Management Scripts untuk Quotation App

case "$1" in
  "dev")
    echo "🚀 Starting Development Environment..."
    docker-compose up -d
    echo "✅ Development servers running:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend: http://localhost:3001"
    ;;
    
  "hot")
    echo "🔥 Starting Hot Reload Development Environment..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Hot reload servers running:"
    echo "   Frontend: http://localhost:5173 (auto-refresh)"
    echo "   Backend: http://localhost:3001 (nodemon)"
    echo "   📝 Edit files - changes will auto-update!"
    ;;
    
  "prod")
    echo "🚀 Starting Production Environment..."
    docker-compose -f docker-compose.prod.yml up -d
    echo "✅ Production servers running:"
    echo "   Application: http://localhost"
    ;;
    
  "stop")
    echo "🛑 Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.prod.yml down
    ;;
    
  "restart")
    echo "🔄 Restarting services..."
    docker-compose down
    docker-compose up -d
    ;;
    
  "logs")
    if [ "$2" ]; then
      if [ -f "docker-compose.dev.yml" ] && [ "$(docker-compose -f docker-compose.dev.yml ps -q)" ]; then
        docker-compose -f docker-compose.dev.yml logs -f "$2"
      else
        docker-compose logs -f "$2"
      fi
    else
      if [ -f "docker-compose.dev.yml" ] && [ "$(docker-compose -f docker-compose.dev.yml ps -q)" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
      else
        docker-compose logs -f
      fi
    fi
    ;;
    
  "build")
    echo "🔨 Building Docker images..."
    docker-compose build --no-cache
    docker-compose -f docker-compose.dev.yml build --no-cache
    ;;
    
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    docker volume prune -f
    ;;
    
  "backup")
    echo "💾 Creating backup..."
    mkdir -p ./backups
    docker exec quotation-backend-prod tar -czf - /app/quotation.db > "./backups/quotation-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    echo "✅ Backup created in ./backups/"
    ;;
    
  *)
    echo "📖 Docker Management Script untuk Quotation App"
    echo ""
    echo "Usage: $0 {dev|hot|prod|stop|restart|logs|build|clean|backup}"
    echo ""
    echo "Commands:"
    echo "  dev      - Start development environment"
    echo "  hot      - Start hot reload development (auto-update files)"
    echo "  prod     - Start production environment"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart development services"
    echo "  logs     - Show logs (optional: specify service name)"
    echo "  build    - Rebuild Docker images"
    echo "  clean    - Clean up Docker resources"
    echo "  backup   - Create database backup"
    echo ""
    echo "Examples:"
    echo "  $0 hot            # Start with auto-update"
    echo "  $0 dev            # Start normal development"
    echo "  $0 logs backend   # Show backend logs"
    echo "  $0 clean          # Clean everything"
    ;;
esac
