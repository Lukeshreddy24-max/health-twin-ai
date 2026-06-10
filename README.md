# Health Twin AI Simulator + Spekit Knowledge Base

A full-stack hackathon project: AI-powered health twin simulator with built-in Spekit knowledge base.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Recharts
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI**: Claude API (Anthropic)

---

## Setup (WSL Debian / Linux)

### Step 1 — Database

```bash
# Start PostgreSQL
sudo service postgresql start

# Create database and tables
psql -U postgres -f database/schema.sql
```

### Step 2 — Backend

```bash
cd backend

# Copy env file and fill in your values
cp .env.example .env
# Edit .env: add your ANTHROPIC_API_KEY and PostgreSQL password

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs

### Step 3 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Features

| Feature | Description |
|---|---|
| 🏠 Home | Landing page with features overview |
| 📚 Knowledge Base | 12 Spekit cards with search + category filters |
| 🧬 Simulator | Enter vitals → AI health risk analysis |
| 🫀 Body Map | 2D organ map with color-coded risk levels |
| 📈 Charts | Radar chart of organ risks |
| ⏳ Timeline | AI predictions for 5, 10, 20 years |
| ⚡ What-If | "What if I quit smoking?" AI scenarios |
| 🛠️ Admin | Add/edit/delete Spekit knowledge cards |
| 📋 History | View past simulations by user ID |

---

## Team Split

**Person 1 (Frontend)**
- `frontend/src/pages/` — all pages
- `frontend/src/components/` — Navbar, SpekCard, BodyMap

**Person 2 (Backend)**
- `backend/routes/` — speks.py, simulator.py
- `backend/models/`, `backend/schemas/`
- `database/schema.sql`

---

## Deployment (Free)

**Backend** → Railway.app (free tier)
```bash
# In Railway: connect GitHub repo, set backend/ as root
# Add env vars: DATABASE_URL, ANTHROPIC_API_KEY
```

**Frontend** → Vercel (free)
```bash
# In Vercel: connect GitHub repo, set frontend/ as root
# Update vite.config.js proxy to point to Railway URL
```
