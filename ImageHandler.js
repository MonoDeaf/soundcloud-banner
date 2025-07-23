export class ImageHandler {
    constructor(headerEditor) {
        this.headerEditor = headerEditor;
    }

    handleHeaderImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.headerEditor.headerImage = img;
                this.resetHeaderPosition();
                this.headerEditor.renderer.drawCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handlePfpImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.headerEditor.pfpImage = img;
                this.resetPfpPosition();
                this.headerEditor.renderer.drawCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resetHeaderPosition() {
        this.headerEditor.headerScale = 1;
        this.headerEditor.headerOffsetX = 0;
        this.headerEditor.headerOffsetY = 0;
        this.headerEditor.headerFlipped = false;
    }

    resetPfpPosition() {
        // Calculate appropriate initial scale for pfp image
        if (this.headerEditor.pfpImage) {
            const pfpRadius = 100; // SoundCloud spec: 200px radius in export, scaled down for preview
            
            // Calculate scale to fit image nicely in circular area
            const maxDimension = Math.max(this.headerEditor.pfpImage.width, this.headerEditor.pfpImage.height);
            this.headerEditor.pfpScale = (pfpRadius * 2) / maxDimension;
            
            // Ensure minimum scale for very large images
            this.headerEditor.pfpScale = Math.max(0.1, this.headerEditor.pfpScale);
        } else {
            this.headerEditor.pfpScale = 1;
        }
        
        this.headerEditor.pfpOffsetX = 0;
        this.headerEditor.pfpOffsetY = 0;
    }

    openHeaderFileDialog() {
        document.getElementById('headerImageUpload').click();
    }

    openPfpFileDialog() {
        document.getElementById('pfpImageUpload').click();
    }
}