#!/bin/bash
# Enhanced Deployment Script for Quotation Apps
# Usage: ./scripts/deploy.sh [dev|prod|stop|logs|status|backup|restore|monitor|maintenance]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="quotation_apps-v2"
BACKUP_DIR="./backups"
LOG_DIR="./logs"
MONITORING_INTERVAL=30

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

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
}

# Check if Docker daemon is running
check_docker_daemon() {
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    mkdir -p $BACKUP_DIR
    mkdir -p $LOG_DIR
    mkdir -p ./backend/logs
    print_success "Directories created"
}

# Deploy development environment
deploy_dev() {
    print_header "Deploying Development Environment"
    
    check_docker
    check_docker_daemon
    create_directories
    
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    
    print_status "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Health checks
    print_status "Performing health checks..."
    
    # Backend health check
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Frontend health check
    if curl -f http://localhost:5174 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    print_success "Development environment deployed successfully!"
    echo ""
    print_status "Access URLs:"
    print_status "Frontend: http://localhost:5174"
    print_status "Backend: http://localhost:3001"
    print_status "Health check: http://localhost:3001/health"
    print_status "Statistics: http://localhost:3001/api/stats"
    echo ""
    print_status "📱 Mobile Access:"
    local_ip=$(hostname -I | awk '{print $1}')
    print_status "Frontend: http://$local_ip:5174"
    print_status "Backend: http://$local_ip:3001"
    print_status "Run './scripts/setup-mobile.sh' untuk update IP otomatis"
    echo ""
    print_status "📊 Monitoring:"
    print_status "Run './scripts/deploy.sh monitor' untuk monitoring real-time"
    print_status "Run './scripts/deploy.sh logs' untuk melihat logs"
}

# Deploy production environment
deploy_prod() {
    print_header "Deploying Production Environment"
    
    check_docker
    check_docker_daemon
    create_directories
    
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    print_status "Building and starting production containers..."
    docker-compose --profile prod up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Health checks
    print_status "Performing health checks..."
    
    # Backend health check
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Frontend health check
    if curl -f http://localhost > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    print_success "Production environment deployed successfully!"
    echo ""
    print_status "Access URLs:"
    print_status "Application: http://localhost"
    print_status "Health check: http://localhost/health"
    print_status "Statistics: http://localhost/api/stats"
    echo ""
    print_status "📊 Monitoring:"
    print_status "Run './scripts/deploy.sh monitor' untuk monitoring real-time"
    print_status "Run './scripts/deploy.sh logs' untuk melihat logs"
}

# Stop all containers
stop_containers() {
    print_header "Stopping All Containers"
    
    print_status "Stopping development containers..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    
    print_status "Stopping production containers..."
    docker-compose down --remove-orphans
    
    print_success "All containers stopped"
}

