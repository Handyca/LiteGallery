# LiteGallery

A lightweight, feature-rich image carousel library for modern web applications.

## Features

- **Fullscreen Viewing**: Immersive fullscreen mode with light theme for better image viewing experience
  - Double-click to toggle fullscreen
- **Image Zoom**: Smooth zoom functionality with multiple options:
  - Click to automatically zoom in at cursor position with progressive zoom levels (2x → 3x → reset)
  - Step-by-step zoom with visual indicators in fullscreen mode
  - Mouse wheel for gradual zoom adjustment
  - Touch gestures on mobile with matching zoom behavior
- **Image Rotation**: Rotate images 90/180/270 degrees with smooth transitions
- **Thumbnails**: Easily navigate through gallery images with thumbnail previews
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Navigation**: Use arrow keys, plus/minus for zoom, 'r' for rotate
- **Touch Support**: Swipe, pinch-to-zoom and drag gestures on mobile
- **Autoplay Option**: Automatic slideshow functionality
- **UI Enhancements**:
  - Intuitive zoom-in cursor on hover
  - Transform display showing current zoom level and rotation
  - Centered thumbnail alignment
  - Prominent, accessible controls
- **Maintainable Code**: Clean, modular architecture for easy extension
- **No Dependencies**: Zero external dependencies, pure JavaScript

## Quick Start

1. Include the CSS and JavaScript files in your HTML:

```html
<link rel="stylesheet" href="css/lite-gallery.css">
<script src="js/lite-gallery.js"></script>
```

2. Create your gallery HTML structure:

```html
<div id="my-gallery" class="lite-gallery">
    <div class="gallery-images">
        <img src="path/to/image1.jpg" alt="Description 1">
        <img src="path/to/image2.jpg" alt="Description 2">
        <img src="path/to/image3.jpg" alt="Description 3">
    </div>
</div>
```

3. Initialize the gallery:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const gallery = new LiteGallery('#my-gallery', {
        thumbnails: true,
        fullscreen: true,
        zoom: true,
        rotate: true,
        autoplay: false,
        zoomLevels: [1, 1.5, 2, 3] // Custom zoom levels
    });
});
```

## Installation

### Method 1: Direct Download
1. Download the files from the repository
2. Include `lite-gallery.css` and `lite-gallery.js` in your project
3. Follow the Quick Start guide above

### Method 2: Using CDN (Coming soon)
```html
<link rel="stylesheet" href="https://cdn.example.com/lite-gallery/1.0/lite-gallery.min.css">
<script src="https://cdn.example.com/lite-gallery/1.0/lite-gallery.min.js"></script>
```

## Complete Usage Guide

### Basic Initialization

Initialize LiteGallery with default options:

```javascript
const gallery = new LiteGallery('#gallery-container');
```

### All Configuration Options

```javascript
const gallery = new LiteGallery('#gallery-container', {
    thumbnails: true,      // Show thumbnail navigation
    fullscreen: true,      // Enable fullscreen mode
    zoom: true,            // Enable zoom functionality
    rotate: true,          // Enable rotation functionality
    autoplay: false,       // Enable automatic slideshow
    autoplaySpeed: 3000,   // Slideshow speed in milliseconds
    zoomLevels: [1, 1.5, 2, 3] // Custom zoom level steps
});
```

### HTML Structure

The simplest HTML structure required:

```html
<div id="gallery-container" class="lite-gallery">
    <div class="gallery-images">
        <img src="image1.jpg" alt="Image 1">
        <img src="image2.jpg" alt="Image 2">
        <!-- Add more images as needed -->
    </div>
</div>
```

### API Methods

LiteGallery provides several methods you can use to control the gallery programmatically:

```javascript
// Initialize the gallery
const gallery = new LiteGallery('#gallery-container');

// Navigation methods
gallery.showImage(2);   // Show the third image (zero-based index)
gallery.nextImage();    // Show the next image
gallery.prevImage();    // Show the previous image

// Zoom methods
gallery.zoom(0.1);      // Zoom in by 0.1
gallery.zoom(-0.1);     // Zoom out by 0.1
gallery.resetZoom();    // Reset zoom to original size

// Rotation methods
gallery.rotate(90);     // Rotate by 90 degrees clockwise
gallery.resetRotation(); // Reset rotation to 0 degrees

// Fullscreen methods
gallery.toggleFullscreen(); // Toggle fullscreen mode
gallery.exitFullscreen();   // Exit fullscreen mode

