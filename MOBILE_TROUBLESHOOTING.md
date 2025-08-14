# 📱 Mobile Access Troubleshooting

## 🚨 Masalah Umum dan Solusi

### 1. **Fetch Error di Mobile**

**Gejala:**
- Error "Failed to fetch" di browser mobile
- Network error di console
- API calls tidak berhasil

**Penyebab:**
- API URL menggunakan `localhost` yang tidak bisa diakses dari mobile
- CORS configuration tidak tepat
- IP address tidak benar

**Solusi:**
```bash
# 1. Setup mobile access dengan IP yang benar
./scripts/setup-mobile.sh

# 2. Restart aplikasi
./scripts/deploy.sh stop
./scripts/deploy.sh dev

# 3. Test koneksi
curl http://192.168.0.185:3001/health
curl http://192.168.0.185:5174
```

### 2. **Tidak Bisa Akses dari Mobile**

**Gejala:**
- Browser mobile tidak bisa load halaman
- Connection timeout
- Network unreachable

**Penyebab:**
- Firewall blocking port
- IP address berubah
- Network configuration

**Solusi:**
```bash
# 1. Periksa IP address saat ini
hostname -I

# 2. Update konfigurasi dengan IP baru
./scripts/setup-mobile.sh

# 3. Periksa firewall
sudo ufw status
sudo ufw allow 3001
sudo ufw allow 5174

# 4. Restart aplikasi
./scripts/deploy.sh stop
./scripts/deploy.sh dev
```

### 3. **CORS Error**

**Gejala:**
- CORS policy error di console
- Preflight request failed
- Access-Control-Allow-Origin error

**Penyebab:**
- Backend CORS configuration tidak mengizinkan mobile origin
- Missing CORS headers

**Solusi:**
```bash
# 1. Periksa CORS configuration di backend
# File: backend/index.js
# CORS sudah dikonfigurasi untuk development mode

# 2. Restart backend
docker restart quotation-backend-dev

# 3. Periksa logs
docker logs quotation-backend-dev
```

### 4. **SSL/HTTPS Issues**

**Gejala:**
- Mixed content warnings
- HTTPS required errors
- Security warnings

**Penyebab:**
- Mobile browser memerlukan HTTPS
- Mixed HTTP/HTTPS content

**Solusi:**
```bash
# Untuk development, gunakan HTTP
# Untuk production, setup SSL certificate

# Development mode sudah menggunakan HTTP
# Production mode bisa dikonfigurasi dengan SSL
```

## 🔧 Debugging Steps

### Step 1: Periksa Network
```bash
# Periksa IP address
hostname -I

# Test koneksi lokal
curl http://localhost:3001/health

# Test koneksi dari IP
curl http://192.168.0.185:3001/health
```

### Step 2: Periksa Container Status
```bash
# Periksa container yang berjalan
docker ps

# Periksa logs
docker logs quotation-backend-dev
docker logs quotation-frontend-dev
```

### Step 3: Periksa Environment Variables
```bash
# Periksa environment di container
docker exec quotation-frontend-dev env | grep VITE
docker exec quotation-backend-dev env | grep NODE
```

### Step 4: Test API Endpoints
```bash
# Test health check
curl http://192.168.0.185:3001/health

# Test API endpoints
curl http://192.168.0.185:3001/quotations
curl http://192.168.0.185:3001/customers
```

## 📱 Mobile Browser Testing

### Chrome Mobile
1. Buka Chrome di mobile
2. Akses: `http://192.168.0.185:5174`
3. Buka Developer Tools (jika tersedia)
4. Periksa Console untuk errors

### Safari Mobile (iOS)
1. Buka Safari di iPhone/iPad
2. Akses: `http://192.168.0.185:5174`
3. Periksa Console melalui Safari Web Inspector

### Firefox Mobile
1. Buka Firefox di mobile
2. Akses: `http://192.168.0.185:5174`
3. Buka Developer Tools

## 🔍 Common Error Messages

### "Failed to fetch"
- **Penyebab**: Network error, wrong API URL
- **Solusi**: Periksa IP address dan restart aplikasi

### "CORS policy"
- **Penyebab**: CORS configuration issue
- **Solusi**: Restart backend container

### "Connection refused"
- **Penyebab**: Port tidak terbuka atau aplikasi tidak berjalan
- **Solusi**: Periksa container status dan restart

### "Network unreachable"
- **Penyebab**: IP address salah atau network issue
- **Solusi**: Update IP dengan `./scripts/setup-mobile.sh`

## 🛠️ Advanced Troubleshooting

### Periksa Network Interface
```bash
# Periksa semua network interfaces
ip addr show

# Periksa routing
ip route show

# Test connectivity
ping 192.168.0.185
```

### Periksa Docker Network
```bash
# Periksa docker networks
docker network ls

# Periksa network details
docker network inspect quotation_apps-v2_quotation-network-dev
```

### Debug Container Communication
```bash
# Masuk ke container frontend
docker exec -it quotation-frontend-dev sh

# Test API call dari dalam container
curl http://quotation-backend-dev:3001/health
```

## 📋 Checklist Mobile Access

- [ ] IP address benar dan bisa diakses
- [ ] Port 3001 dan 5174 terbuka
- [ ] Container berjalan dengan baik
- [ ] CORS configuration benar
- [ ] API endpoints bisa diakses
- [ ] Frontend bisa load
- [ ] Mobile dan komputer dalam jaringan yang sama
- [ ] Firewall tidak blocking

## 🆘 Emergency Reset

Jika semua troubleshooting tidak berhasil:

```bash
# 1. Stop semua container
./scripts/deploy.sh stop

# 2. Clean up
docker system prune -f

# 3. Setup ulang mobile access
./scripts/setup-mobile.sh

# 4. Deploy ulang
./scripts/deploy.sh dev

# 5. Test koneksi
curl http://192.168.0.185:3001/health
curl http://192.168.0.185:5174
```

---

**Last Updated**: August 14, 2025  
**IP Address**: 192.168.0.185  
**Status**: ✅ Mobile Access Configured
