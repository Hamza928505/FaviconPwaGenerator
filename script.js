// State Management
let uploadedImage = null;
let generatedIcons = [];
let editorRotation = 0;
let editorZoom = 1;
let isCropMode = false;
let cropStart = null;
let cropEnd = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('previewContainer');
const editBtn = document.getElementById('editBtn');
const generateBtn = document.getElementById('generateBtn');
const appNameInput = document.getElementById('appName');
const appShortNameInput = document.getElementById('appShortName');
const themeColorInput = document.getElementById('themeColor');
const themeColorText = document.getElementById('themeColorText');
const bgColorInput = document.getElementById('bgColor');
const bgColorText = document.getElementById('bgColorText');
const transparentCheckbox = document.getElementById('transparent');
const editorModal = document.getElementById('editorModal');
const editorCanvas = document.getElementById('editorCanvas');
const rotationSlider = document.getElementById('rotationSlider');
const zoomSlider = document.getElementById('zoomSlider');
const rotationValue = document.getElementById('rotationValue');
const zoomValue = document.getElementById('zoomValue');
const iconsContainer = document.getElementById('iconsContainer');
const iconsList = document.getElementById('iconsList');
const emptyState = document.getElementById('emptyState');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const codeSection = document.getElementById('codeSection');
const deviceSection = document.getElementById('deviceSection');
const htmlSnippet = document.getElementById('htmlSnippet');
const manifestSnippet = document.getElementById('manifestSnippet');
const cropSensitivitySlider = document.getElementById('cropSensitivitySlider');
const cropSensitivityValue = document.getElementById('cropSensitivityValue');

// Event Listeners
uploadArea.addEventListener('click', () => imageInput.click());
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(0, 217, 255, 0.1)';
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
});

editBtn.addEventListener('click', openEditor);
generateBtn.addEventListener('click', generateIcons);
downloadZipBtn.addEventListener('click', downloadAllAsZip);

rotationSlider.addEventListener('input', (e) => {
    editorRotation = parseFloat(e.target.value);
    rotationValue.textContent = editorRotation;
    drawEditorImage();
});

zoomSlider.addEventListener('input', (e) => {
    editorZoom = parseFloat(e.target.value);
    zoomValue.textContent = editorZoom.toFixed(1);
    drawEditorImage();
});

cropSensitivitySlider.addEventListener('input', (e) => {
    cropSensitivityValue.textContent = e.target.value;
});

themeColorInput.addEventListener('change', (e) => {
    themeColorText.value = e.target.value;
});

themeColorText.addEventListener('change', (e) => {
    themeColorInput.value = e.target.value;
});

bgColorInput.addEventListener('change', (e) => {
    bgColorText.value = e.target.value;
});

bgColorText.addEventListener('change', (e) => {
    bgColorInput.value = e.target.value;
});

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Functions
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = e.target.result;
        preview.src = uploadedImage;
        previewContainer.style.display = 'block';
        uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function openEditor() {
    if (!uploadedImage) return;
    editorRotation = 0;
    editorZoom = 1;
    rotationSlider.value = 0;
    zoomSlider.value = 1;
    rotationValue.textContent = '0';
    zoomValue.textContent = '1.0';
    editorModal.style.display = 'flex';
    setTimeout(() => drawEditorImage(), 100);
}

function closeEditor() {
    editorModal.style.display = 'none';
    isCropMode = false;
}

function drawEditorImage() {
    const canvas = editorCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((editorRotation * Math.PI) / 180);
        ctx.scale(editorZoom, editorZoom);
        ctx.translate(-img.width / 2, -img.height / 2);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
    };
    img.src = uploadedImage;
}

function rotateLeft() {
    editorRotation = (editorRotation - 90 + 360) % 360;
    rotationSlider.value = editorRotation;
    rotationValue.textContent = editorRotation;
    drawEditorImage();
}

