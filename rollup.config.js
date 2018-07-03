import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
  ],
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.es.js', format: 'es' },
  ],
}
