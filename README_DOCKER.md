# 🐳 Quotation Apps - Docker Deployment

Aplikasi Quotation Apps telah berhasil dikonfigurasi untuk berjalan dengan Docker di Linux.

## 🚀 Quick Start

### Development Environment
```bash
# Deploy development environment
./scripts/deploy.sh dev

# Access aplikasi
# Frontend: http://localhost:5174
# Backend: http://localhost:3001
# Health Check: http://localhost:3001/health
```

### Production Environment
```bash
# Deploy production environment
./scripts/deploy.sh prod

# Access aplikasi
# Application: http://localhost
```

## 📋 Available Commands

```bash
# Development
./scripts/deploy.sh dev

# Production
./scripts/deploy.sh prod

# Stop all containers
./scripts/deploy.sh stop

# View logs
./scripts/deploy.sh logs backend dev
./scripts/deploy.sh logs frontend dev

# Check status
./scripts/deploy.sh status

# Backup database
./scripts/deploy.sh backup

# Restore database
./scripts/deploy.sh restore <backup_file>

# Show help
./scripts/deploy.sh help
```

## 🔧 Manual Commands

### Development
```bash
docker-compose -f docker-compose.dev.yml up --build -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
docker-compose --profile prod up --build -d
docker-compose --profile prod logs -f
docker-compose --profile prod down
```

## 📁 File Structure

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
│   ├── Dockerfile.dev          # Backend dev Dockerfile
│   ├── index.js                # Backend application
│   ├── quotation.db            # SQLite database
│   └── uploads/                # Upload directory
└── logs/                       # Application logs
```

## 🌐 Service URLs

### Development
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Production
- **Application**: http://localhost
- **Health Check**: http://localhost/health

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo netstat -tulpn | grep :3001
   sudo kill -9 <PID>
   ```

2. **Container Won't Start**
   ```bash
   docker logs quotation-backend-dev
   docker-compose build --no-cache
   ```

3. **Permission Issues**
   ```bash
   sudo chmod 666 /var/run/docker.sock
   ```

### Health Checks
```bash
# Check backend health
curl http://localhost:3001/health

# Check all containers status
./scripts/deploy.sh status
```

## 📊 Monitoring

```bash
# View resource usage
docker stats

# View container logs
docker logs -f quotation-backend-dev
docker logs -f quotation-frontend-dev

# Check container health
docker inspect quotation-backend-dev | grep Health -A 10
```

## 💾 Database Management

```bash
# Backup database
./scripts/deploy.sh backup

# Restore database
./scripts/deploy.sh restore backend/quotation.db.backup.20241201_143022

# Access database inside container
docker exec -it quotation-backend-dev sqlite3 /app/quotation.db
```

## 🔒 Security

- Containers run as non-root user
- Database file mounted as volume
- Network isolation between containers
- Nginx provides additional security layer

## 📈 Performance

- Multi-stage builds for smaller images
- Docker layer caching
- Nginx static file caching
- Health checks for monitoring

## 📞 Support

Untuk bantuan lebih lanjut:
1. Periksa logs container
2. Periksa dokumentasi lengkap di `DOCKER_README.md`
3. Periksa status kesehatan aplikasi
4. Hubungi tim development

---

**Status**: ✅ Ready for Production
**Last Updated**: August 14, 2025
**Docker Version**: 28.3.3
**Node Version**: 20.x
