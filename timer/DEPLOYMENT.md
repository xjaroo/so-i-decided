# Timer PWA Deployment Guide

This guide explains how to create a static build and deploy your timer PWA to various hosting platforms.

## 🚀 Quick Start

### 1. Basic Build

```bash
cd timer
pnpm install
pnpm run build
```

### 2. Advanced Build (Better Optimization)

```bash
cd timer
pnpm install
pnpm run build:advanced
```

### 3. Test Build Locally

```bash
pnpm run serve-dist
# Visit http://localhost:8000
```

## 📦 Build Output

The build process creates a `dist/` folder containing:

```
dist/
├── index.html          # Optimized HTML (built from src.html)
├── manifest.json       # PWA manifest
├── service-worker.js   # Minified service worker
├── timer-terminer-342934.mp3  # Audio file
├── icon-192.png       # PWA icon (192x192)
├── icon-512.png       # PWA icon (512x512)
└── build-info.json    # Build metadata
```

## 📁 Project Structure

```
timer/
├── src.html           # Source HTML file
├── manifest.json      # PWA manifest
├── service-worker.js  # Service worker
├── build.js          # Build script
├── dist/             # Build output (generated)
│   └── index.html    # Optimized HTML
└── package.json      # Project configuration
```

## 🌐 Deployment Options

### 1. **Netlify** (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd timer
pnpm run build
netlify deploy --dir=dist --prod
```

### 2. **Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd timer
pnpm run build
vercel dist --prod
```

### 3. **GitHub Pages**

```bash
# Create a new repository
# Push your code to GitHub

# Enable GitHub Pages in repository settings
# Set source to /docs or /dist folder
```

### 4. **Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
cd timer
pnpm run build
firebase deploy
```

### 5. **AWS S3 + CloudFront**

```bash
# Install AWS CLI
# Configure AWS credentials

# Create S3 bucket
aws s3 mb s3://your-timer-app

# Upload files
cd timer
pnpm run build
aws s3 sync dist/ s3://your-timer-app --delete

# Enable static website hosting
aws s3 website s3://your-timer-app --index-document index.html
```

### 6. **Traditional Web Hosting**

1. Run `pnpm run build`
2. Upload all files from `dist/` folder to your web server
3. Ensure HTTPS is enabled (required for PWA)

## 🔧 Build Configuration

### Environment Variables

Create a `.env` file for build-time configuration:

```env
NODE_ENV=production
APP_VERSION=1.0.0
```

### Custom Build Options

Edit `build.js` or `build-advanced.js` to customize:

- Minification settings
- File compression
- Asset optimization
- Cache strategies

## 📊 Performance Optimization

### Before Deployment

1. **Generate Icons**: Run `pnpm run build-icons`
2. **Optimize Images**: Ensure icons are properly sized
3. **Test PWA**: Verify install prompt works
4. **Check Lighthouse**: Run performance audit

### Post-Deployment Checklist

- [ ] HTTPS is enabled
- [ ] Service worker is registered
- [ ] PWA install prompt appears
- [ ] Offline functionality works
- [ ] Icons display correctly
- [ ] Performance score > 90

## 🚨 Troubleshooting

### Common Issues

1. **PWA not installable**

   - Ensure HTTPS is enabled
   - Check manifest.json is accessible
   - Verify service worker registration

2. **Build fails**

   - Check Node.js version (14+ required)
   - Install dependencies: `pnpm install`
   - Clear cache: `rm -rf node_modules && pnpm install`

3. **Assets not loading**

   - Verify file paths in dist/
   - Check CORS settings
   - Ensure all files are uploaded

4. **Service worker not working**
   - Check browser console for errors
   - Verify service-worker.js is accessible
   - Clear browser cache

### Performance Tips

1. **Enable Compression**

   ```nginx
   # Nginx
   gzip on;
   gzip_types text/css application/javascript;
   ```

2. **Set Cache Headers**

   ```nginx
   # Nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Use CDN**
   - Consider using Cloudflare, AWS CloudFront, or similar
   - Improves global performance

## 📈 Monitoring

### Analytics Setup

Add Google Analytics or similar to track usage:

```html
<!-- Add to index.html head section -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

### Error Tracking

Consider adding error tracking:

```javascript
// Add to service worker
self.addEventListener("error", (event) => {
  console.error("Service Worker Error:", event.error);
  // Send to your error tracking service
});
```

## 🔄 Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy Timer PWA
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "16"
      - run: npm install
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📱 PWA Testing

### Manual Testing

1. Open Chrome DevTools
2. Go to Application tab
3. Check Manifest and Service Workers
4. Test offline functionality
5. Verify install prompt

### Automated Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-app.com --output=html --output-path=./lighthouse-report.html
```

## 🎯 Best Practices

1. **Always use HTTPS** - Required for PWA features
2. **Optimize images** - Use WebP format when possible
3. **Minimize bundle size** - Use advanced build for better compression
4. **Test on multiple devices** - Ensure responsive design works
5. **Monitor performance** - Use Lighthouse regularly
6. **Update regularly** - Keep dependencies current
7. **Backup your data** - Store build artifacts safely
