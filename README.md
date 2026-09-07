# Nourish

**Eat better with what you have.**

Nourish is an Ethiopia-first, globally extensible nutrition-affordability platform. Its central question:

> *What is the best achievable nutrition this household can get from the food and money it actually has?*

## The Problem

Many households know what they should eat but cannot afford the ideal diet. Generic meal planners ignore real budgets, local food prices, pantry contents, and household-specific nutritional needs. Nourish addresses this with deterministic optimization under real constraints.

## Why Nourish Is Different

Nourish is **not** primarily:
- A calorie tracker
- A weight-loss app
- A generic AI meal planner
- A medical diagnosis system

Nourish **is**:
- A scarcity optimizer that finds the best achievable nutrition under budget
- Grounded in authoritative food composition and price data
- Designed for Ethiopia first, extensible globally
- Privacy-preserving at population scale

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API routes (no separate Express server) |
| Database | PostgreSQL via Prisma ORM |
| Testing | Vitest |
| Validation | Zod |

### Directory Structure

```
src/
  app/              # Next.js routes (landing + /app household experience)
  components/       # UI components (no business logic)
  lib/              # Database, validation, i18n, constants
  services/
    nutrition/      # Household, food import
    optimization/   # Optimizer contract + input preparation
    pricing/        # Price lookup
    analytics/      # Privacy-preserving aggregates (future)
    ai/             # AI boundary (future)
    reports/        # Institutional reporting (future)
  types/            # Shared TypeScript interfaces

prisma/             # Database schema
data/
  foods/            # Food composition datasets (import only)
  requirements/     # Nutrient reference datasets
  prices/           # Regional price datasets
tests/              # Vitest tests
```

## Database Overview

| Model | Purpose |
|-------|---------|
| User | Account (demo user for development) |
| Household | Family unit with region and currency |
| HouseholdMember | Members with DOB, sex, pregnancy, allergies |
| Region | Geographic hierarchy (Ethiopia-first, global-ready) |
| Food | Canonical food records with provenance |
| NutrientDefinition | Extensible nutrient model (not fixed columns) |
| FoodNutrient | Nutrient values per food with source tracking |
| FoodPrice | Time-sensitive regional prices |
| PantryItem | Household food inventory |
| DailyBudget | Daily food budget by date |
| MealPlan | Generated plans with optimization metadata |
| MealPlanItem | Selected foods, quantities, costs |
| NutrientHistory | Calculated coverage for Nutrient Memory |

## Setup

### Prerequisites

- **Node.js** 20+ and npm
- **PostgreSQL** 14+

### Installation

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit DATABASE_URL in .env

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Application URL |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale (`en` or `am`) |

## Data Provenance Principles

- Nutrient values come from authoritative sources (e.g., Ethiopian Food Composition Table)
- Prices from verified surveys with observation dates
- Requirements from established reference standards
- Every imported record tracks: source name, URL, version, import date, units
- **Never invent nutrition values, prices, or medical data**

Place datasets in `data/foods/`, `data/requirements/`, and `data/prices/` with README instructions.

## Deterministic Optimization Principle

The scarcity optimizer uses mathematical optimization — not LLMs — to select foods. The `OptimizationInput` / `OptimizationResult` contract in `src/types/optimization.ts` defines the interface. The engine is not yet implemented; the application prepares inputs and persists pending plans.

## AI Safety Boundary

AI (future) may:
- Interpret natural-language household input
- Map multilingual food terms to canonical records
- Explain deterministic results
- Summarize institutional statistics

AI must **never** be authoritative for:
- Nutrient values, prices, requirements
- Optimization results or affordability percentages
- Medical diagnosis

See `src/services/ai/ai-service.ts`.

## Privacy Principles

- No household names or identifiable histories in analytics
- No automatic reporting to NGOs
- Future support requests are consent-based
- No medical diagnosis

## Current Implementation Status

### Implemented
- Project foundation (Next.js, Prisma, Tailwind design system)
- PostgreSQL schema with all core models
- Landing page with honest capability labeling
- Household dashboard, profile, pantry, plan, history, affordability routes
- Real data-entry and persistence workflows
- Optimization input preparation (not calculation)
- AI, analytics, and reports service boundaries
- Data import validation interfaces
- i18n structure (English + Amharic foundation)
- Validation schemas and tests

### Current Limitations
- No authentication (demo user for development)
- Food database empty — import authoritative data to populate
- Optimizer not implemented — plans remain in `PENDING_OPTIMIZATION`
- No nutrient requirement calculation yet
- No AI integration
- No offline sync, voice/IVR, or NGO analytics

## Planned V1 Features

- [ ] Household Nutrition Profile (partial — member management done)
- [ ] Pantry + Daily Budget (done)
- [ ] Scarcity Optimizer
- [ ] Nutrient Memory
- [ ] Marginal Nutrition Value (+10 Birr)
- [ ] Affordability Gap
- [ ] Offline-first household experience
- [ ] Nourish Voice / IVR prototype
- [ ] Nourish Impact
- [ ] Intervention Lab
- [ ] Nutrition ROI
- [ ] Price Shock simulation
- [ ] PDF/CSV/Excel institutional reporting

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Vitest
npm run db:push      # Push schema to database
npm run db:studio    # Prisma Studio
```

## License

Private — hackathon project.
