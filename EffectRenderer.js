import { TextRingEffect } from './TextRingEffect.js';
import { DisplacementEffect } from './DisplacementEffect.js';
import { BlurBackdropEffect } from './BlurBackdropEffect.js';

export class EffectRenderer {
    static drawBorderEffect(ctx, headerEditor, pfpX, pfpY, pfpRadius) {
        if (headerEditor.borderEffect === 'blck-cld-ring') {
            TextRingEffect.drawTextRing(ctx, headerEditor, pfpX, pfpY, pfpRadius);
        }
    }

    static applyDisplacementEffect(ctx, pfpX, pfpY, pfpRadius) {
        DisplacementEffect.apply(ctx, pfpX, pfpY, pfpRadius);
    }

    static applyDisplacementEffectExport(ctx, pfpX, pfpY, pfpRadius) {
        DisplacementEffect.apply(ctx, pfpX, pfpY, pfpRadius);
    }

    static applyBlurBackdropEffect(ctx, pfpX, pfpY, pfpRadius, blurIntensity) {
        BlurBackdropEffect.apply(ctx, pfpX, pfpY, pfpRadius, blurIntensity, false);
    }

    static applyBlurBackdropEffectExport(ctx, pfpX, pfpY, pfpRadius, blurIntensity) {
        BlurBackdropEffect.apply(ctx, pfpX, pfpY, pfpRadius, blurIntensity, true);
    }
}