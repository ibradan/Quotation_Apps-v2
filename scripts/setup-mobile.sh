#!/bin/bash

# Script untuk setup akses mobile dengan IP dinamis
# Usage: ./scripts/setup-mobile.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Get local IP address
get_local_ip() {
    # Try different methods to get local IP
    local ip=""
    
    # Method 1: hostname -I (Linux)
    if command -v hostname &> /dev/null; then
        ip=$(hostname -I | awk '{print $1}')
    fi
    
    # Method 2: ip route (Linux)
    if [ -z "$ip" ] && command -v ip &> /dev/null; then
        ip=$(ip route get 1.1.1.1 | awk '{print $7}' | head -n1)
    fi
    
    # Method 3: ifconfig (macOS/Linux)
    if [ -z "$ip" ] && command -v ifconfig &> /dev/null; then
        ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n1)
    fi
    
    echo "$ip"
}

# Update docker-compose with current IP
update_docker_compose() {
    local ip=$1
    
    if [ -z "$ip" ]; then
        print_error "Tidak bisa mendapatkan IP address"
        exit 1
    fi
    
    print_status "Menggunakan IP: $ip"
    
    # Update docker-compose.dev.yml
    if [ -f "docker-compose.dev.yml" ]; then
        sed -i "s|VITE_API_URL=http://[0-9.]*:3001|VITE_API_URL=http://$ip:3001|g" docker-compose.dev.yml
        print_success "Updated docker-compose.dev.yml"
    fi
    
    # Update docker-compose.yml for production
    if [ -f "docker-compose.yml" ]; then
        sed -i "s|VITE_API_URL=http://[0-9.]*:3001|VITE_API_URL=http://$ip:3001|g" docker-compose.yml
        print_success "Updated docker-compose.yml"
    fi
}

# Create mobile access info
create_mobile_info() {
    local ip=$1
    
    cat > MOBILE_ACCESS.md << EOF
# 📱 Mobile Access Information

## IP Address: $ip

### Development Environment
- **Frontend**: http://$ip:5174
- **Backend API**: http://$ip:3001
- **Health Check**: http://$ip:3001/health

### Production Environment
- **Application**: http://$ip
- **Health Check**: http://$ip/health

## 📋 Cara Akses dari Mobile

1. Pastikan mobile dan komputer berada dalam jaringan WiFi yang sama
2. Buka browser di mobile
3. Akses salah satu URL di atas

## 🔧 Troubleshooting

### Jika tidak bisa akses:
1. Periksa firewall settings
2. Pastikan port 3001 dan 5174 terbuka
3. Coba restart aplikasi: \`./scripts/deploy.sh stop && ./scripts/deploy.sh dev\`

### Test koneksi:
\`\`\`bash
# Test backend
curl http://$ip:3001/health

# Test frontend
curl http://$ip:5174
\`\`\`

## 📱 QR Code untuk Akses Cepat

Scan QR code ini dengan mobile untuk akses cepat:

- Frontend: \`http://$ip:5174\`
- Backend: \`http://$ip:3001\`

---
**Generated**: $(date)
**IP Address**: $ip
EOF

    print_success "Created MOBILE_ACCESS.md"
}

# Main function
main() {
    print_status "Setting up mobile access..."
    
    # Get local IP
    local_ip=$(get_local_ip)
    
    if [ -z "$local_ip" ]; then
        print_error "Tidak bisa mendapatkan IP address lokal"
        exit 1
    fi
    
    print_status "Local IP: $local_ip"
    
    # Update docker-compose files
    update_docker_compose "$local_ip"
    
    # Create mobile access info
    create_mobile_info "$local_ip"
    
    print_success "Mobile setup completed!"
    print_status "Restart aplikasi untuk menerapkan perubahan:"
    echo "  ./scripts/deploy.sh stop"
    echo "  ./scripts/deploy.sh dev"
    echo ""
    print_status "Akses dari mobile menggunakan:"
    echo "  Frontend: http://$local_ip:5174"
    echo "  Backend: http://$local_ip:3001"
}

# Run main function
main "$@"
