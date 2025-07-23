import { ImageHandler } from './ImageHandler.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { EventManager } from './EventManager.js';
import { ExportManager } from './ExportManager.js';

class HeaderEditor {
    constructor() {
        this.canvas = document.getElementById('headerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.headerImage = null;
        this.pfpImage = null;
        this.headerScale = 1;
        this.headerOffsetX = 0;
        this.headerOffsetY = 0;
        this.headerFlipped = false;
        this.pfpScale = 1;
        this.pfpOffsetX = 0;
        this.pfpOffsetY = 0;
        this.isDragging = false;
        this.dragTarget = null; // 'header' or 'pfp'
        this.lastX = 0;
        this.lastY = 0;
        this.borderEffect = 'none';
        this.hasDragged = false; // Track if actual dragging occurred
        this.pfpBorderVisible = true; // New property to control border visibility
        this.pfpShadowVisible = false; // New property to control shadow visibility
        
        // Initialize modules
        this.imageHandler = new ImageHandler(this);
        this.renderer = new CanvasRenderer(this);
        this.eventManager = new EventManager(this);
        this.exportManager = new ExportManager(this);
        
        this.renderer.drawCanvas();
    }

    zoom(factor) {
        if (this.dragTarget === 'pfp' && this.pfpImage) {
            this.pfpScale *= factor;
            this.pfpScale = Math.max(0.1, Math.min(5, this.pfpScale));
        } else if (this.headerImage) {
            this.headerScale *= factor;
            this.headerScale = Math.max(0.1, Math.min(5, this.headerScale));
        }
        this.renderer.drawCanvas();
    }

    resetPosition() {
        if (this.dragTarget === 'pfp') {
            this.imageHandler.resetPfpPosition();
        } else {
            this.imageHandler.resetHeaderPosition();
        }
        this.renderer.drawCanvas();
    }

    flipHeader() {
        this.headerFlipped = !this.headerFlipped;
        this.renderer.drawCanvas();
    }

    togglePfpBorder() {
        this.pfpBorderVisible = !this.pfpBorderVisible;
        this.renderer.drawCanvas();
    }

    togglePfpShadow() {
        this.pfpShadowVisible = !this.pfpShadowVisible;
        this.renderer.drawCanvas();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeaderEditor();
});