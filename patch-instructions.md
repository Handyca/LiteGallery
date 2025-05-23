# LiteGallery Patch Instructions

## Changes Required

1. Add custom zoom levels in the constructor (already done)
2. Update click handlers to use custom zoom levels
3. Remove box shadow on images (already done)
4. Update main view container click handler

## Implementation Steps:

1. Find the `this.mainImage.addEventListener('click', (e) => {` block and replace the inner zoom logic with:

```javascript
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
```

2. Find the `this.mainView.addEventListener('click', (e) => {` block and replace the inner zoom logic with:

```javascript
// Handle zoom functionality - prevent zoom during drag or right after drag
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

    // Show visual feedback
    this.showZoomNotification();
}
```

3. Fix the `handleTouchEnd` method to use custom zoom levels as well:

```javascript
// Handle single tap zoom if we're not dragging and haven't just finished dragging
if (!this.state.isDragging && !this.state.recentlyDragged && e.changedTouches.length === 1) {
    const touch = e.changedTouches[0];
    
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
        this.zoomAtPosition(nextZoom, touch.clientX, touch.clientY);
    }
}
```
