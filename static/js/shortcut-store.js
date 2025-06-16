// Shortcut Store Clone JavaScript
// Handles animations, interactions, and dynamic content

// Prevent multiple initializations
let initialized = false;
let cartSynced = false;

document.addEventListener('DOMContentLoaded', function() {
    if (initialized) return;
    initialized = true;

    // Initialize all components
    initializeAnimations();
    initializeNavigation();
    initializeScrollEffects();
    initializeProductInteractions();
    initializeSidebars();
    initializeWishlistCart();
    initializeCollectionCarousel();
});

// Wishlist and Cart storage - Database-driven only
let wishlistItems = [];
let cartItems = [];

// Get CSRF token
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
           document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

// Sync cart data from database
async function syncCartFromDatabase() {
    try {
        const response = await fetch('/products/get-cart/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                cartItems = data.cart_items || [];
                console.log('Cart synced successfully:', cartItems.length, 'items');
                updateCartDisplay();
                return data;
            } else {
                console.log('Cart sync message:', data.message);
                cartItems = [];
                updateCartDisplay();
            }
        } else {
            console.error('Failed to fetch cart data');
            cartItems = [];
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error syncing cart from database:', error);
        cartItems = [];
        updateCartDisplay();
    }
    return null;
}

// Initialize fade-in animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to elements and observe them
    const animatedElements = document.querySelectorAll('.category-card, .section-title, .about-section');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Initialize product grid
function initializeProductGrid() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    // Clear existing content
    productsGrid.innerHTML = '';

    // Create product cards
    sampleProducts.forEach((product, index) => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
        
        // Add staggered animation delay
        setTimeout(() => {
            productCard.classList.add('visible');
        }, index * 100);
    });
}

