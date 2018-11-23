import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  // 核心选项
  input: './src/index.js',     // 必须
  // external: ['jszip'],
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: ['node_modules/**', 'src/lib/jszip.js'],  // Default: undefined
      // exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
      // these values can also be regular expressions
      // include: /node_modules/

      // search for files other than .js files (must already
      // be transpiled by a previous plugin!)
      extensions: [ '.js'],  // Default: [ '.js' ]

      // if true then uses of `global` won't be dealt with by this plugin
      ignoreGlobal: false,  // Default: false

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false,  // Default: true

      // explicitly specify unresolvable named exports
      // (see below for more details)
      //namedExports: { './module.js': ['foo', 'bar' ] },  // Default: undefined

      // sometimes you have to leave require statements
      // unconverted. Pass an array containing the IDs
      // or a `id => boolean` function. Only use this
      // option if you know what you're doing!
      ignore: [ 'conditional-runtime-dependency' ]
    }),
    // babel({
    //   exclude: 'node_modules/**' // 只编译我们的源代码
    // })
  ],

  // 额外选项
  //onwarn,

  // danger zone
  // acorn,
  // context,
  // moduleContext,
  // legacy

  output: {  // 必须 (如果要输出多个，可以是一个数组)
    // 核心选项
    file: './example/js/bundle.js',    // 必须
    format: 'iife',  // 必须
    name: 'saveToHtml',
    // name,
    globals: {jszip: 'jszip'},

    // // 额外选项
    // paths,
    // banner,
    // footer,
    // intro,
    // outro,
    // sourcemap,
    // sourcemapFile,
    // interop,

    // // 高危选项
    // exports,
    // amd,
    // indent
    // strict
  },
};