import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

const isDev = process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/planavista-cards.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: isDev,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript(),
    !isDev && terser({
      compress: { passes: 2 },
      output: { comments: false },
    }),
  ].filter(Boolean),
};
