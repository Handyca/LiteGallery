/**
 * LiteGallery Examples
 * This file contains example code to demonstrate various ways to use LiteGallery
 */

/**
 * Example 1: Basic initialization with default settings
 */
function basicGallerySetup() {
    // Initialize the gallery with default options
    const basicGallery = new LiteGallery('#basic-gallery');

    // HTML structure:
    // <div id="basic-gallery" class="lite-gallery">
    //   <div class="gallery-images">
    //     <img src="image1.jpg" alt="Image 1">
    //     <img src="image2.jpg" alt="Image 2">
    //     <img src="image3.jpg" alt="Image 3">
    //   </div>
    // </div>
}

/**
 * Example 2: Gallery with custom configuration
 */
function customGallerySetup() {
    // Initialize with custom options
    const customGallery = new LiteGallery('#custom-gallery', {
        thumbnails: true,
        fullscreen: true,
        zoom: true,
        rotate: true,
        autoplay: false,
        zoomLevels: [1, 1.5, 2, 3] // Custom zoom levels
    });
}

/**
 * Example 3: Gallery with autoplay slideshow
 */
function slideshowGallerySetup() {
    // Initialize a slideshow gallery
    const slideshowGallery = new LiteGallery('#slideshow-gallery', {
        autoplay: true,
        autoplaySpeed: 5000, // 5 seconds per slide
        thumbnails: true
    });

    // Add controls to start/stop the slideshow
    document.getElementById('play-slideshow').addEventListener('click', function () {
        slideshowGallery.startAutoplay();
    });

    document.getElementById('pause-slideshow').addEventListener('click', function () {
        slideshowGallery.stopAutoplay();
    });
}

/**
 * Example 4: Programmatically controlling the gallery
 */
function programmaticControlGallery() {
    // Initialize the gallery
    const gallery = new LiteGallery('#controlled-gallery');

    // Navigate to specific images
    document.getElementById('show-first').addEventListener('click', function () {
        gallery.showImage(0);
    });

    document.getElementById('show-last').addEventListener('click', function () {
        // Assuming we know there are 5 images
        gallery.showImage(4);
    });

    // Next and previous navigation
    document.getElementById('next-image').addEventListener('click', function () {
        gallery.nextImage();
    });

    document.getElementById('prev-image').addEventListener('click', function () {
        gallery.prevImage();
    });

    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', function () {
        gallery.zoom(0.1);
    });

    document.getElementById('zoom-out').addEventListener('click', function () {
        gallery.zoom(-0.1);
    });

    document.getElementById('reset-zoom').addEventListener('click', function () {
        gallery.resetZoom();
    });

    // Rotation controls
    document.getElementById('rotate-image').addEventListener('click', function () {
        gallery.rotate(90);
    });

    // Fullscreen controls
    document.getElementById('toggle-fullscreen').addEventListener('click', function () {
        gallery.toggleFullscreen();
    });
}

/**
 * Example 5: Handling gallery events
 */
function eventHandlingGallery() {
    // Initialize the gallery
    const gallery = new LiteGallery('#event-gallery');

    // Get the gallery container element
    const galleryElement = document.getElementById('event-gallery');

    // Listen for image change events
    galleryElement.addEventListener('litegallery:imagechange', function (e) {
        console.log('Image changed to index:', e.detail.index);
        updateImageCounter(e.detail.index + 1, e.detail.total);
    });

    // Listen for zoom change events
    galleryElement.addEventListener('litegallery:zoomchange', function (e) {
        console.log('Zoom level changed to:', e.detail.zoomLevel);
        updateZoomDisplay(e.detail.zoomLevel);
    });

    // Listen for fullscreen change events
    galleryElement.addEventListener('litegallery:fullscreenchange', function (e) {
        console.log('Fullscreen mode:', e.detail.isFullscreen);
        updateFullscreenButton(e.detail.isFullscreen);
    });

    // Example functions to update UI based on events
    function updateImageCounter(current, total) {
        document.getElementById('image-counter').textContent = `${current} / ${total}`;
    }

    function updateZoomDisplay(zoomLevel) {
        document.getElementById('zoom-display').textContent = `${Math.round(zoomLevel * 100)}%`;
    }

    function updateFullscreenButton(isFullscreen) {
        const button = document.getElementById('fullscreen-toggle');
        button.textContent = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }
}

/**
 * Example 6: Dynamically adding images to a gallery
 */
function dynamicGallerySetup() {
    // Initialize an empty gallery
    let gallery = new LiteGallery('#dynamic-gallery');

    // Function to add new images
    function addImagesToGallery(images) {
        const container = document.getElementById('dynamic-gallery');
        let imagesDiv = container.querySelector('.gallery-images');

        // Create the images container if it doesn't exist
        if (!imagesDiv) {
            imagesDiv = document.createElement('div');
            imagesDiv.className = 'gallery-images';
            container.appendChild(imagesDiv);
        }

        // Add each image to the container
        images.forEach(function (img) {
            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            imgElement.alt = img.alt || '';
            imagesDiv.appendChild(imgElement);
        });

        // Reinitialize the gallery (this is a simplified example)
        // In a real implementation, you might need to destroy and recreate the gallery
        // or implement a refresh method
        gallery = new LiteGallery('#dynamic-gallery');
    }

    // Example usage of the add images function
    document.getElementById('add-images').addEventListener('click', function () {
        addImagesToGallery([
            { src: 'new-image1.jpg', alt: 'New Image 1' },
            { src: 'new-image2.jpg', alt: 'New Image 2' }
        ]);
    });
}

/**
 * Example 7: Mobile-optimized gallery setup
 */
function mobileOptimizedGallery() {
    // Set up a gallery with mobile-friendly options
    const mobileGallery = new LiteGallery('#mobile-gallery', {
        thumbnails: false, // Hide thumbnails on mobile for more space
        fullscreen: true,
        zoom: true,
        rotate: true,
        // Use simpler zoom levels for touch interactions
        zoomLevels: [1, 2]
    });
}

/**
 * Example 8: Customizing gallery behavior based on viewport
 */
function responsiveGallerySetup() {
    // Determine options based on screen size
    function getGalleryOptions() {
        const isMobile = window.innerWidth < 768;

        return {
            thumbnails: !isMobile, // Hide thumbnails on mobile
            fullscreen: true,
            zoom: true,
            rotate: true,
            autoplay: false,
            // Different zoom levels based on device
            zoomLevels: isMobile ? [1, 1.5, 2] : [1, 1.5, 2, 3, 4]
        };
    }

    // Initialize with responsive options
    const responsiveGallery = new LiteGallery('#responsive-gallery', getGalleryOptions());

    // Update gallery on window resize
    window.addEventListener('resize', function () {
        // This is a simplified example - in real usage you might need to:
        // 1. Destroy the existing gallery
        // 2. Reinitialize with new options
        // 3. Implement a method to update options without reinitialization
    });
}

// Initialize examples when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Call example setup functions as needed
    // basicGallerySetup();
    // customGallerySetup();
    // slideshowGallerySetup();
    // programmaticControlGallery();
    // eventHandlingGallery();
    // dynamicGallerySetup();
    // mobileOptimizedGallery();
    // responsiveGallerySetup();
});
