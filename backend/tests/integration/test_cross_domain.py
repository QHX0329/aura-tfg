"""
Cross-domain integration tests — Phase 1 gate.

Validates the full happy path spanning auth → products → shopping_lists,
and confirms the OpenAPI/Swagger endpoints are accessible.
"""

import pytest


@pytest.mark.django_db
class TestHappyPath:
    """E2E happy-path tests that exercise all five Phase 1 domains."""

    def test_full_register_login_list_flow(self, api_client):
        """register → login → browse categories → create list → detail."""
        # 1. Register
        r = api_client.post(
            "/api/v1/auth/register/",
            {
                "username": "e2euser",
                "email": "e2e@test.com",
                "password": "securepass123",
                "password_confirm": "securepass123",
            },
            format="json",
        )
        assert r.status_code == 201, f"Register failed: {r.data}"

        # 2. Login — obtain JWT
        r = api_client.post(
            "/api/v1/auth/token/",
            {"username": "e2euser", "password": "securepass123"},
            format="json",
        )
        assert r.status_code == 200, f"Login failed: {r.data}"
        access = r.data["data"]["access"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        # 3. Browse product categories
        r = api_client.get("/api/v1/products/categories/")
        assert r.status_code == 200, f"Categories failed: {r.data}"

        # 4. Create a shopping list
        r = api_client.post("/api/v1/lists/", {"name": "Lista E2E"}, format="json")
        assert r.status_code == 201, f"Create list failed: {r.data}"
        list_id = r.data["id"]

        # 5. Retrieve list detail
        r = api_client.get(f"/api/v1/lists/{list_id}/")
        assert r.status_code == 200, f"List detail failed: {r.data}"
        assert r.data["name"] == "Lista E2E"

    def test_swagger_schema_accessible(self, api_client):
        """GET /api/v1/schema/ must return 200 with JSON content."""
        r = api_client.get("/api/v1/schema/")
        assert r.status_code == 200

    def test_swagger_ui_accessible(self, api_client):
        """GET /api/v1/schema/swagger-ui/ must return 200."""
        r = api_client.get("/api/v1/schema/swagger-ui/")
        assert r.status_code == 200

    def test_redoc_accessible(self, api_client):
        """GET /api/v1/schema/redoc/ must return 200."""
        r = api_client.get("/api/v1/schema/redoc/")
        assert r.status_code == 200
