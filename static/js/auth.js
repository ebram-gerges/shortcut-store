/**
 * Shortcut Store Authentication JavaScript
 * Handles form interactions, validation, and user experience
 */

// Utility function to get CSRF token
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Insert at the top of the form
    const form = document.querySelector('.auth-form');
    if (form) {
        form.insertBefore(alertDiv, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById('passwordToggleIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('.form-control');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const isRequired = input.hasAttribute('required') || input.closest('.form-group').querySelector('.required');
        
        // Remove existing error classes
        input.classList.remove('error');
        
        // Check if required field is empty
        if (isRequired && !value) {
            input.classList.add('error');
            isValid = false;
        }
        
        // Email validation
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                input.classList.add('error');
                isValid = false;
            }
        }
        
        // Phone validation
        if (input.name === 'phone' && value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
            if (!phoneRegex.test(value)) {
                input.classList.add('error');
                isValid = false;
            }
        }
        
        // Password validation
        if (input.name === 'password1' && value) {
            if (value.length < 8) {
                input.classList.add('error');
                isValid = false;
            }
        }
        
        // Password confirmation
        if (input.name === 'password2' && value) {
            const password1 = form.querySelector('[name="password1"]');
            if (password1 && value !== password1.value) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Handle form submission with loading states
function handleFormSubmission(formId, buttonId) {
    const form = document.getElementById(formId);
    const button = document.getElementById(buttonId);
    
    if (!form || !button) return;
    
    form.addEventListener('submit', function(e) {
        // Validate form
        if (!validateForm(formId)) {
            e.preventDefault();
            showMessage('Please correct the errors in the form.', 'error');
            return;
        }
        
        // Show loading state
        button.classList.add('loading');
        button.disabled = true;
        
        // The form will submit normally, but if there's an error,
        // we'll handle it on page reload
    });
}

// Real-time validation
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            this.classList.remove('error');
            
            // Email validation
            if (this.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.classList.add('error');
                }
            }
            
            // Phone validation
            if (this.name === 'phone' && value) {
                const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
                if (!phoneRegex.test(value)) {
                    this.classList.add('error');
                }
            }
            
            // Password confirmation
            if (this.name === 'password2' && value) {
                const password1 = document.querySelector('[name="password1"]');
                if (password1 && value !== password1.value) {
                    this.classList.add('error');
                }
            }
        });
        
        // Remove error class on input
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
}

// Format phone number input
function formatPhoneInput() {
    const phoneInputs = document.querySelectorAll('input[name="phone"], input[name="secondary_phone"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove non-numeric characters except +, -, (, ), and spaces
            let value = this.value.replace(/[^\d\+\-\(\)\s]/g, '');
            this.value = value;
        });
    });
}

// Auto-format verification code input
function setupVerificationInput() {
    const verificationInput = document.getElementById('verification_code');
    if (!verificationInput) return;
    
    verificationInput.addEventListener('input', function() {
        // Only allow digits
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 6 digits
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6);
        }
        
        // Auto-submit when 6 digits are entered
        if (this.value.length === 6) {
            const form = this.closest('form');
            if (form) {
                setTimeout(() => {
                    form.submit();
                }, 500);
            }
        }
    });
    
    // Handle paste events
    verificationInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const digits = paste.replace(/\D/g, '').slice(0, 6);
        this.value = digits;
        
        if (digits.length === 6) {
            const form = this.closest('form');
            if (form) {
                setTimeout(() => {
                    form.submit();
                }, 500);
            }
        }
    });
}

// Google OAuth placeholder (to be implemented with actual credentials)
function initializeGoogleOAuth() {
    const googleButtons = document.querySelectorAll('#googleSignIn, #googleSignUp');
    
    googleButtons.forEach(button => {
        button.addEventListener('click', function() {
            showMessage('Google OAuth integration will be available once credentials are configured.', 'warning');
        });
    });
}

// Initialize all authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup form handling
    handleFormSubmission('loginForm', 'submitBtn');
    handleFormSubmission('registerForm', 'submitBtn');
    handleFormSubmission('verificationForm', 'verifyBtn');
    
    // Setup validation
    setupRealTimeValidation();
    
    // Setup input formatting
    formatPhoneInput();
    setupVerificationInput();
    
    // Initialize OAuth
    initializeGoogleOAuth();
    
    // Focus first input
    const firstInput = document.querySelector('.form-control');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Handle remember me functionality
    const rememberCheckbox = document.getElementById('remember_me');
    if (rememberCheckbox) {
        // Load saved email if remember me was checked
        const savedEmail = localStorage.getItem('shortcut_remember_email');
        if (savedEmail) {
            const emailInput = document.querySelector('input[type="email"]');
            if (emailInput) {
                emailInput.value = savedEmail;
                rememberCheckbox.checked = true;
            }
        }
        
        // Save email when form is submitted
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function() {
                const emailInput = document.querySelector('input[type="email"]');
                if (rememberCheckbox.checked && emailInput) {
                    localStorage.setItem('shortcut_remember_email', emailInput.value);
                } else {
                    localStorage.removeItem('shortcut_remember_email');
                }
            });
        }
    }
});

// Export functions for global use
window.authUtils = {
    getCsrfToken,
    showMessage,
    togglePassword,
    validateForm
};
