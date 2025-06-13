// Product Detail Page JavaScript
// Handles image gallery, quantity controls, and add to cart functionality

document.addEventListener("DOMContentLoaded", function () {
	initializeProductDetail();
});

function initializeProductDetail() {
	initializeImageGallery();
	initializeQuantityControls();
	initializeAddToCart();
	initializeSizeSelection();
	initializeColorSelection();
	initializeStockChecking();
	initializeWishlistButton();
	initializeAskQuestion();
	setDefaultSelections();
}

// Set default color and size selections
function setDefaultSelections() {
	// Set default color (first available color)
	const firstColorOption = document.querySelector(".color-option");
	if (firstColorOption && !document.querySelector(".color-option.active")) {
		firstColorOption.click();
	}

	// Set default size (smallest available size)
	const sizeInputs = document.querySelectorAll('input[name="size"]');
	if (
		sizeInputs.length > 0 &&
		!document.querySelector('input[name="size"]:checked')
	) {
		// Find the smallest size (assuming they're ordered S, M, L, XL)
		const sizeOrder = ["S", "M", "L", "XL", "XXL"];
		let defaultSize = null;

		for (const size of sizeOrder) {
			const sizeInput = document.querySelector(
				`input[name="size"][value="${size}"]`
			);
			if (sizeInput) {
				defaultSize = sizeInput;
				break;
			}
		}

		// If no standard size found, use the first available
		if (!defaultSize && sizeInputs.length > 0) {
			defaultSize = sizeInputs[0];
		}

		if (defaultSize) {
			defaultSize.checked = true;
			defaultSize.dispatchEvent(new Event("change"));
		}
	}

	// Update add to cart button with initial price
	setTimeout(() => {
		updateCartButtonPrice();
	}, 100);
}

// Initialize image gallery functionality
function initializeImageGallery() {
	const thumbnails = document.querySelectorAll(".thumbnail-image");
	const mainImage = document.getElementById("mainProductImage");

	if (thumbnails.length > 0 && mainImage) {
		thumbnails.forEach((thumbnail) => {
			thumbnail.addEventListener("click", function () {
				// Remove active class from all thumbnails
				thumbnails.forEach((thumb) => thumb.classList.remove("active"));

				// Add active class to clicked thumbnail
				this.classList.add("active");

				// Update main image
				const newSrc = this.dataset.mainSrc;
				if (newSrc) {
					mainImage.src = newSrc;

					// Add fade effect
					mainImage.style.opacity = "0.5";
					setTimeout(() => {
						mainImage.style.opacity = "1";
					}, 150);
				}
			});
		});
	}

	// Add zoom functionality to main image
	if (mainImage) {
		mainImage.addEventListener("click", function () {
			openImageZoom(this.src);
		});
	}
}

// Initialize quantity controls
function initializeQuantityControls() {
	const quantityInput = document.getElementById("quantity");
	const decreaseBtn = document.getElementById("decreaseQty");
	const increaseBtn = document.getElementById("increaseQty");

	if (quantityInput && decreaseBtn && increaseBtn) {
		decreaseBtn.addEventListener("click", function () {
			let currentValue = parseInt(quantityInput.value);
			if (currentValue > 1) {
				quantityInput.value = currentValue - 1;
				updateQuantityButtons();
				updateCartButtonPrice();
			}
		});

		increaseBtn.addEventListener("click", function () {
			let currentValue = parseInt(quantityInput.value);
			const maxValue = parseInt(quantityInput.max) || 10;
			if (currentValue < maxValue) {
				quantityInput.value = currentValue + 1;
				updateQuantityButtons();
				updateCartButtonPrice();
			}
		});

		quantityInput.addEventListener("input", function () {
			const value = parseInt(this.value);
			const min = parseInt(this.min) || 1;
			const max = parseInt(this.max) || 10;

			if (value < min) {
				this.value = min;
			} else if (value > max) {
				this.value = max;
			}

			updateQuantityButtons();
			updateCartButtonPrice();
		});

		// Also trigger on change event for better compatibility
		quantityInput.addEventListener("change", function () {
			updateQuantityButtons();
			updateCartButtonPrice();
		});
	}

	// Initialize button states
	updateQuantityButtons();
}

