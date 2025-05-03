# SVG to NSImage Template Converter

A web-based tool to convert SVG files to PNG images with various scaling options, specifically formatted for use as NSImage templates in macOS/iOS applications.

## Features

- Upload SVG files via file selector or drag-and-drop
- Convert SVGs to multiple PNG sizes based on standard scale factors
- Custom scaling options (enter your own scale factors)
- Override colors in the SVG while preserving alpha transparency
- Preserve aspect ratio option for non-square images
- Preview generated images before downloading
- Download individual PNG files or all images as a ZIP archive

## How to Use

1. Download the zip or clone the project
2. Open `index.html` in a web browser
3. Upload an SVG file by clicking the upload area or dragging and dropping a file
4. Set your desired options:
   - Image name (used for the output filenames)
   - Custom scale factors (optional)
   - Color override (optional)
   - Preserve aspect ratio (optional)
5. Click "Convert SVG to PNGs"
6. Preview the generated images
7. Download individual images or click "Download All Images" to get a ZIP archive

## File Naming Convention

Generated files follow Apple's standard naming convention for image assets:
- Base image: `[name]Template.png`
- Scaled images: `[name]Template@[scale]x.png`

### Default Scales

By default, the zip will contain the following scales:

- 1x (16x16 pixels)
- 1.25x
- 1.33x
- 1.4x
- 1.5x
- 1.8x
- 2x
- 2.5x
- 3x
- 4x
- 5x

## Dependencies

This project uses the following libraries:
- JSZip - For creating ZIP archives
- FileSaver - For saving files to the user's device

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by [ECRomaneli](https://github.com/ecromaneli)