import { defineConfig, mergeConfig, type Plugin } from 'vite';
import base from './vite.config';
import Critters from 'critters';

function crittersPlugin(options: ConstructorParameters<typeof Critters>[0] = {}): Plugin {
  let outDir = 'dist';
  return {
    name: 'vite-critters-inline',
    apply: 'build',
    enforce: 'post',
    configResolved(resolved) {
      outDir = resolved.build.outDir;
    },
    async generateBundle(_opts, bundle) {
      const critters = new Critters({
        path: outDir,
        preload: 'swap',
        reduceInlineStyles: true,
        pruneSource: true,
        ...options,
      });
      const entries = Object.entries(bundle);
      for (const [fileName, asset] of entries) {
        if (asset.type === 'asset' && fileName.endsWith('.html')) {
          const html = typeof asset.source === 'string' ? asset.source : asset.source?.toString?.() ?? '';
          const inlined = await critters.process(html);
          asset.source = inlined;
        }
      }
    },
  };
}

export default mergeConfig(
  // @ts-expect-error base may be a function or config; mergeConfig can handle it
  base as any,
  defineConfig({
    plugins: [crittersPlugin()],
  })
);
