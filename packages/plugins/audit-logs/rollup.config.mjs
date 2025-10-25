import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // Server bundle
  {
    input: 'server/src/index.ts',
    output: [
      {
        file: 'dist/server/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'auto'
      },
      {
        file: 'dist/server/index.mjs',
        format: 'es',
        sourcemap: true
      }
    ],
    external: [
      '@strapi/strapi',
      '@strapi/types',
      'lodash',
      /^node:.*/
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './server/tsconfig.build.json',
        declaration: false,
        declarationMap: false
      })
    ]
  }
];