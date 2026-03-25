---
phase: 5
slug: optimizer-scraping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x (backend) |
| **Config file** | `backend/pytest.ini` |
| **Quick run command** | `docker exec bargain-backend pytest tests/ -x -q --tb=short` |
| **Full suite command** | `docker exec bargain-backend pytest tests/ -v --tb=short` |
| **Estimated runtime** | ~30-60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `docker exec bargain-backend pytest tests/ -x -q --tb=short`
- **After every plan wave:** Run `docker exec bargain-backend pytest tests/ -v --tb=short`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-scraping-01 | scraping | 1 | SCRAPING | unit | `pytest tests/unit/test_scraping_pipeline.py` | ❌ W0 | ⬜ pending |
| 5-scraping-02 | scraping | 1 | SCRAPING | unit | `pytest tests/unit/test_spider_mercadona.py` | ❌ W0 | ⬜ pending |
| 5-optimizer-01 | optimizer | 2 | OPTIMIZER | unit | `pytest tests/unit/test_optimizer.py` | ❌ W0 | ⬜ pending |
| 5-optimizer-02 | optimizer | 2 | OPTIMIZER | integration | `pytest tests/integration/test_optimizer_api.py` | ❌ W0 | ⬜ pending |
| 5-ocr-01 | ocr | 2 | OCR | unit | `pytest tests/unit/test_ocr.py` | ❌ W0 | ⬜ pending |
| 5-ocr-02 | ocr | 2 | OCR | integration | `pytest tests/integration/test_ocr_api.py` | ❌ W0 | ⬜ pending |
| 5-llm-01 | assistant | 3 | LLM | unit | `pytest tests/unit/test_assistant.py` | ❌ W0 | ⬜ pending |
| 5-llm-02 | assistant | 3 | LLM | integration | `pytest tests/integration/test_assistant_api.py` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/unit/test_scraping_pipeline.py` — stubs for scraping pipeline
- [ ] `backend/tests/unit/test_spider_mercadona.py` — stubs for Mercadona spider
- [ ] `backend/tests/unit/test_optimizer.py` — stubs for multicriterio optimizer
- [ ] `backend/tests/integration/test_optimizer_api.py` — API endpoint integration tests
- [ ] `backend/tests/unit/test_ocr.py` — stubs for OCR service
- [ ] `backend/tests/integration/test_ocr_api.py` — OCR API integration tests
- [ ] `backend/tests/unit/test_assistant.py` — stubs for LLM assistant
- [ ] `backend/tests/integration/test_assistant_api.py` — assistant API integration tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Scrapy spider fetches live prices | SCRAPING | External site dependency, rate limits | Run `docker exec bargain-backend scrapy crawl mercadona` and verify output |
| OR-Tools produces valid route | OPTIMIZER | Route correctness requires visual inspection | Call `/api/v1/optimize/` with test list, verify map route makes geographic sense |
| OCR reads receipt photo | OCR | Requires real photo input | Upload test ticket photo via `/api/v1/ocr/scan/`, verify product matching |
| LLM guardrails reject off-topic | LLM | Claude API response quality | Send off-topic query to `/api/v1/assistant/chat/`, verify rejection |
| Playwright spider anti-bot | SCRAPING | Dynamic site behavior | Manual run of Carrefour/Lidl spiders, verify no 403s |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
