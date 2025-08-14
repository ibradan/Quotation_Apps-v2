# Docker Deployment Guide - Quotation Apps

## Overview

Aplikasi Quotation Apps telah dikonfigurasi untuk berjalan dengan Docker di lingkungan Linux. Setup ini mencakup:

- **Backend**: Node.js Express API dengan SQLite
- **Frontend**: React dengan Vite
- **Nginx**: Reverse proxy untuk production
- **Database**: SQLite dengan volume mounting

## Prerequisites

### Install Docker di Linux

```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

## Quick Start

### Development Environment

```bash
# Deploy development environment
./scripts/deploy.sh dev

# View logs
./scripts/deploy.sh logs backend dev
./scripts/deploy.sh logs frontend dev

# Stop development environment
./scripts/deploy.sh stop
```

### Production Environment

```bash
# Deploy production environment
./scripts/deploy.sh prod

# View logs
./scripts/deploy.sh logs backend prod
./scripts/deploy.sh logs nginx prod

# Stop production environment
./scripts/deploy.sh stop
```

## Manual Docker Commands

### Development

```bash
# Build and start development containers
docker-compose -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Build and start production containers
docker-compose --profile prod up --build -d

# View logs
docker-compose --profile prod logs -f

# Stop containers
docker-compose --profile prod down
```

## Service URLs

### Development
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Production
- **Application**: http://localhost
- **Health Check**: http://localhost/health

## Database Management

### Backup Database
```bash
./scripts/deploy.sh backup
```

### Restore Database
```bash
./scripts/deploy.sh restore backend/quotation.db.backup.20241201_143022
```

### Manual Database Operations
```bash
# Access database inside container
docker exec -it quotation-backend-dev sqlite3 /app/backend/quotation.db

# Copy database from container
docker cp quotation-backend-dev:/app/backend/quotation.db ./backend/quotation.db.backup
```

## Environment Variables

### Backend Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Port untuk backend (default: 3001)
- `DB_PATH`: Path ke database file

### Frontend Environment Variables
- `VITE_API_URL`: URL backend API

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Fix Docker permissions
   sudo chmod 666 /var/run/docker.sock
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3001
   
   # Kill process using port
   sudo kill -9 <PID>
   ```

3. **Database Locked**
   ```bash
   # Stop containers and remove volumes
   docker-compose down -v
   
   # Restart containers
   docker-compose up -d
   ```

4. **Container Won't Start**
   ```bash
   # Check container logs
   docker logs quotation-backend-dev
   
   # Rebuild containers
   docker-compose build --no-cache
   ```

### Health Checks

```bash
# Check backend health
curl http://localhost:3001/health

# Check all containers status
./scripts/deploy.sh status
```

## File Structure

```
Quotation_Apps-v2/
├── Dockerfile                    # Main Dockerfile
├── docker-compose.yml           # Production compose
├── docker-compose.dev.yml       # Development compose
├── .dockerignore                # Docker ignore file
├── scripts/
│   └── deploy.sh               # Deployment script
├── nginx/
│   └── nginx.conf              # Nginx configuration
├── frontend/
│   ├── Dockerfile.dev          # Frontend dev Dockerfile
│   ├── Dockerfile.prod         # Frontend prod Dockerfile
│   └── nginx.conf              # Frontend nginx config
├── backend/
│   ├── index.js                # Backend application
│   ├── quotation.db            # SQLite database
│   └── uploads/                # Upload directory
└── logs/                       # Application logs
```

## Security Considerations

1. **Database Security**
   - Database file is mounted as volume
   - Regular backups recommended
   - Consider using external database for production

2. **Network Security**
   - Containers run in isolated network
   - Only necessary ports exposed
   - Nginx provides additional security layer

3. **File Permissions**
   - Containers run as non-root user
   - Proper file permissions set
   - Volume mounts with correct ownership

## Performance Optimization

1. **Multi-stage Builds**
   - Separate build and runtime stages
   - Smaller production images
   - Faster builds

2. **Caching**
   - Docker layer caching
   - Nginx static file caching
   - Database query optimization

3. **Resource Limits**
   - Memory and CPU limits can be set
   - Health checks for monitoring
   - Automatic restart policies

## Monitoring

### Container Monitoring
```bash
# View resource usage
docker stats

# View container logs
docker logs -f quotation-backend-dev

# Check container health
docker inspect quotation-backend-dev | grep Health -A 10
```

### Application Monitoring
```bash
# Health check endpoint
curl http://localhost:3001/health

# API status
curl http://localhost:3001/api/quotations
```

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# Create daily backup
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/quotation-apps"

mkdir -p $BACKUP_DIR
docker cp quotation-backend-dev:/app/backend/quotation.db $BACKUP_DIR/quotation.db.$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "quotation.db.*" -mtime +7 -delete
```

### Recovery Process
```bash
# Stop application
./scripts/deploy.sh stop

# Restore database
./scripts/deploy.sh restore /backup/quotation-apps/quotation.db.20241201_143022

# Start application
./scripts/deploy.sh prod
```

## Support

Untuk bantuan lebih lanjut:
1. Periksa logs container
2. Periksa dokumentasi aplikasi
3. Periksa status kesehatan aplikasi
4. Hubungi tim development
