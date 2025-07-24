export class DisplacementEffect {
    static apply(ctx, pfpX, pfpY, pfpRadius) {
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