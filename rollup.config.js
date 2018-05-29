import resolve from "rollup-plugin-node-resolve";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import commonjs from "rollup-plugin-commonjs";
import serve from "rollup-plugin-serve";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";
import livereload from "rollup-plugin-livereload";
import puppeteer from "./rollup-plugin-puppeteer";

const ENV = ["DEVELOPMENT", "PRODUCTION", "TEST"].reduce(
  (acc, curr) => {
    const obj = Object.assign({}, acc);
    obj[curr] = !!process.env[curr];
    obj[process.env[curr]] = curr;
    return obj;
  },
  {
    toString() {
      return this.true;
    }
  }
);

const DEFAULT = {
  output: {
    name: "asa",
    format: "umd",
    globals: {
      "whatwg-fetch": "fetch"
    }
  },
  cache: false,
  perf: true,
  external: ["whatwg-fetch"],
  plugins: [
    typescript(),
    resolve({
      browser: true
    }),
    commonjs({
      namedExports: !ENV.PRODUCTION ? { chai: ["expect"] } : {},
      include: ["node_modules/**"],
      sourceMap: false
    }),
    json(),
    globals(),
    builtins()
  ]
};

const MAKE = {};

MAKE.TEST = () =>
  Object.assign({}, DEFAULT, {
    input: "src/index.spec.ts",
    output: Object.assign({}, DEFAULT.output, {
      file: "build/asa.js",
      sourcemap: true
    }),
    external: ["mocha", "it", "describe"],
    plugins: DEFAULT.plugins.concat([
      serve({
        contentBase: ["build"]
      }),
      puppeteer({
        url: "http://localhost:10001"
      })
    ])
  });

MAKE.DEVELOPMENT = () =>
  Object.assign({}, DEFAULT, {
    input: "src/index.spec.ts",
    output: Object.assign({}, DEFAULT.output, {
      file: "build/asa.js",
      sourcemap: true
    }),
    external: ["mocha", "it", "describe"],
    watch: {
      chokidar: false,
      include: "src/**",
      exclude: "node_modules/**"
    },
    plugins: DEFAULT.plugins.concat([
      serve({
        open: true,
        contentBase: ["build"]
      }),
      livereload({
        watch: "build"
      })
    ])
  });

MAKE.PRODUCTION = () => [
  Object.assign({}, DEFAULT, {
    input: "src/index.ts",
    output: Object.assign({}, DEFAULT.output, {
      file: "dist/asa.min.js"
    }),
    plugins: DEFAULT.plugins.concat([
      babel({
        include: ["src/**"]
      }),
      uglify()
    ])
  }),
  Object.assign({}, DEFAULT, {
    input: "src/index.ts",
    output: Object.assign({}, DEFAULT.output, {
      format: "es",
      file: "dist/asa.es"
    })
  }),
  Object.assign({}, DEFAULT, {
    input: "src/index.ts",
    output: Object.assign({}, DEFAULT.output, {
      format: "cjs",
      file: "dist/asa.cjs"
    })
  })
];

export default MAKE[ENV]();
