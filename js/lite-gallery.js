/**
 * LiteGallery - A lightweight, feature-rich image carousel library
 * Features:
 * 1. Fullscreen viewing
 * 2. Image zoom
 * 3. Image rotation
 * 4. Thumbnails
 * 5. Maintainable and scalable architecture
 */

class LiteGallery {
    /**
     * Create a new image gallery
     * @param {string} selector - CSS selector for the gallery container
     * @param {Object} options - Configuration options
     */
    constructor(selector, options = {}) {
        // Set default options
        this.options = {
            thumbnails: true,
            fullscreen: true,
            zoom: true,
            rotate: true,
            autoplay: false,
            autoplaySpeed: 3000,
            zoomLevels: [1, 1.5, 2, 3], // Custom zoom levels
            ...options
        };

        // State management
        this.state = {
            currentIndex: 0,
            isFullscreen: false,
            isZoomed: false,
            zoomLevel: 1,
            zoomLevelIndex: 0, // Index of current zoom level in the zoomLevels array
            rotationDegree: 0,
            isPlaying: false,
            autoplayTimer: null,
            isDragging: false,
            recentlyDragged: false, // Flag to track if image was recently dragged
            dragStartX: 0,
            dragStartY: 0,
            translateX: 0,
            translateY: 0
        };

        // Touch interaction tracking
        this.lastTapTime = 0;
        this.tapTimeout = null;
        this.scaleInfoTimeout = null;
        this.rotationInfoTimeout = null;

        // DOM elements
        this.container = document.querySelector(selector);
        if (!this.container) {
            console.error(`LiteGallery: Element ${selector} not found`);
            return;
        }

        // Find all images in the container
        this.images = Array.from(this.container.querySelectorAll('.gallery-images img'));
        if (this.images.length === 0) {
            console.error('LiteGallery: No images found in the gallery');
            return;
        }

        // Initialize the gallery
        this.init();

        // Add to the class properties in constructor
        // Inside the constructor after initializing state
        this.swipeData = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            minSwipeDistance: 50 // Minimum distance for a swipe to be detected
        };
    }    /**
     * Initialize the gallery structure and event listeners
     */
    init() {
        // Build gallery structure
        this.buildGallery();

        // Set up event listeners
        this.setupEventListeners();

        // Show the first image
        this.showImage(0);

        // Start autoplay if enabled
        if (this.options.autoplay) {
            this.startAutoplay();
        }

        // Show zoom hint after a short delay
        if (this.options.zoom) {
            setTimeout(() => {
                this.showZoomHint();
            }, 1500);
        }

        // Handle keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    /**
     * Build the gallery DOM structure
     */
    buildGallery() {
        // Clear original content
        const originalImages = this.images.map(img => ({
            src: img.src,
            alt: img.alt || 'Gallery image'
        }));

        this.container.innerHTML = '';

        // Create main view
        this.mainView = document.createElement('div');
        this.mainView.className = 'gallery-main';
        this.container.appendChild(this.mainView);

        // Create loading indicator
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'gallery-loading';
        this.loadingIndicator.style.display = 'none';
        this.mainView.appendChild(this.loadingIndicator);

        // Create main image
        this.mainImage = document.createElement('img');
        this.mainImage.className = 'gallery-active-image';
        this.mainView.appendChild(this.mainImage);        // Create image counter
        this.counter = document.createElement('div');
        this.counter.className = 'gallery-counter';
        this.mainView.appendChild(this.counter);

        // Create transform info display (scale and rotation)
        this.transformInfo = document.createElement('div');
        this.transformInfo.className = 'gallery-transform-info';        // Scale info
        this.scaleInfo = document.createElement('div');
        this.scaleInfo.className = 'scale-info';
        this.scaleInfo.innerHTML = '<span class="icon">🔍</span><span class="value">1.0x</span>';
        this.transformInfo.appendChild(this.scaleInfo);

        // Rotation info
        this.rotationInfo = document.createElement('div');
        this.rotationInfo.className = 'rotation-info';
        this.rotationInfo.innerHTML = '<span class="icon">🔄</span><span class="value">0°</span>';
        this.transformInfo.appendChild(this.rotationInfo);

        this.mainView.appendChild(this.transformInfo);        // Create fullscreen button directly in the main view (top-right)
        if (this.options.fullscreen) {
            // Enter fullscreen button
            this.fullscreenBtn = document.createElement('button');
            this.fullscreenBtn.className = 'gallery-fullscreen-btn';
            this.fullscreenBtn.title = 'Enter fullscreen';
            this.fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>';
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
            this.mainView.appendChild(this.fullscreenBtn);

            // Exit fullscreen button (shown only in fullscreen mode via CSS)
            this.exitFullscreenBtn = document.createElement('button');
            this.exitFullscreenBtn.className = 'gallery-exit-fullscreen-btn';
            this.exitFullscreenBtn.title = 'Exit fullscreen';
            this.exitFullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>';
            this.exitFullscreenBtn.addEventListener('click', () => this.exitFullscreen());
            this.mainView.appendChild(this.exitFullscreenBtn);
        }

        // Create navigation
        this.createNavigation();

        // Create toolbar with controls (excluding fullscreen which is now in top-right)
        this.createToolbar();

        // Create thumbnails if enabled
        if (this.options.thumbnails) {
            this.createThumbnails(originalImages);
        }

        // Rebuild the images array with the new sources
        this.images = originalImages;
    }

    /**
     * Create next/prev navigation buttons
     */
    createNavigation() {
        const navigation = document.createElement('div');
        navigation.className = 'gallery-navigation';

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'gallery-nav-btn gallery-prev';
        prevBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
        prevBtn.addEventListener('click', () => this.prevImage());

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'gallery-nav-btn gallery-next';
        nextBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
        nextBtn.addEventListener('click', () => this.nextImage());

        navigation.appendChild(prevBtn);
        navigation.appendChild(nextBtn);

        this.mainView.appendChild(navigation);
    }

    /**
     * Create toolbar with controls (zoom, rotate)
     */
    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'gallery-toolbar';

        // Add toolbar buttons based on options
        if (this.options.zoom) {
            const zoomInBtn = this.createToolButton('zoom-in',
                '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>',
                () => this.zoom(0.1));
            toolbar.appendChild(zoomInBtn);

            const zoomOutBtn = this.createToolButton('zoom-out',
                '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>',
                () => this.zoom(-0.1));
            toolbar.appendChild(zoomOutBtn);

            const resetZoomBtn = this.createToolButton('reset-zoom',
                '<svg viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>',
                () => this.resetZoom());
            toolbar.appendChild(resetZoomBtn);
        }

        if (this.options.rotate) {
            const rotateBtn = this.createToolButton('rotate',
                '<svg viewBox="0 0 24 24"><path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/></svg>',
                () => this.rotate(90));
            toolbar.appendChild(rotateBtn);
        }

        if (this.options.autoplay) {
            const playPauseBtn = this.createToolButton('play-pause',
                '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>',
                () => this.toggleAutoplay());
            this.playPauseBtn = playPauseBtn;
            toolbar.appendChild(playPauseBtn);
        }

        this.container.appendChild(toolbar);
    }

    /**
     * Helper to create toolbar buttons
     */
    createToolButton(name, iconSvg, clickHandler) {
        const button = document.createElement('button');
        button.className = `gallery-tool-btn gallery-${name}`;
        button.innerHTML = iconSvg;
        button.addEventListener('click', clickHandler);
        return button;
    }    /**
     * Create thumbnails container and images
     */
    createThumbnails(images) {
        const thumbnails = document.createElement('div');
        thumbnails.className = 'gallery-thumbnails';

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumbnail';

            // First image should have active class by default
            if (i === 0) {
                thumb.classList.add('active');
            }

            const thumbImg = document.createElement('img');
            thumbImg.src = img.src;
            thumbImg.alt = img.alt;
            thumbImg.loading = 'eager'; // Ensure thumbnails load quickly

            thumb.appendChild(thumbImg);

            // Use a closure to preserve the index value
            ((index) => {
                thumb.addEventListener('click', () => this.showImage(index));
            })(i);

            thumbnails.appendChild(thumb);
        }

        this.thumbnailsContainer = thumbnails;
        this.container.appendChild(thumbnails);
        this.thumbnails = Array.from(thumbnails.querySelectorAll('.gallery-thumbnail'));
    }    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Zoom image with mouse wheel
        if (this.options.zoom) {
            this.mainView.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.zoom(delta);
            });            // Single click to zoom in/out using custom zoom levels
            this.mainImage.addEventListener('click', (e) => {
                // Log that we received a click event
                console.log('Image clicked', e.clientX, e.clientY);

                // Prevent event bubbling to ensure no other elements capture it
                e.stopPropagation();

                // Only zoom if we're not dragging and haven't recently finished dragging
                if (!this.state.isDragging && !this.state.recentlyDragged) {
                    // Get the zoom levels from options
                    const zoomLevels = this.options.zoomLevels;

                    // Find current zoom level index or closest match
                    let currentIndex = 0;
                    let minDiff = Math.abs(zoomLevels[0] - this.state.zoomLevel);

                    for (let i = 1; i < zoomLevels.length; i++) {
                        const diff = Math.abs(zoomLevels[i] - this.state.zoomLevel);
                        if (diff < minDiff) {
                            minDiff = diff;
                            currentIndex = i;
                        }
                    }

                    // Cycle to next zoom level or reset to 1x
                    if (currentIndex >= zoomLevels.length - 1) {
                        // If at max zoom level, reset to 1x
                        this.resetZoom();
                    } else {
                        // Move to next zoom level
                        const nextIndex = currentIndex + 1;
                        const nextZoom = zoomLevels[nextIndex];
                        this.state.zoomLevelIndex = nextIndex;
                        this.zoomAtPosition(nextZoom, e.clientX, e.clientY);
                    }

                    // Show visual feedback that the zoom action was received
                    this.showZoomNotification();
                }
            });

            // Move zoomed image by dragging
            this.mainImage.addEventListener('mousedown', this.handleDragStart.bind(this));
            this.mainImage.addEventListener('mousemove', this.handleDragMove.bind(this));
            this.mainImage.addEventListener('mouseup', this.handleDragEnd.bind(this));
            this.mainImage.addEventListener('mouseleave', this.handleDragEnd.bind(this));

            // Touch events for mobile
            this.mainImage.addEventListener('touchstart', this.handleTouchStart.bind(this));
        }

        // Double click functionality removed as requested

        // Move zoomed image by dragging
        this.mainImage.addEventListener('mousedown', this.handleDragStart.bind(this));
        this.mainImage.addEventListener('mousemove', this.handleDragMove.bind(this));
        this.mainImage.addEventListener('mouseup', this.handleDragEnd.bind(this));
        this.mainImage.addEventListener('mouseleave', this.handleDragEnd.bind(this));

        // Touch events for mobile
        this.mainImage.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.mainImage.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.mainImage.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Listen for full screen change
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));

        // Preload images
        this.preloadImages();

        // Add a direct click handler to the main view container as a fallback
        // Fix in the setupEventListeners method (around line 375-425)


    }

    /**
     * Preload all gallery images
     */
    preloadImages() {
        for (const img of this.images) {
            const image = new Image();
            image.src = img.src;
        }
    }
    showImage(idx) {
        // Make a local copy to avoid modifying the parameter
        let index = idx;

        if (index < 0) {
            index = this.images.length - 1;
        } else if (index >= this.images.length) {
            index = 0;
        }        // Update state
        this.state.currentIndex = index;
        this.resetZoom();

        // Reset rotation
        this.state.rotationDegree = 0;

        // Reset rotation info display
        if (this.rotationInfo) {
            this.rotationInfo.querySelector('.value').textContent = '0°';
        }

        // Update main image
        this.loadingIndicator.style.display = 'block';
        this.mainImage.style.opacity = '0';

        const newImage = new Image();
        newImage.src = this.images[index].src;
        newImage.alt = this.images[index].alt;

        newImage.onload = () => {
            this.loadingIndicator.style.display = 'none';
            this.mainImage.src = newImage.src;
            this.mainImage.alt = newImage.alt;
            this.mainImage.style.opacity = '1';
            this.mainImage.className = 'gallery-active-image gallery-slide-animation';
            this.updateRotation();
        };

        newImage.onerror = () => {
            this.loadingIndicator.style.display = 'none';
            this.mainImage.src = '';

            const errorElement = document.createElement('div');
            errorElement.className = 'gallery-error';
            errorElement.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>Error loading image</p>
            `;

            this.mainView.appendChild(errorElement);
        };

        // Update counter
        this.counter.textContent = `${index + 1} / ${this.images.length}`;        // Update active thumbnail
        if (this.options.thumbnails && this.thumbnails) {
            for (const [i, thumb] of this.thumbnails.entries()) {
                if (i === index) {
                    thumb.classList.add('active');
                    // Scroll thumbnail into view with a slight delay to ensure UI has updated
                    setTimeout(() => {
                        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }, 50);
                } else {
                    thumb.classList.remove('active');
                }
            }
        }
    }

    /**
     * Go to next image
     */
    nextImage() {
        this.showImage(this.state.currentIndex + 1);
    }

    /**
     * Go to previous image
     */
    prevImage() {
        this.showImage(this.state.currentIndex - 1);
    }    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!this.state.isFullscreen) {
            // Enter fullscreen
            if (this.container.requestFullscreen) {
                this.container.requestFullscreen().catch(err => console.error(`Error attempting to enable fullscreen: ${err.message}`));
            } else if (this.container.mozRequestFullScreen) { // Firefox
                this.container.mozRequestFullScreen();
            } else if (this.container.webkitRequestFullscreen) { // Chrome, Safari, Opera
                this.container.webkitRequestFullscreen();
            } else if (this.container.msRequestFullscreen) { // IE/Edge
                this.container.msRequestFullscreen();
            }
        } else {
            this.exitFullscreen();
        }
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (error) {
            console.error('Error exiting fullscreen:', error);
            // Force fullscreen state update in case the browser API call failed
            this.state.isFullscreen = false;
            this.container.classList.remove('gallery-fullscreen');
        }
    }    /**
     * Handle fullscreen change event
     */
    handleFullscreenChange() {
        const isFullscreen = document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;

        this.state.isFullscreen = !!isFullscreen;

        // Update UI based on fullscreen state
        if (this.state.isFullscreen) {
            this.container.classList.add('gallery-fullscreen');
            // Show fullscreen help with Esc instruction
            this.showFullscreenHelp();
            // Show appropriate zoom hint for fullscreen mode
            this.showZoomHint();
        } else {
            this.container.classList.remove('gallery-fullscreen');
            // Reset zoom when exiting fullscreen
            this.resetZoom();
        }
    }

    /**
     * Zoom the current image
     * @param {number} delta - Amount to zoom (positive for zoom in, negative for zoom out)
     */
    zoom(delta) {
        // Calculate new zoom level
        let newZoom = this.state.zoomLevel + delta;

        // Limit zoom level between 0.5 and 3
        newZoom = Math.max(0.5, Math.min(3, newZoom));

        // Update state
        this.state.zoomLevel = newZoom;
        this.state.isZoomed = newZoom !== 1;

        // Apply zoom transform
        this.updateImageTransform();

        // Update zoom level indicator if in fullscreen
        if (this.state.isFullscreen) {
            this.updateZoomLevelIndicator();
        }

        // Update scale info display
        if (this.scaleInfo) {
            // Show percentage in fullscreen mode
            const zoomText = this.state.isFullscreen ?
                `${newZoom.toFixed(1)}x (${Math.round((newZoom - 1) * 100)}%)` :
                `${newZoom.toFixed(1)}x`;
            this.scaleInfo.querySelector('.value').textContent = zoomText;

            // Show zoom steps indicator in fullscreen mode
            if (this.state.isFullscreen) {
                const stepsText = newZoom >= 3 ?
                    '(Click to reset)' :
                    '(Click to zoom in)';

                // Check if we already have a steps indicator
                let stepsIndicator = this.scaleInfo.querySelector('.steps-info');
                if (!stepsIndicator) {
                    stepsIndicator = document.createElement('span');
                    stepsIndicator.className = 'steps-info';
                    this.scaleInfo.appendChild(stepsIndicator);
                }

                stepsIndicator.textContent = ` ${stepsText}`;
            } else {
                // Remove steps indicator if not in fullscreen
                const stepsIndicator = this.scaleInfo.querySelector('.steps-info');
                if (stepsIndicator) {
                    stepsIndicator.remove();
                }
            }

            // Make the transform info visible when zooming
            this.transformInfo.style.opacity = '1';
            // Hide after 2 seconds unless further zooming happens
            clearTimeout(this.scaleInfoTimeout);
            this.scaleInfoTimeout = setTimeout(() => {
                if (!this.state.isDragging) {
                    this.transformInfo.style.opacity = '0.5';
                }
            }, 2000);
        }

        // Add/remove zoomed class
        if (this.state.isZoomed) {
            this.mainImage.classList.add('zoomed');
        } else {
            this.mainImage.classList.remove('zoomed');

            // Reset translation when zoom is reset
            if (newZoom === 1) {
                this.state.translateX = 0;
                this.state.translateY = 0;
            }
        }
    }

    /**
     * Zoom at a specific position (mouse cursor or touch position)
     * @param {number} targetZoom - The zoom level to set
     * @param {number} clientX - X position to center zoom at (usually mouse or touch X)
     * @param {number} clientY - Y position to center zoom at (usually mouse or touch Y)
     */
    zoomAtPosition(targetZoom, clientX, clientY) {
        // Get image and container dimensions and position
        const rect = this.mainImage.getBoundingClientRect();
        const imageWidth = rect.width;
        const imageHeight = rect.height;

        // Calculate relative position on the image (0-1)
        const relativeX = (clientX - rect.left) / imageWidth;
        const relativeY = (clientY - rect.top) / imageHeight;

        // Calculate the current image center position
        const centerX = (rect.width / 2) + rect.left;
        const centerY = (rect.height / 2) + rect.top;

        // Current scale
        const currentZoom = this.state.zoomLevel;

        // Point on original image before zoom
        const pointXBeforeZoom = (clientX - centerX) / currentZoom + centerX;
        const pointYBeforeZoom = (clientY - centerY) / currentZoom + centerY;

        // Update zoom level
        this.state.zoomLevel = targetZoom;
        this.state.isZoomed = targetZoom !== 1;

        // Point on original image after zoom
        const pointXAfterZoom = (pointXBeforeZoom - centerX) * targetZoom + centerX;
        const pointYAfterZoom = (pointYBeforeZoom - centerY) * targetZoom + centerY;

        // Calculate translation needed to keep the point under cursor
        this.state.translateX += (clientX - pointXAfterZoom) / targetZoom;
        this.state.translateY += (clientY - pointYAfterZoom) / targetZoom;

        // Apply transform
        this.updateImageTransform();

        // Update UI indicators
        if (this.state.isFullscreen) {
            this.updateZoomLevelIndicator();
        }

        // Update cursor and class
        if (this.state.isZoomed) {
            this.mainImage.classList.add('zoomed');
        } else {
            this.mainImage.classList.remove('zoomed');
        }

        // Update scale info display
        if (this.scaleInfo) {
            // Show percentage in fullscreen mode
            const zoomText = this.state.isFullscreen ?
                `${targetZoom.toFixed(1)}x (${Math.round((targetZoom - 1) * 100)}%)` :
                `${targetZoom.toFixed(1)}x`;
            this.scaleInfo.querySelector('.value').textContent = zoomText;

            // Show zoom steps indicator in fullscreen mode
            if (this.state.isFullscreen) {
                const stepsText = targetZoom >= 3 ?
                    '(Click to reset)' :
                    '(Click to zoom in)';

                // Check if we already have a steps indicator
                let stepsIndicator = this.scaleInfo.querySelector('.steps-info');
                if (!stepsIndicator) {
                    stepsIndicator = document.createElement('span');
                    stepsIndicator.className = 'steps-info';
                    this.scaleInfo.appendChild(stepsIndicator);
                }

                stepsIndicator.textContent = ` ${stepsText}`;
            }

            // Make transform info visible
            this.transformInfo.style.opacity = '1';

            // Hide after delay
            clearTimeout(this.scaleInfoTimeout);
            this.scaleInfoTimeout = setTimeout(() => {
                if (!this.state.isDragging) {
                    this.transformInfo.style.opacity = '0.5';
                }
            }, 2000);
        }
    }

    /**
     * Reset zoom to default level (1x)
     */
    resetZoom() {
        // Reset zoom level
        this.state.zoomLevel = 1;
        this.state.isZoomed = false;

        // Reset translation
        this.state.translateX = 0;
        this.state.translateY = 0;

        // Remove zoomed class
        this.mainImage.classList.remove('zoomed');

        // Apply transform
        this.updateImageTransform();

        // Update indicators
        if (this.state.isFullscreen) {
            this.updateZoomLevelIndicator();
        }

        // Update scale info display
        if (this.scaleInfo) {
            this.scaleInfo.querySelector('.value').textContent = '1.0x';

            // Remove steps indicator
            const stepsIndicator = this.scaleInfo.querySelector('.steps-info');
            if (stepsIndicator) {
                stepsIndicator.remove();
            }

            // Make transform info visible briefly
            this.transformInfo.style.opacity = '1';

            // Hide after delay
            clearTimeout(this.scaleInfoTimeout);
            this.scaleInfoTimeout = setTimeout(() => {
                this.transformInfo.style.opacity = '0.5';
            }, 2000);
        }
    }

    /**
     * Create a visual zoom level indicator for fullscreen mode
     * This shows the available zoom steps
     */
    createZoomLevelIndicator() {
        // Remove existing indicator if any
        this.removeZoomLevelIndicator();

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'gallery-zoom-level-indicator';

        // Create zoom levels
        const levels = this.options.zoomLevels ?? [1, 1.5, 2, 2.5, 3];
        const currentZoom = this.state.zoomLevel;
        console.log('Current zoom level:', currentZoom);

        // biome-ignore lint/complexity/noForEach: <explanation>
        levels.forEach(level => {
            const step = document.createElement('div');
            step.className = 'zoom-level-step';
            step.setAttribute('data-level', `${level}x`);

            if (Math.abs(currentZoom - level) < 0.1) {
                step.classList.add('active');
            }

            if (level === 1) {
                step.textContent = '1x';
            } else if (level === Number(Math.max(...levels))) {
                step.textContent = `${Math.max(...levels)}x`;
            }

            // Add click handler to allow direct zoom selection
            step.addEventListener('click', () => {
                if (Math.abs(this.state.zoomLevel - level) < 0.1) {
                    // If already at this zoom level, reset to 1x
                    this.resetZoom();
                } else {
                    // Otherwise zoom to this level
                    this.zoomToLevel(level);
                    this.showZoomNotification();
                }
            });

            indicator.appendChild(step);
        });

        this.mainView.appendChild(indicator);
        this.zoomLevelIndicator = indicator;

        // Hide indicator after 3 seconds
        setTimeout(() => {
            if (this.zoomLevelIndicator) {
                this.zoomLevelIndicator.style.opacity = '0.3';
            }
        }, 3000);
    }

    /**
     * Remove the zoom level indicator
     */
    removeZoomLevelIndicator() {
        if (this.zoomLevelIndicator) {
            this.zoomLevelIndicator.remove();
            this.zoomLevelIndicator = null;
        }
    }

    /**
     * Update the zoom level indicator to reflect current zoom level
     */
    updateZoomLevelIndicator() {
        if (!this.zoomLevelIndicator || !this.state.isFullscreen) return;

        const steps = this.zoomLevelIndicator.querySelectorAll('.zoom-level-step');
        const levels = this.options.zoomLevels ?? [1, 1.5, 2, 2.5, 3];
        const currentZoom = this.state.zoomLevel;

        steps.forEach((step, index) => {
            step.classList.toggle('active', Math.abs(currentZoom - levels[index]) < 0.1);
        });

        // Show indicator clearly when updating
        this.zoomLevelIndicator.style.opacity = '0.9';

        // Hide indicator after 3 seconds
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            if (this.zoomLevelIndicator) {
                this.zoomLevelIndicator.style.opacity = '0.3';
            }
        }, 3000);
    }

    /**
     * Zoom to a specific level without changing position
     * @param {number} level - Target zoom level (1, 1.5, 2, 2.5, or 3)
     */
    zoomToLevel(level) {
        this.state.zoomLevel = level;
        this.state.isZoomed = level !== 1;

        if (!this.state.isZoomed) {
            this.state.translateX = 0;
            this.state.translateY = 0;
            this.mainImage.classList.remove('zoomed');
        } else {
            this.mainImage.classList.add('zoomed');
        }

        // Apply transform
        this.updateImageTransform();

        // Update indicators
        this.updateZoomLevelIndicator();

        // Update scale info display
        if (this.scaleInfo) {
            const zoomText = this.state.isFullscreen ?
                `${level.toFixed(1)}x (${Math.round((level - 1) * 100)}%)` :
                `${level.toFixed(1)}x`;
            this.scaleInfo.querySelector('.value').textContent = zoomText;

            // Update steps indicator in fullscreen mode
            if (this.state.isFullscreen) {
                const stepsText = level >= 3 ? '(Click to reset)' : '(Click to zoom in)';
                let stepsIndicator = this.scaleInfo.querySelector('.steps-info');

                if (!stepsIndicator) {
                    stepsIndicator = document.createElement('span');
                    stepsIndicator.className = 'steps-info';
                    this.scaleInfo.appendChild(stepsIndicator);
                }

                stepsIndicator.textContent = ` ${stepsText}`;
            }

            // Make info visible
            this.transformInfo.style.opacity = '1';

            // Hide after delay
            clearTimeout(this.scaleInfoTimeout);
            this.scaleInfoTimeout = setTimeout(() => {
                if (!this.state.isDragging) {
                    this.transformInfo.style.opacity = '0.5';
                }
            }, 2000);
        }
    }

    /**
     * Rotate the current image
     * @param {number} degrees - Degrees to rotate (usually 90, 180, 270)
     */
    rotate(degrees) {
        this.state.rotationDegree = (this.state.rotationDegree + degrees) % 360;
        this.updateRotation();        // Update rotation info display
        if (this.rotationInfo) {
            this.rotationInfo.querySelector('.value').textContent = `${this.state.rotationDegree}°`;
            // Make the transform info visible when rotating
            this.transformInfo.style.opacity = '1';
            // Hide after 2 seconds unless further rotation happens
            clearTimeout(this.rotationInfoTimeout);
            this.rotationInfoTimeout = setTimeout(() => {
                if (!this.state.isDragging) {
                    this.transformInfo.style.opacity = '0.5';
                }
            }, 2000);
        }
    }    /**
     * Update image rotation based on current rotation state
     */
    updateRotation() {
        // Instead of using CSS classes, we'll use the combined transform in updateImageTransform
        this.updateImageTransform();
    }/**
     * Update image transform with current zoom, translation, and rotation
     */
    updateImageTransform() {
        this.mainImage.style.transform = `rotate(${this.state.rotationDegree}deg) scale(${this.state.zoomLevel}) translate(${this.state.translateX}px, ${this.state.translateY}px)`;
    }

    /**
     * Start autoplay
     */
    startAutoplay() {
        if (this.state.autoplayTimer) {
            clearInterval(this.state.autoplayTimer);
        }

        this.state.isPlaying = true;
        this.state.autoplayTimer = setInterval(() => {
            this.nextImage();
        }, this.options.autoplaySpeed);

        // Update play/pause button if it exists
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>';
        }
    }

    /**
     * Stop autoplay
     */
    stopAutoplay() {
        if (this.state.autoplayTimer) {
            clearInterval(this.state.autoplayTimer);
            this.state.autoplayTimer = null;
        }

        this.state.isPlaying = false;

        // Update play/pause button if it exists
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>';
        }
    }

    /**
     * Toggle autoplay
     */
    toggleAutoplay() {
        if (this.state.isPlaying) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        // Only respond to keyboard events when gallery is focused or in fullscreen
        if (!this.container.contains(document.activeElement) && !this.state.isFullscreen) {
            return;
        }

        switch (e.key) {
            case 'ArrowLeft':
                this.prevImage();
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.nextImage();
                e.preventDefault();
                break;
            case 'Escape':
                if (this.state.isFullscreen) {
                    this.toggleFullscreen();
                }
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                e.preventDefault();
                break;
            case '+':
                if (this.options.zoom) {
                    this.zoom(0.1);
                    e.preventDefault();
                }
                break;
            case '-':
                if (this.options.zoom) {
                    this.zoom(-0.1);
                    e.preventDefault();
                }
                break;
            case 'r':
            case 'R':
                if (this.options.rotate) {
                    this.rotate(90);
                    e.preventDefault();
                }
                break;
            case '0':
                if (this.options.zoom) {
                    this.resetZoom();
                    e.preventDefault();
                }
                break;
            case ' ':
                if (this.options.autoplay) {
                    this.toggleAutoplay();
                    e.preventDefault();
                }
                break;
        }
    }    /**
     * Handle drag start for zoomed image
     */
    handleDragStart(e) {
        if (!this.state.isZoomed) return;

        e.preventDefault();
        this.state.isDragging = true;
        this.state.dragStartX = e.clientX;
        this.state.dragStartY = e.clientY;

        // Track the initial position to determine if significant movement occurred
        this.dragInitialX = e.clientX;
        this.dragInitialY = e.clientY;
        this.significantDragOccurred = false;
    }    /**
     * Handle drag move for zoomed image
     */
    handleDragMove(e) {
        if (!this.state.isDragging) return;

        e.preventDefault();
        const dx = e.clientX - this.state.dragStartX;
        const dy = e.clientY - this.state.dragStartY;

        this.state.translateX += dx / this.state.zoomLevel;
        this.state.translateY += dy / this.state.zoomLevel;

        this.state.dragStartX = e.clientX;
        this.state.dragStartY = e.clientY;

        // Check if this drag represents significant movement (more than 5 pixels in any direction)
        // This helps distinguish between a real drag vs. a simple click
        const totalDragX = Math.abs(e.clientX - this.dragInitialX);
        const totalDragY = Math.abs(e.clientY - this.dragInitialY);

        if (totalDragX > 5 || totalDragY > 5) {
            this.significantDragOccurred = true;
        }

        this.updateImageTransform();
    }    /**
     * Handle drag end for zoomed image
     */
    handleDragEnd() {
        this.state.isDragging = false;

        // Only set recentlyDragged if we actually dragged (not just clicked)
        // This prevents zoom from triggering right after drag ends
        if (this.significantDragOccurred) {
            this.state.recentlyDragged = true;

            // Reset the recentlyDragged flag after a short delay
            setTimeout(() => {
                this.state.recentlyDragged = false;
            }, 300); // 300ms delay before allowing zoom again
        }

        // Reset the tracking variables
        this.significantDragOccurred = false;
    }    /**
     * Handle touch start for mobile devices
     */
    handleTouchStart(e) {
        // Store touch start position for swipe detection
        if (e.touches.length === 1) {
            this.swipeData.startX = e.touches[0].clientX;
            this.swipeData.startY = e.touches[0].clientY;

            // Reset end position
            this.swipeData.endX = 0;
            this.swipeData.endY = 0;

            // Store touch start time to detect double-tap
            const now = new Date().getTime();
            const timeSince = now - (this.lastTapTime || 0);

            // Detect double-tap (tap within 300ms of last tap)
            if (timeSince < 300 && timeSince > 0) {
                // This is a double-tap
                e.preventDefault();
                this.toggleFullscreen();
                this.lastTapTime = 0; // Reset the tap time
            } else {
                // This is a single tap or the first tap of a potential double-tap
                this.lastTapTime = now;
            }

            // Handle dragging when zoomed
            if (this.state.isZoomed) {
                this.state.isDragging = true;
                this.state.dragStartX = e.touches[0].clientX;
                this.state.dragStartY = e.touches[0].clientY;

                // Track the initial position to determine if significant movement occurred
                this.touchInitialX = e.touches[0].clientX;
                this.touchInitialY = e.touches[0].clientY;
                this.significantTouchMoveOccurred = false;
            }
        }
    }    /**
     * Handle touch move for mobile devices
     */
    handleTouchMove(e) {
        // Update swipe end position
        if (e.touches.length === 1) {
            this.swipeData.endX = e.touches[0].clientX;
            this.swipeData.endY = e.touches[0].clientY;
        }

        // Existing dragging code
        if (!this.state.isDragging) return;

        e.preventDefault();
        const dx = e.touches[0].clientX - this.state.dragStartX;
        const dy = e.touches[0].clientY - this.state.dragStartY;

        this.state.translateX += dx / this.state.zoomLevel;
        this.state.translateY += dy / this.state.zoomLevel;

        this.state.dragStartX = e.touches[0].clientX;
        this.state.dragStartY = e.touches[0].clientY;

        // Check if this touch movement represents significant movement 
        const totalMoveX = Math.abs(e.touches[0].clientX - this.touchInitialX);
        const totalMoveY = Math.abs(e.touches[0].clientY - this.touchInitialY);

        if (totalMoveX > 10 || totalMoveY > 10) {
            this.significantTouchMoveOccurred = true;
        }

        this.updateImageTransform();
    }/**
     * Handle touch end for mobile devices
     */    handleTouchEnd(e) {
        // Process swipe if we have valid start and end points
        if (this.swipeData.endX !== 0 && !this.state.isZoomed) {
            const deltaX = this.swipeData.endX - this.swipeData.startX;
            const deltaY = this.swipeData.endY - this.swipeData.startY;

            // Check if horizontal movement is greater than vertical (to distinguish from scrolling)
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Check if the swipe was long enough
                if (Math.abs(deltaX) > this.swipeData.minSwipeDistance) {
                    // Swipe right: previous image
                    if (deltaX > 0) {
                        this.prevImage();
                        // Show a visual indicator for previous
                        this.showNavigationIndicator('prev');
                        // No need to process as a tap
                        this.lastTapTime = 0;
                        if (this.tapTimeout) {
                            clearTimeout(this.tapTimeout);
                            this.tapTimeout = null;
                        }
                        return;
                    }
                    // Swipe left: next image
                    // biome-ignore lint/style/noUselessElse: <explanation>
                    else {
                        this.nextImage();
                        // Show a visual indicator for next
                        this.showNavigationIndicator('next');
                        // No need to process as a tap
                        this.lastTapTime = 0;
                        if (this.tapTimeout) {
                            clearTimeout(this.tapTimeout);
                            this.tapTimeout = null;
                        }
                        return;
                    }
                }
            }
        }

        // Existing touch end logic
        this.state.isDragging = false;
        this.state.recentlyDragged = true;

        // Reset the recentlyDragged flag after a short delay
        setTimeout(() => {
            this.state.recentlyDragged = false;
        }, 300);

        // Handle single tap after a delay to ensure it's not the start of a double-tap
        if (this.lastTapTime && !this.tapTimeout) {
            this.tapTimeout = setTimeout(() => {
                const now = new Date().getTime();
                const timeSince = now - this.lastTapTime;

                // If this is a single tap (no second tap arrived within 300ms)
                if (timeSince >= 300) {
                    // Handle single tap zoom if we're not dragging and haven't just finished dragging
                    if (!this.state.isDragging && !this.state.recentlyDragged && e.changedTouches.length === 1) {
                        const touch = e.changedTouches[0];

                        if (this.state.isFullscreen) {
                            // In fullscreen mode, we zoom step by step
                            if (this.state.zoomLevel >= 3) {
                                // If at max zoom, reset to 1x
                                this.resetZoom();
                            } else {
                                // Increase zoom by 0.5x up to 3x
                                const newZoom = Math.min(3, this.state.zoomLevel + 0.5);
                                this.zoomAtPosition(newZoom, touch.clientX, touch.clientY);
                            }
                        } else {
                            // In normal mode, cycle through zoom levels: 1x -> 2x -> 3x -> 1x
                            if (this.state.zoomLevel >= 2.5) {
                                this.resetZoom();
                            } else if (this.state.zoomLevel >= 1.5) {
                                this.zoomAtPosition(3, touch.clientX, touch.clientY);
                            } else {
                                this.zoomAtPosition(2, touch.clientX, touch.clientY);
                            }
                        }
                    }
                }

                this.tapTimeout = null;
            }, 300);
        }
    }    /**
     * Destroy the gallery and clean up event listeners
     */
    destroy() {
        // Stop autoplay if running
        this.stopAutoplay();

        // Clear any pending timers
        if (this.tapTimeout) clearTimeout(this.tapTimeout);
        if (this.scaleInfoTimeout) clearTimeout(this.scaleInfoTimeout);
        if (this.rotationInfoTimeout) clearTimeout(this.rotationInfoTimeout);
        if (this.swipeIndicatorTimeout) clearTimeout(this.swipeIndicatorTimeout);

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
        document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));

        // Reset container
        this.container.innerHTML = '';        // Add back original images
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'gallery-images';

        for (const img of this.images) {
            const imgEl = document.createElement('img');
            imgEl.src = img.src;
            imgEl.alt = img.alt;
            imagesContainer.appendChild(imgEl);
        }

        this.container.appendChild(imagesContainer);
    }

    /**
     * Show a temporary zoom hint tooltip
     */
    showZoomHint() {
        // Remove existing hint if any
        this.removeZoomHint();

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'gallery-zoom-hint';
        tooltip.textContent = 'Click image to zoom';

        // Add tooltip to container
        this.mainView.appendChild(tooltip);
        this.zoomHint = tooltip;

        // Fade in
        setTimeout(() => {
            if (this.zoomHint) {
                this.zoomHint.classList.add('visible');
            }
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            this.removeZoomHint();
        }, 3000);
    }

    /**
     * Remove the zoom hint tooltip
     */
    removeZoomHint() {
        if (this.zoomHint) {
            this.zoomHint.classList.remove('visible');
            setTimeout(() => {
                if (this.zoomHint) {
                    this.zoomHint.remove();
                    this.zoomHint = null;
                }
            }, 300);
        }
    }    /**
     * Show a brief notification indicating the zoom action was received
     */
    showZoomNotification() {
        const zoomLevel = this.state.zoomLevel.toFixed(1);

        // Create or update zoom notification
        if (!this.zoomNotification) {
            this.zoomNotification = document.createElement('div');
            this.zoomNotification.className = 'gallery-zoom-notification';
            this.mainView.appendChild(this.zoomNotification);
        }

        // Show current zoom level
        this.zoomNotification.textContent = `${zoomLevel}x zoom`;
        this.zoomNotification.classList.add('visible');

        // Hide after a short delay
        clearTimeout(this.zoomNotificationTimeout);
        this.zoomNotificationTimeout = setTimeout(() => {
            if (this.zoomNotification) {
                this.zoomNotification.classList.remove('visible');
            }
        }, 1200);
    }

    /**
     * Show a brief fullscreen help tooltip
     */
    showFullscreenHelp() {
        // Create or update fullscreen help
        if (!this.fullscreenHelp) {
            this.fullscreenHelp = document.createElement('div');
            this.fullscreenHelp.className = 'gallery-fullscreen-help';
            this.fullscreenHelp.textContent = 'Press Esc to exit fullscreen';
            this.mainView.appendChild(this.fullscreenHelp);
        }

        // Show the help
        this.fullscreenHelp.classList.add('visible');

        // Hide after a short delay
        clearTimeout(this.fullscreenHelpTimeout);
        this.fullscreenHelpTimeout = setTimeout(() => {
            if (this.fullscreenHelp) {
                this.fullscreenHelp.classList.remove('visible');
            }
        }, 3000);
    }

    /**
     * Show a visual indicator for swipe navigation
     * @param {string} direction - 'next' or 'prev'
     */
    showNavigationIndicator(direction) {
        // Create the indicator if it doesn't exist
        if (!this.swipeIndicator) {
            this.swipeIndicator = document.createElement('div');
            this.swipeIndicator.className = 'gallery-swipe-indicator';
            this.mainView.appendChild(this.swipeIndicator);
        }

        // Set the indicator content based on direction
        if (direction === 'next') {
            this.swipeIndicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
            this.swipeIndicator.className = 'gallery-swipe-indicator next';
        } else {
            this.swipeIndicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
            this.swipeIndicator.className = 'gallery-swipe-indicator prev';
        }

        // Show the indicator
        this.swipeIndicator.classList.add('visible');

        // Hide after a short delay
        clearTimeout(this.swipeIndicatorTimeout);
        this.swipeIndicatorTimeout = setTimeout(() => {
            if (this.swipeIndicator) {
                this.swipeIndicator.classList.remove('visible');
            }
        }, 800);
    }
}

// Export as global or module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiteGallery;
} else {
    window.LiteGallery = LiteGallery;
}
