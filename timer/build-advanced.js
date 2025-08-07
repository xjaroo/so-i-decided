const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if required tools are installed
function checkTools() {
  const tools = ['npx'];
  const missing = [];
  
  for (const tool of tools) {
    try {
      execSync(`${tool} --version`, { stdio: 'ignore' });
    } catch (error) {
      missing.push(tool);
    }
  }
  
  if (missing.length > 0) {
    console.log(`⚠️  Missing tools: ${missing.join(', ')}`);
    console.log('Using basic build instead...');
    return false;
  }
  
  return true;
}

// Install dependencies if needed
function installDependencies() {
  try {
    console.log('📦 Installing build dependencies...');
    execSync('npm install --save-dev terser clean-css-cli html-minifier-terser', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.log('⚠️  Could not install dependencies, using basic build...');
    return false;
  }
}

// Advanced minification using external tools
async function advancedBuild() {
  console.log('🚀 Starting advanced static build...');
  
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  try {
    // Read source files
    const html = fs.readFileSync('index.html', 'utf8');
    const manifest = fs.readFileSync('manifest.json', 'utf8');
    const serviceWorker = fs.readFileSync('service-worker.js', 'utf8');
    
    // Extract CSS and JS
    const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    const css = cssMatch ? cssMatch[1] : '';
    const js = jsMatch ? jsMatch[1] : '';
    
    // Create temporary files for minification
    fs.writeFileSync('temp.css', css);
    fs.writeFileSync('temp.js', js);
    fs.writeFileSync('temp-sw.js', serviceWorker);
    
    // Minify using external tools
    try {
      execSync('npx terser temp.js -o temp.min.js --compress --mangle');
      execSync('npx clean-css-cli temp.css -o temp.min.css');
      execSync('npx terser temp-sw.js -o temp-sw.min.js --compress --mangle');
      execSync('npx html-minifier-terser index.html -o temp.min.html --collapse-whitespace --remove-comments --minify-css --minify-js');
    } catch (error) {
      console.log('⚠️  External minification failed, using basic minification...');
      // Fallback to basic minification
      const minifiedCSS = basicMinifyCSS(css);
      const minifiedJS = basicMinifyJS(js);
      const minifiedServiceWorker = basicMinifyJS(serviceWorker);
      const minifiedHTML = basicMinifyHTML(html);
      
      fs.writeFileSync('temp.min.js', minifiedJS);
      fs.writeFileSync('temp.min.css', minifiedCSS);
      fs.writeFileSync('temp-sw.min.js', minifiedServiceWorker);
      fs.writeFileSync('temp.min.html', minifiedHTML);
    }
    
    // Read minified files
    const minifiedJS = fs.readFileSync('temp.min.js', 'utf8');
    const minifiedCSS = fs.readFileSync('temp.min.css', 'utf8');
    const minifiedServiceWorker = fs.readFileSync('temp-sw.min.js', 'utf8');
    const minifiedHTML = fs.readFileSync('temp.min.html', 'utf8');
    
    // Create optimized HTML
    const optimizedHTML = minifiedHTML
      .replace(/<style>[\s\S]*?<\/style>/, `<style>${minifiedCSS}</style>`)
      .replace(/<script>[\s\S]*?<\/script>/, `<script>${minifiedJS}</script>`);
    
    // Write optimized files
    fs.writeFileSync(path.join(distDir, 'index.html'), optimizedHTML);
    fs.writeFileSync(path.join(distDir, 'manifest.json'), manifest);
    fs.writeFileSync(path.join(distDir, 'service-worker.js'), minifiedServiceWorker);
    
    // Copy assets
    if (fs.existsSync('timer-terminer-342934.mp3')) {
      fs.copyFileSync('timer-terminer-342934.mp3', path.join(distDir, 'timer-terminer-342934.mp3'));
    }
    
    ['icon-192.png', 'icon-512.png'].forEach(icon => {
      if (fs.existsSync(icon)) {
        fs.copyFileSync(icon, path.join(distDir, icon));
      }
    });
    
    // Clean up temp files
    ['temp.css', 'temp.js', 'temp-sw.js', 'temp.min.js', 'temp.min.css', 'temp-sw.min.js', 'temp.min.html'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    // Create build info
    const buildInfo = {
      buildTime: new Date().toISOString(),
      version: '1.0.0',
      files: fs.readdirSync(distDir),
      optimization: 'advanced'
    };
    
    fs.writeFileSync(path.join(distDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
    
    console.log('✅ Advanced static build completed successfully!');
    console.log(`📁 Build output: ${distDir}`);
    
    // Calculate file sizes
    const totalSize = buildInfo.files.reduce((total, file) => {
      const stats = fs.statSync(path.join(distDir, file));
      return total + stats.size;
    }, 0);
    
    console.log(`📊 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Advanced build failed:', error.message);
    process.exit(1);
  }
}

// Basic minification functions (fallback)
function basicMinifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim();
}

function basicMinifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim();
}

function basicMinifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

// Run build
if (checkTools() && installDependencies()) {
  advancedBuild();
} else {
  // Fallback to basic build
  console.log('🔄 Using basic build process...');
  require('./build.js');
}
