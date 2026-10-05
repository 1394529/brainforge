# BrainForge V1.3 — First Games & Scoring

BrainForge is a precision cognitive workout SaaS providing rapid, gamified mental challenges across Knowledge, Logic, Memory, and Reaction Speed with server-authoritative scoring, XP progression, and immutable audit ledgers.

---

## 🚀 What's New in V1.3

### 1. Four Playable Cognitive Games
* **Quiz Game**: 2-4 choices, one correct answer. Tests vocabulary, logic, and general knowledge.
* **Pattern Game**: Sequence progression recognition (arithmetic, geometric, Fibonacci, primes, alternating alphabet).
* **Memory Game**: Short-term visuo-spatial memory span with memorization phase, countdown, and sequence reconstruction.
* **Reaction Game**: Millisecond visual reflex trial with stochastic delays (1000–3000ms) and false start anti-cheat.

### 2. Standardized Scoring & Normalization Engine
* Standard score result schema (`rawScore`, `maxScore`, `percentage`, `metrics`, `durationMs`).
* `normalizeScore()` bounds every score strictly within `0 <= percentage <= 100` and `0 <= rawScore <= maxScore`.
* Centralized reaction thresholds (<200ms -> 100, 200-299ms -> 90, ..., >=1000ms -> 0).

### 3. Gamification & Progression Engine
* **XpEngine**: Base XP matches score percentage (100% = 100 XP, 80% = 80 XP, false start = 0 XP).
* **LevelService**: Progressive level thresholds (Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 450 XP, Level 5: 700 XP, Level 6: 1000 XP...).
* **LevelProgress**: Real-time progress toward next level. Level-up detection and celebration.
* **XP Ledger (`xp_transactions`)**: Server-authoritative audit trail with unique `attempt_id` constraint preventing double XP exploitation.
* **User Progress (`user_progress`)**: Dedicated, isolated gamification table.

### 4. Training Workout Flow & Session Summary
* Configurable workouts: 3, 5, or 10 challenges.
* Domain focus filter: All, Quiz, Pattern, Memory, Reaction.
* Immediate factual feedback after each challenge without clinical claims.
* Comprehensive Session Summary with aggregate score, total XP, and challenge breakdown.
* Full History view (`/history`) with drill-down metrics.

### 5. Multi-Language & Security
* Full bilingual content: French (FR) & English (EN) toggle with 30 seeded challenges.
* Strict server-side validation: client never receives `answer_key`.
* Full SQL migrations in `migrations/001_initial_schema.sql` and `migrations/002_v1_3_games_and_scoring.sql`.

---

## 🛠️ Tech Stack & Architecture

```text
Game UI (Quiz, Pattern, Memory, Reaction)
   ↓
Challenge Renderer
   ↓
Challenge Engine
   ↓
Challenge Adapters (Zod Schema Validation)
   ↓
Scoring Engine (normalizeScore & Reaction thresholds)
   ↓
Gamification Engine (XpEngine & LevelService)
   ↓
Database (Atomic Attempt + XP Ledger + User Progress)
```

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend Server**: Express 4, Vite middleware integration, Zod schema validation
- **Database & RLS**: SQL migrations for PostgreSQL / Supabase, in-memory ACID transaction runner with unique constraints

---

## 🧪 Testing

Run the full automated test suite:
```bash
npm test
```
Tests cover:
* Scoring engine normalization and boundary conditions
* Reaction time threshold evaluation & false start disqualification
* Level and XP progression formulas
* All 4 game adapters (Quiz, Pattern, Memory, Reaction)
* Seed data integrity (30+ challenges across all 4 categories)
* Anti-duplication and idempotency on attempt submissions
* Security audits preventing `answer_key` exposure to the client