// Autoplay methods
gallery.startAutoplay(); // Start slideshow
gallery.stopAutoplay();  // Stop slideshow
gallery.toggleAutoplay(); // Toggle slideshow
```

## UI Features

- **Light Theme** - Clean, modern white background for better focus on images
- **Transform Info** - Visual indicators showing current zoom level and rotation degree
- **Improved Controls** - Easily accessible buttons for navigation and image manipulation
- **Responsive Thumbnails** - Centered, well-aligned thumbnail gallery
- **Intuitive Interactions**:
  - Single click to zoom in/out at cursor position
  - Double click to toggle fullscreen
  - Scroll wheel for gradual zoom adjustment
  - Smooth rotation with visual indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Keyboard & Touch Controls

### Keyboard Shortcuts

| Key                | Action                       |
|--------------------|------------------------------|
| `←` or `↑`         | Previous image               |
| `→` or `↓`         | Next image                   |
| `+` or `=`         | Zoom in                      |
| `-`                | Zoom out                     |
| `0`                | Reset zoom                    |
| `r`                | Rotate 90° clockwise          |
| `Esc`              | Exit fullscreen or reset zoom |
| `Space`            | Toggle autoplay              |
| `f`                | Toggle fullscreen            |

### Touch Gestures

| Gesture            | Action                       |
|--------------------|------------------------------|
| Tap                | Enter fullscreen (normal mode)<br>Zoom in/out (fullscreen mode) |
| Swipe left/right   | Next/previous image          |
| Pinch              | Zoom in/out                  |
| Double tap         | Reset zoom when zoomed in    |
| Touch and drag     | Move zoomed image            |

## Advanced Usage Examples

### Example 1: Gallery with Custom Zoom Levels

```javascript
const customZoomGallery = new LiteGallery('#custom-gallery', {
    zoomLevels: [1, 1.25, 1.75, 2.5, 4], // Custom zoom level progression
    zoom: true,
    thumbnails: true
});
```

### Example 2: Slideshow Gallery

```javascript
const slideshowGallery = new LiteGallery('#slideshow-gallery', {
    autoplay: true,
    autoplaySpeed: 5000, // 5 seconds per slide
    thumbnails: false,   // Hide thumbnails for cleaner slideshow
    fullscreen: true
});

// Stop slideshow on user interaction
document.querySelector('#stop-slideshow').addEventListener('click', function() {
    slideshowGallery.stopAutoplay();
});
```

### Example 3: Programmatic Control

```javascript
const controlledGallery = new LiteGallery('#controlled-gallery');

// Custom navigation buttons
document.querySelector('#next-btn').addEventListener('click', function() {
    controlledGallery.nextImage();
});

document.querySelector('#prev-btn').addEventListener('click', function() {
    controlledGallery.prevImage();
});

// Jump to specific image
document.querySelector('#jump-to-3').addEventListener('click', function() {
    controlledGallery.showImage(2); // Show the third image (zero-based index)
});

// Toggle fullscreen
document.querySelector('#fullscreen-toggle').addEventListener('click', function() {
    controlledGallery.toggleFullscreen();
});
```

### Example 4: Dynamically Adding Images

```javascript
const dynamicGallery = new LiteGallery('#dynamic-gallery');

// Function to add a new image to the gallery
function addImageToGallery(src, alt) {
    // Get the container
    const container = document.querySelector('#dynamic-gallery');
    
    // Get or create the gallery-images div
    let imagesDiv = container.querySelector('.gallery-images');
    if (!imagesDiv) {
        imagesDiv = document.createElement('div');
        imagesDiv.className = 'gallery-images';
        container.appendChild(imagesDiv);
    }
    
    // Create and add the new image
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || 'Gallery image';
    imagesDiv.appendChild(img);
    
    // Reinitialize the gallery
    dynamicGallery.destroy(); // Assuming a destroy method exists
    dynamicGallery = new LiteGallery('#dynamic-gallery');
}

// Example usage
document.querySelector('#add-image-btn').addEventListener('click', function() {
    addImageToGallery('path/to/new-image.jpg', 'New image description');
});
```

## Browser Compatibility

LiteGallery works on all modern browsers:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 16+
- iOS Safari 12+
- Android Browser 76+

## Troubleshooting

### Common Issues

1. **Gallery doesn't initialize**
   - Check for JavaScript errors in the console
   - Ensure your selector matches an existing element
   - Verify the HTML structure follows the required format

2. **Images don't load**
   - Check image paths are correct
   - Verify images exist and are accessible
   - Check for CORS issues if images are from different domains

3. **Zooming doesn't work**
   - Ensure the `zoom: true` option is set
   - Check if you're in fullscreen mode (zoom on click only works in fullscreen)
   - Verify no JavaScript errors are occurring

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 LiteGallery