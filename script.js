import { ImageHandler } from './ImageHandler.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { EventManager } from './EventManager.js';
import { ExportManager } from './ExportManager.js';
import { tips } from './tips.js';

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
        this.borderColor = '#ff6600'; // New property for border color
        this.blurIntensity = 5; // New property for blur backdrop intensity
        this.textRingBlendMode = false; // New property for text ring blend mode
        
        // Initialize modules
        this.imageHandler = new ImageHandler(this);
        this.renderer = new CanvasRenderer(this);
        this.eventManager = new EventManager(this);
        this.exportManager = new ExportManager(this);
        
        // Initialize tip cycling
        this.initTipCycling();
        
        this.renderer.drawCanvas();
    }

    initTipCycling() {
        this.currentTipIndex = 0;
        this.activeTipElement = 1; // Track which tip element is currently active (1 or 2)
        
        const tip1Element = document.querySelector('.tip-1');
        const tip2Element = document.querySelector('.tip-2');
        
        // Set initial tip on tip-1
        tip1Element.textContent = tips[this.currentTipIndex];
        tip1Element.classList.add('slide-up-in');
        
        // Hide tip-2 initially
        tip2Element.classList.add('slide-up-start');
        
        // Start cycling after 3 seconds
        setTimeout(() => {
            this.cycleTips();
        }, 3000);
    }

    cycleTips() {
        const tip1Element = document.querySelector('.tip-1');
        const tip2Element = document.querySelector('.tip-2');
        
        let currentElement, nextElement;
        
        if (this.activeTipElement === 1) {
            currentElement = tip1Element;
            nextElement = tip2Element;
            this.activeTipElement = 2;
        } else {
            currentElement = tip2Element;
            nextElement = tip1Element;
            this.activeTipElement = 1;
        }
        
        // Update to next tip
        this.currentTipIndex = (this.currentTipIndex + 1) % tips.length;
        nextElement.textContent = tips[this.currentTipIndex];
        
        // Start sliding current tip up and out
        currentElement.classList.remove('slide-up-in');
        currentElement.classList.add('slide-up-out');
        
        // Prepare next tip at bottom and slide it up
        nextElement.classList.remove('slide-up-out');
        nextElement.classList.add('slide-up-start');
        
        // Trigger the upward slide animation for next tip
        setTimeout(() => {
            nextElement.classList.remove('slide-up-start');
            nextElement.classList.add('slide-up-in');
        }, 50);
        
        // Reset current element position after animation completes
        setTimeout(() => {
            currentElement.classList.remove('slide-up-out');
            currentElement.classList.add('slide-up-start');
        }, 800);
        
        // Schedule next cycle
        setTimeout(() => {
            this.cycleTips();
        }, 4000);
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

    toggleTextRingBlendMode() {
        this.textRingBlendMode = !this.textRingBlendMode;
        this.renderer.drawCanvas();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeaderEditor();
});