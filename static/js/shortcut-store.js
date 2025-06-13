// Shortcut Store Clone JavaScript
// Handles animations, interactions, and dynamic content

// Prevent multiple initializations
let initialized = false;
let cartSynced = false;

document.addEventListener("DOMContentLoaded", function () {
	if (initialized) return;
	initialized = true;

	// Initialize all components
	initializeAnimations();
	initializeNavigation();
	initializeScrollEffects();
	initializeProductInteractions();
	initializeSidebars();
	initializeWishlistCart();
});

// Wishlist and Cart storage - Database-driven only
let wishlistItems = [];
let cartItems = [];

// Sync cart data from database
async function syncCartFromDatabase() {
	try {
		const response = await fetch("/cart/get-cart/", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
		});

		if (response.ok) {
			const data = await response.json();
			if (data.success) {
				cartItems = data.cart_items || [];
				updateCartDisplay();
				updateCartCount();
				return data;
			}
		}
	} catch (error) {
		console.error("Error syncing cart from database:", error);
	}
	return null;
}

// Initialize fade-in animations
function initializeAnimations() {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: "0px 0px -50px 0px",
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
			}
		});
	}, observerOptions);

	// Add fade-in class to elements and observe them
	const animatedElements = document.querySelectorAll(
		".category-card, .section-title, .about-section"
	);
	animatedElements.forEach((el) => {
		el.classList.add("fade-in");
		observer.observe(el);
	});
}

// Initialize product grid
function initializeProductGrid() {
	const productsGrid = document.getElementById("products-grid");
	if (!productsGrid) return;

	// Clear existing content
	productsGrid.innerHTML = "";

	// Create product cards
	sampleProducts.forEach((product, index) => {
		const productCard = createProductCard(product);
		productsGrid.appendChild(productCard);

		// Add staggered animation delay
		setTimeout(() => {
			productCard.classList.add("visible");
		}, index * 100);
	});
}

