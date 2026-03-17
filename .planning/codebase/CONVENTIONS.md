# CONVENTIONS.md — BargAIn Codebase Conventions

## Python (Backend)

### Style
- **Linter/Formatter:** Ruff (`ruff check` + `ruff format`)
- **Max line length:** 99 characters
- **Import order:** isort with black profile
- **Type hints:** Required on all public functions

### Naming
- `snake_case` for functions, variables, modules
- `PascalCase` for classes
- `UPPER_SNAKE_CASE` for constants
- Django app names: lowercase, singular (e.g. `products`, `stores`, `prices`)

### Docstrings
- Google-style on all public classes and functions
- Example:
  ```python
  def get_queryset(self) -> QuerySet[Product]:
      """Filtra productos por usuario si no es admin."""
  ```

### Django Patterns
- ViewSets use `select_related`/`prefetch_related` on queryset
- Permission classes declared at ViewSet level
- Filter fields declared via `filterset_fields`
- Custom exceptions in `backend/apps/core/exceptions.py`

### Error Handling
- Custom `BargainAPIException` hierarchy from `core/exceptions.py`
- API always responds with consistent format:
  ```json
  { "success": false, "error": { "code": "...", "message": "...", "details": {} } }
  ```
- Structured logging via `structlog`
- Critical errors → Sentry

### Imports
- Standard library → third-party → Django → local apps
- No wildcard imports

---

## JavaScript/TypeScript (Frontend)

### Style
- **Linter:** ESLint 9 flat config (`eslint.config.mjs`)
- **Formatter:** Prettier (`printWidth: 100`, `singleQuote: true`)
- **No `--ext` flag** — ESLint 9 flat config only

### Naming
- `PascalCase` for React components and types/interfaces
- `camelCase` for functions, variables, hooks
- `UPPER_SNAKE_CASE` for constants
- File names match component name (e.g. `ProductCard.tsx`)

### Components
- Functional components with hooks only
- Props typed via TypeScript `interface`
- Destructure props in function signature
- Example:
  ```typescript
  interface ProductCardProps {
    product: Product;
    onPress: (id: string) => void;
  }
  export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => { ... }
  ```

### State Management
- Global state: Zustand stores in `src/store/`
- Local state: `useState` / `useReducer`
- Server state: Axios with JWT interceptors in `src/api/`

### Path Aliases
- `@/*` maps to `src/*`

---

## Git Conventions

### Branches
- `main` — production
- `develop` — integration
- `feature/*` — new features
- `fix/*` — bug fixes
- `docs/*` — documentation

### Commits (Conventional Commits in Spanish)
```
feat(optimizer): implementar algoritmo de ruta ponderada (F3-01)
fix(scraping): corregir parser de precios Mercadona
docs(memoria): añadir sección de requisitos funcionales
test(prices): añadir tests unitarios del servicio de precios
refactor(stores): extraer lógica PostGIS a servicio
chore(ci): configurar workflow de despliegue staging
```
- Always include task ID `(FX-NN)` in feat/fix commits

### PRs
- Always target `develop`
- Include description and checklist
- Template at `.github/pull_request_template.md`

---

## Security Conventions
- No hardcoded secrets — `.env` only
- JWT with refresh token rotation
- Sanitize all OCR/user inputs
- CORS restricted to authorized domains
- HTTPS required in production
