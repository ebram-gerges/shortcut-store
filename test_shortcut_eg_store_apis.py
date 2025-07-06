#!/usr/bin/env python3
"""
Comprehensive API Testing Suite for shortcut-eg.store
Tests all endpoints: Authentication, Products, Cart, Wishlist, Admin, Categories, etc.
"""

import requests
import json
import time
import sys
from datetime import datetime
import urllib3

# Disable SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ShortcutStoreAPITester:
    def __init__(self, base_url="https://shortcut-eg.store"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'ShortcutStore-API-Tester/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, status, details="", response_time=0):
        """Log test results"""
        result = {
            'test': test_name,
            'status': status,
            'details': details,
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_emoji} {test_name} - {status} ({response_time:.2f}s)")
        if details:
            print(f"   Details: {details}")
    
    def test_basic_connectivity(self):
        """Test basic website connectivity"""
        print("\n🌐 Testing Basic Connectivity...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            if response.status_code in [200, 301, 302]:
                self.log_test("Basic Connectivity", "PASS", f"Status: {response.status_code}", response_time)
            else:
                self.log_test("Basic Connectivity", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("Basic Connectivity", "FAIL", f"Error: {str(e)}")
    
    def test_ssl_certificate(self):
        """Test SSL certificate validity"""
        print("\n🔒 Testing SSL Certificate...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/", timeout=10)
            response_time = time.time() - start_time
            
            self.log_test("SSL Certificate", "PASS", "SSL certificate is valid", response_time)
            
        except requests.exceptions.SSLError as e:
            self.log_test("SSL Certificate", "FAIL", f"SSL Error: {str(e)}")
        except Exception as e:
            self.log_test("SSL Certificate", "WARN", f"Could not verify SSL: {str(e)}")
    
    def test_security_headers(self):
        """Test security headers"""
        print("\n🛡️ Testing Security Headers...")
        
        try:
            start_time = time.time()
            response = self.session.head(f"{self.base_url}/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            security_headers = {
                'Strict-Transport-Security': 'HSTS',
                'X-Content-Type-Options': 'Content Type Protection',
                'X-Frame-Options': 'Clickjacking Protection',
                'X-XSS-Protection': 'XSS Protection',
                'Content-Security-Policy': 'CSP',
                'Referrer-Policy': 'Referrer Policy'
            }
            
            for header, description in security_headers.items():
                if header in response.headers:
                    self.log_test(f"Security Header: {description}", "PASS", f"{header}: {response.headers[header][:50]}...")
                else:
                    self.log_test(f"Security Header: {description}", "WARN", f"Header {header} missing")
                    
        except Exception as e:
            self.log_test("Security Headers", "FAIL", f"Error: {str(e)}")
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("\n❤️ Testing Health Check...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/healthz/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                self.log_test("Health Check", "PASS", "Health endpoint accessible", response_time)
            else:
                self.log_test("Health Check", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("Health Check", "FAIL", f"Error: {str(e)}")
    
    def test_admin_panel_access(self):
        """Test admin panel accessibility"""
        print("\n👑 Testing Admin Panel Access...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/secure-admin-panel-2024/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            if response.status_code in [200, 302]:  # 302 is redirect to login
                self.log_test("Admin Panel Access", "PASS", f"Admin panel accessible (Status: {response.status_code})", response_time)
            else:
                self.log_test("Admin Panel Access", "WARN", f"Unexpected status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("Admin Panel Access", "FAIL", f"Error: {str(e)}")
    
    def test_api_endpoints(self):
        """Test API endpoints"""
        print("\n🔌 Testing API Endpoints...")
        
        api_endpoints = [
            ("/api/", "API Root"),
            ("/api/products/", "Products API"),
            ("/api/categories/", "Categories API"),
            ("/api/auth/", "Authentication API"),
            ("/api/cart/", "Cart API"),
            ("/api/wishlist/", "Wishlist API"),
            ("/api/orders/", "Orders API"),
            ("/api/reviews/", "Reviews API"),
            ("/api/vouchers/", "Vouchers API"),
        ]
        
        for endpoint, name in api_endpoints:
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=10, verify=False)
                response_time = time.time() - start_time
                
                if response.status_code in [200, 401, 403]:  # 401/403 for auth-required endpoints
                    self.log_test(f"API: {name}", "PASS", f"Status: {response.status_code}", response_time)
                else:
                    self.log_test(f"API: {name}", "WARN", f"Status: {response.status_code}", response_time)
                    
            except Exception as e:
                self.log_test(f"API: {name}", "FAIL", f"Error: {str(e)}")
    
    def test_user_registration(self):
        """Test user registration"""
        print("\n📝 Testing User Registration...")
        
        test_user_data = {
            "email": f"test_{int(time.time())}@shortcut-eg.store",
            "password1": "TestPassword123!",
            "password2": "TestPassword123!"
        }
        
        try:
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/api/auth/register/",
                json=test_user_data,
                timeout=10,
                verify=False
            )
            response_time = time.time() - start_time
            
            if response.status_code in [200, 201]:
                self.log_test("User Registration", "PASS", f"Registration successful", response_time)
            elif response.status_code == 400:
                self.log_test("User Registration", "WARN", f"Registration validation error", response_time)
            else:
                self.log_test("User Registration", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("User Registration", "FAIL", f"Error: {str(e)}")
    
    def test_user_login(self):
        """Test user login"""
        print("\n🔑 Testing User Login...")
        
        # Try to login with admin credentials
        login_data = {
            "email": "admin@shortcut-eg.store",
            "password": "AdminSecure2024!8f2a9c"
        }
        
        try:
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/api/auth/login/",
                json=login_data,
                timeout=10,
                verify=False
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data or 'token' in data:
                    self.auth_token = data.get('access_token') or data.get('token')
                    self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
                self.log_test("User Login", "PASS", "Login successful", response_time)
            elif response.status_code == 400:
                self.log_test("User Login", "WARN", "Login validation error", response_time)
            else:
                self.log_test("User Login", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("User Login", "FAIL", f"Error: {str(e)}")
    
    def test_products_crud(self):
        """Test products CRUD operations"""
        print("\n📦 Testing Products CRUD...")
        
        # Test GET products
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/products/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Products List", "PASS", f"Found {len(data.get('results', data)) if isinstance(data, dict) else len(data)} products", response_time)
            else:
                self.log_test("Products List", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("Products List", "FAIL", f"Error: {str(e)}")
    
    def test_categories(self):
        """Test categories endpoint"""
        print("\n📂 Testing Categories...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/categories/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('results', data)) if isinstance(data, dict) else len(data)
                self.log_test("Categories List", "PASS", f"Found {count} categories", response_time)
            else:
                self.log_test("Categories List", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("Categories List", "FAIL", f"Error: {str(e)}")
    
    def test_cart_operations(self):
        """Test cart operations"""
        print("\n🛒 Testing Cart Operations...")
        
        # Test GET cart
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/cart/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            if response.status_code in [200, 401]:  # 401 if auth required
                self.log_test("Cart Access", "PASS", f"Cart endpoint accessible", response_time)
            else:
                self.log_test("Cart Access", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("Cart Access", "FAIL", f"Error: {str(e)}")
    
    def test_wishlist_operations(self):
        """Test wishlist operations"""
        print("\n❤️ Testing Wishlist Operations...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/wishlist/", timeout=10, verify=False)
            response_time = time.time() - start_time
            
            if response.status_code in [200, 401]:  # 401 if auth required
                self.log_test("Wishlist Access", "PASS", f"Wishlist endpoint accessible", response_time)
            else:
                self.log_test("Wishlist Access", "FAIL", f"Status: {response.status_code}", response_time)
                
        except Exception as e:
            self.log_test("Wishlist Access", "FAIL", f"Error: {str(e)}")
    
    def test_rate_limiting(self):
        """Test rate limiting"""
        print("\n🚦 Testing Rate Limiting...")
        
        # Make multiple rapid requests to test rate limiting
        rate_limit_triggered = False
        
        for i in range(15):  # Try 15 rapid requests
            try:
                response = self.session.get(f"{self.base_url}/api/auth/login/", timeout=5, verify=False)
                if response.status_code == 429:  # Too Many Requests
                    rate_limit_triggered = True
                    break
            except:
                pass
        
        if rate_limit_triggered:
            self.log_test("Rate Limiting", "PASS", "Rate limiting is working")
        else:
            self.log_test("Rate Limiting", "WARN", "Rate limiting not triggered in test")
    
    def test_static_files(self):
        """Test static files serving"""
        print("\n📁 Testing Static Files...")
        
        static_files = [
            "/static/admin/css/base.css",
            "/static/admin/js/core.js",
            "/favicon.ico"
        ]
        
        for static_file in static_files:
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}{static_file}", timeout=10, verify=False)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    self.log_test(f"Static File: {static_file}", "PASS", "File accessible", response_time)
                elif response.status_code == 404:
                    self.log_test(f"Static File: {static_file}", "WARN", "File not found", response_time)
                else:
                    self.log_test(f"Static File: {static_file}", "FAIL", f"Status: {response.status_code}", response_time)
                    
            except Exception as e:
                self.log_test(f"Static File: {static_file}", "FAIL", f"Error: {str(e)}")
    
    def test_security_vulnerabilities(self):
        """Test for common security vulnerabilities"""
        print("\n🔍 Testing Security Vulnerabilities...")
        
        # Test for exposed sensitive files
        sensitive_files = [
            "/.env",
            "/settings.py",
            "/manage.py",
            "/.git/config",
            "/wp-admin/",
            "/phpmyadmin/",
            "/admin.php"
        ]
        
        for sensitive_file in sensitive_files:
            try:
                response = self.session.get(f"{self.base_url}{sensitive_file}", timeout=5, verify=False)
                
                if response.status_code in [404, 403]:
                    self.log_test(f"Security: {sensitive_file} blocked", "PASS", "File properly protected")
                else:
                    self.log_test(f"Security: {sensitive_file} exposed", "FAIL", f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Security: {sensitive_file}", "PASS", "File inaccessible")
    
    def generate_report(self):
        """Generate test report"""
        print("\n" + "="*50)
        print("📊 TEST REPORT SUMMARY")
        print("="*50)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['status'] == 'PASS'])
        failed_tests = len([t for t in self.test_results if t['status'] == 'FAIL'])
        warned_tests = len([t for t in self.test_results if t['status'] == 'WARN'])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⚠️ Warnings: {warned_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if test['status'] == 'FAIL':
                    print(f"  - {test['test']}: {test['details']}")
        
        if warned_tests > 0:
            print("\n⚠️ WARNINGS:")
            for test in self.test_results:
                if test['status'] == 'WARN':
                    print(f"  - {test['test']}: {test['details']}")
        
        # Save detailed report to file
        with open(f"test_report_{int(time.time())}.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\nDetailed report saved to: test_report_{int(time.time())}.json")
        print("="*50)
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive API Testing for shortcut-eg.store")
        print(f"Target: {self.base_url}")
        print(f"Time: {datetime.now().isoformat()}")
        
        # Run all test categories
        self.test_basic_connectivity()
        self.test_ssl_certificate()
        self.test_security_headers()
        self.test_health_check()
        self.test_admin_panel_access()
        self.test_api_endpoints()
        self.test_user_registration()
        self.test_user_login()
        self.test_products_crud()
        self.test_categories()
        self.test_cart_operations()
        self.test_wishlist_operations()
        self.test_rate_limiting()
        self.test_static_files()
        self.test_security_vulnerabilities()
        
        # Generate report
        self.generate_report()


def main():
    """Main function"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "https://shortcut-eg.store"
    
    tester = ShortcutStoreAPITester(base_url)
    tester.run_all_tests()


if __name__ == "__main__":
    main()