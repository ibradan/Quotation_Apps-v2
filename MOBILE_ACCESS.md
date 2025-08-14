# 📱 Mobile Access Information

## IP Address: 192.168.0.185

### Development Environment
- **Frontend**: http://192.168.0.185:5174
- **Backend API**: http://192.168.0.185:3001
- **Health Check**: http://192.168.0.185:3001/health

### Production Environment
- **Application**: http://192.168.0.185
- **Health Check**: http://192.168.0.185/health

## 📋 Cara Akses dari Mobile

1. Pastikan mobile dan komputer berada dalam jaringan WiFi yang sama
2. Buka browser di mobile
3. Akses salah satu URL di atas

## 🔧 Troubleshooting

### Jika tidak bisa akses:
1. Periksa firewall settings
2. Pastikan port 3001 dan 5174 terbuka
3. Coba restart aplikasi: `./scripts/deploy.sh stop && ./scripts/deploy.sh dev`

### Test koneksi:
```bash
# Test backend
curl http://192.168.0.185:3001/health

# Test frontend
curl http://192.168.0.185:5174
```

## 📱 QR Code untuk Akses Cepat

Scan QR code ini dengan mobile untuk akses cepat:

- Frontend: `http://192.168.0.185:5174`
- Backend: `http://192.168.0.185:3001`

---
**Generated**: Kam 14 Agu 2025 11:16:45  WIB
**IP Address**: 192.168.0.185
