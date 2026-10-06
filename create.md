# Backend
## Setup laravel backend
```bash
cd ~/projects
composer create-project laravel/laravel backend
cd backend
```
# Frontend
## Setup React frontend
```bash
cd ~/projects/todolist
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom @dnd-kit/core @dnd-kit/sortable sass
```
# Desktop
## Os setup first:
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

pkg-config --modversion libsoup-3.0
pkg-config --modversion javascriptcoregtk-4.1
```
## setup Tauri
```bash
npm run build
npm install --save-dev @tauri-apps/cli
npx tauri init

```
## important values are:
```
Frontend dev URL:
http://localhost:3000

Frontend build directory:
../build
```
## You should add a Tauri script under "scripts":
```bash
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "tauri": "tauri"
}
```
## then
```bash
npm run tauri dev
```
## for production version 
```bash
npm run build
npm run tauri build
```

# Project structure
```
src/
├── api/
│   └── client.js
├── components/
│   ├── DayColumn.jsx
│   ├── TaskCard.jsx
│   ├── AddTaskModal.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Tasks.jsx
│   └── Settings.jsx
├── styles/
│   ├── main.scss
│   ├── _variables.scss
│   ├── _auth.scss
│   ├── _tasks.scss
│   └── _dashboard.scss
├── App.jsx
└── main.jsx
```
# Running Everything
## Terminal 1 – backend:
```bash
cd backend
php artisan serve
```
## Terminal 2 – frontend:
```bash
cd frontend
npm run dev
```

