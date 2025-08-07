# Timer PWA Setup Guide

This timer app is now configured as a Progressive Web App (PWA) that can be installed on mobile devices and desktop browsers.

## Files Added/Modified

1. **manifest.json** - Web app manifest with app metadata
2. **service-worker.js** - Service worker for offline functionality
3. **index.html** - Source HTML file with PWA meta tags and service worker registration
4. **create-icons.html** - Tool to generate required PNG icons
5. **build.js** - Build script that creates optimized index.html in dist/

## Setup Steps

### 1. Generate Icons

Open `create-icons.html` in a web browser and download the generated PNG icons:

- Save as `icon-192.png` (192x192 pixels)
- Save as `icon-512.png` (512x512 pixels)

### 2. Test the PWA

1. Serve the timer folder using a local web server (required for service workers)
2. Open the timer in Chrome/Edge
3. Look for the install icon in the address bar or menu
4. Click "Add to Home Screen" or "Install"

### 3. Local Development Server

You can use any of these methods to serve the files locally:

**Using Python:**

```bash
cd timer
python -m http.server 8000
```

**Using Node.js:**

```bash
cd timer
npx serve .
```

**Using PHP:**

```bash
cd timer
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## PWA Features

✅ **Installable** - Can be added to home screen
✅ **Offline Support** - Works without internet connection
✅ **Responsive Design** - Works on all screen sizes
✅ **App-like Experience** - Standalone window mode
✅ **Background Sync** - Service worker handles caching

## Testing Checklist

- [ ] App loads correctly
- [ ] Timer functionality works
- [ ] Install prompt appears (Chrome/Edge)
- [ ] App can be installed
- [ ] Works offline after first load
- [ ] Icons display correctly
- [ ] App name shows correctly when installed

## Browser Support

- **Chrome/Edge**: Full PWA support with install prompt
- **Firefox**: PWA support with manual install
- **Safari**: Limited PWA support, use "Add to Home Screen"
- **Mobile Browsers**: Varies by platform

## Troubleshooting

1. **No install prompt**: Make sure you're using HTTPS or localhost
2. **Service worker not registering**: Check browser console for errors
3. **Icons not showing**: Verify PNG files are in the correct location
4. **Offline not working**: Clear browser cache and reload

## Performance Benefits

- **Faster Loading**: Cached resources load instantly
- **Reduced Data Usage**: Resources cached locally
- **Better UX**: App-like experience with no browser chrome
- **Reliable**: Works even with poor network conditions
