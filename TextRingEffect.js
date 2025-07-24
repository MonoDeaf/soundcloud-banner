export class TextRingEffect {
    static drawTextRing(ctx, headerEditor, pfpX, pfpY, pfpRadius) {
        const text = "BLCK CLD COLLECTIVE";
        const textRadius = pfpRadius - 15; // Distance from center to text (inside circle)
        const fontSize = 14; // Scaled down for preview
        
        ctx.save();
        
        // Apply blend mode if enabled
        if (headerEditor.textRingBlendMode) {
            ctx.globalCompositeOperation = 'difference';
        }
        
        ctx.font = `${fontSize}px "Funnel Display", sans-serif`;
        ctx.fillStyle = '#f1f1f1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate angle step between characters
        const angleStep = (Math.PI * 2) / text.length;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const angle = angleStep * i - Math.PI / 2; // Start from top
            
            const x = pfpX + Math.cos(angle) * textRadius;
            const y = pfpY + Math.sin(angle) * textRadius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2); // Rotate text to follow circle
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
        
        ctx.restore();
    }

    static drawTextRingExport(ctx, headerEditor, pfpX, pfpY, pfpRadius) {
        const text = "BLCK CLD COLLECTIVE";
        const textRadius = pfpRadius - 60; // Distance from center to text (increased from exportPfpRadius - 30)
        const fontSize = 56; // Significantly increased font size for export visibility
        
        ctx.save();
        
        // Apply blend mode if enabled
        if (headerEditor.textRingBlendMode) {
            ctx.globalCompositeOperation = 'difference';
        }
        
        ctx.font = `${fontSize}px "Funnel Display", sans-serif`;
        ctx.fillStyle = '#f1f1f1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate angle step between characters
        const angleStep = (Math.PI * 2) / text.length;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const angle = angleStep * i - Math.PI / 2; // Start from top
            
            const x = pfpX + Math.cos(angle) * textRadius;
            const y = pfpY + Math.sin(angle) * textRadius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2); // Rotate text to follow circle
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
        
        ctx.restore();
    }
}