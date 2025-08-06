# Quotation Management App

Aplikasi manajemen penawaran (quotation) yang memungkinkan Anda untuk:
- 📋 Membuat dan mengelola penawaran profesional
- 👥 Mengelola data customer dan barang/jasa
- 📊 Melihat dashboard dengan statistik
- 🧾 Export penawaran ke PDF
- 📈 Tracking status penawaran

## ✨ Fitur Utama

### 🎯 Core Features
- **Dashboard** - Overview aplikasi dengan statistik
- **Penawaran** - CRUD penawaran dengan status tracking
- **Barang & Jasa** - Manajemen produk dan layanan
- **Customer** - Database customer dengan detail kontak
- **Pengaturan** - Konfigurasi perusahaan dan aplikasi

### 🔧 Technical Features
- **Responsive Design** - Optimized untuk desktop dan mobile
- **Real-time Updates** - Data sinkronisasi real-time
- **Error Handling** - Robust error handling dan validation
- **Export PDF** - Generate PDF profesional
- **Data Import/Export** - Import/export data via Excel

## 🏗️ Struktur Project

```
quotation-apps/
├── backend/              # Node.js + Express API
│   ├── index.js         # Main server file
│   ├── package.json     # Backend dependencies
│   └── quotation.db     # SQLite database
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   └── constants/   # App constants
│   ├── package.json     # Frontend dependencies
│   └── vite.config.js   # Vite configuration
└── package.json         # Root package.json
```

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js (v16 atau lebih baru)
- npm atau yarn

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd quotation-apps

# Install dependencies untuk semua package
npm run install:all

# Jalankan aplikasi (backend + frontend)
npm run dev
```

### Manual Setup
```bash
# Install root dependencies
npm install

# Setup backend
cd backend
npm install
npm run dev

# Setup frontend (terminal baru)
cd frontend
npm install
npm run dev
```

### URLs
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Jalankan backend + frontend
npm run build        # Build frontend untuk production
npm run test         # Jalankan tests
npm run lint         # Lint code
npm run lint:fix     # Fix lint issues
npm run clean        # Clean build artifacts
```

### Environment Variables
```bash
# Frontend (.env.local)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=Quotation Management App
VITE_ENABLE_CONSOLE_LOGS=false

# Backend (.env)
PORT=3001
NODE_ENV=development
DB_PATH=./quotation.db
```

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **PDF Generation**: PDFKit
- **Security**: CORS, Security Headers

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **UI Library**: Material-UI
- **HTTP Client**: Axios
- **State Management**: Custom Hooks
- **Styling**: CSS Modules

## 🎨 UI/UX Features

### Design System
- **Modern UI** - Clean, professional interface
- **Responsive** - Mobile-first design

- **Accessibility** - WCAG compliant components

### User Experience
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Notifications** - Toast notifications for actions
- **Form Validation** - Real-time validation feedback

## 📊 Database Schema

### Tables
- **quotations** - Data penawaran utama
- **quotation_items** - Item-item dalam penawaran
- **customers** - Data customer
- **items** - Master data barang/jasa
- **settings** - Pengaturan aplikasi

## 🔒 Security

### Implemented
- **CORS Protection** - Configured origins
- **Input Validation** - Frontend & backend validation
- **Security Headers** - XSS, CSRF protection
- **Error Sanitization** - No sensitive data leaks

### Best Practices
- Environment-based configuration
- Graceful error handling
- Input sanitization
- SQL injection prevention

## 📈 Performance

### Optimizations
- **React.memo** - Component memoization
- **Lazy Loading** - Code splitting ready
- **Debounced Search** - Optimized search inputs
- **Efficient Re-renders** - Custom hooks optimization

## 🧪 Testing

### Test Coverage
- Component unit tests
- API integration tests
- E2E testing ready

```bash
# Jalankan tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📱 Mobile Support

- Responsive design untuk semua screen sizes
- Touch-friendly interface
- Mobile-optimized forms
- PWA ready (Progressive Web App)

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Setup
- Configure production environment variables
- Setup production database
- Configure CORS for production domain

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Complete CRUD operations
- ✅ PDF export functionality
- ✅ Dashboard with statistics
- ✅ Responsive design
- ✅ Error handling & validation

### Planned Features
- [ ] Email integration
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Advanced permissions
- [ ] Backup & restore

## 📞 Support

Untuk bantuan atau pertanyaan:
- 📧 Email: [your-email@domain.com]
- 🐛 Issues: [GitHub Issues]
- 📖 Documentation: [Wiki/Docs]

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Dibuat dengan ❤️ untuk mempermudah manajemen penawaran bisnis Anda** 