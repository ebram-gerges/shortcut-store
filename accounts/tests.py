from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User

# Create your tests here.

class AccountsAPITestCase(APITestCase):
    """Basic sanity checks for registration, login and email verification endpoints."""

    def setUp(self):
        self.register_url = "/api/accounts/register/"
        self.login_url = "/api/token/"
        self.profile_url = "/api/accounts/profile/"
        self.verify_url = "/api/accounts/verify-email/"

    def test_register_login_and_verify_flow(self):
        """User can register, receive code in DB, login and verify email."""
        # 1. Register
        payload = {
            "username": "alice",
            "email": "alice@example.com",
            "password": "Testpass123!",
            "password_confirm": "Testpass123!"
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)

        # 2. Ensure verification code is generated
        user = User.objects.get(username="alice")
        self.assertIsNotNone(user.email_verification_code)

        # 3. Login (jwt token obtain)
        login_resp = self.client.post(self.login_url, {"username": "alice", "password": "Testpass123!"})
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        access = login_resp.data.get("access")
        self.assertTrue(access)

        # 4. Verify email using code
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        verify_resp = self.client.post(self.verify_url, {"code": user.email_verification_code})
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.email_verified)

    def test_login_with_username_and_email(self):
        """User can log in using either their username or their email."""
        # 1. Register a user
        payload = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "Testpass123!",
            "password_confirm": "Testpass123!"
        }
        self.client.post(self.register_url, payload, format="json")

        # 2. Test login with username
        login_with_username_payload = {
            "username": "testuser",
            "password": "Testpass123!"
        }
        response_username = self.client.post(self.login_url, login_with_username_payload, format="json")
        self.assertEqual(response_username.status_code, status.HTTP_200_OK)
        self.assertIn("access", response_username.data)

        # 3. Test login with email
        login_with_email_payload = {
            "username": "test@example.com",  # Note: field name is still 'username'
            "password": "Testpass123!"
        }
        response_email = self.client.post(self.login_url, login_with_email_payload, format="json")
        self.assertEqual(response_email.status_code, status.HTTP_200_OK)
        self.assertIn("access", response_email.data)

        # 4. Test login with wrong password
        login_with_wrong_pass_payload = {
            "username": "testuser",
            "password": "wrongpassword"
        }
        response_wrong_pass = self.client.post(self.login_url, login_with_wrong_pass_payload, format="json")
        self.assertEqual(response_wrong_pass.status_code, status.HTTP_401_UNAUTHORIZED)
