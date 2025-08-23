#!/bin/bash

# Script untuk informasi akses network

SERVER_IP=$(ip route get 1 | awk '{print $7}' | head -1)

echo "🚀 Quotation App Network Access"
echo "================================"
echo ""
echo "📱 Akses dari device lain:"
echo "   Frontend: http://$SERVER_IP:5173"
echo "   Backend:  http://$SERVER_IP:3001"
echo ""
echo "💻 Akses lokal:"
echo "   Frontend: http://localhost:5173" 
echo "   Backend:  http://localhost:3001"
echo ""
echo "📋 Server IP: $SERVER_IP"
echo "🔧 Network: $(ip route | grep default | awk '{print $3}' | head -1)/24"
echo ""
echo "📱 Untuk akses dari HP/device lain:"
echo "   1. Pastikan device tersambung ke WiFi yang sama"
echo "   2. Buka browser dan ketik: http://$SERVER_IP:5173"
echo "   3. Jika tidak bisa akses, cek firewall atau router settings"
echo ""
echo "🔧 Status Container:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep quotation
