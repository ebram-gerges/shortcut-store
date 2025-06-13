# Shortcut Store Website

A complete e-commerce website for Shortcut Store built with Bootstrap, custom CSS, and JavaScript animations.

## 🎨 Color Customization

All colors are defined as CSS custom properties in `/static/css/dxlr-clone.css` at the top of the file. You can easily change the entire color scheme by modifying these variables:

### Primary Colors

```css
:root {
	--primary-black: #000000; /* Main black color */
	--primary-white: #ffffff; /* Main white color */
	--primary-grey: #f8f9fa; /* Light grey backgrounds */
	--dark-grey: #6c757d; /* Medium grey */
	--light-grey: #e9ecef; /* Very light grey */
}
```

### Accent Colors

```css
:root {
	--accent-red: #dc3545; /* Sale badges, alerts */
	--accent-blue: #0d6efd; /* Links, buttons */
	--accent-green: #198754; /* Success messages */
}
```

### Text Colors

```css
:root {
	--text-primary: #212529; /* Main text color */
	--text-secondary: #6c757d; /* Secondary text */
	--text-muted: #adb5bd; /* Muted text */
}
```

### Background Colors

```css
:root {
	--bg-primary: #ffffff; /* Main background */
	--bg-secondary: #f8f9fa; /* Section backgrounds */
	--bg-dark: #212529; /* Footer background */
}
```

## 🚀 Features

### ✅ Responsive Design

- Mobile-first approach
- Bootstrap 5 grid system
- Custom breakpoints for optimal viewing

### ✅ Animations & Interactions

- Smooth scroll effects
- Fade-in animations on scroll
- Product hover effects
- Image swap on hover
- Loading animations
- Notification system

### ✅ Product Features

- Product grid with dynamic loading
- Size selection
- Add to wishlist
- Quick add to cart
- Sale badges and pricing
- Product image hover effects

### ✅ Navigation

- Sticky navigation with scroll effects
- Dropdown menus
- Mobile-responsive hamburger menu
- Search, account, wishlist, and cart icons

### ✅ Sections Included

- Top promotional banner
- Hero section with call-to-action
- Category showcase
- Product grid
- About section
- Footer with newsletter signup
- Social media links

## 📁 File Structure

```
templates/dxlr_clone/
├── index.html              # Main template

static/css/
├── dxlr-clone.css          # Main stylesheet with custom properties

static/js/
├── dxlr-clone.js           # JavaScript for animations and interactions

static/images/              # Image assets (you'll need to add these)
├── dxlr-logo.png
├── hero-image.jpg
├── tshirts-category.jpg
├── bottoms-category.jpg
├── sets-category.jpg
└── products/               # Product images
```

## 🛠️ Setup Instructions

1. **Add the URL pattern** (already done):

   ```python
   # In landing/urls.py
   path('dxlr/', views.dxlr_clone, name='dxlr_clone'),
   ```

2. **Add images**: Place your images in the `static/images/` directory

   - Logo: `dxlr-logo.png`
   - Hero image: `hero-image.jpg`
   - Category images: `tshirts-category.jpg`, `bottoms-category.jpg`, `sets-category.jpg`
   - Product images in `products/` folder

3. **Access the clone**: Visit `/dxlr/` in your browser

## 🎯 Customization Examples

### Change Primary Color Scheme

```css
:root {
	--primary-black: #1a1a1a; /* Softer black */
	--accent-blue: #007bff; /* Different blue */
	--accent-red: #e74c3c; /* Different red */
}
```

### Dark Theme Example

```css
:root {
	--bg-primary: #1a1a1a;
	--bg-secondary: #2d2d2d;
	--text-primary: #ffffff;
	--text-secondary: #cccccc;
	--primary-black: #ffffff;
	--primary-white: #1a1a1a;
}
```

### Brand Color Example (Purple Theme)

```css
:root {
	--accent-blue: #6f42c1; /* Purple primary */
	--accent-red: #e83e8c; /* Pink accent */
	--text-primary: #2d1b69; /* Dark purple text */
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: 768px - 992px
- **Large Desktop**: > 992px

## 🔧 JavaScript Features

- **Intersection Observer**: For scroll animations
- **Product Interactions**: Size selection, wishlist, cart
- **Smooth Scrolling**: For navigation links
- **Dynamic Content**: Product grid generation
- **Notifications**: Toast-style messages
- **Image Hover**: Product image swapping

## 📝 Notes

- All animations use CSS transitions for smooth performance
- Images are optimized for web with proper aspect ratios
- The design follows modern web standards
- Accessibility features included (ARIA labels, semantic HTML)
- SEO-friendly structure

## 🎨 Quick Color Change Guide

To quickly change the entire site's color scheme:

1. Open `/static/css/dxlr-clone.css`
2. Find the `:root` section at the top
3. Modify the color values
4. Save and refresh your browser

The entire site will automatically update with your new colors!