function rotateRight() {
    editorRotation = (editorRotation + 90) % 360;
    rotationSlider.value = editorRotation;
    rotationValue.textContent = editorRotation;
    drawEditorImage();
}

function toggleCropMode() {
    isCropMode = !isCropMode;
    if (isCropMode) {
        editorCanvas.style.cursor = 'crosshair';
    } else {
        editorCanvas.style.cursor = 'default';
        cropStart = null;
        cropEnd = null;
    }
}

function applyCrop() {
    if (!cropStart || !cropEnd) {
        alert('Please select a crop area');
        return;
    }

    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    if (width === 0 || height === 0) {
        alert('Please select a valid crop area');
        return;
    }

    const ctx = editorCanvas.getContext('2d');
    const imageData = ctx.getImageData(x, y, width, height);
    editorCanvas.width = width;
    editorCanvas.height = height;
    ctx.putImageData(imageData, 0, 0);

    isCropMode = false;
    cropStart = null;
    cropEnd = null;
}

function applySmartCrop() {
    const sensitivity = parseFloat(cropSensitivitySlider.value) / 100;
    const canvas = editorCanvas;
    const ctx = canvas.getContext('2d');
    
    try {
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const bgColor = getBackgroundColor(pixels);
        
        if (!bgColor) {
            alert('Could not detect background color');
            return;
        }

        const bbox = findBoundingBox(canvas, bgColor, sensitivity);
        if (!bbox) {
            alert('Could not find object in image');
            return;
        }

        const padding = Math.min(bbox.width, bbox.height) * 0.1;
        const cropX = Math.max(0, bbox.x - padding);
        const cropY = Math.max(0, bbox.y - padding);
        const cropWidth = Math.min(canvas.width - cropX, bbox.width + padding * 2);
        const cropHeight = Math.min(canvas.height - cropY, bbox.height + padding * 2);

        const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        ctx.putImageData(imageData, 0, 0);

        alert('Smart crop applied!');
    } catch (error) {
        alert('Smart crop failed: ' + error.message);
    }
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function getBackgroundColor(pixels) {
    const colorFreq = new Map();

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 128) continue;

        const key = `${r},${g},${b}`;
        colorFreq.set(key, (colorFreq.get(key) || 0) + 1);
    }

    if (colorFreq.size === 0) return null;

    const [mostCommonColor] = Array.from(colorFreq.entries()).sort((a, b) => b[1] - a[1])[0];
    const [r, g, b] = mostCommonColor.split(',').map(Number);
    return { r, g, b };
}

function findBoundingBox(canvas, bgColor, sensitivity) {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let found = false;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 128) continue;

        const pixelIndex = i / 4;
        const y = Math.floor(pixelIndex / canvas.width);
        const x = pixelIndex % canvas.width;

        const pixelHsl = rgbToHsl(r, g, b);
        const bgHsl = rgbToHsl(bgColor.r, bgColor.g, bgColor.b);

        const hDiff = Math.abs(pixelHsl.h - bgHsl.h);
        const sDiff = Math.abs(pixelHsl.s - bgHsl.s);
        const lDiff = Math.abs(pixelHsl.l - bgHsl.l);

        const threshold = (1 - sensitivity) * 100;

        if (!(hDiff < 30 && sDiff < threshold && lDiff < threshold)) {
            found = true;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    if (!found) return null;

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
    };
}

function applyAndContinue() {
    const dataUrl = editorCanvas.toDataURL('image/png');
    uploadedImage = dataUrl;
    preview.src = uploadedImage;
    closeEditor();
}

editorCanvas.addEventListener('mousedown', (e) => {
    if (!isCropMode) return;
    const rect = editorCanvas.getBoundingClientRect();
    cropStart = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
});

editorCanvas.addEventListener('mousemove', (e) => {
    if (!isCropMode || !cropStart) return;
    const rect = editorCanvas.getBoundingClientRect();
    cropEnd = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
});

