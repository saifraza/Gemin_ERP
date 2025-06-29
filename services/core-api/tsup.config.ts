import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/basic-index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node20',
  external: ['@prisma/client'],
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
  noExternal: ['@prisma/client'],
});