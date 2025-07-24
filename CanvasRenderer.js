import { DrawingUtils } from './DrawingUtils.js';
import { EffectRenderer } from './EffectRenderer.js';
import { PlaceholderRenderer } from './PlaceholderRenderer.js';

export class CanvasRenderer {
    constructor(headerEditor) {
        this.headerEditor = headerEditor;
        this.canvas = headerEditor.canvas;
        this.ctx = headerEditor.ctx;
    }

    drawCanvas() {
        this.drawBackground();
        this.drawHeaderImage();
        this.drawProfilePicture();
        this.drawProfileDetails();
    }

    drawBackground() {
        // Draw base background
        this.ctx.fillStyle = '#111111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw striped pattern as header background - only when header image is present
        if (this.headerEditor.headerImage) {
            this.ctx.save();
            this.ctx.fillStyle = '#ff000020';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.strokeStyle = '#ff4a00';
            this.ctx.lineWidth = 1;
            
            // Draw diagonal stripes with increased spacing
            const stripeSpacing = 18;
            const canvasMax = Math.max(this.canvas.width, this.canvas.height);
            
            this.ctx.beginPath();
            for (let i = -canvasMax; i < canvasMax + this.canvas.width; i += stripeSpacing) {
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i + this.canvas.height, this.canvas.height);
            }
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    drawHeaderImage() {
        if (this.headerEditor.headerImage) {
            this.ctx.save();
            
            // Apply horizontal flip if needed
            if (this.headerEditor.headerFlipped) {
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.canvas.width, 0);
            }
            
            // Calculate the scale needed to cover the entire canvas while maintaining aspect ratio
            const canvasAspect = this.canvas.width / this.canvas.height;
            const imageAspect = this.headerEditor.headerImage.width / this.headerEditor.headerImage.height;
            
            let baseScale;
            if (imageAspect > canvasAspect) {
                // Image is wider than canvas - scale based on height
                baseScale = this.canvas.height / this.headerEditor.headerImage.height;
            } else {
                // Image is taller than canvas - scale based on width
                baseScale = this.canvas.width / this.headerEditor.headerImage.width;
            }
            
            // Apply user's zoom factor on top of the cover scale
            const totalScale = baseScale * this.headerEditor.headerScale;
            const scaledWidth = this.headerEditor.headerImage.width * totalScale;
            const scaledHeight = this.headerEditor.headerImage.height * totalScale;
            
            // Position from top-left corner with offsets
            const x = 0 + this.headerEditor.headerOffsetX;
            const y = 0 + this.headerEditor.headerOffsetY;
            
            this.ctx.drawImage(this.headerEditor.headerImage, x, y, scaledWidth, scaledHeight);
            
            this.ctx.restore();
        } else {
            PlaceholderRenderer.drawHeaderPlaceholder(this.ctx, this.canvas);
        }
    }

    drawProfilePicture() {
        // Profile picture area positioning
        const pfpRadius = 100; // 200px radius in export (400px diameter), scaled down for preview
        const pfpX = 130; // 60px + 200px from left edge in export, scaled down for preview
        const pfpY = 130; // 60px + 200px from top edge in export, scaled down for preview

        // Draw shadow behind pfp if enabled
        if (this.headerEditor.pfpShadowVisible) {
            this.ctx.save();
            
            // Create shadow with soft edges
            const shadowOffsetX = 8;
            const shadowOffsetY = 12;
            const shadowBlur = 20;
            
            // Create gradient for soft shadow
            const gradient = this.ctx.createRadialGradient(
                pfpX + shadowOffsetX, pfpY + shadowOffsetY, 0,
                pfpX + shadowOffsetX, pfpY + shadowOffsetY, pfpRadius + shadowBlur
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pfpX + shadowOffsetX, pfpY + shadowOffsetY, pfpRadius + shadowBlur, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }

        // Apply displacement effect if selected and header image exists
        if (this.headerEditor.borderEffect === 'displacement' && this.headerEditor.headerImage) {
            EffectRenderer.applyDisplacementEffect(this.ctx, pfpX, pfpY, pfpRadius);
        }

        // Apply blur backdrop effect if selected and header image exists
        if (this.headerEditor.borderEffect === 'blur-backdrop' && this.headerEditor.headerImage) {
            EffectRenderer.applyBlurBackdropEffect(this.ctx, pfpX, pfpY, pfpRadius, this.headerEditor.blurIntensity);
        }

        // Draw profile picture area with SoundCloud spec positioning
        // Save context for clipping
        this.ctx.save();
        
        // Create circular clipping path
        this.ctx.beginPath();
        this.ctx.arc(pfpX, pfpY, pfpRadius, 0, Math.PI * 2);
        this.ctx.clip();
        
        if (this.headerEditor.pfpImage) {
            // Draw pfp image within the circular area
            const scaledWidth = this.headerEditor.pfpImage.width * this.headerEditor.pfpScale;
            const scaledHeight = this.headerEditor.pfpImage.height * this.headerEditor.pfpScale;
            
            const x = pfpX - scaledWidth / 2 + this.headerEditor.pfpOffsetX;
            const y = pfpY - scaledHeight / 2 + this.headerEditor.pfpOffsetY;
            
            this.ctx.drawImage(this.headerEditor.pfpImage, x, y, scaledWidth, scaledHeight);
        } else {
            PlaceholderRenderer.drawPfpPlaceholder(this.ctx, pfpX, pfpY);
        }
        
        // Restore context
        this.ctx.restore();
        
        // Draw profile picture border only if visible
        if (this.headerEditor.pfpBorderVisible) {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2; // Thinner border for smaller canvas
            this.ctx.setLineDash([8, 4]); // Add dashed pattern
            this.ctx.beginPath();
            this.ctx.arc(pfpX, pfpY, pfpRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]); // Reset line dash
        }

        // Draw border effect
        EffectRenderer.drawBorderEffect(this.ctx, this.headerEditor, pfpX, pfpY, pfpRadius);

        // Draw inner border effect if selected
        if (this.headerEditor.borderEffect === 'border') {
            this.ctx.save();
            this.ctx.strokeStyle = this.headerEditor.borderColor;
            this.ctx.lineWidth = 6;
            this.ctx.beginPath();
            this.ctx.arc(pfpX, pfpY, pfpRadius - 3, 0, Math.PI * 2); // Offset by half line width to keep inside
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    drawProfileDetails() {
        // Draw example account details to the right of pfp (visual reference only) - only when header image is present
        if (this.headerEditor.headerImage) {
            const pfpX = 130;
            const pfpY = 130;
            const pfpRadius = 100;
            const detailsStartX = pfpX + pfpRadius + 60; // Adjust based on corrected pfp position
            const detailsStartY = pfpY - 40; // Adjusted for better spacing
            
            // Artist name skeleton with dark background and rounded corners
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            DrawingUtils.drawRoundedRect(this.ctx, detailsStartX - 20, detailsStartY - 20, 400, 40, 4);
            
            // Location skeleton with dark background and rounded corners  
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            DrawingUtils.drawRoundedRect(this.ctx, detailsStartX - 20, detailsStartY + 25, 350, 30, 4);
            
            // Artist Pro badge skeleton with rounded corners
            const badgeY = detailsStartY + 70; // Reduced spacing from location
            
            // Draw dark background for artist pro badge skeleton
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            DrawingUtils.drawRoundedRect(this.ctx, detailsStartX - 20, badgeY - 10, 200, 25, 4);
        }
    }
}