# Frontend Performance Enhancements

This document provides an overview of the performance enhancements that have been made to the Shortcut Store frontend.

## 1. Summary

The goal of these enhancements was to improve the loading and rendering performance of the application without sacrificing the user experience.

## 2. Image Optimization

- **Lazy Loading:** Images on the product detail page are now lazy-loaded, which means that they are only loaded when they are about to enter the viewport. This reduces the initial page load time and saves bandwidth.
- **Responsive Images:** The application now uses the `<picture>` element to serve responsive images. This allows the browser to select the most appropriate image size based on the user's screen resolution, which further reduces page load times.
- **Modern Image Formats:** The application now serves images in modern formats like WebP, which provide better compression than traditional formats like JPEG and PNG.

## 3. Bundle Size Analysis

- **`rollup-plugin-visualizer`:** This plugin has been added to the Vite configuration to help analyze the frontend bundle size. This allows us to identify large dependencies and opportunities for code splitting.

## 4. How to Use

- To view the bundle size analysis, run `npm run build` in the `frontend` directory and open the `stats.html` file in your browser.
