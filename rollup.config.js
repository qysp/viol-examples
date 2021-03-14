import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: {
    file: 'app.js',
    format: 'iife',
  },
  plugins: [
    typescript({ tsconfig: 'tsconfig.json' }),
    nodeResolve(),
    commonjs(),
  ],
};
