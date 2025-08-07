const fs = require("fs");
const path = require("path");

// Simple minification functions
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, "$1") // Remove spaces around brackets, colons, semicolons, commas
    .replace(/;\}/g, "}") // Remove trailing semicolons
    .trim();
}

function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
    .replace(/\/\/.*$/gm, "") // Remove line comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, "$1") // Remove spaces around brackets, colons, semicolons, commas
    .replace(/;\}/g, "}") // Remove trailing semicolons
    .trim();
}

function minifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/>\s+</g, "><") // Remove spaces between tags
    .trim();
}

// Build process
async function build() {
  console.log("🚀 Starting static build...");

  // Create dist directory
  const distDir = path.join(__dirname, "dist");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  try {
    // Read source files
    const html = fs.readFileSync("index.html", "utf8");
    const manifest = fs.readFileSync("manifest.json", "utf8");
    const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

    // Extract CSS from HTML
    const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    const css = cssMatch ? cssMatch[1] : "";

    // Extract JS from HTML
    const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    const js = jsMatch ? jsMatch[1] : "";

    // Minify files
    const minifiedCSS = minifyCSS(css);
    const minifiedJS = minifyJS(js);
    const minifiedHTML = minifyHTML(html);
    const minifiedServiceWorker = minifyJS(serviceWorker);

    // Create optimized HTML
    const optimizedHTML = minifiedHTML
      .replace(/<style>[\s\S]*?<\/style>/, `<style>${minifiedCSS}</style>`)
      .replace(/<script>[\s\S]*?<\/script>/, `<script>${minifiedJS}</script>`);

    // Copy and optimize files
    fs.writeFileSync(path.join(distDir, "index.html"), optimizedHTML);
    fs.writeFileSync(path.join(distDir, "manifest.json"), manifest);
    fs.writeFileSync(
      path.join(distDir, "service-worker.js"),
      minifiedServiceWorker
    );

    // Copy audio file if it exists
    if (fs.existsSync("timer-terminer-342934.mp3")) {
      fs.copyFileSync(
        "timer-terminer-342934.mp3",
        path.join(distDir, "timer-terminer-342934.mp3")
      );
    }

    // Copy icons if they exist
    ["icon-192.png", "icon-512.png"].forEach((icon) => {
      if (fs.existsSync(icon)) {
        fs.copyFileSync(icon, path.join(distDir, icon));
      }
    });

    // Create build info
    const buildInfo = {
      buildTime: new Date().toISOString(),
      version: "1.0.0",
      files: fs.readdirSync(distDir),
    };

    fs.writeFileSync(
      path.join(distDir, "build-info.json"),
      JSON.stringify(buildInfo, null, 2)
    );

    console.log("✅ Static build completed successfully!");
    console.log(`📁 Build output: ${distDir}`);
    console.log("📊 Build info:");
    console.log(`   - Build time: ${buildInfo.buildTime}`);
    console.log(`   - Files: ${buildInfo.files.join(", ")}`);

    // Calculate file sizes
    const totalSize = buildInfo.files.reduce((total, file) => {
      const stats = fs.statSync(path.join(distDir, file));
      return total + stats.size;
    }, 0);

    console.log(`   - Total size: ${(totalSize / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  }
}

// Run build
build();
