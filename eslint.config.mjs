import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({ 
    extends:["next/core-web-vitals", "next/typescript"],
    rules: {
    "@typescript-eslint/no-explicit-any": "off",
    'no-unsafe-optional-chaining': 'off'
  }
  }),
];

export default eslintConfig;
