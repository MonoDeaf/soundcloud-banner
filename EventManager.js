export class EventManager {
    constructor(headerEditor) {
        this.headerEditor = headerEditor;
        this.canvas = headerEditor.canvas;
        this.initEventListeners();
    }

    initEventListeners() {
        // File upload triggers
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        document.getElementById('headerImageUpload').addEventListener('change', (e) => this.headerEditor.imageHandler.handleHeaderImageUpload(e));
        document.getElementById('pfpImageUpload').addEventListener('change', (e) => this.headerEditor.imageHandler.handlePfpImageUpload(e));
        document.getElementById('removeBorder').addEventListener('click', () => this.headerEditor.togglePfpBorder());
        document.getElementById('zoomIn').addEventListener('click', () => this.headerEditor.zoom(1.1));
        document.getElementById('zoomOut').addEventListener('click', () => this.headerEditor.zoom(0.9));
        document.getElementById('flipHeader').addEventListener('click', () => this.headerEditor.flipHeader());
        document.getElementById('toggleShadow').addEventListener('click', () => this.headerEditor.togglePfpShadow());
        document.getElementById('saveHeader').addEventListener('click', () => this.headerEditor.exportManager.saveImage());
        document.getElementById('borderEffect').addEventListener('change', (e) => {
            this.headerEditor.borderEffect = e.target.value;
            this.headerEditor.renderer.drawCanvas();
        });

        // Canvas mouse events for dragging
        this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.endDrag());
        this.canvas.addEventListener('mouseleave', () => this.endDrag());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drag(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.endDrag());
    }

    handleCanvasClick(e) {
        // Only handle click if no dragging occurred
        if (this.headerEditor.hasDragged) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to canvas coordinates
        const canvasX = (x / rect.width) * this.canvas.width;
        const canvasY = (y / rect.height) * this.canvas.height;
        
        // Check if click is in pfp area - using SoundCloud spec positioning
        const pfpRadius = 100; // 200px radius in export (400px diameter), scaled down for preview
        const pfpCenterX = 130; // 60px + 200px from left edge in export, scaled down for preview
        const pfpCenterY = 130; // 60px + 200px from top edge in export, scaled down for preview
        
        const distanceFromPfpCenter = Math.sqrt(
            Math.pow(canvasX - pfpCenterX, 2) + Math.pow(canvasY - pfpCenterY, 2)
        );
        
        if (distanceFromPfpCenter <= pfpRadius) {
            // Click in pfp area
            this.headerEditor.imageHandler.openPfpFileDialog();
        } else {
            // Click in header area
            this.headerEditor.imageHandler.openHeaderFileDialog();
        }
    }

    handleMouseMove(e) {
        if (this.headerEditor.isDragging) {
            this.drag(e);
            return;
        }
        
        // Update cursor based on what's under the mouse
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to canvas coordinates
        const canvasX = (x / rect.width) * this.canvas.width;
        const canvasY = (y / rect.height) * this.canvas.height;
        
        // Check if mouse is in pfp area
        const pfpRadius = 100;
        const pfpCenterX = 130;
        const pfpCenterY = 130;
        
        const distanceFromPfpCenter = Math.sqrt(
            Math.pow(canvasX - pfpCenterX, 2) + Math.pow(canvasY - pfpCenterY, 2)
        );
        
        if (distanceFromPfpCenter <= pfpRadius) {
            // Mouse is in pfp area
            this.canvas.style.cursor = this.headerEditor.pfpImage ? 'grab' : 'pointer';
        } else {
            // Mouse is in header area
            this.canvas.style.cursor = this.headerEditor.headerImage ? 'grab' : 'pointer';
        }
    }

    startDrag(e) {
        this.headerEditor.hasDragged = false; // Reset drag flag at start
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to canvas coordinates
        const canvasX = (x / rect.width) * this.canvas.width;
        const canvasY = (y / rect.height) * this.canvas.height;
        
        // Check if click is in pfp area - using SoundCloud spec positioning
        const pfpRadius = 100; // 200px radius in export (400px diameter), scaled down for preview
        const pfpCenterX = 130; // 60px + 200px from left edge in export, scaled down for preview
        const pfpCenterY = 130; // 60px + 200px from top edge in export, scaled down for preview
        
        const distanceFromPfpCenter = Math.sqrt(
            Math.pow(canvasX - pfpCenterX, 2) + Math.pow(canvasY - pfpCenterY, 2)
        );
        
        if (distanceFromPfpCenter <= pfpRadius && this.headerEditor.pfpImage) {
            this.headerEditor.dragTarget = 'pfp';
            this.headerEditor.isDragging = true;
        } else if (this.headerEditor.headerImage) {
            this.headerEditor.dragTarget = 'header';
            this.headerEditor.isDragging = true;
        }
        
        if (this.headerEditor.isDragging) {
            this.headerEditor.lastX = e.clientX - rect.left;
            this.headerEditor.lastY = e.clientY - rect.top;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    drag(e) {
        if (!this.headerEditor.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const deltaX = currentX - this.headerEditor.lastX;
        const deltaY = currentY - this.headerEditor.lastY;
        
        // Set flag that actual dragging occurred
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            this.headerEditor.hasDragged = true;
        }
        
        if (this.headerEditor.dragTarget === 'header') {
            this.headerEditor.headerOffsetX += deltaX;
            this.headerEditor.headerOffsetY += deltaY;
        } else if (this.headerEditor.dragTarget === 'pfp') {
            this.headerEditor.pfpOffsetX += deltaX;
            this.headerEditor.pfpOffsetY += deltaY;
        }
        
        this.headerEditor.lastX = currentX;
        this.headerEditor.lastY = currentY;
        
        this.headerEditor.renderer.drawCanvas();
    }

    endDrag() {
        this.headerEditor.isDragging = false;
        this.headerEditor.dragTarget = null;
        
        // Reset cursor based on current mouse position
        // We'll let the next mousemove event handle this, or set a default
        const rect = this.canvas.getBoundingClientRect();
        // Default to grab if we have images, otherwise pointer
        if (this.headerEditor.headerImage || this.headerEditor.pfpImage) {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'pointer';
        }
    }
}