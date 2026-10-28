const { compile, Polyfills } = require('@tailwindcss/node');
const { Scanner } = require('@tailwindcss/oxide');
const fs = require('fs');
const path = require('path');

async function buildCSS() {
  const rootDir = path.resolve(__dirname, '..');
  const sourcePath = path.resolve(rootDir, 'styles/tailwind-source.css');
  const outputPath = path.resolve(rootDir, 'app/globals.css');

  const cssInput = fs.readFileSync(sourcePath, 'utf8');

  const fullRebuildPaths = [];
  const compiler = await compile(cssInput, {
    from: sourcePath,
    base: rootDir,
    shouldRewriteUrls: true,
    onDependency: (f) => fullRebuildPaths.push(f),
    polyfills: Polyfills.All,
  });

  const scanner = new Scanner({
    sources: [
      { base: rootDir, pattern: 'app/**/*.{js,ts,jsx,tsx}', negated: false },
      { base: rootDir, pattern: 'components/**/*.{js,ts,jsx,tsx}', negated: false },
    ],
  });

  const candidates = scanner.scan();
  let builtCss = compiler.build([...candidates]);

  // Append ChatGPT custom theme & scrollbars
  const customStyles = `
/* ChatGPT Custom Styles & Scrollbars */
:root {
  --background: #ffffff;
  --foreground: #0d0d0d;
}

.dark {
  --background: #212121;
  --foreground: #ececec;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
`;

  fs.writeFileSync(outputPath, builtCss + '\n' + customStyles);
  console.log('✓ Successfully compiled Tailwind CSS into app/globals.css (' + (builtCss.length + customStyles.length) + ' bytes)');
}

buildCSS().catch(console.error);
