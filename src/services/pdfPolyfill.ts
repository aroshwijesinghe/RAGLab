/**
 * Polyfills for pdfjs-dist when running inside Node / Electron / VS Code extension host.
 * pdfjs-dist checks navigator.platform, navigator.userAgent, DOMMatrix, ImageData, Path2D, and window.location.
 */

const platformString =
  typeof process !== 'undefined' && process.platform === 'win32'
    ? 'Win32'
    : typeof process !== 'undefined' && process.platform === 'darwin'
    ? 'MacIntel'
    : 'Linux x86_64';

const userAgentString =
  typeof process !== 'undefined'
    ? `Mozilla/5.0 (${platformString}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Node.js/${process.version}`
    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)';

// Polyfill navigator
if (typeof (globalThis as any).navigator === 'undefined') {
  (globalThis as any).navigator = {
    userAgent: userAgentString,
    platform: platformString,
    appName: 'Netscape',
    appVersion: '5.0',
    hardwareConcurrency: 4,
    language: 'en-US',
    languages: ['en-US', 'en'],
  };
} else {
  const nav = (globalThis as any).navigator;
  try {
    if (!nav.platform) {
      Object.defineProperty(nav, 'platform', {
        value: platformString,
        writable: true,
        configurable: true,
      });
    }
  } catch {
    try { nav.platform = platformString; } catch {}
  }
  try {
    if (!nav.userAgent) {
      Object.defineProperty(nav, 'userAgent', {
        value: userAgentString,
        writable: true,
        configurable: true,
      });
    }
  } catch {
    try { nav.userAgent = userAgentString; } catch {}
  }
}

// Polyfill window and window.location
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}
if (typeof (globalThis as any).window.location === 'undefined') {
  (globalThis as any).window.location = {
    href: 'http://localhost/',
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
  };
}

// Polyfill DOMMatrix
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;
    constructor(_init?: any) {}
  };
}

// Polyfill ImageData
if (typeof (globalThis as any).ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    width = 0;
    height = 0;
    data = new Uint8ClampedArray(0);
    constructor(_width: number = 0, _height: number = 0) {}
  };
}

// Polyfill Path2D
if (typeof (globalThis as any).Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D {
    constructor(_path?: any) {}
  };
}
