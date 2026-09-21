const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  // Build main extension
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outdir: 'dist',
    external: ['vscode'],
    logLevel: 'info',
    plugins: [],
  });

  // Build test files separately (not bundled with vscode external)
  const testCtx = await esbuild.context({
    entryPoints: [
      'src/test/runTests.ts',
      'src/test/suite/index.ts',
      'src/test/suite/textUtils.test.ts',
      'src/test/suite/chunkingService.test.ts',
      'src/test/suite/statisticsService.test.ts',
      'src/test/suite/pdfService.test.ts',
    ],
    bundle: true,
    format: 'cjs',
    sourcemap: true,
    sourcesContent: false,
    platform: 'node',
    outdir: 'dist/test',
    outbase: 'src/test',
    external: ['vscode', '@vscode/test-electron', 'mocha'],
    logLevel: 'info',
    plugins: [],
  });

  const fs = require('fs');
  const path = require('path');
  function copyWorkerAssets() {
    const workerSrc = path.join(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
    if (fs.existsSync(workerSrc)) {
      const polyfillHeader = `// RAGLaB Polyfills for Node / Electron / Worker execution
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = {
    platform: process.platform === 'win32' ? 'Win32' : (process.platform === 'darwin' ? 'MacIntel' : 'Linux x86_64'),
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Node.js/' + process.version,
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 4,
  };
} else {
  try {
    if (!globalThis.navigator.platform) {
      globalThis.navigator.platform = process.platform === 'win32' ? 'Win32' : 'Linux x86_64';
    }
    if (!globalThis.navigator.userAgent) {
      globalThis.navigator.userAgent = 'Mozilla/5.0 Node.js/' + process.version;
    }
  } catch {}
}
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true; isIdentity = true;
    constructor() {}
  };
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    width = 0; height = 0; data = new Uint8ClampedArray(0);
    constructor() {}
  };
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D { constructor() {} };
}
`;
      const originalWorker = fs.readFileSync(workerSrc, 'utf8');
      const patchedWorker = polyfillHeader + originalWorker;

      fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
      fs.writeFileSync(path.join(__dirname, 'dist/pdf.worker.mjs'), patchedWorker, 'utf8');
      fs.mkdirSync(path.join(__dirname, 'dist/test/suite'), { recursive: true });
      fs.writeFileSync(path.join(__dirname, 'dist/test/suite/pdf.worker.mjs'), patchedWorker, 'utf8');
    }
  }

  copyWorkerAssets();

  if (watch) {
    await ctx.watch();
    await testCtx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    await testCtx.rebuild();
    await testCtx.dispose();
    copyWorkerAssets();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
