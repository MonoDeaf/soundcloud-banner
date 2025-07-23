export class CanvasRenderer {
    constructor(headerEditor) {
        this.headerEditor = headerEditor;
        this.canvas = headerEditor.canvas;
        this.ctx = headerEditor.ctx;
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    drawCanvas() {
        // Draw base background
        this.ctx.fillStyle = '#111111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw striped pattern as header background - only when header image is present
        if (this.headerEditor.headerImage) {
            this.ctx.save();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            
            // Draw diagonal stripes with increased spacing
            const stripeSpacing = 25;
            const canvasMax = Math.max(this.canvas.width, this.canvas.height);
            
            this.ctx.beginPath();
            for (let i = -canvasMax; i < canvasMax + this.canvas.width; i += stripeSpacing) {
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i + this.canvas.height, this.canvas.height);
            }
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Draw header image with cover behavior
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
            // Draw header placeholder
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2 - 15; // Adjusted for new height
            const iconSize = 40; // Smaller icon for smaller canvas
            
            const svgData = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M8 19.385V9.61q0-.671.475-1.14T9.621 8h9.764q.67 0 1.143.472q.472.472.472 1.144v6.961L16.577 21H9.615q-.67 0-1.143-.472Q8 20.056 8 19.385M3.025 6.596q-.13-.671.258-1.208t1.06-.669l9.619-1.694q.67-.13 1.208.258t.669 1.06l.211 1.273h-1.012l-.213-1.193q-.038-.211-.23-.336T14.17 4L4.52 5.714q-.269.038-.404.25q-.134.211-.096.48l1.596 9.016v1.936q-.342-.167-.581-.475q-.24-.307-.315-.705zM9 9.616v9.769q0 .269.173.442t.443.173H16l4-4V9.616q0-.27-.173-.443T19.385 9h-9.77q-.269 0-.442.173T9 9.616M14 18h1v-3h3v-1h-3v-3h-1v3h-3v1h3z'/%3E%3C/svg%3E`;
            
            const icon = new Image();
            icon.onload = () => {
                this.ctx.drawImage(icon, centerX - iconSize/2, centerY - iconSize/2, iconSize, iconSize);
                
                this.ctx.fillStyle = '#666';
                this.ctx.font = '24px "Funnel Display", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Header Image Here', centerX, centerY + iconSize/2 + 30);
            };
            icon.src = svgData;
        }

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
            this.applyDisplacementEffect(pfpX, pfpY, pfpRadius);
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
            // Fill circular background when no pfp image
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.beginPath();
            this.ctx.arc(pfpX, pfpY, pfpRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw pfp placeholder within the circular area
            const pfpIconSize = 40; // Smaller for new canvas size
            const adjustedPfpY = pfpY - 12; // Less adjustment needed
            const svgData = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M8 19.385V9.61q0-.671.475-1.14T9.621 8h9.764q.67 0 1.143.472q.472.472.472 1.144v6.961L16.577 21H9.615q-.67 0-1.143-.472Q8 20.056 8 19.385M3.025 6.596q-.13-.671.258-1.208t1.06-.669l9.619-1.694q.67-.13 1.208.258t.669 1.06l.211 1.273h-1.012l-.213-1.193q-.038-.211-.23-.336T14.17 4L4.52 5.714q-.269.038-.404.25q-.134.211-.096.48l1.596 9.016v1.936q-.342-.167-.581-.475q-.24-.307-.315-.705zM9 9.616v9.769q0 .269.173.442t.443.173H16l4-4V9.616q0-.27-.173-.443T19.385 9h-9.77q-.269 0-.442.173T9 9.616M14 18h1v-3h3v-1h-3v-3h-1v3h-3v1h3z'/%3E%3C/svg%3E`;
            
            const pfpIcon = new Image();
            pfpIcon.onload = () => {
                this.ctx.drawImage(pfpIcon, pfpX - pfpIconSize/2, adjustedPfpY - pfpIconSize/2, pfpIconSize, pfpIconSize);
                
                this.ctx.fillStyle = '#666';
                this.ctx.font = '24px "Funnel Display", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Logo Here', pfpX, adjustedPfpY + pfpIconSize/2 + 25);
            };
            pfpIcon.src = svgData;
        }
        
        // Restore context
        this.ctx.restore();
        
        // Draw profile picture border only if visible
        if (this.headerEditor.pfpBorderVisible) {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2; // Thinner border for smaller canvas
            this.ctx.beginPath();
            this.ctx.arc(pfpX, pfpY, pfpRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw border effect
        this.drawBorderEffect(pfpX, pfpY, pfpRadius);

        // Draw example account details to the right of pfp (visual reference only) - only when header image is present
        if (this.headerEditor.headerImage) {
            const detailsStartX = pfpX + pfpRadius + 60; // Adjust based on corrected pfp position
            const detailsStartY = pfpY - 40; // Adjusted for better spacing
            
            // Artist name skeleton with dark background and rounded corners
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.drawRoundedRect(this.ctx, detailsStartX - 20, detailsStartY - 20, 400, 40, 4);
            
            // Location skeleton with dark background and rounded corners  
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.drawRoundedRect(this.ctx, detailsStartX - 20, detailsStartY + 25, 350, 30, 4);
            
            // Artist Pro badge skeleton with rounded corners
            const badgeY = detailsStartY + 70; // Reduced spacing from location
            
            // Draw dark background for artist pro badge skeleton
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.drawRoundedRect(this.ctx, detailsStartX - 20, badgeY - 10, 200, 25, 4);
        }
    }

    drawBorderEffect(pfpX, pfpY, pfpRadius) {
        if (this.headerEditor.borderEffect === 'blck-cld-ring') {
            const text = "BLCK CLD COLLECTIVE";
            const textRadius = pfpRadius - 15; // Distance from center to text (inside circle)
            const fontSize = 14; // Scaled down for preview
            
            this.ctx.save();
            this.ctx.font = `${fontSize}px "Funnel Display", sans-serif`;
            this.ctx.fillStyle = '#f1f1f1';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Calculate angle step between characters
            const angleStep = (Math.PI * 2) / text.length;
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const angle = angleStep * i - Math.PI / 2; // Start from top
                
                const x = pfpX + Math.cos(angle) * textRadius;
                const y = pfpY + Math.sin(angle) * textRadius;
                
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + Math.PI / 2); // Rotate text to follow circle
                this.ctx.fillText(char, 0, 0);
                this.ctx.restore();
            }
            
            this.ctx.restore();
        }
    }

    applyDisplacementEffect(pfpX, pfpY, pfpRadius) {
        // Get the current canvas image data for the area behind the pfp
        const imageData = this.ctx.getImageData(pfpX - pfpRadius, pfpY - pfpRadius, pfpRadius * 2, pfpRadius * 2);
        const data = imageData.data;
        const width = pfpRadius * 2;
        const height = pfpRadius * 2;
        
        // Create new image data for the displaced image
        const displacedImageData = this.ctx.createImageData(width, height);
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
        const originalImageData = this.ctx.getImageData(pfpX - pfpRadius, pfpY - pfpRadius, pfpRadius * 2, pfpRadius * 2);
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
        this.ctx.putImageData(originalImageData, pfpX - pfpRadius, pfpY - pfpRadius);
    }
}