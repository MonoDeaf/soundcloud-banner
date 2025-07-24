import { EffectRenderer } from './EffectRenderer.js';
import { TextRingEffect } from './TextRingEffect.js';
import { DisplacementEffect } from './DisplacementEffect.js';
import { BlurBackdropEffect } from './BlurBackdropEffect.js';

export class ExportManager {
    constructor(headerEditor) {
        this.headerEditor = headerEditor;
    }

    saveImage() {
        // Create a banner export at 2480x520 for full SoundCloud resolution
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        exportCanvas.width = 2480;
        exportCanvas.height = 520;
        
        // Calculate scaling from preview canvas to export canvas
        const scaleX = 2480 / 1240;
        const scaleY = 520 / 254;
        
        exportCtx.fillStyle = '#111111';
        exportCtx.fillRect(0, 0, 2480, 520);
        
        if (this.headerEditor.headerImage) {
            exportCtx.save();
            
            // Apply horizontal flip if needed
            if (this.headerEditor.headerFlipped) {
                exportCtx.scale(-1, 1);
                exportCtx.translate(-2480, 0);
            }
            
            // Calculate the scale needed to cover the export canvas while maintaining aspect ratio
            const exportCanvasAspect = 2480 / 520;
            const imageAspect = this.headerEditor.headerImage.width / this.headerEditor.headerImage.height;
            
            let baseScale;
            if (imageAspect > exportCanvasAspect) {
                // Image is wider than canvas - scale based on height
                baseScale = 520 / this.headerEditor.headerImage.height;
            } else {
                // Image is taller than canvas - scale based on width
                baseScale = 2480 / this.headerEditor.headerImage.width;
            }
            
            // Apply user's zoom factor on top of the cover scale
            const totalScale = baseScale * this.headerEditor.headerScale;
            const scaledWidth = this.headerEditor.headerImage.width * totalScale;
            const scaledHeight = this.headerEditor.headerImage.height * totalScale;
            
            // Position from top-left corner with scaled offsets
            const x = 0 + (this.headerEditor.headerOffsetX * scaleX);
            const y = 0 + (this.headerEditor.headerOffsetY * scaleY);
            
            exportCtx.drawImage(this.headerEditor.headerImage, x, y, scaledWidth, scaledHeight);
            
            exportCtx.restore();
        }
        
        // Export profile picture positioning (scaled up)
        const exportPfpRadius = 200; // Full 400px radius in export
        const exportPfpX = 260; // 120px + 400px from left edge in export
        const exportPfpY = 260; // 120px + 400px from top edge in export
        
        // Draw shadow behind pfp in export if enabled
        if (this.headerEditor.pfpShadowVisible) {
            exportCtx.save();
            
            // Create shadow with soft edges (scaled for export)
            const shadowOffsetX = 16;
            const shadowOffsetY = 24;
            const shadowBlur = 40;
            
            // Create gradient for soft shadow
            const gradient = exportCtx.createRadialGradient(
                exportPfpX + shadowOffsetX, exportPfpY + shadowOffsetY, 0,
                exportPfpX + shadowOffsetX, exportPfpY + shadowOffsetY, exportPfpRadius + shadowBlur
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            exportCtx.fillStyle = gradient;
            exportCtx.beginPath();
            exportCtx.arc(exportPfpX + shadowOffsetX, exportPfpY + shadowOffsetY, exportPfpRadius + shadowBlur, 0, Math.PI * 2);
            exportCtx.fill();
            
            exportCtx.restore();
        }
        
        // Download the banner
        const bannerLink = document.createElement('a');
        bannerLink.download = 'soundcloud-header.png';
        bannerLink.href = exportCanvas.toDataURL('image/png');
        document.body.appendChild(bannerLink);
        bannerLink.click();
        document.body.removeChild(bannerLink);

        // Create profile picture export as full 1000x1000 square
        const pfpCanvas = document.createElement('canvas');
        const pfpCtx = pfpCanvas.getContext('2d');
        pfpCanvas.width = 1000;
        pfpCanvas.height = 1000;
        
        // Fill background
        pfpCtx.fillStyle = '#1a1a1a';
        pfpCtx.fillRect(0, 0, 1000, 1000);
        
        // Draw header image as background if it exists
        if (this.headerEditor.headerImage) {
            // Crop the exact banner area behind the PFP from the already-rendered exportCanvas
            const bannerBgX = 58; // Offset by 2px to center the larger capture area
            const bannerBgY = 48; // Offset by 2px to center the larger capture area (10px upward + 2px for centering)
            const bannerBgSize = 404; // Increased from 400 to 404 (1% zoom out)
            pfpCtx.drawImage(
                exportCanvas,
                bannerBgX, bannerBgY, bannerBgSize, bannerBgSize,
                0, 0, 1000, 1000
            );
        }

        // Apply displacement effect if selected and header image exists
        if (this.headerEditor.borderEffect === 'displacement' && this.headerEditor.headerImage) {
            DisplacementEffect.apply(exportCtx, exportPfpX, exportPfpY, exportPfpRadius);
        }

        // Apply blur backdrop effect if selected and header image exists
        if (this.headerEditor.borderEffect === 'blur-backdrop' && this.headerEditor.headerImage) {
            BlurBackdropEffect.apply(exportCtx, exportPfpX, exportPfpY, exportPfpRadius, this.headerEditor.blurIntensity, true);
        }
        
        // Draw pfp image on top if it exists
        if (this.headerEditor.pfpImage) {
            // Scale factor from preview (200px diameter) to export PFP area (400px diameter) to final export (1000px)
            // Preview pfp radius: 100px
            // Full banner pfp radius: 200px  
            // Export canvas: 1000x1000 (so radius of 500px for full canvas)
            const previewToFullScale = 2; // preview radius 100 -> full radius 200
            const fullToExportScale = 2.5; // full 400x400 area -> export 1000x1000
            const totalPfpScale = previewToFullScale * fullToExportScale;
            
            const exportScaledWidth = this.headerEditor.pfpImage.width * this.headerEditor.pfpScale * totalPfpScale;
            const exportScaledHeight = this.headerEditor.pfpImage.height * this.headerEditor.pfpScale * totalPfpScale;
            
            // Center the pfp image in the 1000x1000 canvas with offsets
            const exportX = 500 - exportScaledWidth / 2 + (this.headerEditor.pfpOffsetX * totalPfpScale);
            const exportY = 500 - exportScaledHeight / 2 + (this.headerEditor.pfpOffsetY * totalPfpScale);
            
            pfpCtx.drawImage(this.headerEditor.pfpImage, exportX, exportY, exportScaledWidth, exportScaledHeight);
        }

        // Draw border effect on export pfp
        if (this.headerEditor.borderEffect === 'blck-cld-ring') {
            TextRingEffect.drawTextRingExport(pfpCtx, this.headerEditor, 500, 500, 500);
        }

        // Draw inner border effect on export pfp if selected
        if (this.headerEditor.borderEffect === 'border') {
            pfpCtx.save();
            pfpCtx.strokeStyle = this.headerEditor.borderColor;
            pfpCtx.lineWidth = 15; // Scaled up for export (6px * 2.5 scale factor)
            pfpCtx.beginPath();
            pfpCtx.arc(500, 500, 500 - 7.5, 0, Math.PI * 2); // Offset by half line width to keep inside
            pfpCtx.stroke();
            pfpCtx.restore();
        }
        
        // Download the profile picture
        const pfpLink = document.createElement('a');
        pfpLink.download = 'soundcloud-profile.png';
        pfpLink.href = pfpCanvas.toDataURL('image/png');
        document.body.appendChild(pfpLink);
        setTimeout(() => {
            pfpLink.click();
            document.body.removeChild(pfpLink);
        }, 100);
    }
}