function generateIcons() {
    if (!uploadedImage) {
        alert('Please upload an image first');
        return;
    }

    generatedIcons = [];
    const sizes = [16, 32, 180, 192, 512];
    const img = new Image();

    img.onload = () => {
        sizes.forEach((size) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // Draw background
                if (transparentCheckbox.checked) {
                    ctx.clearRect(0, 0, size, size);
                } else {
                    ctx.fillStyle = bgColorInput.value;
                    ctx.fillRect(0, 0, size, size);
                }

                // Calculate dimensions
                const scale = Math.min(size / img.width, size / img.height);
                const x = (size - img.width * scale) / 2;
                const y = (size - img.height * scale) / 2;

                // Draw image
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        generatedIcons.push({
                            size,
                            blob,
                            dataUrl: canvas.toDataURL('image/png'),
                        });

                        if (generatedIcons.length === sizes.length) {
                            displayGeneratedIcons();
                            updateFavicon();
                            generateCodeSnippets();
                            updateDevicePreviews();
                        }
                    }
                }, 'image/png');
            }
        });
    };

    img.src = uploadedImage;
}

function displayGeneratedIcons() {
    iconsList.innerHTML = '';
    generatedIcons.forEach((icon) => {
        const item = document.createElement('div');
        item.className = 'icon-item animate-fade-in';
        item.innerHTML = `
            <div class="icon-item-info">
                <img src="${icon.dataUrl}" alt="${icon.size}x${icon.size}" class="icon-item-image">
                <div class="icon-item-text">
                    <h4>${icon.size}×${icon.size}</h4>
                    <p>${icon.size === 16 || icon.size === 32 ? 'Favicon' : icon.size === 180 ? 'iOS' : 'PWA'}</p>
                </div>
            </div>
            <button class="btn btn-small" onclick="downloadIcon(${generatedIcons.indexOf(icon)})">📥</button>
        `;
        iconsList.appendChild(item);
    });

    emptyState.style.display = 'none';
    iconsContainer.style.display = 'block';
}

function downloadIcon(index) {
    const icon = generatedIcons[index];
    const link = document.createElement('a');
    link.href = icon.dataUrl;
    link.download = `icon-${icon.size}.png`;
    link.click();
}

function downloadAllAsZip() {
    const zip = new JSZip();
    generatedIcons.forEach((icon) => {
        zip.file(`icon-${icon.size}.png`, icon.blob);
    });
    zip.generateAsync({ type: 'blob' }).then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'icons.zip';
        link.click();
    });
}

function generateCodeSnippets() {
    const htmlCode = `<!-- Favicons -->
<link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">

<!-- iOS -->
<link rel="apple-touch-icon" href="/icons/icon-180.png">

<!-- PWA -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="${themeColorInput.value}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${appNameInput.value}">`;

    const manifest = {
        name: appNameInput.value,
        short_name: appShortNameInput.value,
        start_url: '/',
        display: 'standalone',
        background_color: bgColorInput.value,
        theme_color: themeColorInput.value,
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };

    htmlSnippet.value = htmlCode;
    manifestSnippet.value = JSON.stringify(manifest, null, 2);
    codeSection.style.display = 'block';
}

function updateDevicePreviews() {
    const icon192 = generatedIcons.find((i) => i.size === 192)?.dataUrl || '';
    const icon512 = generatedIcons.find((i) => i.size === 512)?.dataUrl || '';

    document.getElementById('mobileIcon').src = icon192;
    document.getElementById('mobileName').textContent = appNameInput.value;
    document.getElementById('desktopIcon').src = icon512;
    document.getElementById('desktopName').textContent = appNameInput.value;

    deviceSection.style.display = 'block';
}

function updateFavicon() {
    const icon = generatedIcons.find((i) => i.size === 32);
    if (icon) {
        let link = document.querySelector('link[rel="icon"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = icon.dataUrl;
    }
}

function copyToClipboard(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
}

function downloadFile(elementId, filename) {
    const textarea = document.getElementById(elementId);
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(textarea.value)}`;
    link.download = filename;
    link.click();
}