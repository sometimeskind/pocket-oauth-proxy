module.exports = {
  env: {
    commonjs: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  extends: ["standard", "prettier", "prettier/standard"],
  plugins: ["import", "prettier", "standard"],
  rules: {
    "prettier/prettier": 2
  }
};