// Update cart button price based on quantity
function updateCartButtonPrice() {
	const quantityInput = document.getElementById("quantity");
	const addToCartText = document.getElementById("addToCartText");

	// Try multiple selectors for price element
	let priceElement =
		document.querySelector(".price-current-detail") ||
		document.querySelector(".price-current") ||
		document.querySelector(".product-price") ||
		document.querySelector('[class*="price"]');

	if (quantityInput && addToCartText && priceElement) {
		const quantity = parseInt(quantityInput.value) || 1;
		const priceText = priceElement.textContent || priceElement.innerText || "";

		// Extract price from text (handles both "LE 100" and "100 EGP" formats)
		const priceMatch = priceText.match(/[\d,]+\.?\d*/);
		if (priceMatch) {
			const price = parseFloat(priceMatch[0].replace(/,/g, ""));

			if (!isNaN(price) && price > 0) {
				const totalPrice = (price * quantity).toFixed(2);

				// Format the total price with proper currency display
				const formattedTotal = parseFloat(totalPrice).toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});

				// Update button text with simplified total price format
				addToCartText.textContent = `Add to Cart - ${formattedTotal} EGP`;
			} else {
				// Fallback if price parsing fails
				addToCartText.textContent = "Add to Cart";
			}
		} else {
			// Fallback if no price found
			addToCartText.textContent = "Add to Cart";
		}
	}
}

// Initialize add to cart functionality
function initializeAddToCart() {
	const addToCartBtn = document.getElementById("addToCartBtn");

	if (addToCartBtn) {
		addToCartBtn.addEventListener("click", function () {
			const selectedSize = document.querySelector('input[name="size"]:checked');

			if (!selectedSize) {
				showNotification("Please select a size", "warning");
				highlightSizeSelection();
				return;
			}

			const quantity = document.getElementById("quantity").value;
			const productId = getProductIdFromUrl();

			addToCart(productId, selectedSize.value, quantity);
		});
	}
}

// Initialize size selection
function initializeSizeSelection() {
	const sizeInputs = document.querySelectorAll('input[name="size"]');

	sizeInputs.forEach((input) => {
		input.addEventListener("change", function () {
			// Remove any previous error highlighting
			const sizeSelection = document.querySelector(".size-selection");
			if (sizeSelection) {
				sizeSelection.classList.remove("error-highlight");
			}

			// Check stock status when size changes
			checkStockStatus();
		});
	});
}

// Initialize color selection
function initializeColorSelection() {
	const colorOptions = document.querySelectorAll(".color-option");

	// Ensure at least one color is selected
	const activeColor = document.querySelector(".color-option.active");
	if (!activeColor && colorOptions.length > 0) {
		// If no color is active, select the first one
		colorOptions[0].classList.add("active");
		const selectedColorName = document.getElementById("selectedColorName");
		if (selectedColorName) {
			selectedColorName.textContent = colorOptions[0].dataset.color;
		}
	}

	colorOptions.forEach((option) => {
		option.addEventListener("click", function () {
			const selectedColor = this.dataset.color;

			// Update active state
			colorOptions.forEach((opt) => opt.classList.remove("active"));
			this.classList.add("active");

			// Update selected color name
			const selectedColorName = document.getElementById("selectedColorName");
			if (selectedColorName) {
				selectedColorName.textContent = selectedColor;
			}

			// Update URL to reflect color selection without creating history entry
			const url = new URL(window.location);
			url.searchParams.set("color", selectedColor);
			window.history.replaceState({}, "", url);

			// Load images for selected color variant
			loadColorVariantImages(selectedColor);

			// Check stock status when color changes
			checkStockStatus();
		});
	});
}