# Show logs
show_logs() {
    print_header "Container Logs"
    
    echo -e "${CYAN}Backend Logs:${NC}"
    docker logs quotation-backend-dev --tail 20 -f &
    BACKEND_PID=$!
    
    echo -e "${CYAN}Frontend Logs:${NC}"
    docker logs quotation-frontend-dev --tail 20 -f &
    FRONTEND_PID=$!
    
    echo ""
    print_status "Press Ctrl+C to stop viewing logs"
    
    # Wait for user to stop
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# Show status
show_status() {
    print_header "Container Status"
    
    echo -e "${CYAN}Running Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo -e "${CYAN}Container Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    echo ""
    echo -e "${CYAN}Health Checks:${NC}"
    
    # Backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend: Healthy"
    else
        print_error "Backend: Unhealthy"
    fi
    
    # Frontend health (dev)
    if curl -f http://localhost:5174 > /dev/null 2>&1; then
        print_success "Frontend (Dev): Healthy"
    else
        print_error "Frontend (Dev): Unhealthy"
    fi
    
    # Frontend health (prod)
    if curl -f http://localhost > /dev/null 2>&1; then
        print_success "Frontend (Prod): Healthy"
    else
        print_error "Frontend (Prod): Unhealthy"
    fi
}

# Backup database
backup_database() {
    print_header "Database Backup"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/quotation_backup_$TIMESTAMP.db"
    
    print_status "Creating backup: $BACKUP_FILE"
    
    # Stop containers to ensure data consistency
    print_status "Stopping containers for backup..."
    docker-compose -f docker-compose.dev.yml down
    
    # Copy database file
    if [ -f "./backend/quotation.db" ]; then
        cp ./backend/quotation.db "$BACKUP_FILE"
        print_success "Backup created: $BACKUP_FILE"
        
        # Show backup info
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_status "Backup size: $BACKUP_SIZE"
    else
        print_error "Database file not found"
        return 1
    fi
    
    # Restart containers
    print_status "Restarting containers..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Backup completed successfully!"
}

# Restore database
restore_database() {
    print_header "Database Restore"
    
    if [ -z "$1" ]; then
        print_error "Please specify backup file to restore"
        echo "Usage: ./scripts/deploy.sh restore <backup_file>"
        echo "Available backups:"
        ls -la $BACKUP_DIR/*.db 2>/dev/null || echo "No backups found"
        exit 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_warning "This will overwrite the current database. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    print_status "Stopping containers..."
    docker-compose -f docker-compose.dev.yml down
    
    print_status "Restoring database from: $BACKUP_FILE"
    cp "$BACKUP_FILE" ./backend/quotation.db
    
    print_status "Restarting containers..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Database restored successfully!"
}

# Real-time monitoring
monitor() {
    print_header "Real-time Monitoring"
    
    print_status "Starting real-time monitoring (Press Ctrl+C to stop)..."
    echo ""
    
    while true; do
        clear
        print_header "System Status - $(date)"
        
        # Container status
        echo -e "${CYAN}Container Status:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10
        
        echo ""
        
        # Resource usage
        echo -e "${CYAN}Resource Usage:${NC}"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        
        echo ""
        
        # Health checks
        echo -e "${CYAN}Health Checks:${NC}"
        
        # Backend
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend: Healthy${NC}"
        else
            echo -e "${RED}✗ Backend: Unhealthy${NC}"
        fi
        
        # Frontend dev
        if curl -f http://localhost:5174 > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend (Dev): Healthy${NC}"
        else
            echo -e "${RED}✗ Frontend (Dev): Unhealthy${NC}"
        fi
        
        # Frontend prod
        if curl -f http://localhost > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend (Prod): Healthy${NC}"
        else
            echo -e "${RED}✗ Frontend (Prod): Unhealthy${NC}"
        fi
        
        echo ""
        echo -e "${YELLOW}Refreshing in $MONITORING_INTERVAL seconds... (Ctrl+C to stop)${NC}"
        
        sleep $MONITORING_INTERVAL
    done
}

# Maintenance tasks
maintenance() {
    print_header "System Maintenance"
    
    print_status "Cleaning up Docker system..."
    docker system prune -f
    
    print_status "Cleaning up unused images..."
    docker image prune -f
    
    print_status "Cleaning up unused volumes..."
    docker volume prune -f
    
    print_status "Cleaning up old logs..."
    find ./logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    print_status "Optimizing database..."
    docker exec quotation-backend-dev node -e "require('./utils/database').optimize()" 2>/dev/null || true
    
    print_status "Clearing cache..."
    docker exec quotation-backend-dev node -e "require('./utils/cache').clear()" 2>/dev/null || true
    
    print_success "Maintenance completed!"
}

# Show help
show_help() {
    print_header "Deployment Script Help"
    
    echo "Usage: ./scripts/deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Deploy development environment"
    echo "  prod        Deploy production environment"
    echo "  stop        Stop all containers"
    echo "  logs        Show real-time logs"
    echo "  status      Show container status and health"
    echo "  backup      Create database backup"
    echo "  restore     Restore database from backup"
    echo "  monitor     Start real-time monitoring"
    echo "  maintenance Run system maintenance tasks"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh dev"
    echo "  ./scripts/deploy.sh restore ./backups/quotation_backup_20231201_143022.db"
    echo "  ./scripts/deploy.sh monitor"
}

# Main script logic
case "${1:-help}" in
    dev)
        deploy_dev
        ;;
    prod)
        deploy_prod
        ;;
    stop)
        stop_containers
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    monitor)
        monitor
        ;;
    maintenance)
        maintenance
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
