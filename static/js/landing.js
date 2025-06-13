// Custom JS for landing page
// Custom backdrop management and card animations

window.addEventListener('DOMContentLoaded', function() {
  const customBackdrop = document.getElementById('customBackdrop');
  const offcanvasElements = ['#offcanvasFilters', '#offcanvasWishlist', '#offcanvasCart'];

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

  // Card animations (including hero card) - using CSS classes for smooth transitions
  document.querySelectorAll('.card, .hero-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('card-hover');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('card-hover');
    });
  });
});