// Load images for selected color variant
function loadColorVariantImages(color) {
	const productId = getProductIdFromUrl();
	const mainImage = document.getElementById("mainProductImage");
	const thumbnailContainer = document.getElementById("thumbnailContainer");

	// Show loading state
	if (mainImage) {
		mainImage.style.opacity = "0.5";
	}

	// Make AJAX request to get color variant images
	fetch(`/products/${productId}/color/${color}/`)
		.then((response) => response.json())
		.then((data) => {
			if (data.error) {
				console.error("Error loading color variant:", data.error);
				return;
			}

			// Update main image
			if (data.images && data.images.length > 0) {
				const primaryImage =
					data.images.find((img) => img.is_primary) || data.images[0];
				mainImage.src = primaryImage.url;
				mainImage.alt = primaryImage.alt_text;
			}

			// Update thumbnail images
			if (thumbnailContainer && data.images) {
				thumbnailContainer.innerHTML = "";
				data.images.forEach((image, index) => {
					const col = document.createElement("div");
					col.className = "col-3";

					const img = document.createElement("img");
					img.src = image.url;
					img.alt = image.alt_text;
					img.className = `thumbnail-image ${index === 0 ? "active" : ""}`;
					img.dataset.mainSrc = image.url;

					col.appendChild(img);
					thumbnailContainer.appendChild(col);
				});

				// Re-initialize thumbnail click handlers
				initializeImageGallery();
			}

			// Restore main image opacity
			mainImage.style.opacity = "1";
		})
		.catch((error) => {
			console.error("Error loading color variant images:", error);
			// Restore main image opacity
			if (mainImage) {
				mainImage.style.opacity = "1";
			}
		});
}

// Initialize ask question modal
function initializeAskQuestion() {
	const sendQuestionBtn = document.getElementById("sendQuestionBtn");
	const askQuestionForm = document.getElementById("askQuestionForm");

	if (sendQuestionBtn && askQuestionForm) {
		sendQuestionBtn.addEventListener("click", function () {
			const formData = new FormData(askQuestionForm);
			const name = document.getElementById("questionName").value;
			const email = document.getElementById("questionEmail").value;
			const message = document.getElementById("questionMessage").value;

			if (!name || !email) {
				showNotification("Please fill in required fields", "warning");
				return;
			}

			// Simulate sending question
			sendQuestionBtn.innerHTML = '<span class="loading"></span> Sending...';
			sendQuestionBtn.disabled = true;

			setTimeout(() => {
				showNotification("Question sent successfully!", "success");
				askQuestionForm.reset();

				// Close modal
				const modal = bootstrap.Modal.getInstance(
					document.getElementById("askQuestionModal")
				);
				modal.hide();

				// Reset button
				sendQuestionBtn.textContent = "Send";
				sendQuestionBtn.disabled = false;
			}, 1500);
		});
	}
}

// Initialize stock checking
function initializeStockChecking() {
	const colorOptions = document.querySelectorAll(".color-option");
	const sizeInputs = document.querySelectorAll('input[name="size"]');

	// Add event listeners for color and size changes
	colorOptions.forEach((option) => {
		option.addEventListener("click", checkStockStatus);
	});

	sizeInputs.forEach((input) => {
		input.addEventListener("change", checkStockStatus);
	});
}

// Check stock status for selected color and size
function checkStockStatus() {
	const selectedColor = document.querySelector(".color-option.active")?.dataset
		.color;
	const selectedSize = document.querySelector(
		'input[name="size"]:checked'
	)?.value;

	if (!selectedColor || !selectedSize) {
		updateStockDisplay(
			"Select color and size to check availability",
			"",
			false
		);
		return;
	}

	const productId = getProductIdFromUrl();

	// Show loading state
	updateStockDisplay("Checking availability...", "", false);

	// Make AJAX request to check stock
	fetch(`/products/${productId}/stock/${selectedColor}/${selectedSize}/`)
		.then((response) => response.json())
		.then((data) => {
			if (data.error) {
				updateStockDisplay("Error checking stock", "out-of-stock", false);
				return;
			}

			updateStockDisplay(
				data.stock_display,
				data.stock_status,
				data.can_add_to_cart
			);
			updateQuantityLimits(data.max_quantity || 1);
		})
		.catch((error) => {
			console.error("Error checking stock:", error);
			updateStockDisplay("Error checking stock", "out-of-stock", false);
		});
}

