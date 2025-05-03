document.addEventListener('DOMContentLoaded', function() {
    const svgFileInput = document.getElementById('svgFile');
    const imageNameInput = document.getElementById('imageName');
    const convertBtn = document.getElementById('convertBtn');
    const imagesContainer = document.getElementById('imagesContainer');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const customScalesInput = document.getElementById('customScales');
    const colorOverride = document.getElementById('colorOverride');
    const colorOverrideText = document.getElementById('colorOverrideText');
    const keepAspectRatio = document.getElementById('keepAspectRatio');
    
    // New - Get drop zone element
    const dropZone = document.getElementById('dropZone');
    
    // Scale factors as specified in the requirements
    const scales = [1, 1.25, 1.33, 1.4, 1.5, 1.8, 2, 2.5, 3, 4, 5];
    const baseSize = 16; // 16x16 pixels
    let generatedImages = [];
    
    // Sync color inputs
    colorOverride.addEventListener('input', function() {
        colorOverrideText.value = colorOverride.value;
    });
    
    colorOverrideText.addEventListener('input', function() {
        // Try to parse the text as a valid color
        if (/^#([0-9A-F]{3}){2}$/i.test(colorOverrideText.value)) {
            colorOverride.value = colorOverrideText.value;
        }
    });

    colorOverrideText.addEventListener('change', function() {
        // Check if the color is valid
        const colorValue = colorOverrideText.value.trim();
        if (colorValue && !/^#([0-9A-F]{3}){2}$/i.test(colorValue) && !/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/.test(colorValue)) {
            colorOverrideText.value = ''; // Reset to default
            colorOverride.value = '#000000';
        }
    });

    // Drag and drop functionality
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith('.svg')) {
                svgFileInput.files = dt.files; // Update the input file for consistency
                processSvgFile(file);
            } else {
                alert('Please drop a valid SVG file.');
            }
        }
    });
    
    // Handle file input change
    svgFileInput.addEventListener('change', function() {
        if (svgFileInput.files.length > 0) {
            processSvgFile(svgFileInput.files[0]);
        }
    });
    
    // Process the SVG file (extracted for reuse)
    function processSvgFile(svgFile) {
        let imageName = imageNameInput.value.trim() || 'icon';
        
        if (svgFile.name && !imageNameInput.value.trim()) {
            imageName = svgFile.name.replace('.svg', ''); // Remove .svg extension
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            let svgData = e.target.result;
            
            // Apply color override if enabled
            if (color = colorOverrideText.value.trim()) {
                svgData = overrideColors(svgData, color);
            }
            
            generatePNGs(svgData, imageName);
        };
        
        reader.readAsText(svgFile);
    }
    
    // Convert button click handler
    convertBtn.addEventListener('click', function() {
        if (svgFileInput.files.length === 0) {
            alert('Please select an SVG file first.');
            return;
        }
        
        processSvgFile(svgFileInput.files[0]);
    });

    function generatePNGs(svgData, imageName) {
        // Clear previous images
        imagesContainer.innerHTML = '';
        generatedImages = [];
                
        // Create base64 image from SVG for drawing to canvas
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        
        img.onload = function() {
            let scalesToUse = scales;
            const customScales = customScalesInput.value.split(',').map(Number).filter(scale => !isNaN(scale) && scale > 0);
            if (customScales.length > 0) {
                scalesToUse = customScales;
            }
            
            // Calculate aspect ratio if needed
            let aspectRatio = 1;
            if (keepAspectRatio.checked) {
                // Get original SVG dimensions
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;
                
                // Try to get dimensions from different SVG attributes
                let svgWidth = svgElement.getAttribute('width');
                let svgHeight = svgElement.getAttribute('height');
                
                // If no explicit width/height, try to get from viewBox
                if ((!svgWidth || !svgHeight) && svgElement.getAttribute('viewBox')) {
                    const viewBox = svgElement.getAttribute('viewBox').split(' ');
                    if (viewBox.length === 4) {
                        svgWidth = parseFloat(viewBox[2]);
                        svgHeight = parseFloat(viewBox[3]);
                    }
                }
                
                // Convert to numbers and calculate ratio
                svgWidth = parseFloat(svgWidth) || img.naturalWidth;
                svgHeight = parseFloat(svgHeight) || img.naturalHeight;
                
                if (svgWidth && svgHeight) {
                    aspectRatio = svgHeight / svgWidth;
                }
            }
            
            scalesToUse.forEach(scale => {
                const width = baseSize * scale;
                const height = keepAspectRatio.checked ? Math.round(width * aspectRatio) : width;
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Generate filename
                let filename;
                if (scale === 1) {
                    filename = `${imageName}Template.png`;
                } else {
                    filename = `${imageName}Template@${scale}x.png`;
                }
                
                // Convert to PNG
                const pngDataUrl = canvas.toDataURL('image/png');
                
                // Save image data for downloading
                generatedImages.push({
                    filename: filename,
                    dataUrl: pngDataUrl
                });
                
                // Create image preview element
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                
                const imagePreview = document.createElement('div');
                imagePreview.className = 'image-preview';
                
                const previewImg = document.createElement('img');
                previewImg.src = pngDataUrl;
                previewImg.alt = filename;
                previewImg.style.width = '50px';
                previewImg.style.height = 'auto'; // Changed to auto to maintain aspect ratio in preview
                
                const nameElement = document.createElement('div');
                nameElement.className = 'image-name';
                nameElement.textContent = filename;
                
                const dimensionsElement = document.createElement('div');
                dimensionsElement.className = 'image-dimensions';
                dimensionsElement.textContent = `${width}×${height}`;
                
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'download-btn';
                downloadBtn.textContent = 'Download';
                downloadBtn.onclick = function() {
                    downloadImage(pngDataUrl, filename);
                };
                
                imagePreview.appendChild(previewImg);
                imageItem.appendChild(imagePreview);
                imageItem.appendChild(nameElement);
                imageItem.appendChild(dimensionsElement);
                imageItem.appendChild(downloadBtn);
                
                imagesContainer.appendChild(imageItem);
            });
            
            // Enable download all button
            downloadAllBtn.disabled = false;
            
            // Clean up
            URL.revokeObjectURL(svgUrl);
        };
        
        img.src = svgUrl;
    }
    
    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }
    
    downloadAllBtn.addEventListener('click', function() {
        if (generatedImages.length === 0) return;
        
        const zip = new JSZip();
        const imageName = imageNameInput.value.trim() || 'icon';
        const folderName = `${imageName}_pngs`;
        const folder = zip.folder(folderName);
        
        generatedImages.forEach(image => {
            const base64Data = image.dataUrl.replace('data:image/png;base64,', '');
            folder.file(image.filename, base64Data, {base64: true});
        });
        
        zip.generateAsync({type: 'blob'}).then(function(content) {
            saveAs(content, `${folderName}.zip`);
        });
    });
    
    // Function to override colors in SVG while preserving alpha
    function overrideColors(svgData, colorValue) {
        // Create a temporary DOM element to parse the SVG
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgData, 'image/svg+xml');
        
        // Convert input color to RGB components
        let r, g, b;
        if (colorValue.startsWith('#')) {
            // Handle hex color
            const hex = colorValue.substring(1);
            r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
            g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
            b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
        } else if (colorValue.startsWith('rgb')) {
            // Handle rgb() color
            const rgbMatch = colorValue.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                r = parseInt(rgbMatch[1], 10);
                g = parseInt(rgbMatch[2], 10);
                b = parseInt(rgbMatch[3], 10);
            }
        }
        
        if (r === undefined || g === undefined || b === undefined) {
            return svgData; // Invalid color, return original data
        }
        
        // Handle explicit color attributes
        const elementsWithColors = doc.querySelectorAll('[fill], [stroke], [style]');
        elementsWithColors.forEach(el => {
            // Handle fill attribute
            if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
                const fill = el.getAttribute('fill');
                const newFill = preserveAlpha(fill, r, g, b);
                el.setAttribute('fill', newFill);
            }
            
            // Handle stroke attribute
            if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                const stroke = el.getAttribute('stroke');
                const newStroke = preserveAlpha(stroke, r, g, b);
                el.setAttribute('stroke', newStroke);
            }
            
            // Handle inline style attributes
            if (el.hasAttribute('style')) {
                const style = el.getAttribute('style');
                const newStyle = processInlineStyle(style, r, g, b);
                el.setAttribute('style', newStyle);
            }
        });
        
        // Handle default black fill for shape elements
        const shapeElements = doc.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon, text');
        shapeElements.forEach(el => {
            // If no fill is specified, add our color (except for elements with fill="none")
            if (!el.hasAttribute('fill') && !hasInheritedFillNone(el)) {
                el.setAttribute('fill', `rgb(${r}, ${g}, ${b})`);
            }
            
            // For stroke, we only override existing strokes to avoid adding strokes where there were none
            if (el.hasAttribute('stroke') && el.getAttribute('stroke') === 'currentColor') {
                el.setAttribute('stroke', `rgb(${r}, ${g}, ${b})`);
            }
        });
        
        // Handle currentColor keyword
        const elementsWithCurrentColor = doc.querySelectorAll('[fill="currentColor"], [stroke="currentColor"]');
        elementsWithCurrentColor.forEach(el => {
            if (el.getAttribute('fill') === 'currentColor') {
                el.setAttribute('fill', `rgb(${r}, ${g}, ${b})`);
            }
            if (el.getAttribute('stroke') === 'currentColor') {
                el.setAttribute('stroke', `rgb(${r}, ${g}, ${b})`);
            }
        });
        
        // Handle CSS styles within the SVG
        const styleElements = doc.querySelectorAll('style');
        styleElements.forEach(style => {
            let cssText = style.textContent;
            
            // Replace currentColor with our RGB color
            cssText = cssText.replace(/currentColor/g, `rgb(${r}, ${g}, ${b})`);
            
            // Process fill colors with alpha preservation
            cssText = cssText.replace(/fill:\s*(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/g, function(match, color) {
                return 'fill: ' + preserveAlpha(color, r, g, b);
            });
            
            // Process stroke colors with alpha preservation
            cssText = cssText.replace(/stroke:\s*(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/g, function(match, color) {
                return 'stroke: ' + preserveAlpha(color, r, g, b);
            });
            
            style.textContent = cssText;
        });
        
        // Serialize the modified SVG back to string
        return new XMLSerializer().serializeToString(doc);
    }
    
    // Function to preserve alpha while changing color
    function preserveAlpha(originalColor, r, g, b) {
        // Check if color has alpha
        if (originalColor && originalColor.startsWith('rgba')) {
            const match = originalColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
            if (match) {
                const alpha = parseFloat(match[4]);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        }
        
        // Handle opacity attribute separately if needed
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Process inline style attributes to replace colors while preserving alpha
    function processInlineStyle(styleText, r, g, b) {
        if (!styleText) return styleText;
        
        // Replace fill and stroke colors in the style string
        styleText = styleText.replace(/(fill|stroke):\s*(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/g, 
            function(_, property, color) {
                return property + ': ' + (color !== 'none' ? preserveAlpha(color, r, g, b) : color);
            }
        );
        
        return styleText;
    }

    // Helper function to check if an element inherits fill="none" from a parent
    function hasInheritedFillNone(element) {
        let current = element.parentElement;
        while (current && current.tagName !== 'svg') {
            if (current.getAttribute('fill') === 'none') {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }
});