// Create individual product card
function createProductCard(product) {
	const col = document.createElement("div");
	col.className = "col-lg-3 col-md-4 col-sm-6 mb-4";

	const discountBadge = product.discount
		? `<div class="product-badge">-${product.discount}%</div>`
		: "";

	const originalPrice = product.salePrice
		? `<span class="price-original">LE ${product.price.toFixed(2)}</span>`
		: "";

	const currentPrice = product.salePrice || product.price;

	const sizesHtml = product.sizes
		.map(
			(size) => `<span class="size-option" data-size="${size}">${size}</span>`
		)
		.join("");

	col.innerHTML = `
        <div class="product-card fade-in" data-product-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${
		product.name
	}" class="product-image" 
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
                    <span class="price-current">LE ${currentPrice.toFixed(
											2
										)}</span>
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
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute("href"));
			if (target) {
				target.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	});

	// Navbar scroll effect
	let lastScrollTop = 0;
	const navbar = document.querySelector(".navbar");

	window.addEventListener("scroll", () => {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		if (scrollTop > lastScrollTop && scrollTop > 100) {
			// Scrolling down
			navbar.style.transform = "translateY(-100%)";
		} else {
			// Scrolling up
			navbar.style.transform = "translateY(0)";
		}

		// Add background on scroll
		if (scrollTop > 50) {
			navbar.classList.add("scrolled");
		} else {
			navbar.classList.remove("scrolled");
		}

		lastScrollTop = scrollTop;
	});
}

// Initialize scroll effects
function initializeScrollEffects() {
	// Parallax effect for hero section
	const heroImage = document.querySelector(".hero-image");
	if (heroImage) {
		window.addEventListener("scroll", () => {
			const scrolled = window.pageYOffset;
			const heroSection = document.querySelector(".hero-section");
			const heroHeight = heroSection.offsetHeight;

			// Only apply parallax when hero section is visible
			if (scrolled < heroHeight) {
				const rate = scrolled * -0.3; // Reduced rate for smoother effect
				heroImage.style.transform = `translate3d(0, ${rate}px, 0)`;
			}
		});
	}

	// Counter animation for badges
	const badges = document.querySelectorAll(".badge");
	badges.forEach((badge) => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
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
	document.addEventListener("mouseover", (e) => {
		if (
			e.target.classList.contains("product-image") &&
			e.target.dataset.hoverSrc
		) {
			const originalSrc = e.target.src;
			e.target.src = e.target.dataset.hoverSrc;

			e.target.addEventListener(
				"mouseleave",
				() => {
					e.target.src = originalSrc;
				},
				{ once: true }
			);
		}
	});

	// Size selection
	document.addEventListener("click", (e) => {
		if (e.target.classList.contains("size-option")) {
			const productCard = e.target.closest(".product-card");
			const sizeOptions = productCard.querySelectorAll(".size-option");

			sizeOptions.forEach((option) => option.classList.remove("active"));
			e.target.classList.add("active");
		}
	});

	// Product actions
	document.addEventListener("click", (e) => {
		if (e.target.closest(".product-action-btn")) {
			const btn = e.target.closest(".product-action-btn");
			const action = btn.dataset.action;
			const productId = btn.closest(".product-card").dataset.productId;

			handleProductAction(action, productId, btn);
		}
	});

	// Product card click navigation
	document.addEventListener("click", (e) => {
		// Handle product card clicks for navigation
		if (
			e.target.closest(".clickable-card") &&
			!e.target.closest(".product-action-btn")
		) {
			const card = e.target.closest(".clickable-card");
			const productUrl = card.dataset.productUrl;

			if (productUrl) {
				window.location.href = productUrl;
			}
		}

		// Handle original product action buttons (wishlist and quick view)
		if (e.target.closest(".product-action-btn")) {
			e.stopPropagation(); // Prevent card navigation

			const button = e.target.closest(".product-action-btn");
			const action = button.dataset.action;
			const productCard = button.closest(".product-card");
			const productId = productCard.dataset.productId;

			if (action === "wishlist") {
				// Handle wishlist functionality
				if (typeof addToWishlist === "function") {
					addToWishlist(productId, "toggle");
				} else {
					showNotification("Please login to add items to wishlist", "warning");
				}
			} else if (action === "quickview") {
				// Handle quick view functionality
				showQuickView(productId);
			}
		}
	});
}

// Handle product actions (wishlist, quickview)
function handleProductAction(action, productId, button) {
	const icon = button.querySelector("i");
	const productCard = button.closest(".product-card");

	switch (action) {
		case "wishlist":
			const productName =
				productCard.querySelector(".product-title").textContent;
			const priceElement = productCard.querySelector(".price-current");
			const productPrice = parseFloat(
				priceElement.textContent.replace(/[^\d.]/g, "")
			);
			const productImage = productCard.querySelector(".product-image").src;

			const isInWishlist = wishlistItems.some((item) => item.id === productId);

			if (isInWishlist) {
				removeFromWishlist(productId);
				icon.classList.remove("fas");
				icon.classList.add("far");
			} else {
				addToWishlist(productId, productName, productPrice, productImage);
				icon.classList.remove("far");
				icon.classList.add("fas");
			}
			break;

		case "quickview":
			showQuickView(productId);
			break;
	}
}

// Quick view functionality is handled by the showQuickView function above

// Show notification
function showNotification(message, type = "info") {
	const notification = document.createElement("div");
	notification.className = `notification notification-${type}`;
	notification.textContent = message;

	notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: var(--accent-${
					type === "success" ? "green" : type === "warning" ? "red" : "blue"
				});
        color: white;
        border-radius: 6px;
        z-index: 150000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.transform = "translateX(0)";
	}, 100);

	setTimeout(() => {
		notification.style.transform = "translateX(100%)";
		setTimeout(() => {
			document.body.removeChild(notification);
		}, 300);
	}, 3000);
}

// Update cart counter
function updateCartCount() {
	const cartIndicator = document.getElementById("cartIndicator");
	if (cartIndicator) {
		const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
		if (totalItems > 0) {
			cartIndicator.style.display = "block";
		} else {
			cartIndicator.style.display = "none";
		}
	}
}

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

// Show quick view modal
async function showQuickView(productId) {
	const modal = new bootstrap.Modal(document.getElementById("quickViewModal"));
	const loadingElement = document.getElementById("quickViewLoading");
	const productElement = document.getElementById("quickViewProduct");
	const errorElement = document.getElementById("quickViewError");

	// Set current product ID for the modal
	currentQuickViewProductId = productId;

	// Show loading state
	loadingElement.style.display = "block";
	productElement.style.display = "none";
	errorElement.style.display = "none";

	// Show modal
	modal.show();

	try {
		const response = await fetch(`/products/${productId}/quick-view/`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
		});

		const data = await response.json();

		if (data.success) {
			populateQuickViewModal(data.product);
			loadingElement.style.display = "none";
			productElement.style.display = "block";
		} else {
			throw new Error(data.error || "Failed to load product data");
		}
	} catch (error) {
		console.error("Error loading quick view:", error);
		loadingElement.style.display = "none";
		errorElement.style.display = "block";
	}
}

// Populate quick view modal with product data
function populateQuickViewModal(product) {
	// Set product title
	document.getElementById("quickViewTitle").textContent = product.name;

	// Set product price
	const priceContainer = document.getElementById("quickViewPrice");
	if (product.is_on_sale) {
		priceContainer.innerHTML = `
            <span class="price-original text-muted text-decoration-line-through me-2">
                LE ${product.price.toFixed(2)}
            </span>
            <span class="price-sale fw-bold text-danger">
                LE ${product.discounted_price.toFixed(2)}
            </span>
            <span class="badge bg-danger ms-2">-${
							product.discount_percentage
						}%</span>
        `;
	} else {
		priceContainer.innerHTML = `
            <span class="price fw-bold">LE ${product.price.toFixed(2)}</span>
        `;
	}

	// Set product description
	document.getElementById("quickViewDescription").innerHTML =
		product.description
			? `<p class="text-muted">${product.description}</p>`
			: "";

	// Set main image and thumbnails
	if (product.images && product.images.length > 0) {
		const mainImage = document.getElementById("quickViewMainImage");
		mainImage.src = product.images[0].url;
		mainImage.alt = product.images[0].alt;

		// Populate thumbnails
		const thumbnailContainer = document.getElementById("quickViewThumbnails");
		thumbnailContainer.innerHTML = "";

		product.images.forEach((image, index) => {
			const thumbnail = document.createElement("img");
			thumbnail.src = image.url;
			thumbnail.alt = image.alt;
			thumbnail.className = `quick-view-thumbnail ${
				index === 0 ? "active" : ""
			}`;
			thumbnailContainer.appendChild(thumbnail);
		});
	}

	// Set color variants
	if (product.color_variants && product.color_variants.length > 0) {
		const colorContainer = document.getElementById("quickViewColors");
		const colorOptions = document.getElementById("quickViewColorOptions");

		colorContainer.style.display = "block";
		colorOptions.innerHTML = "";

		product.color_variants.forEach((variant, index) => {
			const colorOption = document.createElement("div");
			colorOption.className = `color-option-quick ${
				index === 0 ? "active" : ""
			}`;
			colorOption.style.backgroundColor = variant.color_code || variant.color;
			colorOption.dataset.color = variant.color;
			colorOption.title = variant.color;
			colorOptions.appendChild(colorOption);
		});
	} else {
		document.getElementById("quickViewColors").style.display = "none";
	}

	// Set size options
	if (product.available_sizes && product.available_sizes.length > 0) {
		const sizeContainer = document.getElementById("quickViewSizes");
		const sizeOptions = document.getElementById("quickViewSizeOptions");

		sizeContainer.style.display = "block";
		sizeOptions.innerHTML = "";

		product.available_sizes.forEach((size, index) => {
			const sizeOption = document.createElement("div");
			sizeOption.className = `size-option-quick ${index === 0 ? "active" : ""}`;
			sizeOption.textContent = size;
			sizeOption.dataset.size = size;
			sizeOptions.appendChild(sizeOption);
		});
	} else {
		document.getElementById("quickViewSizes").style.display = "none";
	}

	// Set stock status
	const stockContainer = document.getElementById("quickViewStock");
	if (product.in_stock) {
		stockContainer.innerHTML = `
            <small class="text-success">
                <i class="fas fa-check-circle me-1"></i>In Stock (${product.total_stock} available)
            </small>
        `;
		document.getElementById("quickViewQuantity").style.display = "block";
		document.getElementById("quickViewAddToCart").disabled = false;
	} else {
		stockContainer.innerHTML = `
            <small class="text-danger">
                <i class="fas fa-times-circle me-1"></i>Out of Stock
            </small>
        `;
		document.getElementById("quickViewQuantity").style.display = "none";
		document.getElementById("quickViewAddToCart").disabled = true;
	}

	// Set full details link
	document.getElementById("quickViewFullDetails").href = product.product_url;
}

// Initialize sidebars
function initializeSidebars() {
	const customBackdrop = document.getElementById("customBackdrop");
	const offcanvasElements = ["#offcanvasWishlist", "#offcanvasCart"];

	// Function to show backdrop
	function showBackdrop() {
		customBackdrop.classList.add("show");
	}

	// Function to hide backdrop
	function hideBackdrop() {
		customBackdrop.classList.remove("show");
	}

	// Setup offcanvas event handlers
	offcanvasElements.forEach((selector) => {
		const element = document.querySelector(selector);
		if (element) {
			// Show backdrop when offcanvas is shown
			element.addEventListener("show.bs.offcanvas", showBackdrop);

			// Hide backdrop when offcanvas is hidden
			element.addEventListener("hidden.bs.offcanvas", hideBackdrop);
		}
	});

	// Handle backdrop clicks to close offcanvas
	customBackdrop.addEventListener("click", function () {
		// Find any open offcanvas and close it
		const openOffcanvas = document.querySelector(".offcanvas.show");
		if (openOffcanvas) {
			const bsOffcanvas = bootstrap.Offcanvas.getInstance(openOffcanvas);
			if (bsOffcanvas) {
				bsOffcanvas.hide();
			}
		}
	});
}

// Check authentication for cart access
function checkAuthForCart(event) {
	// Check if user is authenticated (this will be set by Django template)
	const isAuthenticated = document.body.dataset.userAuthenticated === "true";

	if (!isAuthenticated) {
		event.preventDefault();
		showAuthPrompt("cart");
		return false;
	}
	return true;
}

// Check authentication for wishlist access
function checkAuthForWishlist(event) {
	// Check if user is authenticated (this will be set by Django template)
	const isAuthenticated = document.body.dataset.userAuthenticated === "true";

	if (!isAuthenticated) {
		event.preventDefault();
		showAuthPrompt("wishlist");
		return false;
	}
	return true;
}

// Show authentication prompt with elegant modal
function showAuthPrompt(feature) {
	const featureName = feature === "cart" ? "shopping cart" : "wishlist";
	const icon = feature === "cart" ? "fa-shopping-cart" : "fa-heart";

	// Create custom modal
	const modal = document.createElement("div");
	modal.className = "auth-prompt-modal";
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
	const cancelBtn = modal.querySelector(".auth-prompt-cancel");
	const loginBtn = modal.querySelector(".auth-prompt-login");
	const overlay = modal.querySelector(".auth-prompt-overlay");

	function closeModal() {
		modal.style.opacity = "0";
		setTimeout(() => {
			document.body.removeChild(modal);
		}, 300);
	}

	cancelBtn.addEventListener("click", closeModal);
	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) closeModal();
	});

	loginBtn.addEventListener("click", () => {
		const currentUrl = encodeURIComponent(
			window.location.pathname + window.location.search
		);
		window.location.href = `/accounts/login/?next=${currentUrl}`;
	});

	// Animate in
	setTimeout(() => {
		modal.style.opacity = "1";
	}, 10);
}

// Initialize wishlist and cart
function initializeWishlistCart() {
	// Sync cart and wishlist from database
	syncCartFromDatabase();
	syncWishlistFromDatabase();
}

// Sync wishlist from database
async function syncWishlistFromDatabase() {
	try {
		const response = await fetch("/wishlist/get-wishlist/", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
		});

		if (response.ok) {
			const data = await response.json();
			if (data.success) {
				wishlistItems = data.wishlist_items || [];
				updateWishlistDisplay();
				updateWishlistCounter(data.wishlist_count);
				return data;
			}
		}
	} catch (error) {
		console.error("Error syncing wishlist from database:", error);
	}
	return null;
}

// Add to wishlist - Database-driven
async function addToWishlist(productId, action = "toggle") {
	try {
		const response = await fetch("/wishlist/add/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
			body: JSON.stringify({
				product_id: productId,
				action: action,
			}),
		});

		const data = await response.json();

		if (data.success) {
			// Sync wishlist from database to update UI
			await syncWishlistFromDatabase();
			showNotification(data.message, "success");
			return data;
		} else {
			if (data.error === "Authentication required") {
				showAuthPrompt("wishlist");
				return null;
			}
			showNotification(data.error || "Error updating wishlist", "error");
			return null;
		}
	} catch (error) {
		console.error("Error updating wishlist:", error);
		showNotification("Error updating wishlist", "error");
		return null;
	}
}

// Remove from wishlist - Database-driven
async function removeFromWishlist(itemId) {
	try {
		const response = await fetch("/wishlist/remove/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
			body: JSON.stringify({
				item_id: itemId,
			}),
		});

		const data = await response.json();

		if (data.success) {
			// Sync wishlist from database to update UI
			await syncWishlistFromDatabase();
			showNotification(data.message, "success");
			return data;
		} else {
			showNotification(data.error || "Error removing from wishlist", "error");
			return null;
		}
	} catch (error) {
		console.error("Error removing from wishlist:", error);
		showNotification("Error removing from wishlist", "error");
		return null;
	}
}

// Add to cart - Database-driven
async function addToCart(productId, color = null, size = "M", quantity = 1) {
	try {
		const response = await fetch("/cart/add/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
			body: JSON.stringify({
				product_id: productId,
				color: color,
				size: size,
				quantity: quantity,
			}),
		});

		const data = await response.json();

		if (data.success) {
			// Sync cart from database to update UI
			await syncCartFromDatabase();
			showNotification(data.message, "success");
			return data;
		} else {
			showNotification(data.error || "Error adding to cart", "error");
			return null;
		}
	} catch (error) {
		console.error("Error adding to cart:", error);
		showNotification("Error adding to cart", "error");
		return null;
	}
}

// Remove from cart - Database-driven
async function removeFromCart(itemId) {
	try {
		console.log("Removing item:", itemId); // Debug log
		const response = await fetch("/cart/remove/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
			body: JSON.stringify({
				item_id: itemId,
			}),
		});

		const data = await response.json();

		if (data.success) {
			// Remove the item from the DOM
			const cartItem = document.querySelector(
				`.cart-item[data-item-id="${itemId}"]`
			);
			if (cartItem) {
				cartItem.remove();
			}

			// Update cart count
			updateCartCount(data.cart_count);

			// Sync cart from database to update UI
			await syncCartFromDatabase();

			showNotification(data.message || "Item removed from cart", "success");
			return data;
		} else {
			showNotification(data.error || "Error removing item from cart", "error");
			return null;
		}
	} catch (error) {
		console.error("Error removing from cart:", error);
		showNotification("Error removing item from cart", "error");
		return null;
	}
}

// Update cart quantity - Database-driven
async function updateCartQuantity(itemId, newQuantity) {
	try {
		const response = await fetch("/cart/update-quantity/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
			body: JSON.stringify({
				item_id: itemId,
				quantity: newQuantity,
			}),
		});

		const data = await response.json();

		if (data.success) {
			// Sync cart from database to update UI
			await syncCartFromDatabase();
			showNotification(data.message, "success");
			return data;
		} else {
			showNotification(data.error || "Error updating cart quantity", "error");
			return null;
		}
	} catch (error) {
		console.error("Error updating cart quantity:", error);
		showNotification("Error updating cart quantity", "error");
		return null;
	}
}

// Update wishlist display
function updateWishlistDisplay() {
	const emptyWishlist = document.getElementById("emptyWishlist");
	const wishlistItems = document.getElementById("wishlistItems");

	if (!emptyWishlist || !wishlistItems) return;

	if (wishlistItems.length === 0) {
		emptyWishlist.style.display = "block";
		wishlistItems.style.display = "none";
	} else {
		emptyWishlist.style.display = "none";
		wishlistItems.style.display = "block";

		wishlistItems.innerHTML = wishlistItems
			.map(
				(item) => `
            <div class="wishlist-item" data-item-id="${item.id}">
                <img src="${item.product_image}" alt="${
					item.product_name
				}" class="wishlist-item-image">
                <div class="wishlist-item-info">
                    <div class="wishlist-item-title">${item.product_name}</div>
                    <div class="wishlist-item-price">LE ${item.product_price.toFixed(
											2
										)}</div>
                </div>
                <button class="wishlist-item-remove" onclick="removeFromWishlist('${
									item.id
								}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `
			)
			.join("");
	}
}

// Update wishlist counter
function updateWishlistCounter(count) {
	const wishlistIndicator = document.getElementById("wishlistIndicator");
	if (wishlistIndicator) {
		if (count > 0) {
			wishlistIndicator.style.display = "block";
		} else {
			wishlistIndicator.style.display = "none";
		}
	}
}

// Update cart display
function updateCartDisplay() {
	const emptyCart = document.getElementById("emptyCart");
	const cartItems_container = document.getElementById("cartItems");

	if (!emptyCart || !cartItems_container) return;

	if (!cartItems || cartItems.length === 0) {
		emptyCart.style.display = "block";
		cartItems_container.style.display = "none";
		return;
	}

	emptyCart.style.display = "none";
	cartItems_container.style.display = "block";

	cartItems_container.innerHTML = cartItems
		.map(
			(item) => `
        <div class="cart-item" data-item-id="${item.id}">
            <img src="${item.product_image}" alt="${
				item.product_name
			}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.product_name}</div>
                <div class="cart-item-variant">
                    ${item.color ? `Color: ${item.color}` : ""}
                    ${item.size ? `Size: ${item.size}` : ""}
                </div>
                <div class="cart-item-price">LE ${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn-small" onclick="updateCartQuantity('${
											item.id
										}', ${item.quantity - 1})" ${
				item.quantity <= 1 ? "disabled" : ""
			}>-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn-small" onclick="updateCartQuantity('${
											item.id
										}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${
							item.id
						}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
		)
		.join("");

	// Add cart summary
	const subtotal = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const freeShippingThreshold = 1000;
	const shippingCost = subtotal >= freeShippingThreshold ? 0 : 50;
	const total = subtotal + shippingCost;

	cartItems_container.innerHTML += `
        <div class="cart-footer mt-4">
            <div class="cart-total mb-3">
                <div class="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span class="fw-bold">LE ${subtotal.toFixed(2)}</span>
                </div>
                ${
									shippingCost > 0
										? `
                    <div class="d-flex justify-content-between">
                        <span>Shipping:</span>
                        <span class="fw-bold">LE ${shippingCost.toFixed(
													2
												)}</span>
                    </div>
                `
										: ""
								}
                <div class="d-flex justify-content-between">
                    <span>Total:</span>
                    <span class="fw-bold">LE ${total.toFixed(2)}</span>
                </div>
            </div>
            <div class="cart-actions">
                <button class="btn btn-outline-primary w-100 mb-2" onclick="viewCart()">View cart</button>
                <button class="btn btn-primary w-100" onclick="checkout()">Check out</button>
            </div>
        </div>
    `;
}

// Add to cart from wishlist
function addToCartFromWishlist(
	productId,
	productName,
	productPrice,
	productImage
) {
	addToCart(productId, productName, productPrice, productImage);
	removeFromWishlist(productId);
}

// View cart function
function viewCart() {
	window.location.href = "/cart/";
}

// Checkout function
function checkout() {
	if (cartItems.length === 0) {
		showNotification("Your cart is empty", "warning");
		return;
	}
	window.location.href = "/checkout/";
}
