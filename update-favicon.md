# Favicon Update Guide

To update your favicon with the new logo, follow these steps:

## Option 1: Online Favicon Generator (Recommended)

1. **Go to a favicon generator** like:
   - https://realfavicongenerator.net/
   - https://favicon.io/
   - https://www.favicon-generator.org/

2. **Upload your logo**: Use `src/img/zorbaslogo.png`

3. **Generate favicon files**: The generator will create:
   - `favicon.ico` (16x16, 32x32, 48x48)
   - `logo192.png` (192x192 for PWA)
   - `logo512.png` (512x512 for PWA)
   - `apple-touch-icon.png` (180x180 for iOS)

4. **Download and replace** the files in the `public/` directory

## Option 2: Manual Update

If you want to manually create the favicon:

1. **Resize your logo** to these dimensions:
   - 16x16, 32x32, 48x48 for favicon.ico
   - 192x192 for logo192.png
   - 512x512 for logo512.png

2. **Replace the files** in the `public/` directory

## Option 3: Use Image Editing Software

1. Open `src/img/zorbaslogo.png` in Photoshop, GIMP, or similar
2. Create new files with the required dimensions
3. Export as the appropriate formats
4. Replace the files in `public/`

## Important Notes

- The favicon should be clear and recognizable at small sizes
- Consider creating a simplified version for the 16x16 favicon
- Test the favicon in different browsers
- Clear your browser cache to see the changes

## Files to Update

- `public/favicon.ico`
- `public/logo192.png`
- `public/logo512.png`
- `public/manifest.json` (if needed)
