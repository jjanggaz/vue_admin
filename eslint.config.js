import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,ts,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        parser: typescriptParser,
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      vue: vue,
    },
    rules: {
      // TypeScript 규칙
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Vue 규칙
      "vue/multi-word-component-names": "off",
      "vue/no-unused-vars": "error",
      "vue/no-unused-components": "error",
      "vue/valid-template-root": "error",
      "vue/no-parsing-error": "error",
      "vue/no-duplicate-attributes": "error",
      "vue/no-irregular-whitespace": "error",
      "vue/no-reserved-component-names": "error",
      "vue/no-reserved-props": "error",
      "vue/no-side-effects-in-computed-properties": "error",
      "vue/no-textarea-mustache": "error",
      "vue/no-use-v-if-with-v-for": "error",
      "vue/no-v-html": "warn",
      "vue/require-component-is": "error",
      "vue/require-default-prop": "warn",
      "vue/require-prop-type-constructor": "error",
      "vue/require-render-return": "error",
      "vue/require-v-for-key": "error",
      "vue/require-valid-default-prop": "error",
      "vue/return-in-computed-property": "error",
      "vue/use-v-on-exact": "error",
      "vue/valid-v-bind": "error",
      "vue/valid-v-cloak": "error",
      "vue/valid-v-else": "error",
      "vue/valid-v-else-if": "error",
      "vue/valid-v-for": "error",
      "vue/valid-v-html": "error",
      "vue/valid-v-if": "error",
      "vue/valid-v-model": "error",
      "vue/valid-v-on": "error",
      "vue/valid-v-once": "error",
      "vue/valid-v-pre": "error",
      "vue/valid-v-show": "error",
      "vue/valid-v-slot": "error",
      "vue/valid-v-text": "error",

      // 일반 JavaScript 규칙
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-unused-vars": "off", // TypeScript 규칙으로 대체
      "no-undef": "off", // TypeScript가 처리
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "public/",
      "*.min.js",
      "*.bundle.js",
      "coverage/",
      ".vscode/",
      ".git/",
      "*.log",
    ],
  },
];
