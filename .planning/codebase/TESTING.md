# TESTING.md — BargAIn Testing Practices

## Backend (Python/Django)

### Framework
- **Test runner:** pytest + pytest-django
- **Coverage:** pytest-cov (min 80% target)
- **Factories:** factory-boy + Faker for test data
- **Config:** `pytest.ini` at `backend/` root

### Structure
```
backend/tests/
├── unit/          # Fast, isolated tests (no DB)
├── integration/   # Tests with real DB (no mocks)
└── e2e/           # Full-stack scenario tests
```

### Key Fixtures (conftest.py)
- `api_client` — DRF APIClient instance
- `consumer_user` — Regular authenticated user
- `business_user` — Business/PYME user
- `authenticated_client` — Client pre-authenticated as consumer

### Running Tests
```bash
# From repo root (recommended)
make test-backend           # -v --tb=short
make test-backend-cov       # With HTML + terminal coverage

# Or directly from backend/
cd backend && pytest tests/unit/ -v
cd backend && pytest tests/integration/ -v
cd backend && pytest --cov=apps --cov-report=html --cov-report=term -v
```

### Conventions
- Test files: `test_<module>.py`
- Test functions: `test_<scenario>_<expected_result>`
- Integration tests hit real PostgreSQL — no DB mocking
- Use factories, not fixtures, for model instances
- Each test class corresponds to one ViewSet or service

### Coverage Target
- Minimum **80%** coverage across `apps/`
- Coverage report generated to `backend/htmlcov/`

---

## Frontend (React Native / Expo)

### Framework
- **Test runner:** Jest with `jest-expo` preset
- **Component testing:** React Native Testing Library
- **Config:** `jest.config.js` or `package.json` jest field

### Structure
```
frontend/__tests__/    # Test files mirroring src/ structure
```

### Running Tests
```bash
cd frontend && npx jest --coverage
```

### Conventions
- Test files: `<Component>.test.tsx` or `<module>.test.ts`
- Prefer React Native Testing Library queries over direct refs
- Mock Expo modules as needed via jest mocks
- Test user interactions, not implementation details

---

## Lint & Format

### Backend
```bash
make lint-backend        # ruff check + ruff format --check
make lint-backend-fix    # ruff check --fix + ruff format
```

### Frontend
```bash
cd frontend && npx eslint src/
cd frontend && npx prettier --check "src/**/*.{ts,tsx}"
```

### CI
- Backend lint + tests run on every PR via `.github/workflows/ci-backend.yml`
- Frontend lint + tests run via `.github/workflows/ci-frontend.yml`
