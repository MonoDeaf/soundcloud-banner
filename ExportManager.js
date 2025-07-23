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
            this.applyDisplacementEffectExport(pfpCtx, 500, 500, 500); // Center at 500,500 with 500px radius for 1000x1000 canvas
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
            const text = "BLCK CLD COLLECTIVE";
            const exportPfpRadius = 400; // Radius for 1000x1000 canvas
            const textRadius = exportPfpRadius - 30; // Distance from center to text (inside circle, moved closer to border)
            const fontSize = 56; // Significantly increased font size for export visibility
            
            pfpCtx.save();
            pfpCtx.font = `${fontSize}px "Funnel Display", sans-serif`;
            pfpCtx.fillStyle = '#f1f1f1';
            pfpCtx.textAlign = 'center';
            pfpCtx.textBaseline = 'middle';
            
            // Calculate angle step between characters
            const angleStep = (Math.PI * 2) / text.length;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const angle = angleStep * i - Math.PI / 2; // Start from top
                
                const x = 500 + Math.cos(angle) * textRadius;
                const y = 500 + Math.sin(angle) * textRadius;
                
                pfpCtx.save();
                pfpCtx.translate(x, y);
                pfpCtx.rotate(angle + Math.PI / 2); // Rotate text to follow circle
                pfpCtx.fillText(char, 0, 0);
                pfpCtx.restore();
            }
            
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

    applyDisplacementEffectExport(ctx, pfpX, pfpY, pfpRadius) {
        // Get the current canvas image data for the area behind the pfp
        const imageData = ctx.getImageData(pfpX - pfpRadius, pfpY - pfpRadius, pfpRadius * 2, pfpRadius * 2);
        const data = imageData.data;
        const width = pfpRadius * 2;
        const height = pfpRadius * 2;
        
        // Create new image data for the displaced image
        const displacedImageData = ctx.createImageData(width, height);
        const displacedData = displacedImageData.data;
        
        // Copy original data first
        for (let i = 0; i < data.length; i++) {
            displacedData[i] = data[i];
        }
        
        // Apply lens distortion effect with smooth glass-like transition
        const lensStrength = 0.25; // Reduced strength for more subtle effect
        const flatRadius = pfpRadius * 0.7; // Larger flat center area (70%)
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Calculate distance from center of the circle
                const dx = x - pfpRadius;
                const dy = y - pfpRadius;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only apply effect inside the circle
                if (distance <= pfpRadius) {
                    let sourceX = x;
                    let sourceY = y;
                    
                    // Only apply displacement if outside the flat center area
                    if (distance > flatRadius) {
                        // Calculate how far we are from the flat area (0 to 1)
                        const borderDistance = (distance - flatRadius) / (pfpRadius - flatRadius);
                        
                        // Use smoother transition functions for more natural glass effect
                        const smoothFactor = 0.5 * (1 - Math.cos(borderDistance * Math.PI)); // Smooth S-curve
                        const distortionFactor = smoothFactor * lensStrength;
                        
                        // Apply gentle lens distortion with smooth falloff
                        const normalizedDistance = distance / pfpRadius;
                        const distortion = 1 + (distortionFactor * Math.sin(normalizedDistance * Math.PI * 0.5));
                        
                        // Calculate source coordinates with smooth displacement
                        sourceX = pfpRadius + (dx * distortion);
                        sourceY = pfpRadius + (dy * distortion);
                    }
                    
                    // Clamp source coordinates to valid bounds
                    sourceX = Math.max(0, Math.min(width - 1, Math.floor(sourceX)));
                    sourceY = Math.max(0, Math.min(height - 1, Math.floor(sourceY)));
                    
                    // Copy pixel data
                    const sourceIndex = (sourceY * width + sourceX) * 4;
                    const targetIndex = (y * width + x) * 4;
                    
                    displacedData[targetIndex] = data[sourceIndex];         // R
                    displacedData[targetIndex + 1] = data[sourceIndex + 1]; // G
                    displacedData[targetIndex + 2] = data[sourceIndex + 2]; // B
                    displacedData[targetIndex + 3] = data[sourceIndex + 3]; // A
                }
            }
        }
        
        // Only put back pixels that are inside the circle to avoid square cutout
        const originalImageData = ctx.getImageData(pfpX - pfpRadius, pfpY - pfpRadius, pfpRadius * 2, pfpRadius * 2);
        const originalData = originalImageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - pfpRadius;
                const dy = y - pfpRadius;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= pfpRadius) {
                    const index = (y * width + x) * 4;
                    originalData[index] = displacedData[index];         // R
                    originalData[index + 1] = displacedData[index + 1]; // G
                    originalData[index + 2] = displacedData[index + 2]; // B
                    originalData[index + 3] = displacedData[index + 3]; // A
                }
            }
        }
        
        // Put the selectively modified image data back onto the canvas
        ctx.putImageData(originalImageData, pfpX - pfpRadius, pfpY - pfpRadius);
    }
}