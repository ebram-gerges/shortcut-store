#!/usr/bin/env python3
"""
Test script to verify frontend-backend connection
"""
import requests
import json

def test_backend_connection(base_url):
    """Test if the backend is responding"""
    try:
        # Test basic API endpoint
        response = requests.get(f"{base_url}/api/")
        print(f"✅ Backend connection: {response.status_code}")
        
        # Test products endpoint
        response = requests.get(f"{base_url}/api/products/")
        print(f"✅ Products API: {response.status_code}")
        
        # Test admin endpoint
        response = requests.get(f"{base_url}/admin/")
        print(f"✅ Admin panel: {response.status_code}")
        
        return True
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_frontend_connection(base_url):
    """Test if the frontend is responding"""
    try:
        response = requests.get(base_url)
        print(f"✅ Frontend connection: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Frontend connection failed: {e}")
        return False

if __name__ == "__main__":
    # Test local development
    print("🔍 Testing local development...")
    backend_url = "http://localhost:8000"
    frontend_url = "http://localhost:5173"
    
    print("\n--- Backend Tests ---")
    test_backend_connection(backend_url)
    
    print("\n--- Frontend Tests ---")
    test_frontend_connection(frontend_url)
    
    # Test production (replace with your actual domain)
    print("\n🔍 Testing production deployment...")
    production_url = "https://your-domain.com"  # Replace with your actual domain
    
    print("\n--- Production Tests ---")
    test_backend_connection(production_url)
    test_frontend_connection(production_url) 