// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 除外ファイル
  {
    ignores: ["dist/**", "node_modules/**", "*.js", "*.mjs"],
  },

  // ESLint推奨設定
  eslint.configs.recommended,

  // TypeScript ESLint推奨設定
  ...tseslint.configs.recommended,

  // カスタムルール（ソースコード）
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript固有ルール
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",

      // 一般的なルール
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // テストファイル用ルール
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      parserOptions: {
        // テストファイルは型チェックなしでLint
        project: null,
      },
    },
    rules: {
      // TypeScript固有ルール
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      // テストファイルではany型を許可（エッジケーステスト用）
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // テストファイルでは require() を許可（後方互換性テスト用）
      "@typescript-eslint/no-require-imports": "off",

      // 一般的なルール
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  }
);
