import * as esbuild from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import tailwindPlugin from 'esbuild-plugin-tailwindcss';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Copy HTML files function
async function copyHtmlFiles() {
  try {
    await mkdir('dist', { recursive: true });
    await copyFile(
      join(__dirname, 'src', 'index.html'),
      join(__dirname, 'dist', 'index.html'),
    );
    console.log('HTML files copied successfully');
  } catch (err) {
    console.error('Error copying HTML files:', err);
    throw err;
  }
}

async function injectCssIntoHtml() {
  try {
    // Read the compiled CSS
    const css = await readFile(join(__dirname, 'dist', 'index.css'), 'utf8');
    
    // Read the HTML template
    let html = await readFile(join(__dirname, 'src', 'index.html'), 'utf8');
    
    // Create style tag with compiled CSS
    const styleTag = `<style>${css}</style>`;
    
    // Remove existing link tag if present
    html = html.replace(/<link[^>]*href=['"]\.\/index\.css['"][^>]*>/g, '');
    
    // Insert style tag after head opening tag
    html = html.replace('</head>', `${styleTag}\n</head>`);
    
    // Ensure dist directory exists
    await mkdir('dist', { recursive: true });
    
    // Write the modified HTML
    await writeFile(join(__dirname, 'dist', 'index.html'), html);
    
    console.log('CSS injected into HTML successfully');
  } catch (err) {
    console.error('Error injecting CSS:', err);
    throw err;
  }
}

let nodeProcess = null;

const config = {
  entryPoints: [
    'src/index.ts',
    'src/index.css'
  ],
  bundle: true,
  platform: 'node',
  target: ['node18'],
  outdir: 'dist',
  format: 'esm',
  sourcemap: true,
  external: [
    'express',
    'socket.io',
    'zod'
  ],
  plugins: [
    tailwindPlugin({ /* options */ }),
    {
      name: 'copy-html',
      setup(build) {
        build.onStart(() => {
          if (nodeProcess) {
            nodeProcess.kill();
          }
        });
        
        build.onEnd(async (result) => {
          if (result.errors.length === 0) {
            await copyHtmlFiles();
            await injectCssIntoHtml();
            
            nodeProcess = spawn('node', ['dist/index.js'], {
              stdio: 'inherit',
              shell: true
            });
          }
        });
      },
    },
  ],
};

const isWatch = process.argv.includes('--watch');

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching...');
} else {
  await esbuild.build(config);
  console.log('Build complete');
}

// Handle process termination
process.on('SIGTERM', () => {
  if (nodeProcess) nodeProcess.kill();
});

process.on('SIGINT', () => {
  if (nodeProcess) nodeProcess.kill();
  process.exit();
});
