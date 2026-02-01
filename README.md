# JalanGuard 🛣️

A comprehensive road defect reporting system for Malaysia, enabling citizens to report road issues and authorities to manage them efficiently.

## 📂 Project Structure

```
/JalanGuard
├── /mobile-app          # React Native (Expo) - Citizen App
├── /web-dashboard       # React.js (Vite) - Authority Dashboard
└── /backend             # Python (FastAPI) - API Server
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- **PostgreSQL** >= 14
- **Expo CLI** (for mobile development)

### Mobile App Setup

```bash
cd mobile-app
npm install
npx expo start
```

### Web Dashboard Setup

```bash
cd web-dashboard
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
uvicorn main:app --reload
```

## 🎨 Theme

The app uses the **Midnight Infrastructure Palette**:

| Color      | Hex       | Usage                          |
| ---------- | --------- | ------------------------------ |
| Primary    | `#0F172A` | Deep Midnight - Headers, Text  |
| Secondary  | `#D97706` | Burnt Amber - Action Buttons   |
| Accent     | `#334155` | Steel Blue - Secondary Actions |
| Background | `#F8FAFC` | Ghost White - App Background   |
| Surface    | `#E2E8F0` | Slate White - Cards, Inputs    |
| Success    | `#10B981` | Emerald Green - Fixed Status   |
| Error      | `#EF4444` | Bright Red - Critical Issues   |
| Warning    | `#F59E0B` | Amber - Pending Review         |
| Info       | `#3B82F6` | Bright Blue - General Info     |

## 🌍 Internationalization

Supports:

- 🇬🇧 English (en)
- 🇲🇾 Bahasa Malaysia (ms)

## 📱 Features

### Mobile App (Citizens)

- Report road defects with photos
- GPS location detection
- Track report status
- View nearby issues on map

### Web Dashboard (Authorities)

- View all reports with filters
- Update report status
- AI-powered defect detection
- Analytics and statistics

### Backend API

- RESTful API endpoints
- JWT authentication
- PostgreSQL database
- YOLOv8 AI integration (coming soon)

## 🛠️ Tech Stack

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Mobile   | React Native (Expo), TypeScript |
| Web      | React.js (Vite), TypeScript     |
| Backend  | Python, FastAPI                 |
| Database | PostgreSQL                      |
| AI/ML    | YOLOv8, OpenCV                  |

## 📄 License

This project is developed as part of a Final Year Project (FYP).

---

**JalanGuard** - Making Malaysian roads safer, one report at a time. 🇲🇾
# JalanGuard