// Update stock display
function updateStockDisplay(text, status, canAddToCart) {
	const stockText = document.getElementById("stockText");
	const stockBadge = document.getElementById("stockBadge");
	const addToCartBtn = document.getElementById("addToCartBtn");
	const addToCartText = document.getElementById("addToCartText");

	if (stockText) {
		stockText.textContent = text;
	}

	if (stockBadge) {
		stockBadge.className = `stock-badge ${status}`;
		stockBadge.textContent = status
			? status.replace("_", " ").toUpperCase()
			: "";
	}

	if (addToCartBtn && addToCartText) {
		addToCartBtn.disabled = !canAddToCart;
		if (canAddToCart) {
			updateCartButtonPrice();
		} else {
			addToCartText.textContent =
				status === "out_of_stock" ? "Out of Stock" : "Select Color & Size";
		}
	}
}

// Update quantity limits based on stock
function updateQuantityLimits(maxQuantity) {
	const quantityInput = document.getElementById("quantity");
	const increaseBtn = document.getElementById("increaseQty");
	const decreaseBtn = document.getElementById("decreaseQty");

	if (quantityInput) {
		quantityInput.max = maxQuantity;
		if (parseInt(quantityInput.value) > maxQuantity) {
			quantityInput.value = maxQuantity;
		}
	}

	updateQuantityButtons();
}

// Update quantity button states
function updateQuantityButtons() {
	const quantityInput = document.getElementById("quantity");
	const increaseBtn = document.getElementById("increaseQty");
	const decreaseBtn = document.getElementById("decreaseQty");

	if (!quantityInput || !increaseBtn || !decreaseBtn) return;

	const currentValue = parseInt(quantityInput.value);
	const maxValue = parseInt(quantityInput.max);
	const minValue = parseInt(quantityInput.min);

	decreaseBtn.disabled = currentValue <= minValue;
	increaseBtn.disabled = currentValue >= maxValue;
}

// Initialize wishlist button
function initializeWishlistButton() {
	const wishlistBtn = document.getElementById("addToWishlistBtn");

	if (wishlistBtn) {
		// Check if product is already in wishlist
		const productId = getProductIdFromUrl();
		checkWishlistStatus(productId);

		wishlistBtn.addEventListener("click", function () {
			toggleWishlist(productId);
		});
	}
}

// Check if product is in wishlist
function checkWishlistStatus(productId) {
	// This would typically check localStorage or make an API call
	const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
	const isInWishlist = wishlist.includes(productId);
	updateWishlistButton(isInWishlist);
}

// Update wishlist button appearance
function updateWishlistButton(isInWishlist) {
	const wishlistIcon = document.getElementById("wishlistIcon");
	const wishlistBtn = document.getElementById("addToWishlistBtn");

	if (wishlistIcon && wishlistBtn) {
		if (isInWishlist) {
			wishlistIcon.className = "fas fa-heart me-2";
			wishlistBtn.classList.add("in-wishlist");
		} else {
			wishlistIcon.className = "far fa-heart me-2";
			wishlistBtn.classList.remove("in-wishlist");
		}
	}
}

// Toggle wishlist
function toggleWishlist(productId) {
	fetch("/wishlist/add/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": getCsrfToken(),
		},
		body: JSON.stringify({
			product_id: productId,
			action: "toggle",
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				updateWishlistButton(data.in_wishlist);
				updateWishlistCounter(data.wishlist_count);
				showNotification(data.message, "success");
			} else {
				if (data.error === "Authentication required") {
					showAuthPrompt("wishlist");
				} else {
					showNotification(data.error || "Error updating wishlist", "error");
				}
			}
		})
		.catch((error) => {
			console.error("Error updating wishlist:", error);
			showNotification("Error updating wishlist", "error");
		});
}

