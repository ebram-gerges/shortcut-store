"""
Security Middleware for Shortcut Store
Advanced security logging and monitoring
"""

import logging
import json
import time
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden
from django.core.cache import cache
from django.conf import settings
import re

# Setup security logger
security_logger = logging.getLogger('django.security')

class SecurityLoggingMiddleware(MiddlewareMixin):
    """
    Advanced security middleware for monitoring and logging security events
    """
    
    # Suspicious patterns to monitor
    SUSPICIOUS_PATTERNS = [
        r'\.\./',           # Directory traversal
        r'<script',         # XSS attempts
        r'union.*select',   # SQL injection
        r'exec\(',          # Code execution
        r'eval\(',          # Code evaluation
        r'system\(',        # System commands
        r'cmd=',            # Command injection
        r'etc/passwd',      # File access attempts
        r'admin.*admin',    # Admin brute force
        r'wp-admin',        # WordPress admin attempts
        r'phpmyadmin',      # phpMyAdmin attempts
        r'\.php',           # PHP file attempts
        r'\.asp',           # ASP file attempts
        r'\.jsp',           # JSP file attempts
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.SUSPICIOUS_PATTERNS]
        super().__init__(get_response)
    
    def __call__(self, request):
        # Pre-process security checks
        start_time = time.time()
        
        # Get client info
        client_ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Check for suspicious activity
        if self.is_suspicious_request(request):
            self.log_security_event('suspicious_request', request, {
                'ip': client_ip,
                'user_agent': user_agent,
                'path': request.path,
                'method': request.method,
                'query_params': str(request.GET),
                'post_data': str(request.POST) if request.method == 'POST' else None
            })
            
            # Optionally block suspicious requests
            if self.should_block_request(request):
                self.log_security_event('blocked_request', request, {
                    'ip': client_ip,
                    'reason': 'Suspicious pattern detected'
                })
                return HttpResponseForbidden("Access Denied")
        
        # Check rate limiting
        if self.is_rate_limited(request):
            self.log_security_event('rate_limit_exceeded', request, {
                'ip': client_ip,
                'path': request.path
            })
            return HttpResponseForbidden("Rate limit exceeded")
        
        # Process the request
        response = self.get_response(request)
        
        # Post-process logging
        process_time = time.time() - start_time
        
        # Log slow requests (potential DoS)
        if process_time > 5.0:  # 5 seconds
            self.log_security_event('slow_request', request, {
                'ip': client_ip,
                'path': request.path,
                'process_time': process_time
            })
        
        # Log failed authentication attempts
        if response.status_code == 401 or (response.status_code == 403 and 'auth' in request.path.lower()):
            self.log_security_event('failed_auth', request, {
                'ip': client_ip,
                'path': request.path,
                'user': str(request.user) if hasattr(request, 'user') else 'Anonymous'
            })
        
        return response
    
    def get_client_ip(self, request):
        """Get the real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_suspicious_request(self, request):
        """Check if the request contains suspicious patterns"""
        # Check URL path
        for pattern in self.compiled_patterns:
            if pattern.search(request.path):
                return True
        
        # Check query parameters
        query_string = request.META.get('QUERY_STRING', '')
        for pattern in self.compiled_patterns:
            if pattern.search(query_string):
                return True
        
        # Check user agent for bots and scanners
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        suspicious_agents = ['bot', 'crawler', 'spider', 'scan', 'hack', 'exploit', 'attack']
        if any(agent in user_agent for agent in suspicious_agents):
            return True
        
        return False
    
    def should_block_request(self, request):
        """Determine if a suspicious request should be blocked"""
        # Block requests to non-existent PHP files
        if request.path.endswith('.php'):
            return True
        
        # Block common attack patterns
        dangerous_patterns = [r'etc/passwd', r'union.*select', r'<script']
        for pattern in dangerous_patterns:
            if re.search(pattern, request.path + request.META.get('QUERY_STRING', ''), re.IGNORECASE):
                return True
        
        return False
    
    def is_rate_limited(self, request):
        """Simple rate limiting check"""
        client_ip = self.get_client_ip(request)
        cache_key = f"rate_limit_{client_ip}"
        
        # Get current request count
        requests = cache.get(cache_key, 0)
        
        # Rate limit: 100 requests per minute for general requests
        limit = 100
        
        # Stricter limits for auth endpoints
        if any(path in request.path for path in ['/auth/', '/login/', '/register/']):
            limit = 10
        
        if requests >= limit:
            return True
        
        # Increment counter
        cache.set(cache_key, requests + 1, 60)  # 60 seconds window
        return False
    
    def log_security_event(self, event_type, request, data):
        """Log security events with structured data"""
        event_data = {
            'event_type': event_type,
            'timestamp': time.time(),
            'ip': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'path': request.path,
            'method': request.method,
            'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
            'referer': request.META.get('HTTP_REFERER', ''),
            'data': data
        }
        
        security_logger.info(f"Security Event: {json.dumps(event_data)}")


class CSRFFailureLoggingMiddleware(MiddlewareMixin):
    """
    Log CSRF failures for security monitoring
    """
    
    def process_exception(self, request, exception):
        if exception.__class__.__name__ == 'Forbidden' and 'CSRF' in str(exception):
            security_logger.warning(f"CSRF failure from {self.get_client_ip(request)} on {request.path}")
        return None
    
    def get_client_ip(self, request):
        """Get the real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AdminSecurityMiddleware(MiddlewareMixin):
    """
    Additional security for admin interface
    """
    
    def __call__(self, request):
        # Check if this is an admin request
        admin_url = getattr(settings, 'ADMIN_URL', 'admin/')
        if request.path.startswith(f'/{admin_url}'):
            # Log all admin access attempts
            client_ip = self.get_client_ip(request)
            
            security_logger.info(f"Admin access attempt from {client_ip} to {request.path}")
            
            # Check for admin-specific rate limiting
            cache_key = f"admin_rate_limit_{client_ip}"
            requests = cache.get(cache_key, 0)
            
            if requests >= 20:  # 20 requests per hour
                security_logger.warning(f"Admin rate limit exceeded for {client_ip}")
                return HttpResponseForbidden("Too many admin requests")
            
            cache.set(cache_key, requests + 1, 3600)  # 1 hour window
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        """Get the real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip