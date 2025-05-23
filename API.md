# LiteGallery API Documentation

This document provides detailed documentation for the LiteGallery library's API, including configuration options, methods, events, and advanced usage patterns.

## Table of Contents

- [Configuration Options](#configuration-options)
- [Public Methods](#public-methods)
- [Events](#events)
- [Advanced Usage](#advanced-usage)
- [CSS Customization](#css-customization)
- [Browser Support](#browser-support)

## Configuration Options

When initializing LiteGallery, you can provide an options object to customize its behavior:

```javascript
const gallery = new LiteGallery('#gallery-selector', {
    // options here
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `thumbnails` | Boolean | `true` | Shows/hides the thumbnail navigation bar |
| `fullscreen` | Boolean | `true` | Enables/disables fullscreen functionality |
| `zoom` | Boolean | `true` | Enables/disables image zoom functionality |
| `rotate` | Boolean | `true` | Enables/disables image rotation functionality |
| `autoplay` | Boolean | `false` | Enables/disables slideshow mode |
| `autoplaySpeed` | Number | `3000` | Time in milliseconds between slides in autoplay |
| `zoomLevels` | Array | `[1, 1.5, 2, 3]` | Custom zoom levels for step-based zooming |

## Public Methods

LiteGallery exposes the following methods that you can call on an initialized gallery instance:

### Navigation

```javascript
// Initialize
const gallery = new LiteGallery('#my-gallery');

// Navigation methods
gallery.showImage(index);  // Shows the image at the specified index (0-based)
gallery.nextImage();       // Shows the next image
gallery.prevImage();       // Shows the previous image
```

### Zoom Operations

```javascript
// Zoom related methods
gallery.zoom(delta);       // Adjusts zoom by the provided delta value (e.g., 0.1 or -0.1)
gallery.zoomAtPosition(zoomLevel, x, y); // Zooms to specific level at cursor position
gallery.resetZoom();       // Resets zoom to original size (1.0)
```

### Rotation Operations

```javascript
// Rotation methods
gallery.rotate(degrees);   // Rotates the image by the specified degrees (typically 90)
gallery.resetRotation();   // Resets rotation to 0 degrees
```

### Fullscreen Operations

```javascript
// Fullscreen methods
gallery.toggleFullscreen(); // Toggles fullscreen mode
gallery.exitFullscreen();   // Exits fullscreen mode
```

### Autoplay Controls

```javascript
// Autoplay methods
gallery.startAutoplay();   // Starts the slideshow
gallery.stopAutoplay();    // Stops the slideshow
gallery.toggleAutoplay();  // Toggles the slideshow state
```

### Other Methods

```javascript
// Other utility methods
gallery.refreshLayout();   // Refreshes the gallery layout (useful after window resize)
```

## Events

LiteGallery emits custom events that you can listen for:

```javascript
const galleryElement = document.querySelector('#my-gallery');

// Image change event
galleryElement.addEventListener('litegallery:imagechange', function(e) {
    console.log('Image changed to index:', e.detail.index);
    console.log('Image source:', e.detail.src);
});

// Zoom change event
galleryElement.addEventListener('litegallery:zoomchange', function(e) {
    console.log('Zoom level changed to:', e.detail.zoomLevel);
});

// Fullscreen change event
galleryElement.addEventListener('litegallery:fullscreenchange', function(e) {
    console.log('Fullscreen mode:', e.detail.isFullscreen);
});
```

### Available Events

| Event Name | Detail Properties | Description |
|------------|-------------------|-------------|
| `litegallery:imagechange` | `{ index, src }` | Fired when the active image changes |
| `litegallery:zoomchange` | `{ zoomLevel }` | Fired when the zoom level changes |
| `litegallery:rotatechange` | `{ rotationDegree }` | Fired when the rotation changes |
| `litegallery:fullscreenchange` | `{ isFullscreen }` | Fired when entering/exiting fullscreen |
| `litegallery:autoplaychange` | `{ isPlaying }` | Fired when autoplay starts/stops |

## Advanced Usage

### Custom Initialization with Dynamic Content

```javascript
// Initialize an empty gallery
const gallery = new LiteGallery('#dynamic-gallery', {
    thumbnails: true,
    zoom: true
});

// Later, add images dynamically
function addImagesToGallery(imageArray) {
    const container = document.querySelector('#dynamic-gallery');
    const imagesDiv = container.querySelector('.gallery-images') || 
                      document.createElement('div');
    
    if (!container.contains(imagesDiv)) {
        imagesDiv.className = 'gallery-images';
        container.appendChild(imagesDiv);
    }
    
    // Clear existing images
    imagesDiv.innerHTML = '';
    
    // Add new images
    imageArray.forEach(imageObj => {
        const img = document.createElement('img');
        img.src = imageObj.src;
        img.alt = imageObj.alt || '';
        imagesDiv.appendChild(img);
    });
    
    // Reinitialize the gallery
    gallery.refresh(); // Assuming a refresh method is implemented
}

// Example usage
addImagesToGallery([
    { src: 'image1.jpg', alt: 'Description 1' },
    { src: 'image2.jpg', alt: 'Description 2' }
]);
```

## CSS Customization

LiteGallery can be customized by overriding its CSS classes:

### Main Container

```css
/* Customize the main gallery container */
.lite-gallery {
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 10px;
}
```

### Navigation Buttons

```css
/* Customize navigation buttons */
.gallery-nav-btn {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    width: 60px;
    height: 60px;
}

.gallery-nav-btn:hover {
    background-color: rgba(0, 0, 0, 0.9);
}
```

### Thumbnails

```css
/* Customize thumbnails */
.gallery-thumbnails {
    background-color: #e0e0e0;
    padding: 15px;
}

.gallery-thumbnail {
    width: 100px;
    height: 75px;
    border: 3px solid transparent;
}

.gallery-thumbnail.active {
    border-color: #ff5500;
}
```

### Fullscreen Mode

```css
/* Customize fullscreen mode */
.gallery-fullscreen {
    background-color: rgba(0, 0, 0, 0.95);
}
```

## Browser Support

LiteGallery is compatible with all modern browsers:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 16+
- iOS Safari 12+
- Android Browser 76+

The library uses modern JavaScript features and may require polyfills for older browsers. For optimal performance and compatibility, we recommend using the latest version of a modern browser.