// Add to cart - Database-driven
async function addToCart(productId) {
	try {
		// Get selected color and size
		const selectedColorOption = document.querySelector(".color-option.active");
		const selectedColor = selectedColorOption
			? selectedColorOption.dataset.color
			: null;
		const selectedSizeInput = document.querySelector(
			'input[name="size"]:checked'
		);
		const selectedSize = selectedSizeInput ? selectedSizeInput.value : null;
		const quantity = parseInt(document.getElementById("quantity").value) || 1;

		// Debug logging
		console.log("Add to cart debug:", {
			productId,
			selectedColor,
			selectedSize,
			quantity,
			colorOptions: Array.from(document.querySelectorAll(".color-option")).map(
				(opt) => ({
					color: opt.dataset.color,
					isActive: opt.classList.contains("active"),
				})
			),
			sizeInputs: Array.from(
				document.querySelectorAll('input[name="size"]')
			).map((input) => ({
				value: input.value,
				isChecked: input.checked,
			})),
		});

		if (!selectedColor) {
			showNotification("Please select a color", "error");
			return;
		}

		if (!selectedSize) {
			showNotification("Please select a size", "error");
			return;
		}

		const requestData = {
			product_id: productId,
			color: selectedColor,
			size: selectedSize,
			quantity: quantity,
		};

		console.log("Sending request with data:", requestData);

		const response = await fetch("/cart/add/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCsrfToken(),
			},
			body: JSON.stringify(requestData),
		});

		console.log("Response status:", response.status);
		const data = await response.json();
		console.log("Response data:", data);

		if (data.success) {
			showNotification(data.message, "success");
			updateCartCount(data.cart_count);
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

// Get CSRF token
function getCsrfToken() {
	// First try to get from meta tag
	const metaToken = document
		.querySelector('meta[name="csrf-token"]')
		?.getAttribute("content");
	if (metaToken) return metaToken;

	// Fallback to form token
	const formToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;
	if (formToken) return formToken;

	// Fallback to cookie (if using cookie-based CSRF)
	const cookieToken = getCookie("csrftoken");
	if (cookieToken) return cookieToken;

	return "";
}

// Get cookie value by name
function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== "") {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === name + "=") {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

// Highlight size selection when not selected
function highlightSizeSelection() {
	const sizeSelection = document.querySelector(".size-selection");
	sizeSelection.classList.add("error-highlight");

	// Add CSS for error highlighting
	if (!document.querySelector("#size-error-style")) {
		const style = document.createElement("style");
		style.id = "size-error-style";
		style.textContent = `
            .error-highlight {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .error-highlight .form-label {
                color: var(--accent-red) !important;
            }
        `;
		document.head.appendChild(style);
	}

	setTimeout(() => {
		sizeSelection.classList.remove("error-highlight");
	}, 500);
}

// Get product ID from URL
function getProductIdFromUrl() {
	const pathParts = window.location.pathname.split("/");
	return pathParts[pathParts.length - 2]; // Assuming URL is /products/123/
}

// Open image zoom modal
function openImageZoom(imageSrc) {
	// Create zoom modal if it doesn't exist
	let zoomModal = document.getElementById("imageZoomModal");
	if (!zoomModal) {
		zoomModal = document.createElement("div");
		zoomModal.id = "imageZoomModal";
		zoomModal.className = "modal fade";
		zoomModal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <img src="" alt="Product Image" class="img-fluid w-100" id="zoomImage">
                    </div>
                </div>
            </div>
        `;
		document.body.appendChild(zoomModal);
	}

	// Update image source and show modal
	const zoomImage = document.getElementById("zoomImage");
	zoomImage.src = imageSrc;

	const modal = new bootstrap.Modal(zoomModal);
	modal.show();
}

// Update cart indicator
function updateCartCounter(newCount) {
	const cartIndicator = document.getElementById("cartIndicator");
	if (cartIndicator) {
		if (newCount > 0) {
			cartIndicator.style.display = "block";
		} else {
			cartIndicator.style.display = "none";
		}
	}
}

// Update wishlist indicator
function updateWishlistCounter(newCount) {
	const wishlistIndicator = document.getElementById("wishlistIndicator");
	if (wishlistIndicator) {
		if (newCount > 0) {
			wishlistIndicator.style.display = "block";
		} else {
			wishlistIndicator.style.display = "none";
		}
	}
}

// Show notification (reuse from main script)
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
			if (document.body.contains(notification)) {
				document.body.removeChild(notification);
			}
		}, 300);
	}, 3000);
}
