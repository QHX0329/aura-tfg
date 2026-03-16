"""Tests unitarios para serializers y vistas de usuarios."""

import pytest


@pytest.mark.django_db
class TestUserRegistrationSerializer:
    """Verifica la lógica de validación del serializer de registro."""

    def test_rejects_mismatched_passwords(self):
        from apps.users.serializers import UserRegistrationSerializer

        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "StrongPass1!",
            "password_confirm": "DifferentPass1!",
            "first_name": "Test",
            "last_name": "User",
        }
        serializer = UserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert "password" in serializer.errors or "non_field_errors" in serializer.errors

    def test_accepts_matching_passwords(self):
        from apps.users.serializers import UserRegistrationSerializer

        data = {
            "username": "newuser2",
            "email": "newuser2@example.com",
            "password": "StrongPass1!",
            "password_confirm": "StrongPass1!",
            "first_name": "Test",
            "last_name": "User",
        }
        serializer = UserRegistrationSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_password_fields_are_write_only(self):
        from apps.users.serializers import UserRegistrationSerializer

        serializer = UserRegistrationSerializer()
        assert serializer.fields["password"].write_only is True
        assert serializer.fields["password_confirm"].write_only is True


@pytest.mark.django_db
class TestUserProfileSerializer:
    """Verifica que los campos read-only no pueden ser actualizados."""

    def test_id_is_read_only(self):
        from apps.users.serializers import UserProfileSerializer

        serializer = UserProfileSerializer()
        assert serializer.fields["id"].read_only is True

    def test_role_is_read_only(self):
        from apps.users.serializers import UserProfileSerializer

        serializer = UserProfileSerializer()
        assert serializer.fields["role"].read_only is True

    def test_created_at_is_read_only(self):
        from apps.users.serializers import UserProfileSerializer

        serializer = UserProfileSerializer()
        assert serializer.fields["created_at"].read_only is True

    def test_optimization_preference_choices_valid(self, consumer_user):
        from apps.users.serializers import UserProfileSerializer

        data = {"optimization_preference": "price"}
        serializer = UserProfileSerializer(consumer_user, data=data, partial=True)
        assert serializer.is_valid(), serializer.errors

    def test_optimization_preference_invalid_value_rejected(self, consumer_user):
        from apps.users.serializers import UserProfileSerializer

        data = {"optimization_preference": "invalid_value"}
        serializer = UserProfileSerializer(consumer_user, data=data, partial=True)
        assert not serializer.is_valid()
