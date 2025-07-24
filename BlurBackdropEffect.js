export class BlurBackdropEffect {
    static apply(ctx, pfpX, pfpY, pfpRadius, blurIntensity, isExport = false) {
        // If blur intensity is at minimum, don't apply any effect
        if (blurIntensity <= 1) {
            return;
        }

        // Get the current canvas image data for the area behind the pfp
        const imageData = ctx.getImageData(pfpX - pfpRadius, pfpY - pfpRadius, pfpRadius * 2, pfpRadius * 2);
        const data = imageData.data;
        const width = pfpRadius * 2;
        const height = pfpRadius * 2;
        
        // Create new image data for the blurred image
        const blurredImageData = ctx.createImageData(width, height);
        const blurredData = blurredImageData.data;
        
        // Scale blur radius based on intensity and export mode
        const maxBlurRadius = isExport ? 90 : 18;
        const blurRadius = Math.floor((blurIntensity - 1) / 19 * maxBlurRadius);
        
        // Calculate opacity based on intensity (fade in the effect)
        const opacity = Math.min(1, (blurIntensity - 1) / 19);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Calculate distance from center to only blur inside circle
                const dx = x - pfpRadius;
                const dy = y - pfpRadius;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= pfpRadius && blurRadius > 0) {
                    let r = 0, g = 0, b = 0, a = 0;
                    let count = 0;
                    
                    // Sample surrounding pixels for blur
                    for (let by = -blurRadius; by <= blurRadius; by++) {
                        for (let bx = -blurRadius; bx <= blurRadius; bx++) {
                            const sx = Math.max(0, Math.min(width - 1, x + bx));
                            const sy = Math.max(0, Math.min(height - 1, y + by));
                            const sampleIndex = (sy * width + sx) * 4;
                            
                            r += data[sampleIndex];
                            g += data[sampleIndex + 1];
                            b += data[sampleIndex + 2];
                            a += data[sampleIndex + 3];
                            count++;
                        }
                    }
                    
                    const targetIndex = (y * width + x) * 4;
                    const originalIndex = targetIndex;
                    
                    // Blend between original and blurred based on opacity
                    blurredData[targetIndex] = data[originalIndex] * (1 - opacity) + (r / count) * opacity;
                    blurredData[targetIndex + 1] = data[originalIndex + 1] * (1 - opacity) + (g / count) * opacity;
                    blurredData[targetIndex + 2] = data[originalIndex + 2] * (1 - opacity) + (b / count) * opacity;
                    blurredData[targetIndex + 3] = data[originalIndex + 3] * (1 - opacity) + (a / count) * opacity;
                } else {
                    // Copy original pixel if outside circle or no blur
                    const index = (y * width + x) * 4;
                    blurredData[index] = data[index];
                    blurredData[index + 1] = data[index + 1];
                    blurredData[index + 2] = data[index + 2];
                    blurredData[index + 3] = data[index + 3];
                }
            }
        }
        
        // Put the blurred image data back onto the canvas
        ctx.putImageData(blurredImageData, pfpX - pfpRadius, pfpY - pfpRadius);
    }
}