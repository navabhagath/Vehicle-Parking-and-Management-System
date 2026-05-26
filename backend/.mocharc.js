export default {
  spec: "test/**/*.test.js",
  recursive: true,
  timeout: 10000,
  exit: true,
  require: ["test/setup.js"],
};
