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

  if (watch) {
    await ctx.watch();
    await testCtx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    await testCtx.rebuild();
    await testCtx.dispose();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
