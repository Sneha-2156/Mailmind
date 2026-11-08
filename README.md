# MailMind AI

> **Your inbox, intelligently understood.**

A production-quality, full-stack AI-powered Email Intelligence and Productivity Platform. Built as a serious software engineering portfolio project demonstrating full-stack development, ML engineering, OAuth integration, security engineering, and professional UI/UX.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Features](#features)
4. [Screenshots](#screenshots)
5. [Architecture](#architecture)
6. [Technology Stack](#technology-stack)
7. [Application Workflow](#application-workflow)
8. [ML Architecture](#ml-architecture)
9. [Database Schema](#database-schema)
10. [API Documentation](#api-documentation)
11. [Installation](#installation)
12. [Environment Variables](#environment-variables)
13. [Running Locally](#running-locally)
14. [Testing](#testing)
15. [Deployment](#deployment)
16. [Security & Privacy](#security--privacy)
17. [Known Limitations](#known-limitations)
18. [Future Improvements](#future-improvements)

---

## Project Overview

MailMind AI connects to a user's Gmail account via secure Google OAuth 2.0, intelligently classifies incoming emails using a trained machine learning model, extracts actionable tasks and deadlines, identifies career and academic opportunities, generates AI-powered summaries, detects phishing, and presents everything through a premium React dashboard.

The platform is specifically designed to serve **students and job seekers**, providing a dedicated Career Intelligence module that surfaces internships, placements, scholarships, hackathons, and application deadlines automatically from their email.

---

## Problem Statement

The average person receives 120+ emails per day. For students, this includes a mix of:
- Academic announcements and exam schedules
- Internship and job opportunities with tight deadlines
- Scholarship notifications
- Financial reminders
- Promotional noise and spam

Manually sorting through this is time-consuming and leads to missed opportunities. MailMind AI automates the classification, prioritization, and information extraction — turning raw email into structured, actionable intelligence.

---

## Features

### Core Platform
- 🔐 **Google OAuth 2.0** — Secure sign-in. Never stores Gmail passwords.
- 📧 **Gmail Integration** — Real Gmail API sync with deduplication and label operations.
- 🧠 **ML Email Classification** — LinearSVC + TF-IDF classifying emails into 9 categories.
- ⚡ **Smart Priority Detection** — Multi-signal scoring: Critical, High, Medium, Low.
- 🤖 **AI Summarization** — Structured summaries with key points, action items, and deadlines (optional LLM).
- 📋 **Task & Deadline Extraction** — Automatically extracts tasks from emails into a managed task list.
- 🎓 **Career & Student Intelligence** — Dedicated dashboard for opportunities with status tracking.
- 💬 **Smart Reply Generator** — Draft professional replies in multiple styles (never auto-sends).
- 🛡️ **Phishing Detection** — Explainable security analysis with risk levels and reasons.
- 🔍 **Advanced Search** — Filter by sender, subject, category, priority, date, read status.
- 📊 **Real Analytics Dashboard** — Charts from actual database data (zero hardcoded metrics).

### Technical Highlights
- **Multi-user isolation**: Every endpoint enforces user ownership. IDOR-proof.
- **OAuth tokens encrypted at rest**: Fernet encryption before database storage.
- **Sanitized HTML rendering**: DOMPurify + allowlist-based HTML sanitization.
- **Graceful AI fallbacks**: Summaries/replies fall back to rule-based output without an LLM key, and the response says which provider produced it.
- **Calibrated ML confidence**: CalibratedClassifierCV prevents inflated probability claims.
- **Responsive design**: Mobile, tablet, and desktop layouts.
- **Dark/Light mode**: Full theme support with system preference detection.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MailMind AI Platform                          │
├──────────────┬───────────────────────────┬──────────────────────────┤
│   Browser    │       Backend             │    External Services      │
│              │                           │                           │
│  React 19    │  FastAPI (Python 3.12)    │  Gmail API (REST)         │
│  TypeScript  │  ┌─────────────────────┐ │  Google OAuth 2.0         │
│  Tailwind    │  │ API Layer (v1)       │ │  Gemini API (optional)    │
│  Zustand     │  │ auth / emails /      │ │  OpenAI API (optional)    │
│  Recharts    │  │ tasks / opp /        │ │                           │
│              │  │ analytics / search   │ │                           │
│              │  ├─────────────────────┤ │                           │
│              │  │ Service Layer        │ │                           │
│              │  │ gmail / classifier / │ │                           │
│              │  │ priority / phishing  │ │                           │
│              │  │ summarizer /         │ │                           │
│              │  │ extraction / reply   │ │                           │
│              │  ├─────────────────────┤ │                           │
│              │  │ ML Pipeline          │ │                           │
│              │  │ LinearSVC + TF-IDF   │ │                           │
│              │  │ CalibratedClassifier │ │                           │
│              │  ├─────────────────────┤ │                           │
│              │  │ SQLAlchemy ORM       │ │                           │
│              │  └─────────────────────┘ │                           │
│              │           │               │                           │
│              │    PostgreSQL 16          │                           │
└──────────────┴───────────────────────────┴──────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Styling |
| React Router | 6.x | Client-side routing |
| Zustand | 5.x | State management |
| Axios | 1.x | HTTP client |
| Recharts | 2.x | Analytics charts |
| Lucide React | 0.x | Icons |
| Framer Motion | 11.x | Animations |
| DOMPurify | 3.x | HTML sanitization |
| date-fns | 4.x | Date formatting |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.12 | Runtime |
| FastAPI | 0.115 | Web framework |
| SQLAlchemy | 2.x | ORM (async) |
| Alembic | 1.13 | Database migrations |
| Pydantic | 2.x | Data validation |
| PostgreSQL | 16 | Primary database |
| asyncpg | 0.29 | Async PostgreSQL driver |
| google-api-python-client | 2.x | Gmail API |
| python-jose | 3.x | JWT tokens |
| cryptography | 43.x | Token encryption (Fernet) |
| httpx | 0.27 | Async HTTP client |
| Pytest | 8.x | Testing |

### Machine Learning
| Technology | Version | Purpose |
|------------|---------|---------|
| scikit-learn | 1.5 | ML model |
| LinearSVC | - | Email classifier |
| TF-IDF | - | Feature extraction |
| CalibratedClassifierCV | - | Probability calibration |
| Pandas | 2.x | Data processing |
| NumPy | 1.26 | Numerical operations |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| GitHub Actions | CI/CD |
| Playwright | E2E testing |

---

## Application Workflow

```
User Login (Google OAuth)
        │
        ▼
Connect Gmail Account
        │
        ▼
Sync Emails (Gmail API)
        │
        ▼
For each email:
  ├── ML Classification (LinearSVC)
  ├── Priority Scoring
  ├── Phishing Analysis
  ├── Task Extraction (rule-based + optional LLM)
  └── Opportunity Extraction (pattern matching)
        │
        ▼
Store in PostgreSQL (per-user, isolated)
        │
        ▼
Display in React Dashboard
  ├── Inbox (classified, prioritized)
  ├── Tasks & Deadlines
  ├── Career Opportunities (with status tracking)
  ├── Analytics (Recharts)
  └── Settings
```

---

## ML Architecture

### Model Pipeline
```
Email Text (subject + body)
        │
        ▼
TF-IDF Vectorizer
  - max_features: 10,000
  - ngram_range: (1, 2)
  - sublinear_tf: True
        │
        ▼
LinearSVC (C=1.0, max_iter=2000)
        │
        ▼
CalibratedClassifierCV (sigmoid, cv=3)
        │
        ▼
Classification Result
  - category: one of 9 normalized categories
  - confidence: calibrated probability [0, 1]
  - top_terms: top TF-IDF features (explanation)
  - is_needs_review: confidence < threshold (0.45)
```

### Categories
| # | Category | Description |
|---|----------|-------------|
| 1 | Academic | Exams, results, curriculum, faculty |
| 2 | Administration | Registrations, ID cards, official notices |
| 3 | Campus Service | Library, hostel, cafeteria, facilities |
| 4 | Career and Opportunity | Jobs, internships, placements, hackathons |
| 5 | Financial Services | Fee payments, scholarships, stipends |
| 6 | Service Notification | App alerts, portal updates, system emails |
| 7 | Scholarship | Scholarship announcements and applications |
| 8 | Skill Development | Courses, certifications, workshops |
| 9 | Miscellaneous | Events, newsletters, general announcements |

> **Note**: LinearSVC does not natively produce calibrated probabilities. We use `CalibratedClassifierCV` with sigmoid calibration. Confidence scores are relative indicators, not guaranteed probabilities.

### Training Data
- Source: Synthetic + curated email dataset
- Size: 450+ examples across 9 categories
- Split: 70% train / 15% validation / 15% test (stratified)
- Label normalization: whitespace stripped, casing normalized

---

## Database Schema

```
users
  id (UUID PK)
  email (VARCHAR UNIQUE)
  name, picture_url, google_id
  is_active, gmail_connected
  preferences (JSONB)
  created_at, updated_at

oauth_credentials
  id (UUID PK)
  user_id → users (CASCADE)
  provider, encrypted_access_token, encrypted_refresh_token
  token_expiry, scopes[]

emails
  id (UUID PK)
  user_id → users (CASCADE)
  gmail_message_id (UNIQUE per user)
  subject, sender_email, sender_name, recipients[]
  snippet, body_text, body_html (sanitized)
  received_at, is_read, is_important, is_spam
  category, priority, classification_confidence
  phishing_risk, phishing_reasons (JSON)
  ai_summary, ai_summary_structured (JSON)
  created_at, updated_at

tasks
  id (UUID PK)
  user_id → users, email_id → emails
  title, description, due_date, event_date
  organization, priority, confidence
  is_completed, is_date_uncertain
  created_at, updated_at

opportunities
  id (UUID PK)
  user_id → users, email_id → emails
  title, company, role, opportunity_type
  eligibility, skills_required[], location, work_mode
  stipend, application_url, deadline
  status (new/saved/applied/assessment/interview/rejected/offer)
  notes, confidence
  created_at, updated_at

classification_feedback
  id, user_id, email_id
  original_category, corrected_category
  created_at

sync_history
  id, user_id
  sync_type, status, emails_fetched, errors
  started_at, completed_at
```

---

## API Documentation

Base URL: `http://localhost:8000/api/v1`

Interactive docs available at: `http://localhost:8000/docs` (Swagger UI)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google/authorize` | Get OAuth URL |
| GET | `/auth/google/callback` | OAuth callback |
| POST | `/auth/logout` | Sign out |
| GET | `/auth/me` | Current user |
| DELETE | `/auth/account` | Delete account |

### Gmail
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/gmail/connect` | Connect Gmail |
| DELETE | `/gmail/disconnect` | Disconnect Gmail |
| POST | `/gmail/sync` | Sync inbox |
| GET | `/gmail/sync/status` | Sync status |

### Emails
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/emails/` | List emails (paginated) |
| GET | `/emails/{id}` | Email detail |
| PATCH | `/emails/{id}/read` | Mark read |
| PATCH | `/emails/{id}/important` | Toggle important |
| PATCH | `/emails/{id}/spam` | Mark spam |
| PATCH | `/emails/{id}/category` | Update category |
| PATCH | `/emails/{id}/priority` | Update priority |
| POST | `/emails/{id}/summarize` | Generate AI summary |
| GET | `/emails/{id}/reply-suggestions` | Smart replies |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/` | List tasks |
| POST | `/tasks/` | Create task |
| GET | `/tasks/{id}` | Task detail |
| PATCH | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| PATCH | `/tasks/{id}/complete` | Toggle complete |

### Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/opportunities/` | List opportunities |
| GET | `/opportunities/{id}` | Opportunity detail |
| PATCH | `/opportunities/{id}/status` | Update status |
| PATCH | `/opportunities/{id}/notes` | Update notes |
| DELETE | `/opportunities/{id}` | Delete |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | Dashboard metrics |
| GET | `/analytics/category-distribution` | Category breakdown |
| GET | `/analytics/priority-distribution` | Priority breakdown |
| GET | `/analytics/weekly-activity` | 7-day email volume |
| GET | `/analytics/opportunities-overview` | Opportunity funnel |

---

## Installation

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Google Cloud project with Gmail API enabled

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/mailmind-ai.git
cd mailmind-ai
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your values
```

### 3. Set up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Gmail API**
4. Go to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
6. Add authorized redirect URI: `http://localhost:8000/api/v1/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

> **Note**: For production distribution with restricted Gmail scopes, your app requires Google verification. For personal/portfolio use and testing (up to 100 users), you can use it unverified.

---

## Environment Variables

See [.env.example](.env.example) for the complete reference.

**Required for basic functionality:**
```
APP_SECRET_KEY          # Random secret (32+ chars)
DATABASE_URL            # PostgreSQL connection string
GOOGLE_CLIENT_ID        # From Google Cloud Console
GOOGLE_CLIENT_SECRET    # From Google Cloud Console
ENCRYPTION_KEY          # Fernet key for token encryption
JWT_SECRET_KEY          # JWT signing secret
```

**Optional (enables AI features):**
```
AI_PROVIDER             # gemini | openai | (blank = disabled)
GEMINI_API_KEY          # Google Gemini API key
OPENAI_API_KEY          # OpenAI API key
```

**Generate required keys:**
```bash
# Encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# JWT secret / App secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Running Locally

### Option A: Docker Compose (recommended)

```bash
# Copy and configure environment
cp .env.example .env
# (edit .env with your credentials)

# Start all services
docker compose up --build

# Apply migrations
docker compose exec backend alembic upgrade head

# Train the ML model
docker compose exec backend python ml/train.py
```

**Services:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

### Option B: Manual Setup

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# (edit .env)

# Apply database migrations
alembic upgrade head

# Train ML model
python ml/train.py

# Start development server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Testing

### Backend Tests
```bash
cd backend

# All tests
pytest tests/ -v

# With coverage
pytest tests/ -v --cov=app --cov-report=html

# Specific test file
pytest tests/test_auth.py -v
```

### ML Evaluation
```bash
cd backend

# Train model
python ml/train.py

# Run evaluation (reports actual metrics)
python ml/evaluate.py
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# With UI
npm run test:ui
```

### E2E Tests
```bash
cd e2e

# Install Playwright
npx playwright install

# Run E2E tests (requires running frontend + backend)
npx playwright test

# View report
npx playwright show-report
```

---

## Deployment

### Production Docker

```bash
# Build production images
docker build ./backend --target production -t mailmind-backend:latest
docker build ./frontend --target production -t mailmind-frontend:latest

# Update docker-compose for production
# Set APP_ENV=production, CORS_ORIGINS, DATABASE_URL, etc.
docker compose -f docker-compose.yml up -d
```

### Environment for Production
```env
APP_ENV=production
APP_DEBUG=false
SESSION_COOKIE_SECURE=true
CORS_ORIGINS=https://yourdomain.com
DATABASE_URL=postgresql+asyncpg://user:pass@db-host:5432/mailmind_prod
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/google/callback
```

### Database Migrations (Production)
```bash
# Apply all pending migrations
alembic upgrade head

# Check current state
alembic current

# Generate new migration after model changes
alembic revision --autogenerate -m "describe_change"
```

---

## Security & Privacy

- **No Gmail passwords stored** — Uses Google OAuth 2.0 exclusively
- **Tokens encrypted at rest** — All OAuth tokens encrypted with Fernet before database storage
- **User data isolation** — Every API endpoint validates ownership (IDOR prevention)
- **HTML sanitization** — Email HTML rendered through DOMPurify allowlist
- **CSRF protection** — State parameter in OAuth flow
- **Restricted scopes** — Only `gmail.readonly` and `gmail.modify` requested
- **No token logging** — Access/refresh tokens never written to logs
- **SQL injection prevention** — SQLAlchemy parameterized queries throughout
- **CORS configured** — Restricted to configured origins in production

**Data retained:**
- Email metadata (subject, sender, snippet)
- Email body (stored for classification — text and sanitized HTML)
- Classification results and AI summaries
- Extracted tasks and opportunities

**Data NOT stored:**
- Gmail password or App Passwords
- Raw email attachments
- Full attachment content

---

## Known Limitations

1. **Gmail API rate limits**: Sync is limited to 50 emails per request (configurable). Heavy users may hit quota limits.
2. **ML model accuracy**: Measured cross-validated accuracy is **~76% (±3%)** on a small synthetic dataset (451 emails, 9 classes; majority baseline 11%). Overlapping categories (Administration / Campus Service / Miscellaneous) account for most errors. Real-inbox accuracy is expected to be lower. Full methodology, baselines and confusion matrix: [docs/ML_RESULTS.md](docs/ML_RESULTS.md).
3. **No fake data for real users**: Mock emails are seeded **only** for the demo account. A real user whose Gmail is not connected gets HTTP 409, and a failed Gmail sync returns HTTP 502 with the reason. The app never silently substitutes demo data. If no model artifact is loaded, emails are flagged *Needs Review* with 0 confidence rather than guessed.
4. **Sessions**: The JWT lives only in an httpOnly cookie. It is never placed in a URL or `localStorage`. Cross-site deployments (frontend and API on different registrable domains) need `SESSION_COOKIE_SAMESITE=none` + `SESSION_COOKIE_SECURE=true`, or a shared reverse proxy.
5. **Sync is manual and bounded**: Sync runs in-request over the latest N messages (no `historyId` incremental sync or background worker yet).
3. **LLM API required for AI features**: Summarization, smart replies, and enhanced extraction require a Gemini or OpenAI API key.
4. **Google OAuth verification**: Production distribution with Gmail scopes requires Google's OAuth consent screen verification for unrestricted user count.
5. **No real-time push**: Email sync is pull-based (triggered manually or on page load). Real-time push would require Gmail Push Notifications (Pub/Sub).
6. **Attachment handling**: Attachments are detected but not downloaded or processed.

---

## Future Improvements

- [ ] Gmail Push Notifications for real-time inbox updates
- [ ] Semantic search using text embeddings
- [ ] Model retraining pipeline using user feedback data
- [ ] Google Calendar integration for confirmed event creation
- [ ] Gmail send integration (after thorough OAuth safety review)
- [ ] Team/shared inbox support
- [ ] Export: tasks to CSV, opportunities to spreadsheet
- [ ] Mobile app (React Native)
- [ ] Webhook support for external task managers (Notion, Jira, Linear)
- [ ] Email thread analysis and conversation summaries

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## License

See [LICENSE](LICENSE) for details.

---

*Built with ❤️ as a serious software engineering portfolio project.*
