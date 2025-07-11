import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/basic-index.ts'],
  format: ['cjs'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node20',
  external: ['@prisma/client', '.prisma/client'],
  esbuildOptions(options) {
    options.platform = 'node';
    options.mainFields = ['main', 'module'];
  },
});