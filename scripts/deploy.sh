#!/bin/bash

# Script deployment untuk Quotation Apps
# Usage: ./scripts/deploy.sh [dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Check if Docker daemon is running
check_docker_daemon() {
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/uploads
    mkdir -p nginx/ssl
    mkdir -p logs
    
    print_success "Directories created"
}

# Build and start development environment
deploy_dev() {
    print_status "Deploying development environment..."
    
    # Stop existing containers
    docker-compose -f docker-compose.dev.yml down
    
    # Build and start containers
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_success "Development environment deployed!"
    print_status "Frontend: http://localhost:5174"
    print_status "Backend: http://localhost:3001"
    print_status "Health check: http://localhost:3001/health"
    echo ""
    print_status "📱 Mobile Access:"
    local_ip=$(hostname -I | awk '{print $1}')
    print_status "Frontend: http://$local_ip:5174"
    print_status "Backend: http://$local_ip:3001"
    print_status "Run './scripts/setup-mobile.sh' untuk update IP otomatis"
}

# Build and start production environment
deploy_prod() {
    print_status "Deploying production environment..."
    
    # Stop existing containers
    docker-compose --profile prod down
    
    # Build and start containers
    docker-compose --profile prod up --build -d
    
    print_success "Production environment deployed!"
    print_status "Application: http://localhost"
    print_status "Health check: http://localhost/health"
}

# Stop all containers
stop_all() {
    print_status "Stopping all containers..."
    
    docker-compose -f docker-compose.dev.yml down
    docker-compose --profile prod down
    
    print_success "All containers stopped"
}

# Show logs
show_logs() {
    local service=$1
    local env=${2:-dev}
    
    if [ "$env" = "prod" ]; then
        docker-compose --profile prod logs -f $service
    else
        docker-compose -f docker-compose.dev.yml logs -f $service
    fi
}

# Show status
show_status() {
    print_status "Container status:"
    docker-compose -f docker-compose.dev.yml ps
    echo ""
    docker-compose --profile prod ps
}

# Backup database
backup_db() {
    print_status "Creating database backup..."
    
    if [ -f "backend/quotation.db" ]; then
        cp backend/quotation.db backend/quotation.db.backup.$(date +%Y%m%d_%H%M%S)
        print_success "Database backed up"
    else
        print_warning "No database file found to backup"
    fi
}

# Restore database
restore_db() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file"
        exit 1
    fi
    
    if [ -f "$backup_file" ]; then
        cp "$backup_file" backend/quotation.db
        print_success "Database restored from $backup_file"
    else
        print_error "Backup file $backup_file not found"
        exit 1
    fi
}

# Main script
main() {
    local command=${1:-dev}
    
    case $command in
        "dev")
            check_docker
            check_docker_daemon
            create_directories
            deploy_dev
            ;;
        "prod")
            check_docker
            check_docker_daemon
            create_directories
            deploy_prod
            ;;
        "stop")
            stop_all
            ;;
        "logs")
            show_logs $2 $3
            ;;
        "status")
            show_status
            ;;
        "backup")
            backup_db
            ;;
        "restore")
            restore_db $2
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  dev     - Deploy development environment"
            echo "  prod    - Deploy production environment"
            echo "  stop    - Stop all containers"
            echo "  logs    - Show logs (usage: $0 logs [service] [env])"
            echo "  status  - Show container status"
            echo "  backup  - Backup database"
            echo "  restore - Restore database (usage: $0 restore [backup_file])"
            echo "  help    - Show this help message"
            ;;
        *)
            print_error "Unknown command: $command"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
