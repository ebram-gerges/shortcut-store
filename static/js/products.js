// Products Page JavaScript
// Handles filtering, sorting, and product interactions

document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

function initializeProductsPage() {
    initializeFilters();
    initializeSorting();
    initializeLoadMore();
    initializeProductAnimations();
}

// Initialize filter functionality
function initializeFilters() {
    // Price range filters
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin && priceMax) {
        priceMin.addEventListener('input', debounce(applyFilters, 500));
        priceMax.addEventListener('input', debounce(applyFilters, 500));
    }
    
    // Checkbox filters
    const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// Initialize sorting functionality
function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            sortProducts(sortValue);
        });
    }
}

// Initialize load more functionality
function initializeLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreProducts();
        });
    }
}

// Initialize product animations
function initializeProductAnimations() {
    // Animate products on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });
}

// Apply filters to products
function applyFilters() {
    const products = document.querySelectorAll('.product-card');
    const priceMin = parseFloat(document.getElementById('priceMin')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
    
    // Get checked filters
    const availabilityFilters = getCheckedValues('input[id^="inStock"], input[id^="outStock"]');
    const sizeFilters = getCheckedValues('input[id^="size"]');
    
    let visibleCount = 0;
    
    products.forEach(product => {
        const productCard = product.closest('.col-lg-4, .col-md-6, .col-sm-6');
        const priceElement = product.querySelector('.price-current');
        const price = parseFloat(priceElement.textContent.replace(/[^\d.]/g, ''));
        
        let shouldShow = true;
        
        // Price filter
        if (price < priceMin || price > priceMax) {
            shouldShow = false;
        }
        
        // Size filter (if any size filters are selected)
        if (sizeFilters.length > 0) {
            const productSizes = product.querySelectorAll('.size-option');
            const hasMatchingSize = Array.from(productSizes).some(size => 
                sizeFilters.includes(size.dataset.size)
            );
            if (!hasMatchingSize) {
                shouldShow = false;
            }
        }
        
        // Show/hide product
        if (shouldShow) {
            productCard.style.display = 'block';
            visibleCount++;
        } else {
            productCard.style.display = 'none';
        }
    });
    
    // Update results count
    updateResultsCount(visibleCount);
}

// Sort products
function sortProducts(sortValue) {
    const productsGrid = document.getElementById('productsGrid');
    const products = Array.from(productsGrid.children);
    
    products.sort((a, b) => {
        const productA = a.querySelector('.product-card');
        const productB = b.querySelector('.product-card');
        
        switch (sortValue) {
            case 'alphabetical-az':
                const nameA = productA.querySelector('.product-title').textContent;
                const nameB = productB.querySelector('.product-title').textContent;
                return nameA.localeCompare(nameB);
                
            case 'alphabetical-za':
                const nameA2 = productA.querySelector('.product-title').textContent;
                const nameB2 = productB.querySelector('.product-title').textContent;
                return nameB2.localeCompare(nameA2);
                
            case 'price-low-high':
                const priceA = parseFloat(productA.querySelector('.price-current').textContent.replace(/[^\d.]/g, ''));
                const priceB = parseFloat(productB.querySelector('.price-current').textContent.replace(/[^\d.]/g, ''));
                return priceA - priceB;
                
            case 'price-high-low':
                const priceA2 = parseFloat(productA.querySelector('.price-current').textContent.replace(/[^\d.]/g, ''));
                const priceB2 = parseFloat(productB.querySelector('.price-current').textContent.replace(/[^\d.]/g, ''));
                return priceB2 - priceA2;
                
            default:
                return 0;
        }
    });
    
    // Re-append sorted products
    products.forEach(product => {
        productsGrid.appendChild(product);
    });
    
    // Re-animate products
    setTimeout(() => {
        initializeProductAnimations();
    }, 100);
}

// Load more products (placeholder - would typically make AJAX request)
function loadMoreProducts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const originalText = loadMoreBtn.textContent;
    
    loadMoreBtn.innerHTML = '<span class="loading"></span> Loading...';
    loadMoreBtn.disabled = true;
    
    // Simulate loading
    setTimeout(() => {
        loadMoreBtn.textContent = originalText;
        loadMoreBtn.disabled = false;
        
        // In a real implementation, you would:
        // 1. Make an AJAX request to get more products
        // 2. Append them to the grid
        // 3. Initialize animations for new products
        
        showNotification('No more products to load', 'info');
    }, 1500);
}

// Helper function to get checked checkbox values
function getCheckedValues(selector) {
    const checkboxes = document.querySelectorAll(selector);
    return Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => {
            // Extract the value from the ID (e.g., "sizeS" -> "S")
            const id = checkbox.id;
            if (id.startsWith('size')) {
                return id.replace('size', '');
            }
            return id;
        });
}

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.textContent = `${count} products`;
    }
}

// Debounce function for input events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show notification (reuse from main dxlr-clone.js)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: var(--accent-${type === 'success' ? 'green' : type === 'warning' ? 'red' : 'blue'});
        color: white;
        border-radius: 6px;
        z-index: 150000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Clear all filters
function clearAllFilters() {
    // Reset checkboxes
    const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset price inputs
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    
    // Reset sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'featured';
    
    // Show all products
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const productCard = product.closest('.col-lg-4, .col-md-6, .col-sm-6');
        productCard.style.display = 'block';
    });
    
    // Update results count
    updateResultsCount(products.length);
}

// Add clear filters button functionality if it exists
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('clear-filters-btn')) {
        clearAllFilters();
    }
});