// Create individual product card
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
    
    const discountBadge = product.discount ? 
        `<div class="product-badge">-${product.discount}%</div>` : '';
    
    const originalPrice = product.salePrice ? 
        `<span class="price-original">LE ${product.price.toFixed(2)}</span>` : '';
    
    const currentPrice = product.salePrice || product.price;
    
    const sizesHtml = product.sizes.map(size => 
        `<span class="size-option" data-size="${size}">${size}</span>`
    ).join('');

    col.innerHTML = `
        <div class="product-card fade-in" data-product-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     data-hover-src="${product.hoverImage}">
                ${discountBadge}
                <div class="product-actions">
                    <button class="product-action-btn" data-action="wishlist" title="Add to Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="product-action-btn" data-action="quickview" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="price-current">LE ${currentPrice.toFixed(2)}</span>
                    ${originalPrice}
                </div>
                <div class="product-sizes">
                    ${sizesHtml}
                </div>
                <button class="quick-add-btn" data-product-id="${product.id}">
                    Quick add
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Initialize navigation interactions
function initializeNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        // Add background on scroll
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Initialize scroll effects
function initializeScrollEffects() {
    // Parallax effect for hero section
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero-section');
            const heroHeight = heroSection.offsetHeight;

            // Only apply parallax when hero section is visible
            if (scrolled < heroHeight) {
                const rate = scrolled * -0.3; // Reduced rate for smoother effect
                heroImage.style.transform = `translate3d(0, ${rate}px, 0)`;
            }
        });
    }

    // Counter animation for badges
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                }
            });
        });
        observer.observe(badge);
    });
}

// Initialize product interactions
function initializeProductInteractions() {
    // Image hover effect
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('product-image') && e.target.dataset.hoverSrc) {
            const originalSrc = e.target.src;
            e.target.src = e.target.dataset.hoverSrc;
            
            e.target.addEventListener('mouseleave', () => {
                e.target.src = originalSrc;
            }, { once: true });
        }
    });

    // Size selection
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('size-option')) {
            const productCard = e.target.closest('.product-card');
            const sizeOptions = productCard.querySelectorAll('.size-option');
            
            sizeOptions.forEach(option => option.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    // Product actions
    document.addEventListener('click', (e) => {
        if (e.target.closest('.product-action-btn')) {
            const btn = e.target.closest('.product-action-btn');
            const action = btn.dataset.action;
            const productId = btn.closest('.product-card').dataset.productId;
            
            handleProductAction(action, productId, btn);
        }
    });

    // Quick add functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-add-btn')) {
            const productId = e.target.dataset.productId;
            const productCard = e.target.closest('.product-card');
            const selectedSize = productCard.querySelector('.size-option.active');
            
            if (!selectedSize) {
                showNotification('Please select a size', 'warning');
                return;
            }
            
            handleQuickAdd(productId, selectedSize.dataset.size, e.target);
        }
    });
}

// Handle product actions (wishlist, quickview)
function handleProductAction(action, productId, button) {
    const icon = button.querySelector('i');
    const productCard = button.closest('.product-card');

    switch (action) {
        case 'wishlist':
            const productName = productCard.querySelector('.product-title').textContent;
            const priceElement = productCard.querySelector('.price-current');
            const productPrice = parseFloat(priceElement.textContent.replace(/[^\d.]/g, ''));
            const productImage = productCard.querySelector('.product-image').src;

            const isInWishlist = wishlistItems.some(item => item.id === productId);

            if (isInWishlist) {
                removeFromWishlist(productId);
                icon.classList.remove('fas');
                icon.classList.add('far');
            } else {
                addToWishlist(productId, productName, productPrice, productImage);
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
            break;

        case 'quickview':
            showQuickView(productId);
            break;
    }
}

// Handle quick add to cart
function handleQuickAdd(productId, size, button) {
    const originalText = button.textContent;
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('.product-title').textContent;
    const priceElement = productCard.querySelector('.price-current');
    const productPrice = parseFloat(priceElement.textContent.replace(/[^\d.]/g, ''));
    const productImage = productCard.querySelector('.product-image').src;

    button.innerHTML = '<span class="loading"></span> Adding...';
    button.disabled = true;

    // Simulate API call
    setTimeout(() => {
        addToCart(productId, productName, productPrice, productImage, size, 1);

        button.textContent = 'Added!';
        button.style.backgroundColor = 'var(--accent-green)';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.disabled = false;
        }, 1500);
    }, 1000);
}

// Show notification with cart-specific styling
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Check if this is a cart-related notification
    const isCartNotification = message.toLowerCase().includes('cart') ||
                              message.toLowerCase().includes('added') ||
                              message.toLowerCase().includes('removed');

    let backgroundColor;
    if (isCartNotification && (type === 'success' || type === 'info')) {
        backgroundColor = 'var(--shortcut-greeny-black)';
    } else {
        backgroundColor = `var(--accent-${type === 'success' ? 'green' : type === 'warning' ? 'red' : 'blue'})`;
    }

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${backgroundColor};
        color: white;
        border-radius: 6px;
        z-index: 150000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

// Cart counter function removed

// Animate counter
function animateCounter(element) {
    const target = parseInt(element.textContent);
    let current = 0;
    const increment = target / 20;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 50);
}

// Show quick view modal (placeholder)
function showQuickView(productId) {
    showNotification('Quick view feature coming soon!', 'info');
}

// Initialize sidebars
function initializeSidebars() {
    const customBackdrop = document.getElementById('customBackdrop');
    const offcanvasElements = ['#offcanvasWishlist', '#offcanvasCart'];

    // Function to show backdrop
    function showBackdrop() {
        customBackdrop.classList.add('show');
    }

    // Function to hide backdrop
    function hideBackdrop() {
        customBackdrop.classList.remove('show');
    }

    // Setup offcanvas event handlers
    offcanvasElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            // Show backdrop when offcanvas is shown
            element.addEventListener('show.bs.offcanvas', showBackdrop);

            // Hide backdrop when offcanvas is hidden
            element.addEventListener('hidden.bs.offcanvas', hideBackdrop);
        }
    });

    // Handle backdrop clicks to close offcanvas
    customBackdrop.addEventListener('click', function() {
        // Find any open offcanvas and close it
        const openOffcanvas = document.querySelector('.offcanvas.show');
        if (openOffcanvas) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(openOffcanvas);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
    });
}

// This duplicate function has been removed - using the main syncCartFromDatabase function above

// Check authentication for cart access
function checkAuthForCart(event) {
    // Check if user is authenticated (this will be set by Django template)
    const isAuthenticated = document.body.dataset.userAuthenticated === 'true';

    if (!isAuthenticated) {
        event.preventDefault();
        showAuthPrompt('cart');
        return false;
    }
    return true;
}

// Check authentication for wishlist access
function checkAuthForWishlist(event) {
    // Check if user is authenticated (this will be set by Django template)
    const isAuthenticated = document.body.dataset.userAuthenticated === 'true';

    if (!isAuthenticated) {
        event.preventDefault();
        showAuthPrompt('wishlist');
        return false;
    }
    return true;
}

// Show authentication prompt with elegant modal
function showAuthPrompt(feature) {
    const featureName = feature === 'cart' ? 'shopping cart' : 'wishlist';
    const icon = feature === 'cart' ? 'fa-shopping-cart' : 'fa-heart';

    // Create custom modal
    const modal = document.createElement('div');
    modal.className = 'auth-prompt-modal';
    modal.innerHTML = `
        <div class="auth-prompt-overlay">
            <div class="auth-prompt-content">
                <div class="auth-prompt-header">
                    <i class="fas ${icon} auth-prompt-icon"></i>
                    <h3>Login Required</h3>
                </div>
                <div class="auth-prompt-body">
                    <p>Please log in to access your ${featureName}.</p>
                </div>
                <div class="auth-prompt-actions">
                    <button class="btn btn-outline-secondary auth-prompt-cancel">Cancel</button>
                    <button class="btn btn-primary auth-prompt-login">Login</button>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const cancelBtn = modal.querySelector('.auth-prompt-cancel');
    const loginBtn = modal.querySelector('.auth-prompt-login');
    const overlay = modal.querySelector('.auth-prompt-overlay');

    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }

    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    loginBtn.addEventListener('click', () => {
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/accounts/login/?next=${currentUrl}`;
    });

    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// Sync wishlist from database
async function syncWishlistFromDatabase() {
    const isAuthenticated = document.body.dataset.userAuthenticated === 'true';

    if (!isAuthenticated) {
        // For non-authenticated users, use localStorage
        const rawWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistItems = rawWishlist.filter(item =>
            item &&
            item.id &&
            item.id !== 'undefined' &&
            item.name &&
            item.name !== 'undefined' &&
            item.price !== undefined
        );

        if (wishlistItems.length !== rawWishlist.length) {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        }
        return;
    }

    // For authenticated users, sync from database
    try {
        const response = await fetch('/products/get-wishlist/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                wishlistItems = data.wishlist_items || [];
                localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
                console.log('Wishlist synced from database:', wishlistItems.length, 'items');
            }
        }
    } catch (error) {
        console.error('Error syncing wishlist from database:', error);
        // Fallback to localStorage
        const rawWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistItems = rawWishlist.filter(item =>
            item && item.id && item.id !== 'undefined' &&
            item.name && item.name !== 'undefined' &&
            item.price !== undefined
        );
    }
}

// Initialize wishlist and cart
async function initializeWishlistCart() {
    // Sync cart from database first
    await syncCartFromDatabase();

    // Sync wishlist from database or localStorage
    await syncWishlistFromDatabase();

    updateWishlistDisplay();
}

// Force cart refresh when sidebar is opened
function refreshCartOnOpen() {
    syncCartFromDatabase();
}

// Add event listener for cart sidebar
document.addEventListener('DOMContentLoaded', function() {
    const cartSidebar = document.getElementById('offcanvasCart');
    if (cartSidebar) {
        cartSidebar.addEventListener('show.bs.offcanvas', function() {
            // Force refresh cart data when sidebar opens
            syncCartFromDatabase();
        });
    }
});

// Add to wishlist with validation and database sync
function addToWishlist(productId, productName, productPrice, productImage) {
    console.log('Adding to wishlist:', { productId, productName, productPrice, productImage });

    // Validate input parameters
    if (!productId || productId === 'undefined' || !productName || productName === 'undefined') {
        console.error('Invalid product data for wishlist:', { productId, productName, productPrice, productImage });
        showNotification('Error adding to wishlist: Invalid product data', 'error');
        return;
    }

    // Check if user is authenticated
    const isAuthenticated = document.body.dataset.userAuthenticated === 'true';
    console.log('User authenticated:', isAuthenticated);

    if (!isAuthenticated) {
        // For non-authenticated users, use localStorage
        const existingItem = wishlistItems.find(item => item.id === productId);
        if (!existingItem) {
            const newItem = {
                id: productId,
                name: productName,
                price: productPrice || 0,
                image: productImage || '/static/images/placeholder-product.jpg'
            };
            wishlistItems.push(newItem);
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            updateWishlistDisplay();
            showNotification('Added to wishlist!', 'success');
        } else {
            showNotification('Item already in wishlist', 'info');
        }
        return;
    }

    // Use database-driven wishlist for authenticated users
    const data = {
        product_id: productId,
        action: 'add'
    };

    fetch('/products/add-to-wishlist/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update local storage for display purposes
            const existingItem = wishlistItems.find(item => item.id === productId);
            if (!existingItem) {
                const newItem = {
                    id: productId,
                    name: productName,
                    price: productPrice || 0,
                    image: productImage || '/static/images/placeholder-product.jpg'
                };
                wishlistItems.push(newItem);
                localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            }
            updateWishlistDisplay();
            showNotification(data.message || 'Added to wishlist!', 'success');
        } else {
            showNotification(data.error || 'Error adding to wishlist', 'error');
        }
    })
    .catch(error => {
        console.error('Error adding to wishlist:', error);
        showNotification('Error adding to wishlist', 'error');
    });
}

// Remove from wishlist with validation and database sync
function removeFromWishlist(productId) {
    if (!productId || productId === 'undefined') {
        console.error('Invalid product ID for removal:', productId);
        showNotification('Error removing item from wishlist', 'error');
        return;
    }

    // Check if user is authenticated
    const isAuthenticated = document.body.dataset.userAuthenticated === 'true';

    if (!isAuthenticated) {
        // For non-authenticated users, use localStorage
        const initialLength = wishlistItems.length;
        wishlistItems = wishlistItems.filter(item => item.id !== productId);

        if (wishlistItems.length < initialLength) {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            updateWishlistDisplay();
            showNotification('Removed from wishlist', 'info');
        } else {
            showNotification('Item not found in wishlist', 'warning');
        }
        return;
    }

    // Use database-driven wishlist for authenticated users
    const data = {
        product_id: productId,
        action: 'remove'
    };

    fetch('/products/add-to-wishlist/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update local storage for display purposes
            const initialLength = wishlistItems.length;
            wishlistItems = wishlistItems.filter(item => item.id !== productId);

            if (wishlistItems.length < initialLength) {
                localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
                updateWishlistDisplay();
                showNotification(data.message || 'Removed from wishlist', 'info');
            }
        } else {
            showNotification(data.error || 'Error removing from wishlist', 'error');
        }
    })
    .catch(error => {
        console.error('Error removing from wishlist:', error);
        showNotification('Error removing from wishlist', 'error');
    });
}

// Clean wishlist of invalid items
function cleanWishlist() {
    const originalLength = wishlistItems.length;
    wishlistItems = wishlistItems.filter(item =>
        item &&
        item.id &&
        item.id !== 'undefined' &&
        item.name &&
        item.name !== 'undefined' &&
        item.price !== undefined
    );

    if (wishlistItems.length !== originalLength) {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        updateWishlistDisplay();
        const removedCount = originalLength - wishlistItems.length;
        showNotification(`Cleaned ${removedCount} invalid item(s) from wishlist`, 'info');
        console.log('Wishlist cleaned:', removedCount, 'invalid items removed');
    } else {
        showNotification('Wishlist is already clean', 'info');
    }
}

// Initialize collection carousel
function initializeCollectionCarousel() {
    const carousel = document.getElementById('collectionCarousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.collection-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    if (slides.length <= 1) return; // No need for rotation with single image

    let currentSlide = 0;
    let isHovered = false;
    let rotationInterval;

    // Function to show specific slide
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        currentSlide = index;
    }

    // Make goToSlide function global for onclick handlers
    window.goToSlide = function(index) {
        showSlide(index);
        // Restart rotation timer
        if (!isHovered) {
            stopRotation();
            startRotation();
        }
    };

    // Function to go to next slide
    function nextSlide() {
        if (isHovered) return; // Pause on hover
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Start automatic rotation
    function startRotation() {
        rotationInterval = setInterval(nextSlide, 6000); // 6 seconds
    }

    // Stop automatic rotation
    function stopRotation() {
        if (rotationInterval) {
            clearInterval(rotationInterval);
            rotationInterval = null;
        }
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
        isHovered = true;
        stopRotation();
    });

    // Resume on mouse leave
    carousel.addEventListener('mouseleave', () => {
        isHovered = false;
        startRotation();
    });

    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopRotation();
        } else if (!isHovered) {
            startRotation();
        }
    });

    // Start the carousel
    startRotation();

    console.log('Collection carousel initialized with', slides.length, 'images');
}

// Add to cart function removed - handled by product-detail.js for product pages

// Show custom delete confirmation modal
function showConfirmDeleteModal(productId, color, size) {
    // Create modal HTML
    const modalHTML = `
        <div class="custom-modal-overlay" id="deleteConfirmModal">
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <h5 class="custom-modal-title">Remove Item</h5>
                    <button type="button" class="custom-modal-close" onclick="closeDeleteModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="custom-modal-body">
                    <div class="text-center mb-3">
                        <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                    </div>
                    <p class="text-center mb-0">Are you sure you want to remove this item from your cart?</p>
                </div>
                <div class="custom-modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
                    <button type="button" class="btn btn-danger" onclick="confirmRemoveFromCart('${productId}', '${color}', '${size}')">
                        <i class="fas fa-trash me-2"></i>Yes, Remove
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal with animation
    const modal = document.getElementById('deleteConfirmModal');

    // Add click event to close modal when clicking backdrop
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDeleteModal();
        }
    });

    // Add keyboard support (ESC key)
    const handleKeyPress = function(e) {
        if (e.key === 'Escape') {
            closeDeleteModal();
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
    document.addEventListener('keydown', handleKeyPress);

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Close delete confirmation modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Confirm and remove item from cart
async function confirmRemoveFromCart(productId, color, size) {
    closeDeleteModal();

    try {
        const response = await fetch('/products/remove-from-cart/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({
                product_id: productId,
                color: color,
                size: size
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Refresh cart data from database
                await syncCartFromDatabase();
                showNotification('Item removed from cart', 'success');
            } else {
                showNotification(data.message || 'Error removing item', 'error');
            }
        } else {
            showNotification('Failed to remove item', 'error');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing item from cart', 'error');
    }
}

// Remove from cart - Show confirmation modal first
function removeFromCart(productId, color, size) {
    showConfirmDeleteModal(productId, color, size);
}

// Handle quantity change with button reference
function handleQuantityChange(buttonElement, productId, color, size, newQuantity) {
    updateCartQuantity(productId, color, size, newQuantity, buttonElement);
}

// Update cart item quantity - Database-driven with loading states
async function updateCartQuantity(productId, color, size, newQuantity, buttonElement = null) {
    // Prevent quantities below 1
    if (newQuantity < 1) {
        showConfirmDeleteModal(productId, color, size);
        return;
    }

    // Show loading state
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    // Disable all quantity buttons for this item
    const quantityButtons = document.querySelectorAll(`[data-product="${productId}"][data-color="${color}"][data-size="${size}"]`);
    quantityButtons.forEach(btn => {
        btn.disabled = true;
    });

    try {
        const response = await fetch('/products/update-cart-quantity/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({
                product_id: productId,
                color: color,
                size: size,
                quantity: newQuantity
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Refresh cart data from database
                await syncCartFromDatabase();
                showNotification('Quantity updated', 'success');
            } else {
                showNotification(data.message || 'Error updating quantity', 'error');
            }
        } else {
            showNotification('Failed to update quantity', 'error');
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        showNotification('Error updating cart quantity', 'error');
    } finally {
        // Re-enable buttons
        quantityButtons.forEach(btn => {
            btn.disabled = false;
        });

        // Restore button content
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = buttonElement.dataset.originalContent || buttonElement.textContent;
        }
    }
}

// Wishlist counter removed to prevent errors

// Cart counter removed to prevent errors

// Update wishlist display with validation
function updateWishlistDisplay() {
    const emptyWishlist = document.getElementById('emptyWishlist');
    const wishlistItems_container = document.getElementById('wishlistItems');

    // Filter out invalid items (undefined, null, or missing required properties)
    const validWishlistItems = wishlistItems.filter(item =>
        item &&
        item.id &&
        item.id !== 'undefined' &&
        item.name &&
        item.name !== 'undefined' &&
        item.price !== undefined &&
        item.image
    );

    // Update the global wishlistItems array to only contain valid items
    if (validWishlistItems.length !== wishlistItems.length) {
        wishlistItems = validWishlistItems;
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        console.log('Cleaned wishlist: removed', (wishlistItems.length - validWishlistItems.length), 'invalid items');
    }

    if (validWishlistItems.length === 0) {
        if (emptyWishlist) emptyWishlist.style.display = 'block';
        if (wishlistItems_container) wishlistItems_container.style.display = 'none';
    } else {
        if (emptyWishlist) emptyWishlist.style.display = 'none';
        if (wishlistItems_container) wishlistItems_container.style.display = 'block';

        if (wishlistItems_container) {
            wishlistItems_container.innerHTML = validWishlistItems.map(item => `
                <div class="wishlist-item" data-product-id="${item.id}">
                    <img src="${item.image || '/static/images/placeholder-product.jpg'}"
                         alt="${item.name || 'Product'}"
                         class="wishlist-item-image"
                         onerror="this.src='/static/images/placeholder-product.jpg'">
                    <div class="wishlist-item-info">
                        <div class="wishlist-item-title">${item.name || 'Unknown Product'}</div>
                        <div class="wishlist-item-price">LE ${(item.price || 0).toFixed(2)}</div>
                        <div class="wishlist-item-actions">
                            <button class="wishlist-item-btn" onclick="addToCartFromWishlist('${item.id}', '${item.name}', ${item.price}, '${item.image}')">
                                Add to cart
                            </button>
                        </div>
                    </div>
                    <button class="wishlist-item-remove" onclick="removeFromWishlist('${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

// Update cart display with enhanced pricing
function updateCartDisplay() {
    console.log('Updating cart display with', cartItems.length, 'items');
    const emptyCart = document.getElementById('emptyCart');
    const cartItems_container = document.getElementById('cartItems');
    const cartItemsList = document.getElementById('cartItemsList');

    if (cartItems.length === 0) {
        console.log('Showing empty cart');
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartItems_container) cartItems_container.style.display = 'none';
        if (cartItemsList) cartItemsList.innerHTML = '';
    } else {
        console.log('Showing cart with items');
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartItems_container) cartItems_container.style.display = 'block';

        // Calculate pricing
        const originalSubtotal = cartItems.reduce((sum, item) => sum + (item.original_price * item.quantity), 0);
        const finalSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalDiscounts = originalSubtotal - finalSubtotal;
        const freeShipping = finalSubtotal >= 1000;

        // Update pricing summary
        updateCartPricingSummary(originalSubtotal, totalDiscounts, finalSubtotal, freeShipping);

        // Create cart items HTML
        const cartItemsHTML = cartItems.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <img src="${item.image_url || '/static/images/placeholder-product.jpg'}" alt="${item.product_name || 'Product'}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.product_name || 'Unknown Product'}</div>
                    <div class="cart-item-variant">${item.color || 'Default'} - Size: ${item.size || 'N/A'}</div>
                    <div class="cart-item-price">
                        ${item.sale_percent ? `
                            <span class="original-price">LE ${(item.original_price * item.quantity).toFixed(2)}</span>
                            <span class="sale-price">LE ${(item.price * item.quantity).toFixed(2)}</span>
                        ` : `
                            <span class="current-price">LE ${(item.price * item.quantity).toFixed(2)}</span>
                        `}
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn-small quantity-decrease"
                                data-product="${item.product_id}"
                                data-color="${item.color || ''}"
                                data-size="${item.size || ''}"
                                data-original-content="-"
                                onclick="handleQuantityChange(this, '${item.product_id}', '${item.color || ''}', '${item.size || ''}', ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn-small quantity-increase"
                                data-product="${item.product_id}"
                                data-color="${item.color || ''}"
                                data-size="${item.size || ''}"
                                data-original-content="+"
                                onclick="handleQuantityChange(this, '${item.product_id}', '${item.color || ''}', '${item.size || ''}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.product_id}', '${item.color || ''}', '${item.size || ''}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Update cart items list
        const cartItemsList = document.getElementById('cartItemsList');
        if (cartItemsList) {
            cartItemsList.innerHTML = cartItemsHTML;
        }
    }
}

// Update cart pricing summary
function updateCartPricingSummary(originalSubtotal, totalDiscounts, finalTotal, freeShipping) {
    const cartOriginalSubtotal = document.getElementById('cartOriginalSubtotal');
    const cartTotalDiscounts = document.getElementById('cartTotalDiscounts');
    const cartFinalTotal = document.getElementById('cartFinalTotal');
    const discountRow = document.getElementById('discountRow');
    const freeShippingIndicator = document.getElementById('freeShippingIndicator');

    if (cartOriginalSubtotal) {
        cartOriginalSubtotal.textContent = `LE ${originalSubtotal.toFixed(2)}`;
    }

    if (cartTotalDiscounts && discountRow) {
        if (totalDiscounts > 0) {
            cartTotalDiscounts.textContent = `-LE ${totalDiscounts.toFixed(2)}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }

    if (cartFinalTotal) {
        cartFinalTotal.textContent = `LE ${finalTotal.toFixed(2)}`;
    }

    if (freeShippingIndicator) {
        freeShippingIndicator.style.display = freeShipping ? 'block' : 'none';
    }
}

// Add to cart from wishlist
function addToCartFromWishlist(productId, productName, productPrice, productImage) {
    // Redirect to product page for proper add to cart functionality
    window.location.href = `/products/${productId}/`;
}

// View cart function
function viewCart() {
    window.location.href = '/cart/';
}

// Checkout function
function checkout() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    window.location.href = '/checkout/';
}
