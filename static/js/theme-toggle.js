/**
 * Shortcut Store Dark Mode Toggle
 * Handles theme switching with smooth transitions and localStorage persistence
 */

class ThemeToggle {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
        
        this.init();
    }

    init() {
        // Set initial theme
        this.setTheme(this.currentTheme, false);
        
        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.setTheme(e.matches ? 'dark' : 'light', true);
            }
        });
    }

    getStoredTheme() {
        return localStorage.getItem('shortcut-store-theme');
    }

    getPreferredTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setTheme(theme, animate = true) {
        this.currentTheme = theme;
        
        // Store theme preference
        localStorage.setItem('shortcut-store-theme', theme);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update icon with animation
        if (this.themeIcon) {
            if (animate) {
                this.animateIconChange(theme);
            } else {
                this.updateIcon(theme);
            }
        }

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
    }

    updateIcon(theme) {
        if (!this.themeIcon) return;
        
        if (theme === 'dark') {
            this.themeIcon.className = 'fas fa-sun';
        } else {
            this.themeIcon.className = 'fas fa-moon';
        }
    }

    animateIconChange(theme) {
        if (!this.themeIcon || !this.themeToggle) return;

        // Add transition class
        this.themeToggle.classList.add('transitioning');
        
        // Change icon halfway through animation
        setTimeout(() => {
            this.updateIcon(theme);
        }, 300);

        // Remove transition class after animation
        setTimeout(() => {
            this.themeToggle.classList.remove('transitioning');
        }, 600);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, true);

        // Add haptic feedback on supported devices
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }



    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Public method to set theme programmatically
    setThemeManually(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.setTheme(theme, true);
        }
    }
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
});

// Export for global access
window.ThemeToggle = ThemeToggle;
